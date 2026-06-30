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
  X,
  History,
  Info,
  Power,
  Clock,
  Users,
} from "lucide-react";
import { RouteStep, StepType, RunHistoryEntry } from "../types";

export type GymCoordMap = Record<string, { region: string; x: number; y: number }>;
export type RegionMap = Record<string, string>;

export interface GymRerunConfig {
  totalGyms?: number;
  title?: string;
  subtitle?: string;
  description?: string;
  gymResetMs?: number;
  storagePrefix?: string;
}

export interface GymRerunAssistantProps {
  steps: RouteStep[];
  gymCoords: GymCoordMap;
  regionMap: RegionMap;
  config?: GymRerunConfig;
}

type CooldownState = {
  endAt: number | null;
  lastGym: string | null;
};

const formatTime = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((unit) => String(unit).padStart(2, "0"))
    .join(":");
};

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
    }
    return () => { if (frameId) cancelAnimationFrame(frameId); };
  }, [isRunning, startTime, elapsedBeforePause]);

  return <span className={`font-mono fs-mono font-bold tracking-wider ${isRunning ? 'timer-running text-indigo-300' : ''}`}>{formatTime(isRunning ? elapsed : elapsedBeforePause)}</span>;
});
TimerDisplay.displayName = "TimerDisplay";

const CooldownDisplay = memo(({ endAt }: { endAt: number | null }) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  if (!endAt) return <span className="font-mono fs-body font-black text-neutral-500">--:--:--</span>;

  const remaining = Math.max(0, endAt - now);
  return (
    <span className={`font-mono fs-body font-black ${remaining > 0 ? "text-emerald-400" : "text-amber-400"}`}>
      {remaining > 0 ? formatTime(remaining) : "LISTO"}
    </span>
  );
});
CooldownDisplay.displayName = "CooldownDisplay";

const matchPokemon = (text: string): { name: string; id: number } | null => {
  for (const [name, id] of Object.entries(POKEMON_ARTWORK)) {
    if (text.startsWith(name)) return { name, id };
  }
  return null;
};

const PokemonSprite = ({ name, id, size = 24 }: { name: string; id: number; size?: number }) => (
  <img
    src={`${SPRITE_BASE}/${id}.png`}
    alt={name}
    className="inline-block object-contain -mt-0.5 mr-1"
    style={{ width: size, height: size }}
    loading="lazy"
  />
);

const renderWithSprites = (items: string[], sep = " • ") => (
  <span className="fs-body font-semibold inline-flex flex-wrap items-center gap-x-1.5 gap-y-1">
    {items.map((item, i) => {
      const match = matchPokemon(item);
      return (
        <span key={i}>
          {i > 0 && <span className="text-neutral-600 mx-0.5">{sep}</span>}
          {match ? (
            <><PokemonSprite name={match.name} id={match.id} />{item}</>
          ) : (
            item
          )}
        </span>
      );
    })}
  </span>
);

const PokeballSVG = ({ opacity = 0.18 }: { opacity?: number }) => (
  <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", opacity }}>
    <circle cx="50" cy="50" r="47" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="3"/>
    <path d="M 3 50 A 47 47 0 0 1 97 50 Z" fill="rgba(220,50,50,0.22)"/>
    <line x1="3" y1="50" x2="97" y2="50" stroke="rgba(255,255,255,0.35)" strokeWidth="3"/>
    <circle cx="50" cy="50" r="14" fill="rgba(10,10,15,0.8)" stroke="rgba(255,255,255,0.35)" strokeWidth="3"/>
    <circle cx="50" cy="50" r="7" fill="rgba(255,255,255,0.12)"/>
  </svg>
);

const SPRITE_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";

const POKEMON_ARTWORK: Record<string, number> = {
  // Team members
  Hydreigon: 635, Weezing: 110, Togekiss: 468,
  Typhlosion: 157, Vanilluxe: 584, Blastoise: 9, Cloyster: 91, Mienshao: 620,
  // Opponents & wild Pokémon from the route
  Dragonite: 149, Butterfree: 12, Ledian: 166, Metagross: 376,
  Glalie: 362, Stantler: 234, Spinda: 327, Blissey: 242,
  Chansey: 113, Swellow: 277, Tropius: 357, Altaria: 334,
  Whimsicott: 547, Vileplume: 45, Lilligant: 549, Roserade: 407,
  Amoonguss: 591, Excadrill: 530, Pelipper: 279, Gigalith: 526,
  Aron: 304, Bastiodon: 411, Lucario: 448, Wobbuffet: 202,
  Ludicolo: 272, Mantine: 226, Poliwrath: 62, Moltres: 146,
  Arcanine: 59, Flareon: 136, Charizard: 6, Carracosta: 565,
  Tentacruel: 73, Nidoqueen: 31, Sandslash: 28, Unfezant: 521,
};

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
const STARS = Array.from({length: 18}, (_, i) => ({
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

export default function GymRerunAssistant({ steps, gymCoords, regionMap, config = {} }: GymRerunAssistantProps) {
  const {
    totalGyms = 33,
    title = "GYM RERUN",
    subtitle = "ASSISTANT",
    description = "Guía secuencial para 33 Gym Reruns en PokeMMO",
    gymResetMs = 18 * 60 * 60 * 1000,
    storagePrefix = "pkmmo",
  } = config;

  const [showMenu, setShowMenu] = useState<boolean>(true);
  const [menuExiting, setMenuExiting] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showTeam, setShowTeam] = useState<boolean>(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState<boolean>(false);
  const [teamExiting, setTeamExiting] = useState<boolean>(false);
  const [historyExiting, setHistoryExiting] = useState<boolean>(false);
  const [showCooldownEditor, setShowCooldownEditor] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [appExiting, setAppExiting] = useState<boolean>(false);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [slideClass, setSlideClass] = useState<string>("");
  const [slideKey, setSlideKey] = useState<number>(0);
  const [selectedGuide, setSelectedGuide] = useState<boolean>(false);
  const [showStartCheck, setShowStartCheck] = useState<boolean>(false);
  const [startChecks, setStartChecks] = useState<[boolean, boolean, boolean]>([false, false, false]);
  const [showCountdown, setShowCountdown] = useState<boolean>(false);
  const [countdownValue, setCountdownValue] = useState<number>(5);
  const [skipChecklist, setSkipChecklist] = useState<boolean>(() => typeof window !== "undefined" && localStorage.getItem(`${storagePrefix}_skip_checklist`) === "true");
  const [skipCountdown, setSkipCountdown] = useState<boolean>(() => typeof window !== "undefined" && localStorage.getItem(`${storagePrefix}_skip_countdown`) === "true");
  const skipCountdownRef = useRef(skipCountdown);
  useEffect(() => { skipCountdownRef.current = skipCountdown; }, [skipCountdown]);
  const [manualTimer, setManualTimer] = useState<boolean>(() => typeof window !== "undefined" && localStorage.getItem(`${storagePrefix}_manual_timer`) === "true");
  const manualTimerRef = useRef(manualTimer);
  useEffect(() => { manualTimerRef.current = manualTimer; }, [manualTimer]);

  const beginRun = useCallback(() => {
    setShowStartCheck(false);
    if (skipCountdownRef.current) {
      handleNextRef.current();
      return;
    }
    setShowCountdown(true);
    let count = 5;
    setCountdownValue(count);
    const interval = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(interval);
        setShowCountdown(false);
        handleNextRef.current();
      } else {
        setCountdownValue(count);
      }
    }, 1000);
  }, []);

  const [timerIsRunning, setTimerIsRunning] = useState<boolean>(false);
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);
  const [timerElapsed, setTimerElapsed] = useState<number>(0);
  const [cooldown, setCooldown] = useState<CooldownState>({ endAt: null, lastGym: null });
  const [cooldownHours, setCooldownHours] = useState<string>("18");
  const [cooldownMinutes, setCooldownMinutes] = useState<string>("0");
  const [history, setHistory] = useState<RunHistoryEntry[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const storagePrefixRef = useRef(storagePrefix);

  const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] || steps[0] : null;
  const LS = (key: string) => `${storagePrefix}_${key}`;

  const triggerToast = useCallback((message: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 2000);
  }, []);

  useEffect(() => {
    const loadId = window.setTimeout(() => {
      const savedStep = localStorage.getItem(LS("gym_step"));
      if (savedStep) {
        const idx = Number(savedStep);
        if (!isNaN(idx) && idx >= 0 && idx < steps.length) {
          setCurrentStepIndex(idx);
          if (idx > 0) setShowMenu(false);
        }
      }

      const savedTimer = localStorage.getItem(LS("gym_timer"));
      if (savedTimer) {
        try {
          const parsed = JSON.parse(savedTimer);
          setTimerElapsed(parsed.elapsed || 0);
          setTimerIsRunning(parsed.isRunning || false);
          if (parsed.isRunning && parsed.startedAt) setTimerStartTime(parsed.startedAt);
        } catch { /* ignore */ }
      }

      const savedHistory = localStorage.getItem(LS("gym_history"));
      if (savedHistory) {
        try { setHistory(JSON.parse(savedHistory)); } catch { /* ignore */ }
      }

      const savedCooldown = localStorage.getItem(LS("gym_cooldown"));
      if (savedCooldown) {
        try {
          const parsed = JSON.parse(savedCooldown);
          setCooldown({ endAt: parsed.endAt || null, lastGym: parsed.lastGym || null });
        } catch { /* ignore */ }
      }
    }, 0);

    return () => window.clearTimeout(loadId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePop = () => {
      if (showMenu) {
        window.history.pushState(null, "", window.location.href);
        return;
      }
      if (currentStepIndex > 0) {
        handlePrevRef.current();
        window.history.pushState(null, "", window.location.href);
      } else {
        setMenuVisible(true);
        setShowMenu(true);
        window.history.pushState(null, "", window.location.href);
      }
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMenu, currentStepIndex]);

  useEffect(() => localStorage.setItem(LS("gym_step"), currentStepIndex.toString()), [currentStepIndex]);

  useEffect(() => {
    localStorage.setItem(LS("gym_timer"), JSON.stringify({
      elapsed: timerElapsed,
      isRunning: timerIsRunning,
      startedAt: timerStartTime,
    }));
  }, [timerElapsed, timerIsRunning, timerStartTime]);

  useEffect(() => {
    localStorage.setItem(LS("gym_cooldown"), JSON.stringify(cooldown));
  }, [cooldown]);

  const getLastCompletedGym = useCallback(() => {
    for (let i = currentStepIndex; i >= 0; i--) {
      const step = steps[i];
      if (step?.type === "gym") return step.gym || step.title;
    }
    return null;
  }, [currentStepIndex]);

  const startGymCooldown = useCallback((gymName?: string | null, durationMs = gymResetMs) => {
    const lastGym = gymName || getLastCompletedGym() || "Gym desconocido";
    const nextCooldown = { endAt: Date.now() + durationMs, lastGym };
    setCooldown(nextCooldown);
    setCooldownHours(String(Math.floor(durationMs / 3600000)));
    setCooldownMinutes(String(Math.round((durationMs % 3600000) / 60000)));
    triggerToast(`Reset gyms activo: ${lastGym}`);
  }, [getLastCompletedGym, triggerToast]);

  const handleNext = useCallback(() => {
    setCurrentStepIndex((prev) => {
      const nextIdx = prev === -1 ? 0 : Math.min(prev + 1, steps.length - 1);
      if ((!manualTimerRef.current && prev === -1) || (prev === 0 && nextIdx === 1)) {
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
      const nextIdx = Math.max(prev - 1, -1);
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
    localStorage.setItem(LS("gym_history"), JSON.stringify(updatedHistory));
    startGymCooldown(getLastCompletedGym());
    resetTimer();
    setShowFinishConfirm(false);
    triggerToast("¡Run completada!");
  };

  const requestFinishRun = () => setShowFinishConfirm(true);

  const saveCooldownAdjustment = () => {
    const hours = Math.max(0, Number(cooldownHours) || 0);
    const minutes = Math.max(0, Number(cooldownMinutes) || 0);
    const durationMs = (hours * 60 + minutes) * 60 * 1000;

    if (durationMs <= 0) {
      setCooldown({ endAt: null, lastGym: cooldown.lastGym });
      setShowCooldownEditor(false);
      triggerToast("Cooldown apagado");
      return;
    }

    startGymCooldown(cooldown.lastGym || getLastCompletedGym(), durationMs);
    setShowCooldownEditor(false);
  };

  const openCooldownEditor = () => {
    const remaining = cooldown.endAt ? Math.max(0, cooldown.endAt - Date.now()) : gymResetMs;
    setCooldownHours(String(Math.floor(remaining / 3600000)));
    setCooldownMinutes(String(Math.floor((remaining % 3600000) / 60000)));
    setShowCooldownEditor(true);
  };

  const renderIcon = (type: StepType) => {
    if (type === "gym") return <Swords className="w-4 h-4 text-indigo-400" />;
    if (type === "prep") return <Sparkles className="w-4 h-4 text-amber-400" />;
    if (type === "note") return <Info className="w-4 h-4 text-red-400" />;
    return <Compass className="w-4 h-4" />;
  };

  const closeTeam = () => { setTeamExiting(true); setTimeout(() => { setShowTeam(false); setTeamExiting(false); }, 185); };
  const closeHistory = () => { setHistoryExiting(true); setTimeout(() => { setShowHistory(false); setHistoryExiting(false); }, 185); };
  const goToMenu = () => { setAppExiting(true); setTimeout(() => { setMenuVisible(true); setShowMenu(true); setAppExiting(false); }, 310); };

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
      <>
      <div className={`${menuVisible ? 'menu-enter' : 'fade-in-screen'} min-h-screen bg-neutral-950 text-neutral-200 font-sans flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden ${menuExiting ? 'menu-exit' : ''}`}>
        <PokeBackground />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-32 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 w-full max-w-xl flex flex-col items-center gap-2.5" style={{ maxWidth: "min(100%, 36rem)" }}>

          {selectedGuide && (
            <>
              <a href="https://www.youtube.com/watch?v=himBCqDN2-I" target="_blank" rel="noopener noreferrer" title="Ver run de ejemplo en YouTube — de aquí se extrajo toda la información" className="reveal-1 w-full bg-red-950/20 border border-red-800/50 rounded-2xl p-3 flex items-center gap-3 group hover:bg-red-950/30 transition-all cursor-pointer">
                <div className="w-10 h-10 flex-shrink-0 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/30">
                  <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.516 0-9.387.507A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.507 9.386.507 9.386.507s7.518 0 9.387-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="fs-body font-black text-white group-hover:text-red-300 transition-colors">Ver Run de Ejemplo en YouTube</div>
                  <div className="fs-tiny text-neutral-400">Guía visual completa — de aquí se extrajo toda la información</div>
                </div>
                <ChevronRight className="w-5 h-5 text-red-400/60 group-hover:text-red-400 transition-colors shrink-0" />
              </a>

              <div className="reveal-2 w-full flex items-stretch gap-2">
                <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-center">
                  <div className="fs-tiny uppercase tracking-widest text-neutral-500 leading-tight">Sin Moneda Amuleto</div>
                  <div className="fs-body font-black text-white">~297,000</div>
                  <div className="fs-tiny text-neutral-600">×1.0 — ~9,000 c/u</div>
                </div>
                <div className="flex-1 bg-neutral-900 border border-emerald-800/40 rounded-xl px-2.5 py-1.5 text-center bg-emerald-950/15">
                  <div className="fs-tiny uppercase tracking-widest text-emerald-500 leading-tight">Con Moneda Amuleto</div>
                  <div className="fs-body font-black text-emerald-400">~446,000</div>
                  <div className="fs-tiny text-emerald-600">×1.5 — ~13,500 c/u</div>
                </div>
              </div>
            </>
          )}

          <div className="reveal-1 text-center">
            <span className="fs-tiny uppercase tracking-widest font-black text-indigo-400 border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 rounded-full">PokeMMO Speedrun Tool</span>
            <h1 className="fs-hero font-black tracking-tight text-white leading-none mt-1" style={{ textShadow: '0 0 60px rgba(99,102,241,0.5)' }}>GYM RERUN</h1>
            <h2 className="fs-h2 font-bold text-indigo-400 tracking-widest">ASSISTANT</h2>
          </div>

          {!selectedGuide && (
            <div className="reveal-2 w-full bg-gradient-to-r from-indigo-500/5 via-indigo-500/10 to-indigo-500/5 border border-indigo-500/20 rounded-xl px-3 py-2 text-center animate-pulse">
              <p className="fs-body font-bold text-indigo-300">👇 Selecciona una ruta para comenzar</p>
            </div>
          )}

          {!selectedGuide && (
            <p className="reveal-3 fs-small text-neutral-500 text-center -mt-1.5">
              {description}
            </p>
          )}

          <div className="reveal-2 w-full grid grid-cols-3 gap-2 text-center">
            {selectedGuide ? (
              <>
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl py-1.5 px-2">
                  <div className="fs-body font-black text-white">{totalGyms}</div>
                  <div className="fs-tiny text-neutral-500 uppercase tracking-wider leading-tight">Gimnasios</div>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl py-1.5 px-2">
                  <div className="fs-body font-black text-indigo-400">{steps.length}</div>
                  <div className="fs-tiny text-neutral-500 uppercase tracking-wider leading-tight">Pasos</div>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl py-1.5 px-2">
                  <div className="fs-body font-black text-amber-400">{bestRun ? formatTime(bestRun.elapsed) : '--:--'}</div>
                  <div className="fs-tiny text-neutral-500 uppercase tracking-wider leading-tight">Mejor Tiempo</div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl py-1.5 px-2">
                  <div className="fs-body font-black text-white">1</div>
                  <div className="fs-tiny text-neutral-500 uppercase tracking-wider leading-tight">Guías Disp.</div>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl py-1.5 px-2">
                  <div className="fs-body font-black text-neutral-400">33</div>
                  <div className="fs-tiny text-neutral-500 uppercase tracking-wider leading-tight">Gyms por Guía</div>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl py-1.5 px-2">
                  <div className="fs-body font-black text-neutral-400">59</div>
                  <div className="fs-tiny text-neutral-500 uppercase tracking-wider leading-tight">Pasos por Guía</div>
                </div>
              </>
            )}
          </div>

          <div className="reveal-3 w-full grid grid-cols-4 gap-2">
            <button onClick={selectedGuide ? () => exitMenu() : () => setSelectedGuide(true)} title={selectedGuide ? "Iniciar la ruta seleccionada" : "Seleccionar esta guía"} className={`rounded-xl py-2 px-2 text-center transition-all relative overflow-hidden ${selectedGuide ? 'bg-indigo-600 border-2 border-indigo-400' : 'bg-neutral-900 border border-indigo-500/40 hover:bg-neutral-800'}`}>
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-6 h-6 opacity-20">
                  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/635.png" alt="" className="w-full h-full object-contain" />
                </div>
                <span className="fs-tiny font-bold text-white leading-tight">33 Gyms</span>
                <span className={`fs-tiny font-bold px-1.5 rounded-full leading-tight ${selectedGuide ? 'text-white bg-indigo-500/30' : 'text-indigo-400 bg-indigo-500/10'}`}>{selectedGuide ? 'INICIAR' : 'PLAY'}</span>
              </div>
            </button>
            {selectedGuide ? (
              <button onClick={() => setSelectedGuide(false)} title="Volver a la selección de guías" className="bg-neutral-800 border border-neutral-700 rounded-xl py-2 px-1 text-center hover:bg-neutral-700 transition-all">
                <div className="flex flex-col items-center gap-0.5">
                  <ChevronLeft className="w-4 h-4 text-neutral-400" />
                  <span className="fs-tiny font-bold text-neutral-400 leading-tight">Volver</span>
                  <span className="fs-tiny text-neutral-600 leading-tight">al menú</span>
                </div>
              </button>
            ) : (
              <div className="bg-neutral-900/50 border border-dashed border-neutral-700/60 rounded-xl py-2 px-1 text-center opacity-50">
                <div className="flex flex-col items-center gap-0.5">
                  <Compass className="w-4 h-4 text-neutral-500" />
                  <span className="fs-tiny font-bold text-neutral-400 leading-tight">Nueva</span>
                  <span className="fs-tiny text-neutral-600 leading-tight">Soon</span>
                </div>
              </div>
            )}
            <div className="bg-neutral-900/50 border border-dashed border-neutral-700/60 rounded-xl py-2 px-1 text-center opacity-50">
              <div className="flex flex-col items-center gap-0.5">
                <Heart className="w-4 h-4 text-neutral-500" />
                <span className="fs-tiny font-bold text-neutral-400 leading-tight">Alternativa</span>
                <span className="fs-tiny text-neutral-600 leading-tight">Soon</span>
              </div>
            </div>
            <div className="bg-neutral-900/50 border border-dashed border-neutral-700/60 rounded-xl py-2 px-1 text-center opacity-50">
              <div className="flex flex-col items-center gap-0.5">
                <Sparkles className="w-4 h-4 text-neutral-500" />
                <span className="fs-tiny font-bold text-neutral-400 leading-tight">Otra</span>
                <span className="fs-tiny text-neutral-600 leading-tight">Soon</span>
              </div>
            </div>
          </div>

          {selectedGuide && (currentStepIndex > 0 ? (
            <div className="reveal-4 w-full flex flex-col gap-1.5">
              <button onClick={() => exitMenu()} title="Continuar la ruta desde donde la dejaste" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white fs-body font-black rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]">
                ▶ CONTINUAR RUTA · Paso {currentStepIndex + 1}/{steps.length}
              </button>
              <button onClick={() => exitMenu(() => { setCurrentStepIndex(-1); resetTimer(); })} title="Empezar la ruta desde el principio" className="w-full py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 fs-small font-bold rounded-lg transition-colors">
                Reiniciar desde cero
              </button>
            </div>
          ) : (
            <button onClick={() => exitMenu(() => { setCurrentStepIndex(-1); resetTimer(); })} title="Comenzar la ruta seleccionada" className="reveal-4 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white fs-body font-black rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] btn-glow-active">
              ▶ INICIAR RUTA
            </button>
          ))}

          {selectedGuide && (
            <button onClick={() => setShowTeam(true)} title="Ver el equipo Pokémon recomendado para esta ruta" className="reveal-5 w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white fs-body font-black rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]">
              <Users className="w-5 h-5 inline-block mr-2 -mt-0.5" />VER EQUIPO DE LA RUTA
            </button>
          )}

          <div className="reveal-6 w-full border-t border-neutral-800/40 pt-2 flex items-center justify-center gap-4 text-neutral-500">
            <button onClick={() => setShowHistory(true)} title="Historial de runs completadas" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <History className="w-3.5 h-3.5 text-neutral-500" />
              <span className="fs-tiny font-semibold">Historial</span>
            </button>
            <span className="text-neutral-700">·</span>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-pink-400"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              <span className="fs-tiny font-semibold">Dreasy__</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-green-400"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
              <span className="fs-tiny font-semibold">Dreasy</span>
            </div>
           </div>
           <div className="reveal-6 w-full flex items-center justify-center mt-1">
             <button onClick={() => setShowSettings(true)} title="Configuración" className="flex items-center gap-2 px-4 py-2 text-neutral-500 hover:text-white hover:bg-neutral-800/60 rounded-xl transition-all group">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
               <span className="fs-small font-semibold">Configuración</span>
             </button>
           </div>
         </div>

      {showTeam && (
        <div className={`fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-start justify-center p-3 overflow-y-auto ${teamExiting ? 'overlay-exit' : 'overlay-enter'}`} onClick={() => closeTeam()}>
          <div className={`relative w-full max-w-3xl my-3 ${teamExiting ? 'modal-exit' : 'modal-enter'}`} onClick={e => e.stopPropagation()}>
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-5 py-3 bg-neutral-950 border-b border-neutral-800">
                <div>
                  <h3 className="font-black fs-h3 text-white">Equipo de la Run</h3>
                  <p className="fs-tiny text-neutral-500 mt-0.5">Choice Band Weezing · Scarf Vanilluxe · Specs resto</p>
                </div>
                <button onClick={() => closeTeam()} className="text-neutral-500 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3">

                <div className="bg-neutral-950 border border-indigo-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-2.5 mb-2">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${POKEMON_ARTWORK.Hydreigon}.png`} alt="Hydreigon" className="w-10 h-10 object-contain" loading="lazy" />
                    <div>
                      <div className="font-black fs-small text-indigo-300">HI — Hydreigon</div>
                      <div className="fs-tiny text-neutral-500">Levitate · Modest</div>
                    </div>
                  </div>
                  <div className="fs-tiny text-neutral-400 mb-1.5">EVs: 6 HP / 252 SpA / 40 SpD / 252 Spe</div>
                  <div className="grid grid-cols-2 gap-0.5">
                    {['Surf','Sunny Day','Rain Dance','Tailwind'].map(m => <span key={m} className="fs-tiny bg-indigo-950/50 border border-indigo-800/30 px-1.5 py-0.5 rounded text-indigo-300">{m}</span>)}
                  </div>
                </div>

                <div className="bg-neutral-950 border border-cyan-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-2.5 mb-2">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${POKEMON_ARTWORK.Weezing}.png`} alt="Weezing" className="w-10 h-10 object-contain" loading="lazy" />
                    <div>
                      <div className="font-black fs-small text-cyan-300">WW — Weezing</div>
                      <div className="fs-tiny text-neutral-500">Neutralizing Gas · Adamant · Choice Band</div>
                    </div>
                  </div>
                  <div className="fs-tiny text-neutral-400 mb-1.5">EVs: 252 Atk / 6 SpD / 252 Spe</div>
                  <div className="grid grid-cols-2 gap-0.5">
                    {['Explosion','Assurance','Incinerate','Sunny Day'].map(m => <span key={m} className="fs-tiny bg-cyan-950/50 border border-cyan-800/30 px-1.5 py-0.5 rounded text-cyan-300">{m}</span>)}
                  </div>
                </div>

                <div className="bg-neutral-950 border border-sky-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-2.5 mb-2">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${POKEMON_ARTWORK.Togekiss}.png`} alt="Togekiss" className="w-10 h-10 object-contain" loading="lazy" />
                    <div>
                      <div className="font-black fs-small text-sky-300">TO — Togekiss</div>
                      <div className="fs-tiny text-neutral-500">Serene Grace · Modest · Choice Scarf</div>
                    </div>
                  </div>
                  <div className="fs-tiny text-neutral-400 mb-1.5">EVs: 252 SpA / 6 SpD / 252 Spe</div>
                  <div className="grid grid-cols-2 gap-0.5">
                    {['Hyper Voice','Psyshock','Signal Beam','Psychic'].map(m => <span key={m} className="fs-tiny bg-sky-950/50 border border-sky-800/30 px-1.5 py-0.5 rounded text-sky-300">{m}</span>)}
                  </div>
                </div>

                <div className="bg-neutral-950 border border-orange-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-2.5 mb-2">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${POKEMON_ARTWORK.Typhlosion}.png`} alt="Typhlosion" className="w-10 h-10 object-contain" loading="lazy" />
                    <div>
                      <div className="font-black fs-small text-orange-300">TY — Typhlosion</div>
                      <div className="fs-tiny text-neutral-500">Blaze · Choice Specs</div>
                    </div>
                  </div>
                  <div className="fs-tiny text-neutral-400 mb-1.5">EVs: 252 SpA / 6 SpD / 252 Spe</div>
                  <div className="grid grid-cols-2 gap-0.5">
                    {['Eruption','Swift','Cut','Helping Hand'].map(m => <span key={m} className="fs-tiny bg-orange-950/50 border border-orange-800/30 px-1.5 py-0.5 rounded text-orange-300">{m}</span>)}
                  </div>
                </div>

                <div className="bg-neutral-950 border border-violet-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-2.5 mb-2">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${POKEMON_ARTWORK.Vanilluxe}.png`} alt="Vanilluxe" className="w-10 h-10 object-contain" loading="lazy" />
                    <div>
                      <div className="font-black fs-small text-violet-300">Vanilluxe @ Choice Scarf</div>
                      <div className="fs-tiny text-neutral-500">Snow Warning · Timid · Lv. 100</div>
                    </div>
                  </div>
                  <div className="fs-tiny text-neutral-400 mb-1.5">EVs: 10 HP / 252 SpA / 248 Spe</div>
                  <div className="grid grid-cols-2 gap-0.5">
                    {['Blizzard','Hyper Voice','Water Pulse','Flash Cannon'].map(m => <span key={m} className="fs-tiny bg-violet-950/50 border border-violet-800/30 px-1.5 py-0.5 rounded text-violet-300">{m}</span>)}
                  </div>
                </div>

                <div className="bg-neutral-950 border border-blue-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-2.5 mb-2">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${POKEMON_ARTWORK.Blastoise}.png`} alt="Blastoise" className="w-10 h-10 object-contain" loading="lazy" />
                    <div>
                      <div className="font-black fs-small text-blue-300">BW — Blastoise</div>
                      <div className="fs-tiny text-neutral-500">Torrent · Modest · Choice Specs</div>
                    </div>
                  </div>
                  <div className="fs-tiny text-neutral-400 mb-1.5">EVs: 252 SpA / 6 SpD / 252 Spe</div>
                  <div className="grid grid-cols-2 gap-0.5">
                    {['Water Spout','Helping Hand','Blizzard'].map(m => <span key={m} className="fs-tiny bg-blue-950/50 border border-blue-800/30 px-1.5 py-0.5 rounded text-blue-300">{m}</span>)}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3" onClick={() => setShowSettings(false)}>
          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold fs-h2 flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                Configuración
              </h3>
              <button onClick={() => setShowSettings(false)} className="text-neutral-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                <div>
                  <p className="font-bold text-white fs-body">Verificación</p>
                  <p className="fs-tiny text-neutral-400 mt-0.5">Mostrar checklist al iniciar ruta</p>
                </div>
                <button onClick={() => { const next = !skipChecklist; localStorage.setItem(LS("skip_checklist"), String(next)); setSkipChecklist(next); }} className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${skipChecklist ? 'bg-neutral-700' : 'bg-indigo-500'}`}>
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-all ${skipChecklist ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                <div>
                  <p className="font-bold text-white fs-body">Cuenta atrás</p>
                  <p className="fs-tiny text-neutral-400 mt-0.5">Mostrar 5-4-3-2-1 al empezar</p>
                </div>
                <button onClick={() => { const next = !skipCountdown; localStorage.setItem(LS("skip_countdown"), String(next)); setSkipCountdown(next); }} className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${skipCountdown ? 'bg-neutral-700' : 'bg-amber-500'}`}>
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-all ${skipCountdown ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                <div>
                  <p className="font-bold text-white fs-body">Timer</p>
                  <p className="fs-tiny text-neutral-400 mt-0.5">{manualTimer ? 'Manual: inicia al avanzar al paso 1' : 'Automático: inicia al comenzar'}</p>
                </div>
                <button onClick={() => { const next = !manualTimer; localStorage.setItem(LS("manual_timer"), String(next)); setManualTimer(next); }} className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${manualTimer ? 'bg-emerald-500' : 'bg-neutral-700'}`}>
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-all ${!manualTimer ? 'translate-x-0' : 'translate-x-5'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showHistory && (
        <div className={`fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 ${historyExiting ? 'overlay-exit' : 'overlay-enter'}`}>
          <div className={`bg-neutral-900 rounded-2xl border border-neutral-800 w-full max-w-md p-5 ${historyExiting ? 'modal-exit' : 'modal-enter'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold fs-h2">Historial</h3>
              <button onClick={() => closeHistory()} className="text-neutral-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto space-y-1.5">
              {history.length > 0 ? history.map((entry, idx) => (
                <div key={entry.id} className="bg-neutral-950 p-2.5 rounded flex justify-between items-center border border-neutral-800 group">
                  <div>
                    <div className="font-bold fs-body">Run #{history.length - idx}</div>
                    <div className="fs-tiny text-neutral-500">{new Date(entry.finishedAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono fs-body font-bold text-indigo-400">{formatTime(entry.elapsed)}</span>
                    <button
                      onClick={() => {
                        const updated = history.filter(e => e.id !== entry.id);
                        setHistory(updated);
                        localStorage.setItem(LS("gym_history"), JSON.stringify(updated));
                      }}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-opacity"
                      title="Borrar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )) : <div className="text-neutral-500 text-center py-6 fs-body">No hay historial.</div>}
            </div>
          </div>
        </div>
      )}
      </>
    );
  }

  return (
    <div className={`app-enter ${appExiting ? "app-exit" : ""} flex h-screen bg-neutral-950 text-neutral-200 overflow-hidden font-sans relative`}>
      <PokeBackground />
      
      <main className={`flex-1 flex flex-col h-full relative z-10 overflow-hidden ${currentStepIndex === -1 ? 'pb-0' : 'pb-20'}`}>
        
        <header className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <button onClick={() => goToMenu()} title="Volver al menú principal" className="fs-small font-bold tracking-widest text-neutral-400 uppercase hover:text-white transition-colors">Ruta Gym</button>
            <div className="w-px h-4 bg-neutral-700" />
            <div className="fs-small text-neutral-500">{currentStepIndex === -1 ? "Portada" : <>Paso <span className="font-bold text-neutral-300">{currentStepIndex + 1}</span> / {steps.length}</>}</div>
            <button onClick={() => goToMenu()} title="Volver al menú principal" className="px-2 py-1 bg-neutral-800 text-neutral-400 rounded hover:bg-neutral-700 fs-tiny font-bold uppercase tracking-wider">Menú</button>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={() => setShowTeam(true)} title="Ver equipo de la ruta actual" className="px-3 py-1.5 bg-violet-900/40 text-violet-300 border border-violet-700/40 rounded hover:bg-violet-800/50 fs-small font-bold uppercase tracking-wider">Equipo</button>
          </div>
        </header>

        {currentStepIndex !== -1 && (
        <div
          className="flex-none overflow-x-auto px-4 py-2 border-b border-neutral-800/50 bg-neutral-950/40 scrollbar-thin"
          onWheel={(e) => { e.currentTarget.scrollLeft += e.deltaY; }}
        >
          <div className="flex gap-1.5 min-w-max">
            {steps.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setCurrentStepIndex(idx)}
                title={`Ir al paso ${idx + 1}: ${step.title || step.type}`}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg fs-tiny font-bold whitespace-nowrap transition-all ${
                  idx === currentStepIndex
                    ? "bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                    : idx < currentStepIndex
                    ? "bg-neutral-800/60 text-neutral-300 hover:bg-neutral-700/80"
                    : "bg-neutral-800/30 text-neutral-400 hover:bg-neutral-700/60"
                }`}
              >
                <span className="tabular-nums w-4 text-center">{idx + 1}</span>
                <span>{renderIcon(step.type)}</span>
                <span className="max-w-[90px] truncate">{step.title}</span>
              </button>
            ))}
          </div>
        </div>
        )}
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 lg:p-12 overflow-hidden">
          <div key={slideKey} className={`w-full max-w-4xl bg-neutral-900/80 backdrop-blur-sm rounded-2xl border border-neutral-800 p-5 md:p-8 lg:p-12 shadow-2xl overflow-hidden relative text-center ${slideClass}`}>
            
            <div className="absolute -top-6 -right-6 w-24 h-24 opacity-[0.04] pointer-events-none select-none">
              <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png" alt="" className="w-full h-full object-contain" />
            </div>

            <div className="flex flex-col items-center gap-4 mb-6">
              {currentStepIndex === -1 ? (
                <>
                  <div className="w-full flex mb-2">
                    <button onClick={() => goToMenu()} title="Volver al menú" className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 rounded-lg fs-tiny font-bold uppercase tracking-wider self-start">← Menú</button>
                  </div>
                  <a href="https://www.youtube.com/watch?v=himBCqDN2-I" target="_blank" rel="noopener noreferrer" title="Ver run de ejemplo en YouTube" className="w-full max-w-sm mx-auto mb-2 block group">
                    <div className="relative rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl">
                      <img src="https://img.youtube.com/vi/himBCqDN2-I/maxresdefault.jpg" alt="Run de ejemplo" className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                        <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-600/40 group-hover:scale-110 transition-transform">
                          <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8 ml-1"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.516 0-9.387.507A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.507 9.386.507 9.386.507s7.518 0 9.387-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                        </div>
                      </div>
                    </div>
                  </a>
                  <h2 className="fs-h2 font-black tracking-tight text-white">33 Gym Rerun</h2>
                  <p className="fs-body text-neutral-400">{description}</p>
                  {steps[0] && (
                    <div className="w-full bg-neutral-950 rounded-xl border border-neutral-800 p-3 mt-1">
                      <div className="fs-small text-neutral-500 uppercase font-bold tracking-widest mb-1">Primer gimnasio</div>
                      <div className="flex items-center justify-center gap-2">
                        <span className="p-1.5 bg-neutral-900 rounded-lg">{renderIcon(steps[0].type)}</span>
                        <span className="fs-h3 font-black text-white">{steps[0].title}</span>
                        {steps[0].region && <span className="fs-small font-bold uppercase tracking-widest px-2 py-0.5 rounded border bg-neutral-900 text-neutral-400 border-neutral-800">{steps[0].region}</span>}
                      </div>
                      {steps[0].type === "gym" && steps[0].gym && gymCoords[steps[0].gym as keyof typeof gymCoords] && (
                        <div className="w-full max-w-[180px] h-24 mx-auto mt-2 relative rounded-lg border border-neutral-700/50 overflow-hidden bg-neutral-950 shadow-inner group">
                          <img src={regionMap[gymCoords[steps[0].gym as keyof typeof gymCoords].region as keyof typeof regionMap]} alt="Map" className="absolute inset-0 w-full h-full object-cover opacity-70" />
                          <div className="absolute inset-0 bg-indigo-900/10 mix-blend-color" />
                          <div className="absolute w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-[0_0_8px_rgba(239,68,68,0.8)] -translate-x-1/2 -translate-y-1/2 animate-bounce" style={{ left: `${gymCoords[steps[0].gym as keyof typeof gymCoords].x}%`, top: `${gymCoords[steps[0].gym as keyof typeof gymCoords].y}%` }} />
                        </div>
                      )}
                    </div>
                  )}
                  <button onClick={() => { if (skipChecklist) { beginRun(); } else { setStartChecks([false, false, false]); setShowStartCheck(true); } }} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white fs-hero2 font-black rounded-2xl transition-all shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_50px_rgba(99,102,241,0.5)]">
                    ▶ COMENZAR RUTA
                  </button>
                </>
              ) : (<> 
                <div className="reveal-1 flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
                  <span className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 shrink-0">{renderIcon(currentStep!.type)}</span>
                  <h2 className="fs-h3 font-black tracking-tight text-white">{currentStep!.title}</h2>
                  {currentStep!.region && <span className="fs-small font-bold uppercase tracking-widest px-2 py-0.5 rounded shrink-0 border bg-neutral-950 text-neutral-400 border-neutral-800">{currentStep!.region}</span>}
                </div>

              {currentStep!.type === "gym" && currentStep!.gym && gymCoords[currentStep!.gym as keyof typeof gymCoords] && (
                <div className="reveal-2 w-full max-w-[200px] h-28 relative rounded-lg border border-neutral-700/50 overflow-hidden shrink-0 bg-neutral-950 shadow-inner group">
                  <img src={regionMap[gymCoords[currentStep!.gym as keyof typeof gymCoords].region as keyof typeof regionMap]} alt="Region Map" className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-indigo-900/10 mix-blend-color" />
                  <div 
                    className="absolute w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white shadow-[0_0_8px_rgba(239,68,68,0.8)] -translate-x-1/2 -translate-y-1/2 animate-bounce"
                    style={{ 
                      left: `${gymCoords[currentStep!.gym as keyof typeof gymCoords].x}%`, 
                      top: `${gymCoords[currentStep!.gym as keyof typeof gymCoords].y}%` 
                    }}
                  />
                  <div className="absolute bottom-0.5 right-1 fs-tiny font-black uppercase tracking-widest text-white/80 drop-shadow-md">MAPA</div>
              </div>
            )}
            </>)}
          </div>

            {currentStep && (<>
            
            {currentStep.type === "gym" && (
              <div className="space-y-5">
                <div className="flex flex-wrap justify-center gap-4">
                  {currentStep.lead && (
                    <div className="reveal-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800 flex-1 min-w-[180px]">
                      <div className="fs-small text-indigo-400 uppercase font-black tracking-widest mb-2">Leads</div>
                      <div className="flex justify-center">{renderWithSprites(currentStep.lead)}</div>
                    </div>
                  )}
                  {currentStep.switchTo && (
                    <div className="reveal-4 bg-neutral-950 p-4 rounded-xl border border-neutral-800 flex-1 min-w-[180px]">
                      <div className="fs-small text-emerald-400 uppercase font-black tracking-widest mb-2">Cambios Seguros</div>
                      <div className="flex justify-center">{renderWithSprites(currentStep.switchTo)}</div>
                    </div>
                  )}
                </div>
                {currentStep.actions && (
                  <div className="reveal-5 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                    <div className="fs-small text-amber-400 uppercase font-black tracking-widest mb-3 text-center">Estrategia vs Variantes</div>
                    <ul className="space-y-2">
                      {currentStep.actions.map((act, i) => {
                        const parts = act.split("→");
                        return (
                          <li key={i} className="flex flex-col sm:flex-row items-center justify-center gap-2 fs-body bg-neutral-900 p-2 rounded border border-neutral-800">
                            {parts.length > 1 ? (
                              <><span className="font-bold text-white">{parts[0].trim()}</span> <span className="text-neutral-500 hidden sm:inline">→</span> <span className="text-neutral-300">{parts[1].trim()}</span></>
                            ) : <span className="text-center">{act}</span>}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {currentStep.type === "prep" && (
              <div className="space-y-4">
                {currentStep.heal && (
                  <div className="reveal-2 flex items-center justify-center gap-3 bg-red-950/20 border border-red-900/30 p-4 rounded-xl text-red-400 fs-body font-bold">
                    <Heart className="w-5 h-5 fill-current" /> Curar equipo en el Centro Pokémon
                  </div>
                )}
                {currentStep.items && currentStep.items.length > 0 && (
                  <div className="reveal-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                    <div className="fs-small text-blue-400 uppercase font-black tracking-widest mb-3 flex items-center justify-center gap-2"><Sparkles className="w-3.5 h-3.5"/> Equipar Objetos</div>
                    <ul className="space-y-2">
                      {currentStep.items.map((it, i) => {
                        const isScarf = it.item.toLowerCase().includes("panuelo") || it.item.toLowerCase().includes("pañuelo");
                        return (
                          <li key={i} className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-3 rounded border ${isScarf ? 'bg-indigo-900/40 border-indigo-500/50' : 'bg-neutral-900 border-neutral-800 opacity-60'}`}>
                            <span className={isScarf ? 'text-white' : 'text-neutral-400'}>{renderWithSprites(it.pokemon, " • ")}</span>
                            <span className={`${isScarf ? 'text-indigo-400 bg-indigo-950 px-3 py-1 fs-small shadow-[0_0_10px_rgba(99,102,241,0.2)]' : 'text-neutral-500 bg-neutral-950 px-2 py-0.5 fs-tiny'} font-bold rounded uppercase tracking-wider`}>
                              ➔ {it.item}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
                {currentStep.travel && (
                  <div className="reveal-4 flex items-center justify-center gap-3 bg-teal-950/20 border border-teal-900/30 p-4 rounded-xl text-teal-400 fs-body font-bold">
                    <Compass className="w-5 h-5" /> Viajar hacia {currentStep.travel}
                  </div>
                )}
              </div>
            )}

            {currentStep.type === "note" && (
              <div className="reveal-2 bg-amber-950/20 border border-amber-900/30 p-6 rounded-xl text-amber-400 fs-body font-bold text-center">
                {currentStep.description}
              </div>
            )}
            </>)}
            
          </div>

          {currentStepIndex !== -1 && (<>
          <div className="w-full max-w-4xl mt-6 space-y-3">
            <div className="flex gap-4">
              <button onClick={handlePrev} disabled={currentStepIndex <= 0} title="Paso anterior" className="flex-1 py-4 bg-neutral-900 rounded-xl fs-body font-bold text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-20 transition-colors">← Anterior</button>
              <button onClick={currentStepIndex === -1 ? handleNext : (currentStepIndex === steps.length - 1 ? requestFinishRun : handleNext)} title={currentStepIndex === -1 ? "Comenzar la ruta" : currentStepIndex === steps.length - 1 ? "Finalizar la ruta" : "Siguiente paso"} className="flex-[2] py-4 bg-indigo-600 rounded-xl font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/20 transition-all fs-body">
                {currentStepIndex === -1 ? "▶ COMENZAR" : currentStepIndex === steps.length - 1 ? "¡Finalizar!" : "Siguiente (Espacio) →"}
              </button>
            </div>
            <div className="w-full bg-neutral-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="progress-shimmer h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.round(((currentStepIndex + 1) / steps.length) * 100)}%` }}
              />
            </div>
            <div className="text-center fs-tiny md:fs-small text-neutral-500 font-mono">
              {currentStepIndex === -1 ? "0% completado" : `${Math.round(((currentStepIndex + 1) / steps.length) * 100)}% completado`}
            </div>
          </div>
          </>)}
        </div>
      </main>

      {currentStepIndex !== -1 && (
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-neutral-900/95 border-t-2 border-indigo-500/40 backdrop-blur-sm px-3 py-1.5 sm:px-6 sm:py-3">
        <div className="flex sm:hidden items-center justify-center mb-1">
          <TimerDisplay isRunning={timerIsRunning} startTime={timerStartTime} elapsedBeforePause={timerElapsed} />
        </div>

        <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
          
          <div className="hidden sm:flex items-center gap-1">
            <span className="text-[10px] sm:fs-tiny text-neutral-500 font-semibold">Ruta</span>
            <TimerDisplay isRunning={timerIsRunning} startTime={timerStartTime} elapsedBeforePause={timerElapsed} />
          </div>

          <div className="flex items-center gap-0.5">
              <button onClick={handlePrev} disabled={currentStepIndex <= 0} title="Paso anterior" className="p-1 sm:p-1.5 bg-neutral-800/80 rounded hover:bg-neutral-700 disabled:opacity-30 disabled:pointer-events-none text-neutral-400">
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button onClick={handleNext} disabled={currentStepIndex === steps.length - 1} title="Siguiente paso" className="p-1 sm:p-1.5 bg-indigo-600/80 rounded hover:bg-indigo-500 disabled:opacity-30 disabled:pointer-events-none text-white shadow-md shadow-indigo-500/20">
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
          </div>

          <div className="flex gap-0.5 sm:gap-1 shrink-0">
            {!timerIsRunning ? (
              <button onClick={startTimer} title="Iniciar cronómetro de la ruta" className="px-2 sm:px-3 py-1 sm:py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold fs-tiny sm:fs-small flex items-center gap-0.5 sm:gap-1"><Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current"/><span className="text-[10px] sm:text-xs">Iniciar</span></button>
            ) : (
              <button onClick={pauseTimer} title="Pausar cronómetro de la ruta" className="px-2 sm:px-3 py-1 sm:py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded font-bold fs-tiny sm:fs-small flex items-center gap-0.5 sm:gap-1"><Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current"/><span className="text-[10px] sm:text-xs">Pausar</span></button>
            )}
            <button onClick={resetTimer} title="Reiniciar cronómetro a cero" className="px-2 sm:px-3 py-1 sm:py-1.5 bg-neutral-700 hover:bg-neutral-600 text-neutral-300 rounded font-bold fs-tiny sm:fs-small"><RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5"/></button>
          </div>

          <div className="h-5 w-px bg-neutral-700 hidden sm:block" />

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
              <span className="text-[10px] sm:fs-tiny text-neutral-500 font-semibold mr-0.5">Gyms</span>
              <CooldownDisplay endAt={cooldown.endAt} />
            </div>
            <div className="flex gap-0.5 sm:gap-1">
              <button onClick={() => startGymCooldown(getLastCompletedGym())} title="Activar cooldown de 18 horas" className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-bold text-[10px] sm:fs-tiny">18h</button>
              <button onClick={openCooldownEditor} title="Ajustar cooldown" className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded font-bold text-[10px] sm:fs-tiny">Ajustar</button>
              <button onClick={requestFinishRun} title="Terminar la ruta y guardar el tiempo" className="px-2 sm:px-3 py-1 sm:py-1.5 bg-red-700 hover:bg-red-600 text-white rounded font-bold fs-tiny sm:fs-small transition-colors shadow-sm shadow-red-800/30">Terminar Ruta</button>
              <button onClick={() => { if(window.confirm("¿Reiniciar ruta?")) { setCurrentStepIndex(-1); resetTimer(); } }} title="Reiniciar la ruta desde la portada" className="px-2 sm:px-3 py-1 sm:py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded font-bold fs-tiny sm:fs-small transition-colors"><RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5 inline-block mr-0.5" />Reiniciar Ruta</button>
            </div>
          </div>

          <span className="text-[10px] sm:fs-tiny text-neutral-500 font-mono">F4 · Esp</span>
        </div>
      </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-neutral-800 border border-neutral-700 shadow-2xl rounded px-3 py-1.5 text-white fs-body font-bold animate-in slide-in-from-bottom-4 fade-in">
          {toastMessage}
        </div>
      )}

      {showHistory && (
        <div className={`fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 ${historyExiting ? 'overlay-exit' : 'overlay-enter'}`}>
          <div className={`bg-neutral-900 rounded-2xl border border-neutral-800 w-full max-w-md p-5 ${historyExiting ? 'modal-exit' : 'modal-enter'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold fs-h2">Historial</h3>
              <button onClick={() => closeHistory()} className="text-neutral-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto space-y-1.5">
              {history.length > 0 ? history.map((entry, idx) => (
                <div key={entry.id} className="bg-neutral-950 p-2.5 rounded flex justify-between items-center border border-neutral-800 group">
                  <div>
                    <div className="font-bold fs-body">Run #{history.length - idx}</div>
                    <div className="fs-tiny text-neutral-500">{new Date(entry.finishedAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono fs-body font-bold text-indigo-400">{formatTime(entry.elapsed)}</span>
                    <button
                      onClick={() => {
                        const updated = history.filter(e => e.id !== entry.id);
                        setHistory(updated);
                        localStorage.setItem(LS("gym_history"), JSON.stringify(updated));
                      }}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-opacity"
                      title="Borrar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )) : <div className="text-neutral-500 text-center py-6 fs-body">No hay historial.</div>}
            </div>
          </div>
        </div>
      )}

      {showCooldownEditor && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3">
          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 w-full max-w-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold fs-h2">Timer reset gyms</h3>
                <p className="fs-tiny text-neutral-500 mt-0.5">Último gym: {cooldown.lastGym || getLastCompletedGym() || "--"}</p>
              </div>
              <button onClick={() => setShowCooldownEditor(false)} className="text-neutral-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <label className="fs-tiny font-bold uppercase tracking-wider text-neutral-500">
                Horas
                <input
                  type="number"
                  min="0"
                  value={cooldownHours}
                  onChange={(e) => setCooldownHours(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-2.5 py-1.5 fs-body font-mono text-white outline-none focus:border-emerald-500"
                />
              </label>
              <label className="fs-tiny font-bold uppercase tracking-wider text-neutral-500">
                Minutos
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={cooldownMinutes}
                  onChange={(e) => setCooldownMinutes(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-2.5 py-1.5 fs-body font-mono text-white outline-none focus:border-emerald-500"
                />
              </label>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <button
                onClick={() => startGymCooldown(getLastCompletedGym())}
                className="py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-black fs-body"
              >
                Activar 18h
              </button>
              <button
                onClick={saveCooldownAdjustment}
                className="py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black fs-body"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {showFinishConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3">
          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 w-full max-w-sm p-5">
            <h3 className="font-black fs-h2 text-white">¿Terminar ruta?</h3>
            <p className="fs-body text-neutral-400 mt-2">
              Se guardará la run, se reiniciará el cronómetro y se activará el reset de gyms de 18 horas desde el último gym hecho.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-black fs-body"
              >
                Cancelar
              </button>
              <button
                onClick={finishRun}
                className="py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-black fs-body"
              >
                Sí, terminar
              </button>
            </div>
          </div>
        </div>
      )}

      {showTeam && (
        <div className={`fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-start justify-center p-3 overflow-y-auto ${teamExiting ? 'overlay-exit' : 'overlay-enter'}`} onClick={() => closeTeam()}>
          <div className={`relative w-full max-w-3xl my-3 ${teamExiting ? 'modal-exit' : 'modal-enter'}`} onClick={e => e.stopPropagation()}>
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-5 py-3 bg-neutral-950 border-b border-neutral-800">
                <div>
                  <h3 className="font-black fs-h3 text-white">Equipo de la Run</h3>
                  <p className="fs-tiny text-neutral-500 mt-0.5">Choice Band Weezing · Scarf Vanilluxe · Specs resto</p>
                </div>
                <button onClick={() => closeTeam()} className="text-neutral-500 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3">

                <div className="bg-neutral-950 border border-indigo-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-2.5 mb-2">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${POKEMON_ARTWORK.Hydreigon}.png`} alt="Hydreigon" className="w-10 h-10 object-contain" loading="lazy" />
                    <div>
                      <div className="font-black fs-small text-indigo-300">H1 — Hydreigon</div>
                      <div className="fs-tiny text-neutral-500">Levitate · Modest · Choice Specs</div>
                    </div>
                  </div>
                  <div className="fs-tiny text-neutral-400 mb-1.5">EVs: 6 HP / 212 SpA / 40 SpD / 252 Spe</div>
                  <div className="fs-tiny text-neutral-500 mb-1.5">IVs: Max 14 HP / X Atk / Max 14 Def / 31 Spa / Low Spd / 31 Spe</div>
                  <div className="grid grid-cols-2 gap-0.5">
                    {['Surf','Sunny Day','Rain Dance','Tailwind'].map(m => <span key={m} className="fs-tiny bg-indigo-950/50 border border-indigo-800/30 px-1.5 py-0.5 rounded text-indigo-300">{m}</span>)}
                  </div>
                </div>

                <div className="bg-neutral-950 border border-purple-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-2.5 mb-2">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${POKEMON_ARTWORK.Weezing}.png`} alt="Weezing" className="w-10 h-10 object-contain" loading="lazy" />
                    <div>
                      <div className="font-black fs-small text-purple-300">W1 — Weezing</div>
                      <div className="fs-tiny text-neutral-500">Neutralizing Gas · Adamant · Choice Band</div>
                    </div>
                  </div>
                  <div className="fs-tiny text-neutral-400 mb-1.5">EVs: 252 Atk / 6 SpD / 252 Spe</div>
                  <div className="fs-tiny text-neutral-500 mb-1.5">IVs: 31 HP / 31 Atk / High Def / X Spa / 31 Spd / 31 Spe</div>
                  <div className="grid grid-cols-2 gap-0.5">
                    {['Explosion','Assurance','Incinerate','Sunny Day'].map(m => <span key={m} className="fs-tiny bg-purple-950/50 border border-purple-800/30 px-1.5 py-0.5 rounded text-purple-300">{m}</span>)}
                  </div>
                </div>

                <div className="bg-neutral-950 border border-sky-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-2.5 mb-2">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${POKEMON_ARTWORK.Togekiss}.png`} alt="Togekiss" className="w-10 h-10 object-contain" loading="lazy" />
                    <div>
                      <div className="font-black fs-small text-sky-300">TO — Togekiss</div>
                      <div className="fs-tiny text-neutral-500">Serene Grace · Modest · Choice Scarf</div>
                    </div>
                  </div>
                  <div className="fs-tiny text-neutral-400 mb-1.5">EVs: 252 SpA / 6 SpD / 252 Spe</div>
                  <div className="fs-tiny text-neutral-500 mb-1.5">IVs: X HP / X Atk / X Def / 31 Spa / X Spd / 31 Spe</div>
                  <div className="grid grid-cols-2 gap-0.5">
                    {['Hyper Voice','Psyshock','Signal Beam','Psychic'].map(m => <span key={m} className="fs-tiny bg-sky-950/50 border border-sky-800/30 px-1.5 py-0.5 rounded text-sky-300">{m}</span>)}
                  </div>
                </div>

                <div className="bg-neutral-950 border border-orange-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-2.5 mb-2">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${POKEMON_ARTWORK.Typhlosion}.png`} alt="Typhlosion" className="w-10 h-10 object-contain" loading="lazy" />
                    <div>
                      <div className="font-black fs-small text-orange-300">TY — Typhlosion</div>
                      <div className="fs-tiny text-neutral-500">Blaze · Modest · Choice Specs</div>
                    </div>
                  </div>
                  <div className="fs-tiny text-neutral-400 mb-1.5">EVs: 252 SpA / 6 SpD / 252 Spe</div>
                  <div className="fs-tiny text-neutral-500 mb-1.5">IVs: X HP / X Atk / X Def / 31 Spa / X Spd / 31 Spe</div>
                  <div className="grid grid-cols-2 gap-0.5">
                    {['Eruption','Swift','Cut','Helping Hand'].map(m => <span key={m} className="fs-tiny bg-orange-950/50 border border-orange-800/30 px-1.5 py-0.5 rounded text-orange-300">{m}</span>)}
                  </div>
                </div>

                <div className="bg-neutral-950 border border-cyan-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-2.5 mb-2">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${POKEMON_ARTWORK.Vanilluxe}.png`} alt="Vanilluxe" className="w-10 h-10 object-contain" loading="lazy" />
                    <div>
                      <div className="font-black fs-small text-cyan-300">Vanilluxe @ Choice Scarf</div>
                      <div className="fs-tiny text-neutral-500">Snow Warning · Timid · Lv. 100</div>
                    </div>
                  </div>
                  <div className="fs-tiny text-neutral-400 mb-1.5">EVs: 10 HP / 252 SpA / 248 Spe</div>
                  <div className="fs-tiny text-neutral-500 mb-1.5">IVs: X HP / X Atk / X Def / 31 Spa / X Spd / 31 Spe</div>
                  <div className="grid grid-cols-2 gap-0.5">
                    {['Blizzard','Hyper Voice','Water Pulse','Flash Cannon'].map(m => <span key={m} className="fs-tiny bg-cyan-950/50 border border-cyan-800/30 px-1.5 py-0.5 rounded text-cyan-300">{m}</span>)}
                  </div>
                </div>

                <div className="bg-neutral-950 border border-blue-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-2.5 mb-2">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${POKEMON_ARTWORK.Blastoise}.png`} alt="Blastoise" className="w-10 h-10 object-contain" loading="lazy" />
                    <div>
                      <div className="font-black fs-small text-blue-300">BW — Blastoise</div>
                      <div className="fs-tiny text-neutral-500">Torrent · Modest · Choice Specs</div>
                    </div>
                  </div>
                  <div className="fs-tiny text-neutral-400 mb-1.5">EVs: 252 SpA / 10 SpD / 248 Spe</div>
                  <div className="fs-tiny text-neutral-500 mb-1.5">IVs: 31 HP / 31 Spe · High Spd / 31 Spa</div>
                  <div className="grid grid-cols-2 gap-0.5">
                    {['Water Spout','Helping Hand','Blizzard'].map(m => <span key={m} className="fs-tiny bg-blue-950/50 border border-blue-800/30 px-1.5 py-0.5 rounded text-blue-300">{m}</span>)}
                  </div>
                </div>

              </div>
              <div className="px-5 py-2.5 bg-neutral-950 border-t border-neutral-800 fs-tiny text-neutral-600 text-center">
                Click fuera del modal para cerrar · Creado por Dreasy
              </div>
            </div>
          </div>
        </div>
      )}

      {showStartCheck && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3">
          <div className="bg-neutral-900 rounded-2xl border border-amber-700/50 w-full max-w-sm p-5 shadow-2xl shadow-amber-900/20">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-amber-800/30">
              <div className="w-10 h-10 rounded-xl bg-amber-900/40 border border-amber-700/40 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
              </div>
              <div>
                <h3 className="font-black fs-h3 text-amber-300">¿Listo para empezar?</h3>
                <p className="fs-tiny text-amber-500/70">Marca cada verificación para continuar</p>
              </div>
              <button onClick={() => setShowStartCheck(false)} className="ml-auto text-neutral-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-2">
              <button onClick={() => setStartChecks(prev => [!prev[0], prev[1], prev[2]])} className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${startChecks[0] ? 'bg-emerald-950/30 border-emerald-700/50' : 'bg-red-950/30 border-red-800/40 hover:bg-red-900/30'}`}>
                <div className={`w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${startChecks[0] ? 'bg-emerald-500 border-emerald-500' : 'border-neutral-600'}`}>
                  {startChecks[0] && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <div>
                  <div className={`fs-small font-black uppercase tracking-wider ${startChecks[0] ? 'text-emerald-300' : 'text-red-300'}`}>Amulet Coin / Luck Incense</div>
                  <div className={`fs-tiny mt-0.5 ${startChecks[0] ? 'text-emerald-200/60' : 'text-red-200/70'}`}>Equipa este objeto en uno de tus Pokémon. ¡No lo olvides!</div>
                </div>
              </button>
              <button onClick={() => setStartChecks(prev => [prev[0], !prev[1], prev[2]])} className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${startChecks[1] ? 'bg-emerald-950/30 border-emerald-700/50' : 'bg-amber-950/30 border-amber-800/40 hover:bg-amber-900/30'}`}>
                <div className={`w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${startChecks[1] ? 'bg-emerald-500 border-emerald-500' : 'border-neutral-600'}`}>
                  {startChecks[1] && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <div>
                  <div className={`fs-small font-black uppercase tracking-wider ${startChecks[1] ? 'text-emerald-300' : 'text-amber-300'}`}>Ubicación correcta</div>
                  <div className={`fs-tiny mt-0.5 ${startChecks[1] ? 'text-emerald-200/60' : 'text-amber-200/70'}`}>Debes estar en <span className="font-bold text-white">{steps[0]?.title || "Endrino"}</span> ({steps[0]?.region || "Johto"}).</div>
                </div>
              </button>
              <button onClick={() => setStartChecks(prev => [prev[0], prev[1], !prev[2]])} className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${startChecks[2] ? 'bg-emerald-950/30 border-emerald-700/50' : 'bg-neutral-950 border-neutral-800 hover:bg-neutral-900'}`}>
                <div className={`w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${startChecks[2] ? 'bg-emerald-500 border-emerald-500' : 'border-neutral-600'}`}>
                  {startChecks[2] && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <div>
                  <div className={`fs-small font-black uppercase tracking-wider ${startChecks[2] ? 'text-emerald-300' : 'text-neutral-300'}`}>Equipo y objetos</div>
                  <div className={`fs-tiny mt-0.5 ${startChecks[2] ? 'text-emerald-200/60' : 'text-neutral-500'}`}>Verifica movimientos y objetos correctos según la guía.</div>
                </div>
              </button>
            </div>
            <div className="flex gap-2 mt-1">
              <button onClick={() => setStartChecks([true, true, true])} className="flex-1 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 fs-tiny font-bold rounded-lg transition-colors">
                ✓ Marcar todas
              </button>
              <button onClick={() => setStartChecks([false, false, false])} className="flex-1 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-500 fs-tiny font-bold rounded-lg transition-colors">
                ✕ Desmarcar todas
              </button>
            </div>
            <button onClick={() => setSkipChecklist(prev => { const next = !prev; localStorage.setItem(LS("skip_checklist"), String(next)); return next; })} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-neutral-800/50 transition-colors">
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${skipChecklist ? 'bg-indigo-500 border-indigo-500' : 'border-neutral-600'}`}>
                {skipChecklist && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
              <span className={`fs-tiny font-semibold ${skipChecklist ? 'text-neutral-400' : 'text-neutral-600'}`}>No volver a mostrar esta verificación</span>
            </button>
            <p className="fs-small text-neutral-400 text-center">En el <button onClick={() => { setShowStartCheck(false); goToMenu(); }} className="text-indigo-400 font-bold underline hover:text-indigo-300 transition-colors inline">menú</button> puedes configurar todo esto</p>
            <button
              disabled={!startChecks.every(Boolean)}
              onClick={beginRun}
              className={`w-full py-3 text-white text-lg font-black rounded-xl transition-all ${startChecks.every(Boolean) ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-[0_0_25px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] cursor-pointer' : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'}`}
            >
              {startChecks.every(Boolean) ? "▶ COMENZAR RUTA" : "Marca todas las verificaciones"}
            </button>
          </div>
        </div>
      )}

      {showCountdown && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center">
          <div className="text-center">
            <div key={countdownValue} className="countdown-pop text-[12rem] sm:text-[16rem] font-black text-indigo-400 leading-none mb-4 select-none"
              style={{ textShadow: "0 0 80px rgba(99,102,241,0.5), 0 0 150px rgba(99,102,241,0.3)" }}>
              {countdownValue}
            </div>
            <div className="fs-h4 text-neutral-500 uppercase tracking-[0.3em] font-bold animate-pulse">Prepárate</div>
            <button onClick={() => setSkipCountdown(prev => { const next = !prev; localStorage.setItem(LS("skip_countdown"), String(next)); return next; })} className="mt-8 flex items-center justify-center gap-2 mx-auto py-1.5 px-3 rounded-lg hover:bg-neutral-800/50 transition-colors">
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${skipCountdown ? 'bg-indigo-500 border-indigo-500' : 'border-neutral-600'}`}>
                {skipCountdown && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
              <span className={`fs-tiny font-semibold ${skipCountdown ? 'text-neutral-400' : 'text-neutral-600'}`}>No mostrar cuenta atrás</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}