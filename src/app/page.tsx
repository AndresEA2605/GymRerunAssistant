"use client";

import React, { useState, useEffect, useRef, useCallback, memo } from "react";
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
  List,
  X,
  History,
  Info,
  Power
} from "lucide-react";
import rawSteps from "../data/route.json";
import { RouteStep, StepType, RunHistoryEntry } from "../types";

const steps = rawSteps as RouteStep[];

const formatTime = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((unit) => String(unit).padStart(2, "0"))
    .join(":");
};

// Optimized isolated timer to prevent full re-renders
const TimerDisplay = memo(({ isRunning, startTime, elapsedBeforePause }: { isRunning: boolean, startTime: number | null, elapsedBeforePause: number }) => {
  const [elapsed, setElapsed] = useState(elapsedBeforePause);
  
  useEffect(() => {
    let frameId: number;
    const update = () => {
      if (isRunning && startTime) {
        setElapsed(elapsedBeforePause + (Date.now() - startTime));
        frameId = requestAnimationFrame(update);
      }
    };
    if (isRunning) {
      frameId = requestAnimationFrame(update);
    } else {
      setElapsed(elapsedBeforePause);
    }
    return () => { if (frameId) cancelAnimationFrame(frameId); };
  }, [isRunning, startTime, elapsedBeforePause]);

  return <span className="font-mono text-xl md:text-2xl font-bold tracking-wider">{formatTime(elapsed)}</span>;
});
TimerDisplay.displayName = "TimerDisplay";
/* -- Pokeball SVG -- */
const PokeballSVG = ({ opacity = 0.18 }: { opacity?: number }) => (
  <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", opacity }}>
    <circle cx="50" cy="50" r="47" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="3"/>
    <path d="M 3 50 A 47 47 0 0 1 97 50 Z" fill="rgba(220,50,50,0.22)"/>
    <line x1="3" y1="50" x2="97" y2="50" stroke="rgba(255,255,255,0.35)" strokeWidth="3"/>
    <circle cx="50" cy="50" r="14" fill="rgba(10,10,15,0.8)" stroke="rgba(255,255,255,0.35)" strokeWidth="3"/>
    <circle cx="50" cy="50" r="7" fill="rgba(255,255,255,0.12)"/>
  </svg>
);

const POKEBALLS = [
  { x:"8%",  dur:32, del:0  },
  { x:"22%", dur:26, del:7  },
  { x:"38%", dur:38, del:3  },
  { x:"55%", dur:29, del:14 },
  { x:"70%", dur:35, del:5  },
  { x:"84%", dur:24, del:19 },
  { x:"15%", dur:42, del:11 },
  { x:"62%", dur:31, del:22 },
  { x:"90%", dur:45, del:2  },
];
const SIZES = [28, 20, 36, 16, 24, 32, 18, 22, 30];
const STARS = Array.from({length: 28}, (_, i) => ({
  x: `${(i * 37 + 11) % 100}%`,
  y: `${(i * 53 + 7)  % 100}%`,
  s: (i % 3) + 2,
  dur: 1.8 + (i % 5) * 0.6,
  del: (i * 0.37) % 4,
}));

const PokeBackground = memo(() => (
  <>
    <div className="aurora-bg" />
    {POKEBALLS.map((pb, i) => (
      <div
        key={i}
        className="pokeball-float"
        style={{
          "--pb-x": pb.x,
          "--pb-dur": `${pb.dur}s`,
          "--pb-del": `${pb.del}s`,
          width:  SIZES[i],
          height: SIZES[i],
        } as React.CSSProperties}
      >
        <PokeballSVG opacity={0.13 + (i % 3) * 0.03} />
      </div>
    ))}
    {STARS.map((s, i) => (
      <div
        key={i}
        className="star-twinkle"
        style={{
          left:   s.x,
          top:    s.y,
          width:  s.s,
          height: s.s,
          "--tw-dur": `${s.dur}s`,
          "--tw-del": `${s.del}s`,
        } as React.CSSProperties}
      />
    ))}
  </>
));
PokeBackground.displayName = "PokeBackground";


export default function Home() {
  const [showMenu, setShowMenu] = useState<boolean>(true);
  const [menuExiting, setMenuExiting] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showTeam, setShowTeam] = useState<boolean>(false);
  const [slideClass, setSlideClass] = useState<string>("");
  const [slideKey, setSlideKey] = useState<number>(0);

  const [timerIsRunning, setTimerIsRunning] = useState<boolean>(false);
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);
  const [timerElapsed, setTimerElapsed] = useState<number>(0);
  const [history, setHistory] = useState<RunHistoryEntry[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentStep = steps[currentStepIndex] || steps[0];

  const triggerToast = useCallback((message: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 2000);
  }, []);

  useEffect(() => {
    const savedStep = localStorage.getItem("pkmmo_gym_step");
    if (savedStep) {
      const idx = Number(savedStep);
      setCurrentStepIndex(idx);
      // If there's existing progress, skip the menu automatically
      if (idx > 0) setShowMenu(false);
    }

    const savedTimer = localStorage.getItem("pkmmo_gym_timer");
    if (savedTimer) {
      try {
        const parsed = JSON.parse(savedTimer);
        setTimerElapsed(parsed.elapsed || 0);
        setTimerIsRunning(parsed.isRunning || false);
        if (parsed.isRunning && parsed.startedAt) setTimerStartTime(parsed.startedAt);
      } catch (e) { /* ignore */ }
    }

    const savedHistory = localStorage.getItem("pkmmo_gym_history");
    if (savedHistory) {
      try { setHistory(JSON.parse(savedHistory)); } catch (e) { /* ignore */ }
    }
  }, []);

  useEffect(() => localStorage.setItem("pkmmo_gym_step", currentStepIndex.toString()), [currentStepIndex]);

  useEffect(() => {
    localStorage.setItem("pkmmo_gym_timer", JSON.stringify({
      elapsed: timerElapsed,
      isRunning: timerIsRunning,
      startedAt: timerStartTime,
    }));
  }, [timerElapsed, timerIsRunning, timerStartTime]);

  const handleNext = useCallback(() => {
    setCurrentStepIndex((prev) => {
      const nextIdx = Math.min(prev + 1, steps.length - 1);
      if (prev === 0 && nextIdx === 1) {
        setTimerIsRunning(r => {
          if (!r) {
            setTimerStartTime(Date.now());
            triggerToast("¡Ruta iniciada!");
            return true;
          }
          return r;
        });
      }
      if (nextIdx !== prev) {
        setSlideClass("slide-in-right");
        setSlideKey(k => k + 1);
      }
      return nextIdx;
    });
  }, [triggerToast]);

  const handlePrev = useCallback(() => {
    setCurrentStepIndex((prev) => {
      const nextIdx = Math.max(prev - 1, 0);
      if (nextIdx !== prev) {
        setSlideClass("slide-in-left");
        setSlideKey(k => k + 1);
      }
      return nextIdx;
    });
  }, []);

  const handleNextRef = useRef(handleNext);
  const handlePrevRef = useRef(handlePrev);
  useEffect(() => { handleNextRef.current = handleNext; }, [handleNext]);
  useEffect(() => { handlePrevRef.current = handlePrev; }, [handlePrev]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName || "")) return;
      if (e.code === "Space" || e.code === "ArrowRight") {
        e.preventDefault();
        handleNextRef.current();
      } else if (e.code === "ArrowLeft") {
        handlePrevRef.current();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const startTimer = () => { setTimerIsRunning(true); setTimerStartTime(Date.now()); };
  const pauseTimer = () => {
    setTimerIsRunning(false);
    if (timerStartTime) setTimerElapsed(prev => prev + (Date.now() - timerStartTime));
    setTimerStartTime(null);
  };
  const resetTimer = () => { setTimerIsRunning(false); setTimerStartTime(null); setTimerElapsed(0); };

  const finishRun = () => {
    const finalElapsed = timerIsRunning && timerStartTime ? timerElapsed + (Date.now() - timerStartTime) : timerElapsed;
    const newEntry: RunHistoryEntry = {
      id: Math.random().toString(36).substr(2, 9),
      finishedAt: Date.now(),
      elapsed: finalElapsed,
      completedStepsCount: currentStepIndex + 1,
      totalSteps: steps.length
    };
    const updatedHistory = [newEntry, ...history].slice(0, 20);
    setHistory(updatedHistory);
    localStorage.setItem("pkmmo_gym_history", JSON.stringify(updatedHistory));
    resetTimer();
    triggerToast("¡Run completada!");
  };

  const renderIcon = (type: StepType) => {
    if (type === "gym") return <Swords className="w-4 h-4 text-indigo-400" />;
    if (type === "prep") return <Sparkles className="w-4 h-4 text-amber-400" />;
    if (type === "note") return <Info className="w-4 h-4 text-red-400" />;
    return <Compass className="w-4 h-4" />;
  };

  // ── MENU SCREEN ──────────────────────────────────────────────────────────
  const exitMenu = (callback?: () => void) => {
    setMenuExiting(true);
    setTimeout(() => {
      if (callback) callback();
      setShowMenu(false);
      setMenuExiting(false);
    }, 380);
  };

  if (showMenu) {
    const bestRun = history.length > 0 ? history.reduce((a, b) => a.elapsed < b.elapsed ? a : b) : null;
    return (
      <div className={`fade-in-screen min-h-screen bg-neutral-950 text-neutral-200 font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden ${menuExiting ? 'menu-exit' : ''}`}>
        <PokeBackground />
        {/* Glow behind title */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-40 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 w-full max-w-lg flex flex-col items-center gap-8">

          {/* Badge */}
          <span className="text-[10px] uppercase tracking-widest font-black text-indigo-400 border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 rounded-full">PokeMMO Speedrun Tool</span>

          {/* Title */}
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white" style={{ textShadow: '0 0 60px rgba(99,102,241,0.5)' }}>GYM RERUN</h1>
            <h2 className="text-2xl font-bold text-indigo-400 tracking-widest mt-1">ASSISTANT</h2>
            <p className="text-neutral-500 text-sm mt-3">Guía secuencial para 33 Gym Reruns en PokeMMO</p>
          </div>

          {/* Stats Row */}
          <div className="w-full grid grid-cols-3 gap-3 text-center">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
              <div className="text-2xl font-black text-white">33</div>
              <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Gimnasios</div>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
              <div className="text-2xl font-black text-indigo-400">{steps.length}</div>
              <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Pasos Totales</div>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
              <div className="text-2xl font-black text-amber-400">{bestRun ? formatTime(bestRun.elapsed) : '--:--:--'}</div>
              <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Mejor Tiempo</div>
            </div>
          </div>

          {/* Earnings Breakdown */}
          <div className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-2 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
              <span className="text-[10px] uppercase font-black tracking-widest text-neutral-500">Ganancias Aproximadas (33 Gyms)</span>
              <a
                href="https://c4vv.github.io/CharmCalc/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
              >CharmCalc ↗</a>
            </div>
            <div className="grid grid-cols-2 divide-x divide-neutral-800">
              {/* Sin amuleto */}
              <div className="p-4 text-center">
                <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Sin Moneda Amuleto</div>
                <div className="text-2xl font-black text-white">~297,000</div>
                <div className="text-xs text-neutral-500 mt-1">~9,000 × 33 gyms</div>
                <div className="mt-2 text-[10px] text-neutral-600">Multiplicador × 1.0</div>
              </div>
              {/* Con amuleto */}
              <div className="p-4 text-center bg-emerald-950/10">
                <div className="text-[10px] uppercase tracking-widest text-emerald-500 mb-1">Con Moneda Amuleto</div>
                <div className="text-2xl font-black text-emerald-400">~446,000</div>
                <div className="text-xs text-neutral-500 mt-1">~13,500 × 33 gyms</div>
                <div className="mt-2 text-[10px] text-emerald-600 font-bold">Multiplicador × 1.5</div>
              </div>
            </div>
            <div className="px-4 py-2 border-t border-neutral-800 text-[10px] text-neutral-600 text-center">
              La Moneda Amuleto se obtiene en el juego o GTL · El precio varía — usa CharmCalc para ver cuál conviene
            </div>
          </div>

          {/* YouTube link */}
          <div className="w-full bg-neutral-900/60 border border-dashed border-neutral-700 rounded-2xl p-4 flex items-center justify-between gap-4">
            <a
              href="https://www.youtube.com/watch?v=himBCqDN2-I"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-left group flex-1"
            >
              <div className="w-10 h-10 flex-shrink-0 bg-red-600 rounded-xl flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.516 0-9.387.507A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.507 9.386.507 9.386.507s7.518 0 9.387-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">Ver Run de Ejemplo</div>
                <div className="text-[11px] text-neutral-500">33 Gyms completo · YouTube</div>
              </div>
            </a>
            <ChevronRight className="w-5 h-5 text-neutral-600" />
          </div>

          {/* Start Button */}
          {currentStepIndex > 0 ? (
            <div className="w-full flex flex-col gap-3">
              <button
                onClick={() => exitMenu()}
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white text-xl font-black rounded-2xl transition-all shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_50px_rgba(99,102,241,0.5)] tracking-wide"
              >
                ▶ CONTINUAR RUTA
                <span className="block text-sm font-normal text-indigo-300 mt-0.5">Paso {currentStepIndex + 1} / {steps.length}</span>
              </button>
              <button
                onClick={() => exitMenu(() => { setCurrentStepIndex(0); resetTimer(); })}
                className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 text-sm font-bold rounded-xl transition-colors"
              >
                Reiniciar desde cero
              </button>
            </div>
          ) : (
            <button
              onClick={() => exitMenu()}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white text-xl font-black rounded-2xl transition-all shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_50px_rgba(99,102,241,0.5)] tracking-wide btn-glow-active"
            >
              ▶ INICIAR RUTA
            </button>
          )}

          {/* Hotkey tip */}
          <p className="text-xs text-neutral-600">⌨ &nbsp;<kbd className="bg-neutral-800 border border-neutral-700 px-1.5 py-0.5 rounded text-neutral-400 font-mono text-[11px]">Espacio</kbd> para avanzar &nbsp;·&nbsp; <kbd className="bg-neutral-800 border border-neutral-700 px-1.5 py-0.5 rounded text-neutral-400 font-mono text-[11px]">F4</kbd> desde el juego</p>

          {/* Credits */}
          <div className="w-full border-t border-neutral-800/60 pt-4 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-neutral-500">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-pink-400"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              <span className="text-xs font-semibold">Dreasy__</span>
            </div>
            <div className="w-px h-4 bg-neutral-700" />
            <div className="flex items-center gap-2 text-neutral-500">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-green-400"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
              <span className="text-xs font-semibold">Dreasy</span>
            </div>
          </div>
          <p className="text-[10px] text-neutral-700">Creado por Dreasy — PokeMMO Gym Rerun Assistant</p>
        </div>
      </div>
    );
  }
  // ── END MENU SCREEN ──────────────────────────────────────────────────────

  return (
    <div className="app-enter flex h-screen bg-neutral-950 text-neutral-200 overflow-hidden font-sans relative">
      <PokeBackground />
      
      {/* Sidebar Compacta */}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col transition-transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-950">
          <h1 className="font-bold text-sm tracking-widest text-neutral-400 uppercase">Ruta Gym</h1>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-neutral-500"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {steps.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => setCurrentStepIndex(idx)}
              className={`w-full text-left px-2 py-1.5 rounded flex items-center gap-2 text-sm transition-colors ${idx === currentStepIndex ? "bg-indigo-600 text-white font-bold" : idx < currentStepIndex ? "text-neutral-500 hover:bg-neutral-800" : "text-neutral-300 hover:bg-neutral-800"}`}
            >
              <span className={`flex-shrink-0 w-6 text-center text-[10px] font-bold tabular-nums ${idx === currentStepIndex ? 'text-white' : idx < currentStepIndex ? 'text-neutral-600' : 'text-neutral-500'}`}>{idx + 1}</span>
              <span className="opacity-70 flex-shrink-0">{renderIcon(step.type)}</span>
              <span className="truncate">{step.title}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative z-10 overflow-y-auto pb-20">
        
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-1.5 bg-neutral-800 rounded text-neutral-300"><List className="w-5 h-5" /></button>
            <div className="text-xs text-neutral-500">Paso <span className="font-bold text-neutral-300">{currentStepIndex + 1}</span> / {steps.length}</div>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={() => setShowTeam(true)} className="px-3 py-1.5 bg-violet-900/40 text-violet-300 border border-violet-700/40 rounded hover:bg-violet-800/50 text-xs font-bold uppercase tracking-wider">Equipo</button>
            <button onClick={() => setShowMenu(true)} className="px-3 py-1.5 bg-neutral-800 text-neutral-400 rounded hover:bg-neutral-700 text-xs font-bold uppercase tracking-wider">Menú</button>
            <button onClick={() => setShowHistory(true)} className="p-2 bg-neutral-800 text-neutral-400 rounded hover:bg-neutral-700"><History className="w-4 h-4" /></button>
            <button onClick={() => { if(window.confirm("¿Reiniciar ruta?")) { setCurrentStepIndex(0); resetTimer(); } }} className="p-2 bg-red-900/20 text-red-400 rounded hover:bg-red-900/40"><Power className="w-4 h-4" /></button>
          </div>
        </header>

        {/* Card View */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
          <div key={slideKey} className={`w-full max-w-2xl bg-neutral-900/80 backdrop-blur-sm rounded-2xl border border-neutral-800 p-6 md:p-10 shadow-2xl overflow-hidden ${slideClass}`}>
            
            <div className="flex items-center gap-3 mb-6">
              <span className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">{renderIcon(currentStep.type)}</span>
              <h2 className="text-3xl font-black tracking-tight text-white">{currentStep.title}</h2>
              {currentStep.region && <span className="ml-auto text-xs font-bold text-neutral-500 uppercase tracking-widest bg-neutral-950 px-2 py-1 rounded">{currentStep.region}</span>}
            </div>

            {/* Gym View */}
            {currentStep.type === "gym" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {currentStep.lead && (
                    <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                      <div className="text-[10px] text-indigo-400 uppercase font-black tracking-widest mb-2">Leads</div>
                      <div className="font-semibold">{currentStep.lead.join(" • ")}</div>
                    </div>
                  )}
                  {currentStep.switchTo && (
                    <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                      <div className="text-[10px] text-emerald-400 uppercase font-black tracking-widest mb-2">Cambios Seguros</div>
                      <div className="font-semibold">{currentStep.switchTo.join(" • ")}</div>
                    </div>
                  )}
                </div>
                {currentStep.actions && (
                  <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                    <div className="text-[10px] text-amber-400 uppercase font-black tracking-widest mb-3">Estrategia vs Variantes</div>
                    <ul className="space-y-2">
                      {currentStep.actions.map((act, i) => {
                        const parts = act.split("→");
                        return (
                          <li key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm bg-neutral-900 p-2 rounded border border-neutral-800">
                            {parts.length > 1 ? (
                              <><span className="font-bold text-white whitespace-nowrap">{parts[0].trim()}</span> <span className="text-neutral-500 hidden sm:inline">→</span> <span className="text-neutral-300">{parts[1].trim()}</span></>
                            ) : <span>{act}</span>}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Prep View (Merged items, heal, travel) */}
            {currentStep.type === "prep" && (
              <div className="space-y-4">
                {currentStep.heal && (
                  <div className="flex items-center gap-3 bg-red-950/20 border border-red-900/30 p-4 rounded-xl text-red-400 font-bold">
                    <Heart className="w-5 h-5 fill-current" /> Curar equipo en el Centro Pokémon
                  </div>
                )}
                {currentStep.items && currentStep.items.length > 0 && (
                  <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                    <div className="text-[10px] text-blue-400 uppercase font-black tracking-widest mb-3 flex items-center gap-2"><Sparkles className="w-3 h-3"/> Equipar Objetos</div>
                    <ul className="space-y-2">
                      {currentStep.items.map((it, i) => {
                        const isScarf = it.item.toLowerCase().includes("panuelo") || it.item.toLowerCase().includes("pañuelo");
                        return (
                          <li key={i} className={`flex items-center justify-between p-3 rounded border ${isScarf ? 'bg-indigo-900/40 border-indigo-500/50' : 'bg-neutral-900 border-neutral-800 opacity-60'}`}>
                            <span className={`font-semibold ${isScarf ? 'text-white' : 'text-neutral-400'}`}>{it.pokemon.join(" • ")}</span>
                            <span className={`${isScarf ? 'text-indigo-400 bg-indigo-950 px-3 py-1 text-base shadow-[0_0_10px_rgba(99,102,241,0.2)]' : 'text-neutral-500 bg-neutral-950 px-2 py-1 text-xs'} font-bold rounded uppercase tracking-wider`}>
                              ➔ {it.item}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
                {currentStep.travel && (
                  <div className="flex items-center gap-3 bg-teal-950/20 border border-teal-900/30 p-4 rounded-xl text-teal-400 font-bold">
                    <Compass className="w-5 h-5" /> Viajar hacia {currentStep.travel}
                  </div>
                )}
              </div>
            )}

            {/* Note View */}
            {currentStep.type === "note" && (
              <div className="bg-amber-950/20 border border-amber-900/30 p-6 rounded-xl text-amber-400 text-lg font-bold text-center">
                {currentStep.description}
              </div>
            )}
            
          </div>

          {/* Navigation */}
          <div className="w-full max-w-2xl mt-6 space-y-3">
            <div className="flex gap-4">
              <button onClick={handlePrev} disabled={currentStepIndex === 0} className="flex-1 py-4 bg-neutral-900 rounded-xl font-bold text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-20 transition-colors">← Anterior</button>
              <button onClick={currentStepIndex === steps.length - 1 ? finishRun : handleNext} className="flex-[2] py-4 bg-indigo-600 rounded-xl font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/20 transition-all text-lg">
                {currentStepIndex === steps.length - 1 ? "¡Finalizar!" : "Siguiente (Espacio) →"}
              </button>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-neutral-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="progress-shimmer h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.round(((currentStepIndex + 1) / steps.length) * 100)}%` }}
              />
            </div>
            <div className="text-center text-xs text-neutral-500 font-mono">
              {Math.round(((currentStepIndex + 1) / steps.length) * 100)}% completado
            </div>
          </div>
        </div>
      </main>

      {/* ── Floating Timer Bar ─ always visible, bottom of viewport ── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-center gap-6 bg-neutral-900/95 border-t-2 border-indigo-500/40 backdrop-blur-sm px-6 py-3">
        <TimerDisplay isRunning={timerIsRunning} startTime={timerStartTime} elapsedBeforePause={timerElapsed} />
        <div className="flex gap-1">
          {!timerIsRunning ? (
            <button onClick={startTimer} title="Iniciar" className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold text-sm flex items-center gap-1"><Play className="w-3.5 h-3.5 fill-current"/>Iniciar</button>
          ) : (
            <button onClick={pauseTimer} title="Pausar" className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded font-bold text-sm flex items-center gap-1"><Pause className="w-3.5 h-3.5 fill-current"/>Pausar</button>
          )}
          <button onClick={resetTimer} title="Reiniciar" className="px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 text-neutral-300 rounded font-bold text-sm"><RotateCcw className="w-3.5 h-3.5"/></button>
        </div>
        <span className="text-xs text-neutral-500 font-mono hidden sm:inline">F4 en juego · Espacio en web</span>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-800 border border-neutral-700 shadow-2xl rounded px-4 py-2 text-white text-sm font-bold animate-in slide-in-from-bottom-4 fade-in">
          {toastMessage}
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl">Historial</h3>
              <button onClick={() => setShowHistory(false)} className="text-neutral-500 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto space-y-2">
              {history.length > 0 ? history.map((entry, idx) => (
                <div key={entry.id} className="bg-neutral-950 p-3 rounded flex justify-between items-center border border-neutral-800">
                  <div>
                    <div className="font-bold text-sm">Run #{history.length - idx}</div>
                    <div className="text-xs text-neutral-500">{new Date(entry.finishedAt).toLocaleDateString()}</div>
                  </div>
                  <div className="font-mono text-lg font-bold text-indigo-400">{formatTime(entry.elapsed)}</div>
                </div>
              )) : <div className="text-neutral-500 text-center py-8">No hay historial.</div>}
            </div>
          </div>
        </div>
      )}

      {/* Team Modal */}
      {showTeam && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto" onClick={() => setShowTeam(false)}>
          <div className="relative w-full max-w-3xl my-4" onClick={e => e.stopPropagation()}>
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-neutral-950 border-b border-neutral-800">
                <div>
                  <h3 className="font-black text-lg text-white">Equipo de la Run</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Choice Band Weezing · Scarf Vanilluxe · Specs resto</p>
                </div>
                <button onClick={() => setShowTeam(false)} className="text-neutral-500 hover:text-white"><X className="w-6 h-6" /></button>
              </div>
              {/* Team Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">

                {/* Hydreigon */}
                <div className="bg-neutral-950 border border-indigo-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">&#x1F409;</span>
                    <div>
                      <div className="font-black text-indigo-300">H1 — Hydreigon</div>
                      <div className="text-[10px] text-neutral-500">Levitate · Modest · Choice Specs</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-neutral-400 mb-2">EVs: 6 HP / 212 SpA / 40 SpD / 252 Spe</div>
                  <div className="text-[11px] text-neutral-500 mb-2">IVs: Max 14 HP / X Atk / Max 14 Def / 31 Spa / Low Spd / 31 Spe</div>
                  <div className="grid grid-cols-2 gap-1">
                    {['Surf','Sunny Day','Rain Dance','Tailwind'].map(m => <span key={m} className="text-[11px] bg-indigo-950/50 border border-indigo-800/30 px-2 py-0.5 rounded text-indigo-300">{m}</span>)}
                  </div>
                </div>

                {/* Weezing */}
                <div className="bg-neutral-950 border border-purple-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">&#x1F4A8;</span>
                    <div>
                      <div className="font-black text-purple-300">W1 — Weezing</div>
                      <div className="text-[10px] text-neutral-500">Neutralizing Gas · Adamant · Choice Band</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-neutral-400 mb-2">EVs: 252 Atk / 6 SpD / 252 Spe</div>
                  <div className="text-[11px] text-neutral-500 mb-2">IVs: 31 HP / 31 Atk / High Def / X Spa / 31 Spd / 31 Spe</div>
                  <div className="grid grid-cols-2 gap-1">
                    {['Explosion','Assurance','Incinerate','Sunny Day'].map(m => <span key={m} className="text-[11px] bg-purple-950/50 border border-purple-800/30 px-2 py-0.5 rounded text-purple-300">{m}</span>)}
                  </div>
                </div>

                {/* Togekiss */}
                <div className="bg-neutral-950 border border-sky-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">&#x1F54A;</span>
                    <div>
                      <div className="font-black text-sky-300">TO — Togekiss</div>
                      <div className="text-[10px] text-neutral-500">Serene Grace · Modest · Choice Scarf</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-neutral-400 mb-2">EVs: 252 SpA / 6 SpD / 252 Spe</div>
                  <div className="text-[11px] text-neutral-500 mb-2">IVs: X HP / X Atk / X Def / 31 Spa / X Spd / 31 Spe</div>
                  <div className="grid grid-cols-2 gap-1">
                    {['Hyper Voice','Psyshock','Signal Beam','Psychic'].map(m => <span key={m} className="text-[11px] bg-sky-950/50 border border-sky-800/30 px-2 py-0.5 rounded text-sky-300">{m}</span>)}
                  </div>
                </div>

                {/* Typhlosion */}
                <div className="bg-neutral-950 border border-orange-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">&#x1F525;</span>
                    <div>
                      <div className="font-black text-orange-300">TY — Typhlosion</div>
                      <div className="text-[10px] text-neutral-500">Blaze · Modest · Choice Specs</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-neutral-400 mb-2">EVs: 252 SpA / 6 SpD / 252 Spe</div>
                  <div className="text-[11px] text-neutral-500 mb-2">IVs: X HP / X Atk / X Def / 31 Spa / X Spd / 31 Spe</div>
                  <div className="grid grid-cols-2 gap-1">
                    {['Eruption','Swift','Cut','Helping Hand'].map(m => <span key={m} className="text-[11px] bg-orange-950/50 border border-orange-800/30 px-2 py-0.5 rounded text-orange-300">{m}</span>)}
                  </div>
                </div>

                {/* Vanilluxe */}
                <div className="bg-neutral-950 border border-cyan-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">&#x2744;</span>
                    <div>
                      <div className="font-black text-cyan-300">Vanilluxe @ Choice Scarf</div>
                      <div className="text-[10px] text-neutral-500">Snow Warning · Timid · Lv. 100</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-neutral-400 mb-2">EVs: 10 HP / 252 SpA / 248 Spe</div>
                  <div className="text-[11px] text-neutral-500 mb-2">IVs: X HP / X Atk / X Def / 31 Spa / X Spd / 31 Spe</div>
                  <div className="grid grid-cols-2 gap-1">
                    {['Blizzard','Hyper Voice','Water Pulse','Flash Cannon'].map(m => <span key={m} className="text-[11px] bg-cyan-950/50 border border-cyan-800/30 px-2 py-0.5 rounded text-cyan-300">{m}</span>)}
                  </div>
                </div>

                {/* Blastoise */}
                <div className="bg-neutral-950 border border-blue-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">&#x1F30A;</span>
                    <div>
                      <div className="font-black text-blue-300">BW — Blastoise</div>
                      <div className="text-[10px] text-neutral-500">Torrent · Modest · Choice Specs</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-neutral-400 mb-2">EVs: 252 SpA / 10 SpD / 248 Spe</div>
                  <div className="text-[11px] text-neutral-500 mb-2">IVs: 31 HP / 31 Spe · High Spd / 31 Spa</div>
                  <div className="grid grid-cols-2 gap-1">
                    {['Water Spout','Helping Hand','Blizzard'].map(m => <span key={m} className="text-[11px] bg-blue-950/50 border border-blue-800/30 px-2 py-0.5 rounded text-blue-300">{m}</span>)}
                  </div>
                </div>

              </div>
              <div className="px-6 py-3 bg-neutral-950 border-t border-neutral-800 text-[10px] text-neutral-600 text-center">
                Click fuera del modal para cerrar · Creado por Dreasy
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
