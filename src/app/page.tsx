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

export default function Home() {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);

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
    if (savedStep) setCurrentStepIndex(Number(savedStep));

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
      return nextIdx;
    });
  }, [triggerToast]);

  const handlePrev = useCallback(() => setCurrentStepIndex((prev) => Math.max(prev - 1, 0)), []);

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

  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-200 overflow-hidden font-sans">
      
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
      <main className="flex-1 flex flex-col h-full relative z-10 overflow-y-auto bg-neutral-950 pb-20">
        
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-1.5 bg-neutral-800 rounded text-neutral-300"><List className="w-5 h-5" /></button>
            <div className="text-xs text-neutral-500">Paso <span className="font-bold text-neutral-300">{currentStepIndex + 1}</span> / {steps.length}</div>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={() => setShowHistory(true)} className="p-2 bg-neutral-800 text-neutral-400 rounded hover:bg-neutral-700"><History className="w-4 h-4" /></button>
            <button onClick={() => { if(window.confirm("¿Reiniciar ruta?")) { setCurrentStepIndex(0); resetTimer(); } }} className="p-2 bg-red-900/20 text-red-400 rounded hover:bg-red-900/40"><Power className="w-4 h-4" /></button>
          </div>
        </header>

        {/* Card View */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-2xl bg-neutral-900 rounded-2xl border border-neutral-800 p-6 md:p-10 shadow-2xl">
            
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
            <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-300"
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
    </div>
  );
}
