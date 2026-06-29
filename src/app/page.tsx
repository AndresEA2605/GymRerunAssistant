"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Compass,
  Heart,
  Swords,
  Sparkles,
  AlertTriangle,
  List,
  X,
  Search,
  Check,
  Trophy,
  Clock,
  History,
  Info,
  Keyboard,
  Power,
  RotateCw,
  Flame,
  Droplet,
  Zap,
  Shield,
  Shuffle
} from "lucide-react";
import rawSteps from "../data/route.json";
import { RouteStep, StepType, AppState, RunHistoryEntry } from "../types";

const steps = rawSteps as RouteStep[];
const basePath = process.env.GITHUB_ACTIONS === "true" ? "/GymRerunAssistant" : "";

// Helper to format time (ms -> hh:mm:ss)
const formatTime = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((unit) => String(unit).padStart(2, "0"))
    .join(":");
};

// Helper to format date (timestamp -> dd/mm hh:mm)
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
};

export default function Home() {
  // Navigation & step state
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [direction, setDirection] = useState<number>(0); // 1 = next, -1 = prev
  
  // UI states
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showHotkeyHelp, setShowHotkeyHelp] = useState<boolean>(false);

  // Timer states
  const [timerIsRunning, setTimerIsRunning] = useState<boolean>(false);
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);
  const [timerElapsed, setTimerElapsed] = useState<number>(0);

  // History state
  const [history, setHistory] = useState<RunHistoryEntry[]>([]);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ref to track latest timer elapsed to avoid stale state in interval
  const timerElapsedRef = useRef(timerElapsed);
  timerElapsedRef.current = timerElapsed;

  const triggerToast = (message: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    // Current step
    const savedStep = localStorage.getItem("pokemmo_gym_rerun_step_index");
    if (savedStep) {
      const idx = parseInt(savedStep, 10);
      if (idx >= 0 && idx < steps.length) {
        setCurrentStepIndex(idx);
      }
    }

    // Run timer state
    const savedTimer = localStorage.getItem("pokemmo_gym_rerun_timer");
    if (savedTimer) {
      try {
        const parsed = JSON.parse(savedTimer);
        setTimerElapsed(parsed.elapsed || 0);
        setTimerIsRunning(parsed.isRunning || false);
        if (parsed.isRunning && parsed.startedAt) {
          // Adjust starting time so the elapsed time continues ticking correctly
          setTimerStartTime(parsed.startedAt);
        }
      } catch (e) {
        console.error("Failed to load timer from localStorage:", e);
      }
    }

    // Run History
    const savedHistory = localStorage.getItem("pokemmo_gym_rerun_history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to load history from localStorage:", e);
      }
    }
  }, []);

  // 2. Sync step index to LocalStorage
  useEffect(() => {
    localStorage.setItem("pokemmo_gym_rerun_step_index", currentStepIndex.toString());
  }, [currentStepIndex]);

  // 3. Sync timer to LocalStorage
  useEffect(() => {
    const timerState = {
      elapsed: timerElapsed,
      isRunning: timerIsRunning,
      startedAt: timerStartTime,
    };
    localStorage.setItem("pokemmo_gym_rerun_timer", JSON.stringify(timerState));
  }, [timerElapsed, timerIsRunning, timerStartTime]);

  // 4. Timer interval tick
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (timerIsRunning && timerStartTime !== null) {
      intervalId = setInterval(() => {
        const now = Date.now();
        // Current elapsed is elapsedBeforePause + (now - startedAt)
        const total = timerElapsedRef.current + (now - timerStartTime);
        // Note: we only update the active state timer startTime for delta computation, 
        // but we'll store the incremental difference.
        setTimerElapsed(total);
        setTimerStartTime(now);
      }, 100);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [timerIsRunning, timerStartTime]);

  // 5. Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        handleNext();
      } else if (e.code === "ArrowRight") {
        handleNext();
      } else if (e.code === "ArrowLeft") {
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStepIndex]);

  // 6. Navigation Actions
  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setDirection(1);
      setCurrentStepIndex((prev) => prev + 1);

      // Proactive Timer Start: if the user goes past step 0, automatically start the timer if not running!
      if (!timerIsRunning && timerElapsed === 0) {
        startTimer();
        triggerToast("¡Ruta iniciada! Cronómetro en marcha.");
      }
    } else {
      // Completed last step! Celebrate and finish
      if (timerIsRunning) {
        finishRun();
      } else {
        triggerToast("¡Has completado la ruta!");
      }
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setDirection(-1);
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleJumpToStep = (index: number) => {
    if (index >= 0 && index < steps.length) {
      setDirection(index > currentStepIndex ? 1 : -1);
      setCurrentStepIndex(index);
      setIsSidebarOpen(false); // Close on mobile after click
    }
  };

  // 7. Timer Actions
  const startTimer = () => {
    setTimerIsRunning(true);
    setTimerStartTime(Date.now());
  };

  const pauseTimer = () => {
    setTimerIsRunning(false);
    setTimerStartTime(null);
    triggerToast("Cronómetro pausado.");
  };

  const resetTimer = () => {
    setTimerIsRunning(false);
    setTimerStartTime(null);
    setTimerElapsed(0);
    triggerToast("Cronómetro reiniciado.");
  };

  const finishRun = () => {
    const finalElapsed = timerElapsed;
    const newEntry: RunHistoryEntry = {
      id: Math.random().toString(36).substr(2, 9),
      finishedAt: Date.now(),
      elapsed: finalElapsed,
      completedStepsCount: currentStepIndex + 1,
      totalSteps: steps.length
    };

    const updatedHistory = [newEntry, ...history].slice(0, 20); // Keep top 20
    setHistory(updatedHistory);
    localStorage.setItem("pokemmo_gym_rerun_history", JSON.stringify(updatedHistory));

    setTimerIsRunning(false);
    setTimerStartTime(null);
    setTimerElapsed(0);
    triggerToast("¡Run finalizada y guardada en el historial!");
    setShowHistory(true);
  };

  const handleResetRoute = () => {
    const confirmReset = window.confirm(
      "¿Seguro que deseas reiniciar tu progreso? Esto te devolverá al paso 1 y reiniciará el cronómetro."
    );
    if (confirmReset) {
      setCurrentStepIndex(0);
      setTimerIsRunning(false);
      setTimerStartTime(null);
      setTimerElapsed(0);
      triggerToast("Progreso y cronómetro reiniciados.");
    }
  };

  const handleClearHistory = () => {
    const confirmClear = window.confirm("¿Deseas vaciar el historial de runs?");
    if (confirmClear) {
      setHistory([]);
      localStorage.removeItem("pokemmo_gym_rerun_history");
      triggerToast("Historial limpio.");
    }
  };

  // 8. Calculations
  const currentStep = steps[currentStepIndex];
  const progressPercent = steps.length > 0 
    ? Math.round(((currentStepIndex + 1) / steps.length) * 100) 
    : 0;

  // Filter steps for the sidebar timeline
  const filteredSteps = steps.map((step, idx) => ({ ...step, originalIndex: idx })).filter((step) => {
    const query = searchQuery.toLowerCase();
    if (!query) return true;
    return (
      step.title.toLowerCase().includes(query) ||
      (step.description && step.description.toLowerCase().includes(query)) ||
      (step.region && step.region.toLowerCase().includes(query)) ||
      (step.gym && step.gym.toLowerCase().includes(query))
    );
  });

  // Color mappings based on step types and regions
  const getTypeBadgeStyles = (type: StepType) => {
    switch (type) {
      case "travel":
        return "bg-teal-500/10 text-teal-400 border border-teal-500/30";
      case "heal":
        return "bg-pink-500/10 text-pink-400 border border-pink-500/30";
      case "item":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/30";
      case "note":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/30";
      case "gym":
        return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30";
      default:
        return "bg-slate-500/10 text-slate-400 border border-slate-500/30";
    }
  };

  const getTypeNeonClass = (type: StepType, region?: string) => {
    if (type === "gym" && region) {
      return `neon-${region.toLowerCase()}`;
    }
    return `neon-${type}`;
  };

  const getStepIcon = (type: StepType) => {
    switch (type) {
      case "travel":
        return <Compass className="w-6 h-6" />;
      case "heal":
        return <Heart className="w-6 h-6 animate-pulse" />;
      case "item":
        return <Sparkles className="w-6 h-6" />;
      case "note":
        return <AlertTriangle className="w-6 h-6" />;
      case "gym":
        return <Swords className="w-6 h-6" />;
    }
  };

  const getRegionIcon = (region?: string) => {
    if (!region) return null;
    switch (region.toLowerCase()) {
      case "johto":
        return <Flame className="w-4 h-4 text-johto inline mr-1" />;
      case "hoenn":
        return <Droplet className="w-4 h-4 text-hoenn inline mr-1" />;
      case "sinnoh":
        return <Zap className="w-4 h-4 text-sinnoh inline mr-1" />;
      case "kanto":
        return <Shield className="w-4 h-4 text-kanto inline mr-1" />;
      case "unova":
        return <Shuffle className="w-4 h-4 text-unova inline mr-1" />;
      default:
        return null;
    }
  };

  // Framer Motion Carousel animations
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring" as const, stiffness: 350, damping: 30 },
        opacity: { duration: 0.25 },
        scale: { duration: 0.25 }
      }
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: "spring" as const, stiffness: 350, damping: 30 },
        opacity: { duration: 0.2 }
      }
    })
  };

  return (
    <div className="w-full h-screen flex flex-col md:flex-row relative bg-grid-dots overflow-hidden scanlines select-none font-sans">
      
      {/* 1. Sidebar - Timeline Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-80 glass-panel border-r border-white/5 flex flex-col transition-transform duration-300 md:translate-x-0 md:static md:w-80 md:h-full ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-johto" />
            <h1 className="font-bold text-lg tracking-wider text-slate-100 uppercase">
              Gym Reruns
            </h1>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-slate-200 md:hidden hover:bg-white/5 transition-colors"
            title="Cerrar barra lateral"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-white/5">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar gimnasio o paso..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-black/40 border border-white/5 rounded-md text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Step Timeline List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredSteps.map((step) => {
            const isCurrent = step.originalIndex === currentStepIndex;
            const isCompleted = step.originalIndex < currentStepIndex;
            const typeStyles = getTypeBadgeStyles(step.type);

            return (
              <button
                key={step.id}
                onClick={() => handleJumpToStep(step.originalIndex)}
                className={`w-full flex items-start space-x-3 p-2.5 rounded-lg text-left transition-all ${
                  isCurrent
                    ? "bg-indigo-500/10 border border-indigo-500/30 text-slate-100 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                    : isCompleted
                    ? "text-slate-500 hover:text-slate-300 hover:bg-white/2"
                    : "text-slate-300 hover:text-slate-100 hover:bg-white/5 border border-transparent"
                }`}
              >
                {/* Completion Bullet Indicator */}
                <div className="mt-1 flex-shrink-0 flex items-center justify-center">
                  {isCompleted ? (
                    <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                      <Check className="w-3 h-3" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-5 h-5 rounded-full bg-indigo-500 border border-indigo-400 flex items-center justify-center text-white text-xs font-bold relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-40"></span>
                      {step.originalIndex + 1}
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-slate-600/60 flex items-center justify-center text-[10px] text-slate-500 font-semibold">
                      {step.originalIndex + 1}
                    </div>
                  )}
                </div>

                {/* Step Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold text-sm truncate">
                      {step.gym || step.title}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider font-bold opacity-80 px-1 rounded flex-shrink-0 border border-white/5">
                      {step.type === "gym" ? step.region : step.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">
                    {step.type === "gym"
                      ? `${step.lead?.join(" + ") || ""}`
                      : step.description}
                  </p>
                </div>
              </button>
            );
          })}
          {filteredSteps.length === 0 && (
            <div className="py-8 text-center text-slate-500 text-sm">
              No se encontraron pasos.
            </div>
          )}
        </div>

        {/* Sidebar Footer - Keyboard Help Info */}
        <div className="p-3 border-t border-white/5 bg-black/20 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-1.5">
            <Keyboard className="w-4 h-4 text-indigo-400" />
            <span>Presiona <kbd className="bg-white/10 px-1 rounded text-[10px] border border-white/10 font-mono">Espacio</kbd></span>
          </div>
          <button
            onClick={() => setShowHotkeyHelp(true)}
            className="hover:text-indigo-400 transition-colors"
          >
            Atajo Global F4
          </button>
        </div>
      </aside>

      {/* Backdrop for sidebar on mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative z-10 px-4 py-3 md:px-8 md:py-6 overflow-y-auto">
        
        {/* Header Dashboard */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5 mb-6 md:mb-8">
          
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center justify-between sm:justify-start space-x-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-slate-300 md:hidden transition-all"
              title="Abrir menú de ruta"
            >
              <List className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Gym Rerun Assistant
                <span className="hidden sm:inline-flex items-center text-[10px] uppercase font-bold tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                  v2.0
                </span>
              </h2>
              <p className="text-xs text-slate-400 hidden sm:block">
                Guía secuencial optimizada paso a paso
              </p>
            </div>
            
            {/* Quick reset button for mobile */}
            <button
              onClick={handleResetRoute}
              className="p-2 sm:hidden rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 transition-all ml-auto"
              title="Reiniciar ruta completa"
            >
              <Power className="w-4 h-4" />
            </button>
          </div>

          {/* Session Timer Controls & Quick Actions */}
          <div className="flex items-center justify-between sm:justify-end gap-3 bg-white/3 border border-white/5 p-2 rounded-xl backdrop-blur-md">
            
            {/* Timer read-out */}
            <div className="flex items-center space-x-2.5 px-3 py-1">
              <Clock className="w-4 h-4 text-indigo-400" />
              <div className="flex flex-col">
                <span className="font-mono text-sm font-semibold tracking-wider text-slate-100 min-w-[70px]">
                  {formatTime(timerElapsed)}
                </span>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest leading-none font-bold">
                  {timerIsRunning ? "En progreso" : timerElapsed > 0 ? "Pausado" : "Sin iniciar"}
                </span>
              </div>
            </div>

            {/* Timer Actions */}
            <div className="flex items-center space-x-1 border-l border-white/10 pl-2">
              {!timerIsRunning ? (
                <button
                  onClick={startTimer}
                  className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500 hover:text-white transition-all"
                  title="Iniciar Cronómetro"
                >
                  <Play className="w-4 h-4 fill-current" />
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-white transition-all"
                  title="Pausar Cronómetro"
                >
                  <Pause className="w-4 h-4 fill-current" />
                </button>
              )}

              <button
                onClick={resetTimer}
                disabled={timerElapsed === 0}
                className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-slate-400 disabled:opacity-40 disabled:pointer-events-none hover:text-slate-200 transition-all"
                title="Reiniciar Cronómetro"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`p-1.5 rounded-lg border transition-all ${
                  showHistory
                    ? "bg-indigo-500 text-white border-indigo-400"
                    : "bg-white/5 border-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200"
                }`}
                title="Mostrar historial de runs"
              >
                <History className="w-4 h-4" />
              </button>
            </div>

            {/* Global Reset Route Button */}
            <button
              onClick={handleResetRoute}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/25 hover:border-red-500/35 text-red-400 text-xs font-semibold transition-all ml-1"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Reiniciar Ruta</span>
            </button>

          </div>
        </header>

        {/* 3. Main Step Card Container */}
        <div className="flex-1 flex flex-col justify-center items-center max-w-4xl w-full mx-auto pb-10">
          
          <div className="w-full relative min-h-[420px] md:min-h-[460px] flex items-center justify-center">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              
              {/* Dynamic Card rendering based on step type */}
              <motion.div
                key={currentStep.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className={`w-full glass-panel neon-glow rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden animate-neon-pulse ${getTypeNeonClass(
                  currentStep.type,
                  currentStep.region
                )}`}
              >
                
                {/* Ambient Grid overlay inside the active card */}
                <div className="absolute inset-0 bg-grid-dots opacity-10 pointer-events-none" />

                {/* Top Section: Badges & Regional indicators */}
                <div>
                  <div className="flex items-center justify-between mb-5 relative z-10">
                    <div className="flex items-center space-x-2">
                      <span className="p-2 rounded-xl bg-white/5 flex items-center justify-center">
                        {getStepIcon(currentStep.type)}
                      </span>
                      <span className={`text-[10px] uppercase font-extrabold tracking-widest px-2.5 py-1 rounded-full ${getTypeBadgeStyles(currentStep.type)}`}>
                        {currentStep.type === "gym" ? `GIMNASIO: ${currentStep.region}` : currentStep.type}
                      </span>
                    </div>

                    {currentStep.region && (
                      <span className="text-xs font-semibold text-slate-400 bg-white/3 border border-white/5 px-3 py-1 rounded-lg flex items-center">
                        {getRegionIcon(currentStep.region)}
                        {currentStep.region}
                      </span>
                    )}
                  </div>

                  {/* Title & Description of Card */}
                  <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-4 relative z-10">
                    {currentStep.title}
                  </h3>
                  
                  {currentStep.description && currentStep.type !== "gym" && (
                    <p className="text-slate-300 text-base md:text-lg leading-relaxed relative z-10 bg-black/10 p-4 rounded-2xl border border-white/5">
                      {currentStep.description}
                    </p>
                  )}
                  
                  {currentStep.type === "travel" && currentStep.region && (
                    <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-inner relative group z-10">
                      <img
                        src={`${basePath}/images/maps/map_${currentStep.region.toLowerCase()}.png`}
                        alt={`Mapa de viaje a ${currentStep.region}`}
                        className="w-full h-auto max-h-[240px] object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                        <span className="text-xs font-semibold text-slate-200 tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                          Punto de llegada de referencia en {currentStep.region}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Gym combat interface details */}
                  {currentStep.type === "gym" && (
                    <div className="mt-5 space-y-6 relative z-10">
                      
                      {/* Pokemon Lead vs Switch Columns */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Leads */}
                        {currentStep.lead && currentStep.lead.length > 0 && (
                          <div className="bg-black/30 border border-white/5 p-4 rounded-2xl">
                            <h4 className="text-xs uppercase font-extrabold tracking-widest text-indigo-400 mb-2.5 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                              Pokemon Iniciales (Lead)
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {currentStep.lead.map((pokemon, idx) => (
                                <span
                                  key={idx}
                                  className="px-3.5 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-200 text-sm font-semibold tracking-wide"
                                >
                                  {pokemon}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Switch To */}
                        {currentStep.switchTo && currentStep.switchTo.length > 0 && (
                          <div className="bg-black/30 border border-white/5 p-4 rounded-2xl">
                            <h4 className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 mb-2.5 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Cambios de Reemplazo
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {currentStep.switchTo.map((pokemon, idx) => (
                                <span
                                  key={idx}
                                  className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-200 text-sm font-semibold tracking-wide"
                                >
                                  {pokemon}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>

                      {/* Special Battle Strategies */}
                      {currentStep.actions && currentStep.actions.length > 0 && (
                        <div className="bg-black/40 border border-white/5 p-4 rounded-2xl">
                          <h4 className="text-xs uppercase font-extrabold tracking-widest text-amber-400 mb-3 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Estrategias Específicas
                          </h4>
                          <ul className="space-y-2 text-sm text-slate-300">
                            {currentStep.actions.map((action, idx) => {
                              const parts = action.split("→");
                              return (
                                <li
                                  key={idx}
                                  className="p-2.5 rounded-xl bg-white/2 hover:bg-white/5 border border-white/5 transition-all flex items-start justify-between gap-4"
                                >
                                  {parts.length > 1 ? (
                                    <>
                                      <span className="font-semibold text-slate-200 bg-white/5 px-2 py-0.5 rounded text-xs border border-white/5 self-center">
                                        {parts[0].trim()}
                                      </span>
                                      <span className="text-slate-300 text-right flex-1">
                                        {parts[1].trim()}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-slate-300">{action}</span>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}

                      {/* Display descriptions if present in gym step */}
                      {currentStep.description && (
                        <p className="text-xs text-slate-400 italic">
                          {currentStep.description}
                        </p>
                      )}

                    </div>
                  )}

                  {/* Formatting item swapping layout visually */}
                  {currentStep.type === "item" && (
                    <div className="mt-8 flex flex-col items-center justify-center bg-black/30 border border-white/5 p-6 rounded-2xl relative z-10">
                      {currentStep.description?.includes("->") ? (
                        (() => {
                          const parts = currentStep.description.split("->");
                          return (
                            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-center py-4">
                              <div className="bg-blue-500/10 border border-blue-500/30 px-5 py-3 rounded-2xl text-center">
                                <span className="text-[10px] text-blue-400 uppercase tracking-widest font-extrabold block mb-1">Pokémon</span>
                                <span className="text-lg font-bold text-white tracking-wide">{parts[0].trim()}</span>
                              </div>
                              <span className="text-2xl text-blue-500 font-extralight select-none">➔</span>
                              <div className="bg-indigo-500/10 border border-indigo-500/30 px-5 py-3 rounded-2xl text-center">
                                <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-extrabold block mb-1">Objeto Nuevo</span>
                                <span className="text-lg font-bold text-white tracking-wide">{parts[1].trim()}</span>
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        <span className="text-lg text-slate-100 font-bold">{currentStep.description}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Navigation Status and Hint inside card footer */}
                <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 relative z-10">
                  <div className="flex items-center space-x-1 text-[11px] font-medium tracking-wide">
                    <span>Paso {currentStepIndex + 1} de {steps.length}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-indigo-400 font-semibold">{progressPercent}% completado</span>
                  </div>
                  <span className="hidden sm:inline text-[10px] text-slate-500 uppercase tracking-widest font-semibold bg-white/3 border border-white/5 px-2 py-0.5 rounded">
                    F4 en juego para siguiente paso
                  </span>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

          {/* 4. Global Progress Bar & Manual Navigation Controls */}
          <div className="w-full mt-6 space-y-4 max-w-xl">
            
            {/* Real progress bar */}
            <div className="space-y-1">
              <div className="w-full bg-slate-900 border border-white/5 h-3 rounded-full overflow-hidden relative">
                <motion.div
                  className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full"
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Previous & Next Control Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handlePrev}
                disabled={currentStepIndex === 0}
                className="flex-1 flex items-center justify-center space-x-2 py-3.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:pointer-events-none hover:text-white transition-all font-semibold active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Anterior</span>
              </button>

              <button
                onClick={handleNext}
                className="flex-[2] flex items-center justify-center space-x-2 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 border border-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold transition-all shadow-[0_0_20px_rgba(99,102,241,0.25)] active:scale-95"
              >
                <span>{currentStepIndex === steps.length - 1 ? "Completar Ruta" : "Siguiente"}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

          </div>

        </div>

      </main>

      {/* 5. Toast Notifications overlay */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-950 border border-white/10 shadow-2xl rounded-2xl px-5 py-3 text-slate-100 flex items-center space-x-2.5 backdrop-blur-xl"
          >
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div>
            <span className="text-sm font-semibold tracking-wide">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. Run History Modal Panel Overlay */}
      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md glass-panel rounded-3xl p-6 shadow-2xl border border-white/10 z-10 relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
                <div className="flex items-center space-x-2">
                  <History className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-lg text-slate-100 uppercase tracking-wide">
                    Historial de Runs
                  </h3>
                </div>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* History list content */}
              <div className="max-h-[300px] overflow-y-auto space-y-2.5 pr-1">
                {history.length > 0 ? (
                  history.map((entry, idx) => {
                    const isBest = entry.elapsed === Math.min(...history.map((e) => e.elapsed));
                    return (
                      <div
                        key={entry.id}
                        className={`p-3.5 rounded-xl border flex items-center justify-between ${
                          isBest
                            ? "bg-amber-500/5 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.08)]"
                            : "bg-white/2 border-white/5"
                        }`}
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-xs text-slate-200">Run #{history.length - idx}</span>
                            {isBest && (
                              <span className="text-[9px] uppercase font-extrabold tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/25 px-1 rounded">
                                ¡Mejor Tiempo!
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            {formatDate(entry.finishedAt)} • {entry.completedStepsCount}/{entry.totalSteps} pasos
                          </span>
                        </div>
                        <span className="font-mono text-base font-bold text-slate-100 tracking-wide">
                          {formatTime(entry.elapsed)}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-slate-500 text-sm">
                    Aún no hay runs guardadas en tu historial.
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-5 pt-4 border-t border-white/5 flex gap-3">
                <button
                  onClick={handleClearHistory}
                  disabled={history.length === 0}
                  className="flex-1 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 disabled:opacity-40 disabled:pointer-events-none text-red-400 text-xs font-semibold tracking-wide transition-all"
                >
                  Vaciar Historial
                </button>
                <button
                  onClick={() => setShowHistory(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold tracking-wide transition-all"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. Hotkey Helper Modal Panel */}
      <AnimatePresence>
        {showHotkeyHelp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHotkeyHelp(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md glass-panel rounded-3xl p-6 shadow-2xl border border-white/10 z-10 relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
                <div className="flex items-center space-x-2">
                  <Keyboard className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-lg text-slate-100 uppercase tracking-wide">
                    Atajo de Teclado AutoHotkey
                  </h3>
                </div>
                <button
                  onClick={() => setShowHotkeyHelp(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
                <p>
                  Para poder ir marcando la guía paso a paso sin tener que salirte del juego (PokeMMO), puedes utilizar la configuración global de <strong>AutoHotkey (AHK)</strong>:
                </p>
                <div className="bg-black/40 border border-white/5 p-4 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-xs border-b border-white/5 pb-1.5">
                    <span className="font-semibold text-indigo-400">Acción</span>
                    <span className="font-semibold text-indigo-400">Tecla</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span>En el juego (PokeMMO)</span>
                    <kbd className="bg-white/10 px-2 py-0.5 rounded border border-white/10 font-bold font-mono">F4</kbd>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span>Siguiente paso (Manual)</span>
                    <kbd className="bg-white/10 px-2 py-0.5 rounded border border-white/10 font-bold font-mono">Espacio</kbd>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span>Paso anterior (Manual)</span>
                    <kbd className="bg-white/10 px-2 py-0.5 rounded border border-white/10 font-bold font-mono">← / Flecha Izq</kbd>
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  Asegúrate de tener la pestaña de la guía abierta en tu navegador. El script global enviará el comando al navegador y te regresará inmediatamente al juego para no perder tiempo.
                </p>
              </div>

              {/* Close Action */}
              <div className="mt-6 pt-4 border-t border-white/5">
                <button
                  onClick={() => setShowHotkeyHelp(false)}
                  className="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold tracking-wide transition-all"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
