"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
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
  Target,
  Timer,
  Flame,
} from "lucide-react";

const ArrowRight = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
);

import { RouteStep, StepType, RunHistoryEntry, LastRunStats, GuideCategory } from "../types";
import DailyTasks from "./DailyTasks";
import Button from "@/components/ui/Button";
import GuideCredits from "./GuideCredits";
import CategoryFooter from "./layout/footers/CategoryFooter";
import CooldownBadge from "./shared/CooldownBadge";
import TimerDisplay from "./shared/TimerDisplay";
import { formatTime } from "./shared/TimerDisplay";
import { getGuideColorClasses, getGuidePokeGlow } from "@/lib/design-tokens";
import { getGuide, getGuidesByCategory, GUIDE_CATEGORIES, GUIDES } from "../data/guides";
import { showCompleteGym as shouldShowCompleteGym, isRoutesGuide } from "@/lib/guide-footer";

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
  hoohSteps?: RouteStep[];
  guide2Steps?: RouteStep[];
  gymCoords: GymCoordMap;
  regionMap: RegionMap;
  config?: GymRerunConfig;
}

type CooldownState = {
  endAt: number | null;
  lastGym: string | null;
};

type AllCooldowns = {
  gym: CooldownState;
  hooh: CooldownState;
  npc: CooldownState;
};

type StoredTimerState = {
  elapsed?: unknown;
  isRunning?: unknown;
  startedAt?: unknown;
};

type PendingResetAction = "timer" | "route" | "cooldown" | null;

type TimerEventType = "start" | "pause" | "reset" | "finish" | "route_reset" | "cooldown_start" | "cooldown_edit";

interface TimerEventLog {
  type: TimerEventType;
  timestamp: number;
  elapsed: number;
  stepIndex: number;
}

const formatRemaining = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${totalSeconds % 60}s`;
  return `${totalSeconds}s`;
};

const matchPokemon = (text: string): { name: string; id: number } | null => {
  for (const [name, id] of Object.entries(POKEMON_ARTWORK)) {
    if (text.startsWith(name)) return { name, id };
  }
  return null;
};

const PokemonSprite = ({ name, id, size = 24 }: { name: string; id: number; size?: number }) => {
  const [errored, setErrored] = useState(false);
  return errored ? (
    <span className="inline-block w-[${size}px] h-[${size}px] mr-1 rounded bg-neutral-800 align-middle" />
  ) : (
    <img
      src={`${SPRITE_BASE}/${id}.gif`}
      alt={name}
      className="inline-block object-contain -mt-0.5 mr-1 poke-aura-sm poke-glow-white"
      style={{ width: size, height: size }}
      loading="lazy"
      onError={() => setErrored(true)}
    />
  );
};

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

const SPRITE_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated";

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
  // Ho-Oh guide
  Chandelure: 609, Rotom: 479, Lunatone: 337,
  Suicune: 245, Entei: 244, Raikou: 243,
  // Guide 2
  Aerodactyl: 142, Ninetales: 38, Tyranitar: 248,
  Lanturn: 171, Torkoal: 324, Floatzel: 419,
  Stoutland: 508, Dodrio: 85, Bellossom: 182,
  Corsola: 222, Granbull: 210, Hitmontop: 237,
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

const CooldownNoticeModal = memo(({ cooldown, onDismiss }: { cooldown: CooldownState; onDismiss: () => void }) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);
  const remaining = cooldown.endAt ? Math.max(0, cooldown.endAt - now) : 0;
  const expired = remaining <= 0 && cooldown.endAt !== null;
  return (
    <div className="fixed inset-0 z-[80] pointer-events-none flex items-center justify-center p-3">
      <div className="pointer-events-auto bg-neutral-900/95 backdrop-blur-xl rounded-3xl border border-emerald-700/50 w-full max-w-md p-6 shadow-2xl shadow-emerald-950/30">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-black text-white leading-tight">Tiempo de reset de gyms</h2>
          <button onClick={onDismiss} className="w-7 h-7 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-all shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        {cooldown.lastGym && (
          <p className="fs-small text-neutral-500 mb-1">Último reset: <span className="font-bold text-neutral-300">{cooldown.lastGym}</span></p>
        )}
        <div className="my-5 text-center">
          <span className={`font-mono text-5xl md:text-6xl font-black tracking-tight ${expired ? "text-amber-400" : "text-emerald-400"}`} style={{ lineHeight: 1.1 }}>
            {expired ? "LISTO" : formatRemaining(remaining)}
          </span>
          <p className="fs-body text-neutral-400 mt-3">
            {expired
              ? "El tiempo de espera de 18h ya terminó. ¡Podés volver a hacer los gimnasios!"
              : "Tiempo restante para que se reinicien los gimnasios"}
          </p>
        </div>
        <button
          autoFocus
          onClick={onDismiss}
          className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-black fs-body transition-colors"
        >
          Entendido
        </button>
      </div>
    </div>
  );
});
CooldownNoticeModal.displayName = "CooldownNoticeModal";

const LoadingSpinner = memo(({ size = "md", text }: { size?: "sm" | "md" | "lg"; text?: string }) => {
  const sizeClasses = size === "sm" ? "w-5 h-5" : size === "lg" ? "w-10 h-10" : "w-7 h-7";
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className={`${sizeClasses} border-2 border-neutral-600 border-t-indigo-500 rounded-full animate-spin`} />
      {text && <p className="fs-tiny text-neutral-500 animate-pulse">{text}</p>}
    </div>
  );
});
LoadingSpinner.displayName = "LoadingSpinner";

export default function GymRerunAssistant({ steps: defaultSteps, hoohSteps, guide2Steps, gymCoords, regionMap, config = {} }: GymRerunAssistantProps) {
  const {
    totalGyms = 33,
    title = "GYM RERUN",
    subtitle = "ASSISTANT",
    description = "Guía secuencial para 33 Gym Reruns en PokeMMO",
    gymResetMs = 18 * 60 * 60 * 1000,
    storagePrefix = "pkmmo",
  } = config;

  const [showMenu, setShowMenu] = useState<boolean>(true);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [menuExiting, setMenuExiting] = useState<boolean>(false);
  const [guideLoading, setGuideLoading] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const currentStepIndexRef = useRef(currentStepIndex);
  useEffect(() => { currentStepIndexRef.current = currentStepIndex; }, [currentStepIndex]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showTeam, setShowTeam] = useState<boolean>(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState<boolean>(false);
  const [showResumePrompt, setShowResumePrompt] = useState<boolean>(false);
  const [pendingResetAction, setPendingResetAction] = useState<PendingResetAction>(null);
  const [teamExiting, setTeamExiting] = useState<boolean>(false);
  const [historyExiting, setHistoryExiting] = useState<boolean>(false);
  const [showCooldownEditor, setShowCooldownEditor] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [appExiting, setAppExiting] = useState<boolean>(false);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [slideClass, setSlideClass] = useState<string>("");
  const [slideKey, setSlideKey] = useState<number>(0);
  const [selectedGuideId, setSelectedGuideId] = useState<'none' | 'gym33' | 'hooh' | 'guide2'>('none');
  const selectGuide = (id: 'none' | 'gym33' | 'hooh' | 'guide2') => {
    if (id !== 'none') {
      setGuideLoading(true);
      setTimeout(() => {
        setSelectedGuideId(id);
        setLS("selected_guide", id);
        if (id !== 'gym33') { setCurrentStepIndex(-1); resetTimer(); }
        setTimeout(() => setGuideLoading(false), 150);
      }, 300);
    } else {
      setSelectedGuideId(id);
      setLS("selected_guide", id);
    }
  };
  const steps = selectedGuideId === 'hooh' && hoohSteps ? hoohSteps
    : selectedGuideId === 'guide2' && guide2Steps ? guide2Steps
    : defaultSteps;
  const isTurnGuide = selectedGuideId === 'hooh';
  interface GymGroup {
    gymStep: RouteStep;
    subBattles: RouteStep[];
    extras: RouteStep[];
    gymIndex: number;
    region: string;
  }
  const getGroupRegion = (step: RouteStep): string => {
    if (step.region) return step.region;
    const hoennGyms = ['Lavaridge', 'Mauville', 'Fallarbor', 'Rustboro', 'Fortree', 'Sootopolis'];
    return hoennGyms.some(g => (step.gym || step.title).toLowerCase().includes(g.toLowerCase())) ? 'Hoenn' : 'Sinnoh';
  };
  const groupStepsByGym = (steps: RouteStep[]): GymGroup[] => {
    const groups: GymGroup[] = [];
    let current: GymGroup | null = null;
    for (const step of steps) {
      if (step.type === 'gym') {
        if (current && step.gym !== current.gymStep.gym) {
          groups.push(current);
          current = { gymStep: step, subBattles: [], extras: [], gymIndex: groups.length + 1, region: getGroupRegion(step) };
        } else if (current && step.gym === current.gymStep.gym && current.extras.length === 0) {
          current.subBattles.push(step);
        } else {
          if (current) groups.push(current);
          current = { gymStep: step, subBattles: [], extras: [], gymIndex: (current ? groups.length + 1 : 1), region: getGroupRegion(step) };
        }
      } else if (current) {
        current.extras.push(step);
      }
    }
    if (current) groups.push(current);
    return groups;
  };
  const gymGroups = useMemo(() => isTurnGuide ? [] : groupStepsByGym(steps), [steps, isTurnGuide]);
  const gymGroupCount = gymGroups.length;
  const currentGymIndex = useMemo(() => {
    if (isTurnGuide || currentStepIndex === -1) return -1;
    const step = steps[currentStepIndex];
    if (!step) return -1;
    for (let i = 0; i < gymGroups.length; i++) {
      const g = gymGroups[i];
      if (g.gymStep.id === step.id || g.subBattles.some(s => s.id === step.id) || g.extras.some(e => e.id === step.id)) return i;
    }
    return -1;
  }, [currentStepIndex, steps, gymGroups, isTurnGuide]);
  const currentGymGroup = currentGymIndex >= 0 ? gymGroups[currentGymIndex] ?? null : null;

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

  const [timerIsRunning, setTimerIsRunning] = useState<boolean>(false);
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);
  const [timerElapsed, setTimerElapsed] = useState<number>(0);
  const [sessionGymCount, setSessionGymCount] = useState<number>(0);
  const [showTasks, setShowTasks] = useState<boolean>(false);
  const [showCooldownNotice, setShowCooldownNotice] = useState<boolean>(false);
  const [showActiveSessionModal, setShowActiveSessionModal] = useState<boolean>(false);
  const [mapPreview, setMapPreview] = useState<{ src: string; gym: string; region: string; x: number; y: number } | null>(null);
  const [focusStepMode, setFocusStepMode] = useState<boolean>(false);
  const [lastRunStats, setLastRunStats] = useState<LastRunStats | null>(null);
  const [cooldown, setCooldown] = useState<CooldownState>({ endAt: null, lastGym: null });
  const [allCooldowns, setAllCooldowns] = useState<AllCooldowns>({
    gym: { endAt: null, lastGym: null },
    hooh: { endAt: null, lastGym: null },
    npc: { endAt: null, lastGym: null },
  });
  const [cooldownHours, setCooldownHours] = useState<string>("18");
  const [cooldownMinutes, setCooldownMinutes] = useState<string>("0");
  const [pendingCooldownDurationMs, setPendingCooldownDurationMs] = useState<number>(gymResetMs);
  const [history, setHistory] = useState<RunHistoryEntry[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const LS = (key: string) => `${storagePrefix}_${key}`;
  const getLS = (key: string, fallback: string = "") => {
    try {
      return localStorage.getItem(LS(key)) ?? fallback;
    } catch {
      setStorageWarning("No se pudo leer el progreso local. La app sigue funcionando.");
      return fallback;
    }
  };
  const setLS = (key: string, value: string) => {
    try {
      localStorage.setItem(LS(key), value);
    } catch {
      setStorageWarning("No se pudo guardar el progreso local. Revisa el almacenamiento del navegador.");
    }
  };

  const parseLS = <T,>(key: string): T | null => {
    const raw = getLS(key);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as T;
    } catch {
      setStorageWarning(`Datos corruptos en ${key}. Se ignoraron para proteger la sesión.`);
      return null;
    }
  };

  const logTimerEvent = useCallback((type: TimerEventType) => {
    try {
      const now = Date.now();
      const currentTotal = timerIsRunning && timerStartTime ? timerElapsed + (now - timerStartTime) : timerElapsed;
      const event: TimerEventLog = { type, timestamp: now, elapsed: currentTotal, stepIndex: currentStepIndex };
      const raw = localStorage.getItem(LS("gym_timer_events"));
      const events: TimerEventLog[] = raw ? JSON.parse(raw) : [];
      events.push(event);
      if (events.length > 100) events.splice(0, events.length - 100);
      localStorage.setItem(LS("gym_timer_events"), JSON.stringify(events));
    } catch {}
  }, [timerIsRunning, timerStartTime, timerElapsed, currentStepIndex, LS]);

  const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] || steps[0] : null;

  const triggerToast = useCallback((message: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 2000);
  }, []);

  useEffect(() => {
    const savedStep = getLS("gym_step");
    if (savedStep) {
      const idx = Number(savedStep);
      if (!isNaN(idx) && idx >= -1 && idx < steps.length) {
        setCurrentStepIndex(idx);
        if (idx >= 0) {
          const savedGuide = getLS("selected_guide");
          if (savedGuide === "hooh") setSelectedGuideId("hooh");
          else if (savedGuide === "guide2") setSelectedGuideId("guide2");
          else setSelectedGuideId("gym33");
          setShowResumePrompt(true);
        }
      }
    }

    const savedTimer = parseLS<StoredTimerState>("gym_timer");
    if (savedTimer) {
      const elapsed = typeof savedTimer.elapsed === "number" && Number.isFinite(savedTimer.elapsed) ? savedTimer.elapsed : 0;
      const startedAt = typeof savedTimer.startedAt === "number" && Number.isFinite(savedTimer.startedAt) ? savedTimer.startedAt : null;
      const isRunning = savedTimer.isRunning === true && startedAt !== null;
      setTimerElapsed(elapsed);
      setTimerIsRunning(isRunning);
      setTimerStartTime(isRunning ? startedAt : null);
    }

    const savedHistory = parseLS<RunHistoryEntry[]>("gym_history");
    if (Array.isArray(savedHistory)) {
      setHistory(savedHistory);
    }

    const savedCooldown = parseLS<CooldownState>("gym_cooldown");
    if (savedCooldown) {
      const endAt = typeof savedCooldown.endAt === "number" && Number.isFinite(savedCooldown.endAt) ? savedCooldown.endAt : null;
      const lastGym = typeof savedCooldown.lastGym === "string" ? savedCooldown.lastGym : null;
      setCooldown({ endAt, lastGym });
      if (endAt && endAt > Date.now()) {
        setShowCooldownNotice(true);
      }
    }

    const savedAllCooldowns = parseLS<AllCooldowns>("all_cooldowns");
    if (savedAllCooldowns) {
      setAllCooldowns({
        gym: {
          endAt: typeof savedAllCooldowns.gym?.endAt === "number" ? savedAllCooldowns.gym.endAt : null,
          lastGym: typeof savedAllCooldowns.gym?.lastGym === "string" ? savedAllCooldowns.gym.lastGym : null,
        },
        hooh: {
          endAt: typeof savedAllCooldowns.hooh?.endAt === "number" ? savedAllCooldowns.hooh.endAt : null,
          lastGym: typeof savedAllCooldowns.hooh?.lastGym === "string" ? savedAllCooldowns.hooh.lastGym : null,
        },
        npc: {
          endAt: typeof savedAllCooldowns.npc?.endAt === "number" ? savedAllCooldowns.npc.endAt : null,
          lastGym: typeof savedAllCooldowns.npc?.lastGym === "string" ? savedAllCooldowns.npc.lastGym : null,
        },
      });
    }

    setLoaded(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePop = () => {
  if (!loaded) return null;

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

  useEffect(() => {
    if (!loaded) return;
    setLS("gym_step", currentStepIndex.toString());
  }, [loaded, currentStepIndex]);

  useEffect(() => {
    if (!loaded) return;
    setLS("gym_timer", JSON.stringify({
      elapsed: timerElapsed,
      isRunning: timerIsRunning,
      startedAt: timerStartTime,
    }));
  }, [loaded, timerElapsed, timerIsRunning, timerStartTime]);

  useEffect(() => {
    if (!loaded) return;
    setLS("gym_cooldown", JSON.stringify(cooldown));
  }, [loaded, cooldown]);

  useEffect(() => {
    if (!loaded) return;
    setLS("all_cooldowns", JSON.stringify(allCooldowns));
  }, [loaded, allCooldowns]);

  useEffect(() => {
    if (!loaded) return;
    setLS("gym_history", JSON.stringify(history));
  }, [loaded, history]);

  useEffect(() => {
    if (!loaded || !timerIsRunning) return;
    const interval = window.setInterval(() => {
      const currentTotal = timerElapsed + (Date.now() - (timerStartTime || Date.now()));
      setLS("gym_timer", JSON.stringify({ elapsed: currentTotal, isRunning: true, startedAt: timerStartTime }));
    }, 5000);
    return () => window.clearInterval(interval);
  }, [loaded, timerIsRunning, timerElapsed, timerStartTime]);

  const getLastCompletedGym = useCallback(() => {
    for (let i = currentStepIndex; i >= 0; i--) {
      const step = steps[i];
      if (step?.type === "gym") return step.gym || step.title;
    }
    return null;
  }, [currentStepIndex, steps]);

  const startGymCooldown = useCallback((gymName?: string | null, durationMs = gymResetMs) => {
    const lastGym = gymName || getLastCompletedGym() || "Gym desconocido";
    const nextCooldown = { endAt: Date.now() + durationMs, lastGym };
    setCooldown(nextCooldown);
    setCooldownHours(String(Math.floor(durationMs / 3600000)));
    setCooldownMinutes(String(Math.round((durationMs % 3600000) / 60000)));
    logTimerEvent("cooldown_start");
    if (durationMs >= 7 * 24 * 60 * 60 * 1000) {
      setAllCooldowns(prev => ({ ...prev, hooh: nextCooldown }));
    } else if (durationMs <= 6 * 60 * 60 * 1000) {
      setAllCooldowns(prev => ({ ...prev, npc: nextCooldown }));
    } else {
      setAllCooldowns(prev => ({ ...prev, gym: nextCooldown }));
    }
    triggerToast(`Reset gyms activo: ${lastGym}`);
  }, [getLastCompletedGym, gymResetMs, triggerToast, logTimerEvent]);

  const requestGymCooldownStart = useCallback((durationMs = gymResetMs) => {
    setPendingCooldownDurationMs(durationMs);
    if (cooldown.endAt && cooldown.endAt > Date.now()) {
      setPendingResetAction("cooldown");
      return;
    }
    startGymCooldown(getLastCompletedGym(), durationMs);
  }, [cooldown.endAt, getLastCompletedGym, gymResetMs, startGymCooldown]);

  const handleNext = useCallback(() => {
    const isTurn = selectedGuideId === 'hooh';
    if (isTurn) {
      setCurrentStepIndex((prev) => {
        const nextIdx = prev === -1 ? 0 : Math.min(prev + 1, steps.length - 1);
        if (nextIdx !== prev) { setSlideClass("slide-in-right"); setSlideKey(k => k + 1); }
        return nextIdx;
      });
    } else {
      setCurrentStepIndex((prev) => {
        if (prev === -1) return 0;
        for (let i = prev + 1; i < steps.length; i++) {
          if (steps[i].type === 'gym') return i;
        }
        return prev;
      });
      setSlideClass("slide-in-right"); setSlideKey(k => k + 1);
    }
  }, [steps, selectedGuideId]);

  const completeGym = useCallback(() => {
    setSessionGymCount(prev => prev + 1);
    triggerToast("Gym completado");
    const isTurn = selectedGuideId === 'hooh';
    if (isTurn) {
      setCurrentStepIndex((prev) => {
        const nextIdx = prev === -1 ? 0 : Math.min(prev + 1, steps.length - 1);
        if (nextIdx !== prev) { setSlideClass("slide-in-right"); setSlideKey(k => k + 1); }
        return nextIdx;
      });
    } else {
      setCurrentStepIndex((prev) => {
        if (prev === -1) return 0;
        for (let i = prev + 1; i < steps.length; i++) {
          if (steps[i].type === 'gym') return i;
        }
        return prev;
      });
      setSlideClass("slide-in-right"); setSlideKey(k => k + 1);
    }
  }, [steps, selectedGuideId, triggerToast]);

  const handlePrev = useCallback(() => {
    const isTurn = selectedGuideId === 'hooh';
    if (isTurn) {
      setCurrentStepIndex((prev) => {
        const nextIdx = Math.max(prev - 1, -1);
        if (nextIdx !== prev) { setSlideClass("slide-in-left"); setSlideKey(k => k + 1); }
        return nextIdx;
      });
    } else {
      setCurrentStepIndex((prev) => {
        if (prev <= 0) return -1;
        for (let i = prev - 1; i >= 0; i--) {
          if (steps[i].type === 'gym') return i;
        }
        return -1;
      });
      setSlideClass("slide-in-left"); setSlideKey(k => k + 1);
    }
  }, [steps, selectedGuideId]);

  const stepNavRef = useRef<HTMLDivElement | null>(null);
  const stepButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleNextRef = useRef(handleNext);
  const handlePrevRef = useRef(handlePrev);
  useEffect(() => { handleNextRef.current = handleNext; }, [handleNext]);
  useEffect(() => { handlePrevRef.current = handlePrev; }, [handlePrev]);

  useEffect(() => {
    if (currentStepIndex === -1) return;
    const button = stepButtonRefs.current[currentStepIndex];
    if (button?.scrollIntoView) {
      button.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    } else if (stepNavRef.current) {
      const nav = stepNavRef.current;
      const target = stepNavRef.current.querySelectorAll("button")[currentStepIndex] as HTMLElement | undefined;
      target?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [currentStepIndex]);

  const beginRun = useCallback(() => {
    setShowStartCheck(false);
    const willAutoStart = !manualTimerRef.current;
    if (willAutoStart) {
      setTimerIsRunning(true);
      setTimerStartTime(Date.now());
      triggerToast("¡Ruta iniciada!");
    } else {
      triggerToast("Ruta iniciada. Inicia el cronómetro manualmente cuando estés listo.");
    }

    if (!cooldown.endAt || cooldown.endAt <= Date.now()) {
      const firstGym = steps.find(s => s.type === "gym");
      if (firstGym) startGymCooldown(firstGym.gym || firstGym.title);
    }
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
  }, [cooldown.endAt, startGymCooldown, steps, triggerToast]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName || "")) return;
      if (currentStepIndexRef.current === -1) return;
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

  const startTimer = () => {
    setTimerIsRunning(true);
    setTimerStartTime(Date.now());
    logTimerEvent("start");
    if (!cooldown.endAt || cooldown.endAt <= Date.now()) {
      const firstGym = steps.find(s => s.type === "gym");
      if (firstGym) startGymCooldown(firstGym.gym || firstGym.title);
    }
  };
  const pauseTimer = () => {
    setTimerIsRunning(false);
    if (timerStartTime) setTimerElapsed(prev => prev + (Date.now() - timerStartTime));
    setTimerStartTime(null);
    logTimerEvent("pause");
  };
  const resetTimer = () => { setTimerIsRunning(false); setTimerStartTime(null); setTimerElapsed(0); };
  const requestTimerReset = () => setPendingResetAction("timer");
  const requestRouteReset = () => setPendingResetAction("route");

  const confirmPendingReset = () => {
    if (pendingResetAction === "timer") {
      resetTimer();
      logTimerEvent("reset");
      triggerToast("Cronómetro reiniciado");
    }

    if (pendingResetAction === "route") {
      setCurrentStepIndex(-1);
      resetTimer();
      logTimerEvent("route_reset");
      triggerToast("Ruta reiniciada");
    }

    if (pendingResetAction === "cooldown") {
      startGymCooldown(getLastCompletedGym(), pendingCooldownDurationMs);
    }

    setPendingResetAction(null);
  };

  const finishRun = () => {
    const finalElapsed = timerIsRunning && timerStartTime ? timerElapsed + (Date.now() - timerStartTime) : timerElapsed;
    const totalGymsDone = sessionGymCount;
    const newEntry: RunHistoryEntry = {
      id: Math.random().toString(36).substr(2, 9),
      finishedAt: Date.now(),
      elapsed: finalElapsed,
      completedStepsCount: currentStepIndex + 1,
      totalSteps: steps.length
    };
    const updatedHistory = [newEntry, ...history].slice(0, 20);
    setHistory(updatedHistory);
    setLastRunStats({ elapsed: finalElapsed, gymsCompleted: totalGymsDone, totalGyms, finishedAt: Date.now() });
    logTimerEvent("finish");
    const hoohCooldownMs = 7 * 24 * 60 * 60 * 1000;
    const cooldownDuration = selectedGuideId === 'hooh' ? hoohCooldownMs : gymResetMs;
    startGymCooldown(getLastCompletedGym(), cooldownDuration);
    resetTimer();
    setSessionGymCount(0);
    setCurrentStepIndex(-1);
    setShowFinishConfirm(false);
    goToMenu();
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
    if (type === "turn") return <Target className="w-4 h-4 text-emerald-400" />;
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

  const pendingResetCopy = {
    timer: {
      title: "¿Reiniciar cronómetro?",
      body: "Se perderá el tiempo actual de esta ruta. El cooldown de gyms no se toca.",
      confirm: "Sí, reiniciar",
    },
    route: {
      title: "¿Reiniciar ruta?",
      body: "Volverás al inicio y se borrará el cronómetro actual. El cooldown de gyms se conserva.",
      confirm: "Sí, reiniciar ruta",
    },
    cooldown: {
      title: "¿Reiniciar timer de gyms?",
      body: `Se reemplazará el reset actual de ${cooldown.lastGym || getLastCompletedGym() || "último gym"} por un nuevo conteo.`,
      confirm: "Sí, activar nuevo timer",
    },
  } as const;

  const resetConfirmModal = pendingResetAction ? (
    <div className="fixed inset-0 z-[70] bg-black/85 flex items-center justify-center p-3">
      <div className="bg-neutral-900 rounded-2xl border border-red-800/50 w-full max-w-sm p-5 shadow-2xl shadow-red-950/30">
        <h3 className="font-black fs-h2 text-white">{pendingResetCopy[pendingResetAction].title}</h3>
        <p className="fs-body text-neutral-400 mt-2">{pendingResetCopy[pendingResetAction].body}</p>
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <button
            autoFocus
            onClick={() => setPendingResetAction(null)}
            className="py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-black fs-body"
          >
            Cancelar
          </button>
          <button
            onClick={confirmPendingReset}
            className="py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white font-black fs-body"
          >
            {pendingResetCopy[pendingResetAction].confirm}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  const resumePromptModal = showResumePrompt ? (
    <div className="fixed inset-0 z-[65] bg-black/85 flex items-center justify-center p-3">
      <div className="bg-neutral-900 rounded-2xl border border-indigo-700/50 w-full max-w-sm p-5 shadow-2xl shadow-indigo-950/30">
        <h3 className="font-black fs-h2 text-white">Sesión anterior encontrada</h3>
        <p className="fs-body text-neutral-400 mt-2">
          Hay una ruta guardada en el paso {Math.max(0, currentStepIndex + 1)}/{steps.length}. Puedes continuar sin perder cronómetro ni cooldown.
        </p>
        {storageWarning && (
          <p className="mt-3 rounded-xl border border-amber-700/50 bg-amber-950/30 px-3 py-2 fs-tiny text-amber-200">
            {storageWarning}
          </p>
        )}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              setShowResumePrompt(false);
              setPendingResetAction("route");
            }}
            className="w-full"
          >
            Empezar cero
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setShowResumePrompt(false);
              exitMenu();
            }}
            className="w-full"
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>
  ) : null;

  const historyModal = showHistory ? (
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
  ) : null;

  if (showMenu) {
    const bestRun = history.length > 0 ? history.reduce((a, b) => a.elapsed < b.elapsed ? a : b) : null;
    return (
      <>
      <div className={`${menuVisible ? 'menu-enter' : 'fade-in-screen'} bg-neutral-950 text-neutral-200 font-sans relative overflow-hidden ${menuExiting ? 'menu-exit' : ''}`} style={{ minHeight: '100dvh' }}>
        <PokeBackground />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-32 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 w-full mx-auto px-3 sm:px-5 md:px-6 lg:px-8 py-3 sm:py-4 md:py-5" style={{ maxWidth: "min(100%, 90rem)" }}>

          {selectedGuideId !== 'none' && (() => {
            const guide = getGuide(selectedGuideId);
            if (!guide) return null;
            const gc = getGuideColorClasses(guide.color);
            return (
              <div className="reveal-1 w-full text-center space-y-1.5 mb-2">
                <span className={`fs-tiny uppercase tracking-widest font-black border px-1.5 py-0.5 rounded-full inline-block ${gc.text} ${gc.border} ${gc.bg}`}>
                  {guide.credits.author}
                </span>
                <h2 className="fs-h3 font-black text-white leading-tight">{guide.title} Rerun</h2>
                <p className="fs-small text-neutral-400 max-w-xl mx-auto leading-relaxed">{guide.subtitle}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 mt-2 max-w-2xl mx-auto">
                  <div className="bg-neutral-900 border border-neutral-800 rounded-lg py-1 px-1.5">
                    <div className="text-sm">🎯</div>
                    <div className={`fs-tiny font-black ${gc.text}`}>{steps.filter(s => s.type === "gym").length || steps.length}</div>
                    <div className="fs-tiny text-neutral-500 uppercase tracking-wider">{selectedGuideId === 'hooh' ? 'Turnos' : 'Gimnasios'}</div>
                  </div>
                  <div className="bg-neutral-900 border border-neutral-800 rounded-lg py-1 px-1.5">
                    <div className="text-sm">🗺️</div>
                    <div className={`fs-tiny font-black ${gc.text}`}>5</div>
                    <div className="fs-tiny text-neutral-500 uppercase tracking-wider">Regiones</div>
                  </div>
                  <div className="bg-neutral-900 border border-neutral-800 rounded-lg py-1 px-1.5">
                    <div className="text-sm">🔄</div>
                    <div className={`fs-tiny font-black ${gc.text}`}>{steps.filter(s => s.switchTo).length}</div>
                    <div className="fs-tiny text-neutral-500 uppercase tracking-wider">Swaps</div>
                  </div>
                  <div className="bg-neutral-900 border border-neutral-800 rounded-lg py-1 px-1.5">
                    <div className="text-sm">⭐</div>
                    <div className={`fs-tiny font-black ${gc.text}`}>{selectedGuideId === 'hooh' ? 'Media' : 'Media-Alta'}</div>
                    <div className="fs-tiny text-neutral-500 uppercase tracking-wider">Dificultad</div>
                  </div>
                </div>
              </div>
            );
          })()}

          {selectedGuideId === 'none' && (<>
            <div className="reveal-1 text-center mb-3 md:mb-4">
              <span className="fs-tiny uppercase tracking-widest font-black text-indigo-400 border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 rounded-full">PokeMMO Speedrun Tool</span>
              <h1 className="fs-hero font-black tracking-tight text-white leading-none mt-1" style={{ textShadow: '0 0 60px rgba(99,102,241,0.5)' }}>GYM RERUN</h1>
              <h2 className="fs-h2 font-bold text-indigo-400 tracking-widest">ASSISTANT</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-5">
              <div className="bg-gradient-to-br from-amber-500/15 to-orange-500/5 border border-amber-500/30 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Timer className="w-4 h-4 text-amber-400" />
                  <span className="fs-tiny font-black text-amber-300 uppercase tracking-wider">Cooldowns</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-neutral-900/60 rounded-lg px-2 py-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span className="fs-tiny font-bold text-amber-300">Gyms</span>
                    </div>
                    <CooldownBadge endAt={allCooldowns.gym.endAt} />
                  </div>
                  <div className="flex items-center justify-between bg-neutral-900/60 rounded-lg px-2 py-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="fs-tiny font-bold text-red-300">Ho-Oh</span>
                    </div>
                    <CooldownBadge endAt={allCooldowns.hooh.endAt} />
                  </div>
                  <div className="flex items-center justify-between bg-neutral-900/60 rounded-lg px-2 py-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="fs-tiny font-bold text-emerald-300">NPCs</span>
                    </div>
                    <CooldownBadge endAt={allCooldowns.npc.endAt} />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-500/15 to-teal-500/5 border border-emerald-500/30 rounded-2xl p-3 md:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-4 h-4 text-emerald-400" />
                  <span className="fs-tiny font-black text-emerald-300 uppercase tracking-wider">Estadísticas</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-neutral-900/60 rounded-lg px-2 py-2 text-center">
                    <div className="fs-small font-black text-white">{totalGyms}</div>
                    <div className="fs-tiny text-neutral-500">Gyms</div>
                  </div>
                  <div className="bg-neutral-900/60 rounded-lg px-2 py-2 text-center">
                    <div className="fs-small font-black text-white">3</div>
                    <div className="fs-tiny text-neutral-500">Guías</div>
                  </div>
                  <div className="bg-neutral-900/60 rounded-lg px-2 py-2 text-center">
                    <div className="fs-small font-black text-white">5</div>
                    <div className="fs-tiny text-neutral-500">Regiones</div>
                  </div>
                  <div className="bg-neutral-900/60 rounded-lg px-2 py-2 text-center">
                    <div className="fs-small font-black text-white">{history.length}</div>
                    <div className="fs-tiny text-neutral-500">Runs</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-violet-500/15 to-purple-500/5 border border-violet-500/30 rounded-2xl p-3 md:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-violet-400" />
                  <span className="fs-tiny font-black text-violet-300 uppercase tracking-wider">Actividad</span>
                </div>
                {lastRunStats ? (
                  <div className="space-y-2">
                    <div className="bg-neutral-900/60 rounded-lg px-2 py-1.5">
                      <div className="flex items-center justify-between">
                        <span className="fs-tiny text-neutral-400">Última run</span>
                        <span className="fs-tiny font-bold text-violet-300">{formatTime(lastRunStats.elapsed)}</span>
                      </div>
                    </div>
                    <div className="bg-neutral-900/60 rounded-lg px-2 py-1.5">
                      <div className="flex items-center justify-between">
                        <span className="fs-tiny text-neutral-400">Gyms</span>
                        <span className="fs-tiny font-bold text-emerald-300">{lastRunStats.gymsCompleted}/{lastRunStats.totalGyms}</span>
                      </div>
                    </div>
                    <div className="bg-neutral-900/60 rounded-lg px-2 py-1.5">
                      <div className="flex items-center justify-between">
                        <span className="fs-tiny text-neutral-400">Fecha</span>
                        <span className="fs-tiny font-bold text-neutral-300">{new Date(lastRunStats.finishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-neutral-900/60 rounded-lg px-2 py-3 text-center">
                    <span className="fs-tiny text-neutral-500">Sin runs aún</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-5">
              {GUIDE_CATEGORIES.map(cat => {
                const catGuides = getGuidesByCategory(cat.id);
                return (
                  <div key={cat.id} className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">{cat.icon}</span>
                      <span className="fs-small font-black text-neutral-300 uppercase tracking-wider">{cat.label}</span>
                    </div>
                    {catGuides.length > 0 ? (
                      <div className="space-y-3">
                        {catGuides.map(g => {
                          const gc = getGuideColorClasses(g.color);
                          return (
                            <button key={g.id} onClick={() => selectGuide(g.id as 'none' | 'gym33' | 'hooh' | 'guide2')} className={`relative w-full flex min-h-[88px] items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all bg-neutral-950/70 shadow-[0_10px_24px_rgba(0,0,0,0.18)] ${gc.border} hover:bg-neutral-800 ${gc.borderHover} group`}>
                              <div className={`w-11 h-11 shrink-0 rounded-2xl border border-neutral-800/60 bg-neutral-900/70 p-1.5 poke-aura ${getGuidePokeGlow(g.color)}`}>
                                <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${g.icon}.gif`} alt="" className="w-full h-full object-contain" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className={`fs-tiny font-black ${gc.text} truncate`}>{g.title}</div>
                                <div className="fs-tiny text-neutral-500 truncate">{g.subtitle}</div>
                              </div>
                              <span className={`fs-tiny font-black ${gc.text} opacity-0 group-hover:opacity-100 transition-opacity`}>→</span>
                              {/* Hover preview: show team sprites and names */}
                              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 px-3 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-neutral-300 fs-tiny text-center opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl w-max">
                                <div className="flex items-center gap-2">
                                  {(g.team || []).slice(0,6).map((t, i) => (
                                    <div key={i} className="w-10 h-10 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center p-1">
                                      <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${t.spriteId}.gif`} alt={t.name} className="w-full h-full object-contain" loading="lazy" />
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-2 text-neutral-400">{(g.team || []).map(t => t.name).join(' · ')}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : cat.id === 'guides' ? (
                      <div className="space-y-3">
                        <a href="https://docs.google.com/document/d/1GkgTlrZwm2jUO_aD_U9Gha8CaljwRQaMLMMJfpsr4Bc/edit?tab=t.kd1fquq7r0zb" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-neutral-950/60 border border-neutral-800 hover:border-blue-500/40 rounded-xl py-3 px-4 transition-all group">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h5v7h7v9H6z"/></svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="fs-tiny font-bold text-neutral-300 group-hover:text-white transition-colors block truncate">Guía 25 Gyms (MYRROR)</span>
                            <span className="fs-tiny text-neutral-500 block">Documentos</span>
                          </div>
                        </a>
                        <a href="https://www.youtube.com/watch?v=himBCqDN2-I" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-neutral-950/60 border border-neutral-800 hover:border-red-500/40 rounded-xl py-3 px-4 transition-all group">
                          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-red-400"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="fs-tiny font-bold text-neutral-300 group-hover:text-white transition-colors block truncate">33 Gyms Guide</span>
                            <span className="fs-tiny text-neutral-500 block">YouTube</span>
                          </div>
                        </a>
                        <a href="https://www.youtube.com/watch?v=QEwUZKASfeI" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-neutral-950/60 border border-neutral-800 hover:border-amber-500/40 rounded-xl py-3 px-4 transition-all group">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-amber-400"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="fs-tiny font-bold text-neutral-300 group-hover:text-white transition-colors block truncate">Ho-Oh Farming</span>
                            <span className="fs-tiny text-neutral-500 block">YouTube · Finya Cabrazo</span>
                          </div>
                        </a>
                      </div>
                    ) : (
                      <div className="bg-neutral-950/40 border border-dashed border-neutral-700/60 rounded-xl py-4 text-center opacity-50">
                        <Sparkles className="w-4 h-4 text-neutral-500 mx-auto mb-1" />
                        <span className="fs-tiny font-bold text-neutral-400">Próximamente</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="fs-small text-neutral-500 text-center">{description}</p>
          </>)}

          {selectedGuideId === 'none' && (
          <div className="reveal-2 w-full grid grid-cols-3 gap-3 text-center mb-6">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl py-3 px-3">
                  <div className="fs-small font-black text-white">{GUIDES.length}</div>
                  <div className="fs-tiny text-neutral-500 uppercase tracking-wider leading-tight">Guías Disp.</div>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl py-3 px-3">
                  <div className="fs-small font-black text-neutral-400">{totalGyms}</div>
                  <div className="fs-tiny text-neutral-500 uppercase tracking-wider leading-tight">Gyms por Guía</div>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl py-3 px-3">
                  <div className="fs-small font-black text-neutral-400">{steps.length}</div>
                  <div className="fs-tiny text-neutral-500 uppercase tracking-wider leading-tight">Pasos por Guía</div>
                </div>
          </div>
          )}

          {lastRunStats && selectedGuideId !== 'none' && (
            <div className="reveal-3 w-full bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/30 rounded-xl p-2">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <h3 className="font-black fs-small text-indigo-300 uppercase tracking-wider">Última Run</h3>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <div>
                  <div className="fs-small font-black text-white">{formatTime(lastRunStats.elapsed)}</div>
                  <div className="fs-tiny text-neutral-500 uppercase tracking-wider">Tiempo</div>
                </div>
                <div>
                  <div className="fs-small font-black text-emerald-400">{lastRunStats.gymsCompleted}/{lastRunStats.totalGyms}</div>
                  <div className="fs-tiny text-neutral-500 uppercase tracking-wider">Gyms</div>
                </div>
                <div>
                  <div className="fs-small font-black text-amber-400">{new Date(lastRunStats.finishedAt).toLocaleDateString()}</div>
                  <div className="fs-tiny text-neutral-500 uppercase tracking-wider">Fecha</div>
                </div>
              </div>
            </div>
          )}

          {selectedGuideId !== 'none' && (
            <div className="reveal-3 w-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-2">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Timer className="w-3.5 h-3.5 text-amber-400" />
                <h3 className="font-black fs-small text-amber-300 uppercase tracking-wider">
                  {selectedGuideId === 'hooh' ? 'Cooldown Ho-Oh' : 'Cooldown Gyms'}
                </h3>
                <div className="ml-auto">
                  <CooldownBadge endAt={selectedGuideId === 'hooh' ? allCooldowns.hooh.endAt : cooldown.endAt} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="fs-tiny text-amber-200/70">
                    {selectedGuideId === 'hooh' ? (allCooldowns.hooh.lastGym || "Mt. Silver") : (cooldown.lastGym || "Sin gym registrado")}
                  </span>
                </div>
                <button onClick={() => setShowCooldownEditor(true)} className="fs-tiny text-amber-400 hover:text-amber-300 font-bold transition-colors">
                  Ajustar
                </button>
              </div>
              {((selectedGuideId === 'hooh' && allCooldowns.hooh.endAt && allCooldowns.hooh.endAt > Date.now()) || 
                (selectedGuideId !== 'hooh' && cooldown.endAt && cooldown.endAt > Date.now())) && (
                <div className="mt-1.5 w-full h-1 bg-black/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all"
                    style={{ width: `${Math.min(100, ((gymResetMs - ((selectedGuideId === 'hooh' ? allCooldowns.hooh.endAt : cooldown.endAt)! - Date.now())) / gymResetMs) * 100)}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {selectedGuideId !== 'none' && (currentStepIndex >= 0 ? (
            <div className="reveal-4 w-full space-y-2">
              <div className="w-full bg-amber-950/20 border border-amber-700/40 rounded-xl p-3 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-900/40 border border-amber-700/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Info className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black fs-small text-amber-300">Sesión activa</p>
                  <p className="fs-tiny text-amber-200/70 mt-0.5">Hay una ruta en progreso en el paso {currentStepIndex + 1}/{steps.length}.</p>
                  <div className="flex flex-wrap gap-3 mt-3">
                    <Button variant="primary" size="md" onClick={() => exitMenu()} className="min-w-[140px]">
                      Continuar
                    </Button>
                    <Button variant="secondary" size="md" onClick={() => setPendingResetAction("route")} className="min-w-[140px]">
                      Empezar de cero
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => exitMenu(() => { setCurrentStepIndex(-1); resetTimer(); })}
                title="Comenzar la ruta seleccionada"
                className="reveal-4 btn-glow-active"
              >
                ▶ INICIAR RUTA
              </Button>
            </div>
          ))}

          {selectedGuideId !== 'none' && (() => {
            const guide = getGuide(selectedGuideId);
            return guide ? <GuideCredits guide={guide} mode="compact" /> : null;
          })()}

          {selectedGuideId !== 'none' && currentStepIndex < 0 && (
            <Button variant="ghost" size="md" fullWidth onClick={() => selectGuide('none')} title="Volver a la selección de guías" className="justify-center gap-2">
              <ChevronLeft className="w-3.5 h-3.5" />Volver a guías
            </Button>
          )}

          {selectedGuideId !== 'none' && (
            <div className="reveal-5 w-full group/btn relative">
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={() => setShowTeam(true)}
                className="bg-violet-600/80 hover:bg-violet-600 text-white"
                title="Ver el equipo Pokémon recomendado para esta ruta"
              >
                <Users className="w-4 h-4 md:w-5 md:h-5" />VER EQUIPO
              </Button>
            </div>
          )}

          <div className="reveal-6 w-full border-t border-neutral-800/40 pt-2 flex items-center justify-center gap-4 text-neutral-500">
            <div className="relative group/btn">
              <button onClick={() => setShowHistory(true)} className="flex items-center gap-2 hover:text-white transition-colors">
                <History className="w-3.5 h-3.5 text-neutral-500" />
                <span className="fs-tiny font-semibold">Historial</span>
              </button>
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-neutral-300 fs-tiny text-center opacity-0 pointer-events-none group-hover/btn:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl">
                Revisa tus runs anteriores: tiempos, gimnasios completados, ingresos y estadísticas detalladas
              </div>
            </div>
            <span className="text-neutral-700">·</span>
            <a href="https://www.instagram.com/dreasy__/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-pink-400"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              <span className="fs-tiny font-semibold">Dreasy__</span>
            </a>
            <a href="https://github.com/AndresEA2605" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-neutral-300"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.305-5.466-1.335-5.466-5.942 0-1.312.468-2.383 1.236-3.223-.124-.303-.536-1.523.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 0 1 3.005-.404c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.655 1.653.243 2.873.12 3.176.77.84 1.235 1.911 1.235 3.223 0 4.61-2.804 5.634-5.475 5.93.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.596 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              <span className="fs-tiny font-semibold">Dreasy</span>
            </a>
            <a href="https://open.spotify.com/intl-es/artist/728Rey8DKDMb40oWhQkzQz?si=L-P1GPu0Ti2AX3LR3xCPWQ" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-emerald-400"><path d="M12 0a12 12 0 1 0 12 12A12 12 0 0 0 12 0Zm5.33 17.1a.76.76 0 0 1-1.03.25c-2.82-1.73-6.37-2.12-10.54-1.16a.76.76 0 0 1-.95-.47.76.76 0 0 1 .47-.95c4.46-1.03 8.38-.62 11.56 1.34a.76.76 0 0 1 .25 1.03Zm1.47-3.28a.95.95 0 0 1-1.3.31c-3.22-1.98-8.14-2.56-11.95-1.39a.95.95 0 0 1-1.15-.72.95.95 0 0 1 .72-1.15c4.25-1.25 9.69-.64 13.48 1.58a.95.95 0 0 1 .31 1.3Zm.13-3.41c-3.86-2.29-10.24-2.5-13.93-1.39a1.14 1.14 0 0 1-1.46-.83 1.14 1.14 0 0 1 .83-1.46c4.09-1.24 11.55-.99 16.1 1.58a1.14 1.14 0 0 1-.54 2.12Z"/></svg>
              <span className="fs-tiny font-semibold">Spotify</span>
            </a>
          </div>
           <div className="reveal-6 w-full flex items-center justify-center mt-1">
             <div className="relative group/btn">
               <button onClick={() => setShowSettings(true)} className="flex items-center gap-2 px-4 py-2 text-neutral-500 hover:text-white hover:bg-neutral-800/60 rounded-xl transition-all group/btn-inner">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 group-hover/btn-inner:rotate-90 transition-transform duration-300"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                 <span className="fs-small font-semibold">Configuración</span>
               </button>
               <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-neutral-300 fs-tiny text-center opacity-0 pointer-events-none group-hover/btn:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl">
                 Configura recordatorios de descanso, alertas de sonido, temporizador manual y opciones avanzadas
               </div>
             </div>
           </div>
         </div>
       </div>
       {historyModal}

      {showTeam && (
        <div className={`fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-start justify-center p-3 overflow-y-auto ${teamExiting ? 'overlay-exit' : 'overlay-enter'}`} onClick={() => closeTeam()}>
          <div className={`relative w-full max-w-3xl my-3 ${teamExiting ? 'modal-exit' : 'modal-enter'}`} onClick={e => e.stopPropagation()}>
                <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between px-6 py-4 bg-neutral-950 border-b border-neutral-800">
                    <div>
                      <h3 className="font-black fs-h3 text-white">Equipo de la Run</h3>
                      <p className="fs-tiny text-neutral-500 mt-0.5">{selectedGuideId === "hooh" ? "Chandelure · Rotom (Horno) · Lunatone" : selectedGuideId === "guide2" ? "Togekiss · Excadrill · Blastoise · Vanilluxe · Aerodactyl · Typhlosion" : "Weezing con Cinta Elegida · Vanilluxe con Pañuelo Elegido · resto con Gafas Elegidas"}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => closeTeam()} className="text-neutral-500 hover:text-white">
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                  <div className={`grid gap-4 p-4 ${selectedGuideId === "hooh" ? "grid-cols-1 sm:grid-cols-3" : selectedGuideId === "guide2" ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}>

                {selectedGuideId === "hooh" ? (
                  <>
                    <div className="bg-neutral-950 border border-indigo-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${POKEMON_ARTWORK.Chandelure}.gif`} alt="Chandelure" className="w-12 h-12 object-contain poke-aura-sm poke-glow-white" loading="lazy" />
                        <div>
                          <div className="font-black fs-small text-indigo-300">Chandelure</div>
                          <div className="fs-tiny text-neutral-500">Absor. Fuego · Modesta · Hechizo</div>
                        </div>
                      </div>
                      <div className="fs-tiny text-neutral-400 mb-2">EVs: 252 SpA / 58 SpD / 200 Spe</div>
                      <div className="fs-tiny text-neutral-500 mb-2">IVs: 25 PS / - Atk / 25 Def / 31 SpA / 25 SpD / 31 Spe</div>
                      <div className="grid grid-cols-2 gap-2">
                        {['Velo Sagrado','Protección','Más Psique','Bola Sombra'].map(m => <span key={m} className="fs-tiny bg-indigo-950/50 border border-indigo-800/30 px-2 py-1 rounded text-indigo-300">{m}</span>)}
                      </div>
                    </div>

                    <div className="bg-neutral-950 border border-orange-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${POKEMON_ARTWORK.Rotom}.gif`} alt="Rotom" className="w-12 h-12 object-contain poke-aura-sm poke-glow-white" loading="lazy" />
                        <div>
                          <div className="font-black fs-small text-orange-300">Rotom (Horno)</div>
                          <div className="fs-tiny text-neutral-500">Levitación · Mansa · Arena Fina</div>
                        </div>
                      </div>
                      <div className="fs-tiny text-neutral-400 mb-2">EVs: 6 PS / 252 SpA / 252 SpD</div>
                      <div className="fs-tiny text-neutral-500 mb-2">IVs: 25 PS / - Atk / 25 Def / 31 SpA / 25 SpD / - Spe</div>
                      <div className="grid grid-cols-2 gap-2">
                        {['Maquinación','Poder Oculto (Tierra)','Rayo','Pantalla de Luz'].map(m => <span key={m} className="fs-tiny bg-orange-950/50 border border-orange-800/30 px-2 py-1 rounded text-orange-300">{m}</span>)}
                      </div>
                    </div>

                    <div className="bg-neutral-950 border border-sky-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${POKEMON_ARTWORK.Lunatone}.gif`} alt="Lunatone" className="w-12 h-12 object-contain poke-aura-sm poke-glow-white" loading="lazy" />
                        <div>
                          <div className="font-black fs-small text-sky-300">Lunatone</div>
                          <div className="fs-tiny text-neutral-500">Levitación · Mansa · Piedra Dura</div>
                        </div>
                      </div>
                      <div className="fs-tiny text-neutral-400 mb-2">EVs: 96 PS / 252 SpA / 166 SpD</div>
                      <div className="fs-tiny text-neutral-500 mb-2">IVs: 25 PS / - Atk / 25 Def / 31 SpA / 25 SpD / 0 Spe</div>
                      <div className="grid grid-cols-2 gap-2">
                        {['Espacio Raro','Protección','Más Psique','Joya de Luz'].map(m => <span key={m} className="fs-tiny bg-sky-950/50 border border-sky-800/30 px-2 py-1 rounded text-sky-300">{m}</span>)}
                      </div>
                    </div>
                  </>
                ) : selectedGuideId === "guide2" ? (
                <>
                <div className="bg-neutral-950 border border-teal-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${POKEMON_ARTWORK.Togekiss}.gif`} alt="Togekiss" className="w-12 h-12 object-contain poke-aura-sm poke-glow-white" loading="lazy" />
                    <div>
                      <div className="font-black fs-small text-teal-300">Togekiss</div>
                      <div className="fs-tiny text-neutral-500">Dicha · Modesta · Pañuelo Elegido</div>
                    </div>
                  </div>
                  <div className="fs-tiny text-neutral-400 mb-2">EVs: 4 Def / 252 SpA / 252 Spe</div>
                  <div className="grid grid-cols-2 gap-2">
                    {['Hyper Voice','Vuelo','Aire Corte'].map(m => <span key={m} className="fs-tiny bg-teal-950/50 border border-teal-800/30 px-2 py-1 rounded text-teal-300">{m}</span>)}
                  </div>
                </div>
                <div className="bg-neutral-950 border border-amber-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${POKEMON_ARTWORK.Excadrill}.gif`} alt="Excadrill" className="w-12 h-12 object-contain poke-aura-sm poke-glow-white" loading="lazy" />
                    <div>
                      <div className="font-black fs-small text-amber-300">Excadrill</div>
                      <div className="fs-tiny text-neutral-500">Rompemoldes · Firme · Cinta Elegida</div>
                    </div>
                  </div>
                  <div className="fs-tiny text-neutral-400 mb-2">EVs: 252 Atk / 4 Def / 252 Spe</div>
                  <div className="grid grid-cols-2 gap-2">
                    {['Terremoto','Avalancha','Ayuda'].map(m => <span key={m} className="fs-tiny bg-amber-950/50 border border-amber-800/30 px-2 py-1 rounded text-amber-300">{m}</span>)}
                  </div>
                </div>
                <div className="bg-neutral-950 border border-blue-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${POKEMON_ARTWORK.Blastoise}.gif`} alt="Blastoise" className="w-12 h-12 object-contain poke-aura-sm poke-glow-white" loading="lazy" />
                    <div>
                      <div className="font-black fs-small text-blue-300">Blastoise</div>
                      <div className="fs-tiny text-neutral-500">Torrente · Modesta · Pañuelo Elegido</div>
                    </div>
                  </div>
                  <div className="fs-tiny text-neutral-400 mb-2">EVs: 252 SpA / 4 HP / 252 Spe</div>
                  <div className="fs-tiny text-neutral-500 mb-2">IVs: 0 Atk</div>
                  <div className="grid grid-cols-2 gap-2">
                    {['Chorro de Agua','Surf','Ventisca','Pulso Oscuro'].map(m => <span key={m} className="fs-tiny bg-blue-950/50 border border-blue-800/30 px-2 py-1 rounded text-blue-300">{m}</span>)}
                  </div>
                </div>
                <div className="bg-neutral-950 border border-cyan-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${POKEMON_ARTWORK.Vanilluxe}.gif`} alt="Vanilluxe" className="w-10 h-10 object-contain poke-aura-sm poke-glow-white" loading="lazy" />
                    <div>
                      <div className="font-black fs-small text-cyan-300">Vanilluxe</div>
                      <div className="fs-tiny text-neutral-500">Nevada · Modesta · Pañuelo Elegido</div>
                    </div>
                  </div>
                  <div className="fs-tiny text-neutral-400 mb-1.5">EVs: 252 SpA / 4 Def / 252 Spe</div>
                  <div className="fs-tiny text-neutral-500 mb-1.5">IVs: 0 Atk</div>
                  <div className="grid grid-cols-2 gap-1">
                    {['Ventisca','Viento Hielo','Rayo Hielo'].map(m => <span key={m} className="fs-tiny bg-cyan-950/50 border border-cyan-800/30 px-2 py-1 rounded text-cyan-300">{m}</span>)}
                  </div>
                </div>
                <div className="bg-neutral-950 border border-purple-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${POKEMON_ARTWORK.Aerodactyl}.gif`} alt="Aerodactyl" className="w-10 h-10 object-contain poke-aura-sm poke-glow-white" loading="lazy" />
                    <div>
                      <div className="font-black fs-small text-purple-300">Aerodactyl</div>
                      <div className="fs-tiny text-neutral-500">Cabeza Roca · Firme · Lupa</div>
                    </div>
                  </div>
                  <div className="fs-tiny text-neutral-400 mb-1.5">EVs: 252 Atk / 4 Def / 252 Spe</div>
                  <div className="grid grid-cols-2 gap-1">
                    {['Avalancha','Día Soleado','Protección'].map(m => <span key={m} className="fs-tiny bg-purple-950/50 border border-purple-800/30 px-2 py-1 rounded text-purple-300">{m}</span>)}
                  </div>
                </div>
                <div className="bg-neutral-950 border border-orange-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${POKEMON_ARTWORK.Typhlosion}.gif`} alt="Typhlosion" className="w-10 h-10 object-contain poke-aura-sm poke-glow-white" loading="lazy" />
                    <div>
                      <div className="font-black fs-small text-orange-300">Typhlosion</div>
                      <div className="fs-tiny text-neutral-500">Mar Llamas · Modesta · Gafas Elegidas</div>
                    </div>
                  </div>
                  <div className="fs-tiny text-neutral-400 mb-1.5">EVs: 252 SpA / 4 HP / 252 Spe</div>
                  <div className="grid grid-cols-2 gap-1">
                    {['Estallido','Ayuda','Corte'].map(m => <span key={m} className="fs-tiny bg-orange-950/50 border border-orange-800/30 px-2 py-1 rounded text-orange-300">{m}</span>)}
                  </div>
                </div>
                </>) : (
                <><div className="bg-neutral-950 border border-indigo-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${POKEMON_ARTWORK.Hydreigon}.gif`} alt="Hydreigon" className="w-10 h-10 object-contain poke-aura-sm poke-glow-white" loading="lazy" />
                    <div>
                      <div className="font-black fs-small text-indigo-300">HI — Hydreigon</div>
                      <div className="fs-tiny text-neutral-500">Levitación · Modesta</div>
                    </div>
                  </div>
                  <div className="fs-tiny text-neutral-400 mb-1.5">EVs: 6 HP / 252 SpA / 40 SpD / 252 Spe</div>
                  <div className="grid grid-cols-2 gap-1">
                    {['Surf','Día Soleado','Danza Lluvia','Viento Afín'].map(m => <span key={m} className="fs-tiny bg-indigo-950/50 border border-indigo-800/30 px-2 py-1 rounded text-indigo-300">{m}</span>)}
                  </div>
                </div>

                <div className="bg-neutral-950 border border-cyan-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${POKEMON_ARTWORK.Weezing}.gif`} alt="Weezing" className="w-10 h-10 object-contain poke-aura-sm poke-glow-white" loading="lazy" />
                    <div>
                      <div className="font-black fs-small text-cyan-300">WW — Weezing</div>
                      <div className="fs-tiny text-neutral-500">Gas Reactivo · Firme · Cinta Elegida</div>
                    </div>
                  </div>
                  <div className="fs-tiny text-neutral-400 mb-1.5">EVs: 252 Atk / 6 SpD / 252 Spe</div>
                  <div className="grid grid-cols-2 gap-1">
                    {['Explosión','Buena Baza','Incinerar','Día Soleado'].map(m => <span key={m} className="fs-tiny bg-cyan-950/50 border border-cyan-800/30 px-2 py-1 rounded text-cyan-300">{m}</span>)}
                  </div>
                </div>

                <div className="bg-neutral-950 border border-sky-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${POKEMON_ARTWORK.Togekiss}.gif`} alt="Togekiss" className="w-10 h-10 object-contain poke-aura-sm poke-glow-white" loading="lazy" />
                    <div>
                      <div className="font-black fs-small text-sky-300">TO — Togekiss</div>
                      <div className="fs-tiny text-neutral-500">Dicha · Modesta · Pañuelo Elegido</div>
                    </div>
                  </div>
                  <div className="fs-tiny text-neutral-400 mb-1.5">EVs: 252 SpA / 6 SpD / 252 Spe</div>
                  <div className="grid grid-cols-2 gap-1">
                    {['Vozarrón','Psicocarga','Señal Luminosa','Psíquico'].map(m => <span key={m} className="fs-tiny bg-sky-950/50 border border-sky-800/30 px-2 py-1 rounded text-sky-300">{m}</span>)}
                  </div>
                </div>

                <div className="bg-neutral-950 border border-orange-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${POKEMON_ARTWORK.Typhlosion}.gif`} alt="Typhlosion" className="w-10 h-10 object-contain poke-aura-sm poke-glow-white" loading="lazy" />
                    <div>
                      <div className="font-black fs-small text-orange-300">TY — Typhlosion</div>
                      <div className="fs-tiny text-neutral-500">Mar Llamas · Gafas Elegidas</div>
                    </div>
                  </div>
                  <div className="fs-tiny text-neutral-400 mb-1.5">EVs: 252 SpA / 6 SpD / 252 Spe</div>
                  <div className="grid grid-cols-2 gap-1">
                    {['Estallido','Rapidez','Corte','Refuerzo'].map(m => <span key={m} className="fs-tiny bg-orange-950/50 border border-orange-800/30 px-2 py-1 rounded text-orange-300">{m}</span>)}
                  </div>
                </div>

                <div className="bg-neutral-950 border border-violet-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${POKEMON_ARTWORK.Vanilluxe}.gif`} alt="Vanilluxe" className="w-10 h-10 object-contain poke-aura-sm poke-glow-white" loading="lazy" />
                    <div>
                      <div className="font-black fs-small text-violet-300">Vanilluxe @ Pañuelo Elegido</div>
                      <div className="fs-tiny text-neutral-500">Nevada · Miedosa · Lv. 100</div>
                    </div>
                  </div>
                  <div className="fs-tiny text-neutral-400 mb-1.5">EVs: 10 HP / 252 SpA / 248 Spe</div>
                  <div className="grid grid-cols-2 gap-1">
                    {['Ventisca','Vozarrón','Hidropulso','Foco Resplandor'].map(m => <span key={m} className="fs-tiny bg-violet-950/50 border border-violet-800/30 px-2 py-1 rounded text-violet-300">{m}</span>)}
                  </div>
                </div>

                <div className="bg-neutral-950 border border-blue-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${POKEMON_ARTWORK.Blastoise}.gif`} alt="Blastoise" className="w-10 h-10 object-contain poke-aura-sm poke-glow-white" loading="lazy" />
                    <div>
                      <div className="font-black fs-small text-blue-300">BW — Blastoise</div>
                      <div className="fs-tiny text-neutral-500">Torrente · Modesta · Gafas Elegidas</div>
                    </div>
                  </div>
                  <div className="fs-tiny text-neutral-400 mb-1.5">EVs: 252 SpA / 6 SpD / 252 Spe</div>
                  <div className="grid grid-cols-2 gap-1">
                    {['Salpicar','Refuerzo','Ventisca'].map(m => <span key={m} className="fs-tiny bg-blue-950/50 border border-blue-800/30 px-2 py-1 rounded text-blue-300">{m}</span>)}
                  </div>
                </div>
                </>)}

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
                  <p className={`fs-tiny mt-1 ${skipChecklist ? 'text-red-400/70' : 'text-emerald-400/70'}`}>{skipChecklist ? 'Se omitirá el checklist de 3 pasos al iniciar' : 'Se mostrarán 3 verificaciones obligatorias antes de empezar'}</p>
                </div>
                <button onClick={() => { const next = !skipChecklist; setLS("skip_checklist", String(next)); setSkipChecklist(next); }} className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${skipChecklist ? 'bg-red-500' : 'bg-green-500'}`}>
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-all ${skipChecklist ? 'translate-x-0' : 'translate-x-5'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                <div>
                  <p className="font-bold text-white fs-body">Cuenta atrás</p>
                  <p className="fs-tiny text-neutral-400 mt-0.5">Mostrar 5-4-3-2-1 al empezar</p>
                  <p className={`fs-tiny mt-1 ${skipCountdown ? 'text-red-400/70' : 'text-emerald-400/70'}`}>{skipCountdown ? 'La ruta comenzará inmediatamente al confirmar' : 'Verás una cuenta regresiva de 5 segundos antes de empezar'}</p>
                </div>
                <button onClick={() => { const next = !skipCountdown; setLS("skip_countdown", String(next)); setSkipCountdown(next); }} className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${skipCountdown ? 'bg-red-500' : 'bg-green-500'}`}>
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-all ${skipCountdown ? 'translate-x-0' : 'translate-x-5'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                <div>
                  <p className="font-bold text-white fs-body">Timer</p>
                  <p className="fs-tiny text-neutral-400 mt-0.5">{manualTimer ? 'Manual: inicia al avanzar al paso 1' : 'Automático: inicia al comenzar'}</p>
                  <p className={`fs-tiny mt-1 ${manualTimer ? 'text-amber-400/70' : 'text-emerald-400/70'}`}>{manualTimer ? 'El cronómetro esperará a que lo inicies manualmente al paso 1' : 'El cronómetro arrancará automáticamente al confirmar la ruta'}</p>
                </div>
                <button onClick={() => { const next = !manualTimer; setLS("manual_timer", String(next)); setManualTimer(next); }} className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${manualTimer ? 'bg-red-500' : 'bg-green-500'}`}>
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-all ${manualTimer ? 'translate-x-0' : 'translate-x-5'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {resumePromptModal}
      {resetConfirmModal}
      {showCooldownNotice && (
        <CooldownNoticeModal cooldown={cooldown} onDismiss={() => setShowCooldownNotice(false)} />
      )}
      {showActiveSessionModal && (
        <div className="fixed inset-0 z-[75] bg-black/85 flex items-center justify-center p-3">
          <div className="bg-neutral-900 rounded-2xl border border-amber-700/50 w-full max-w-sm p-5 shadow-2xl shadow-amber-950/30">
            <div className="flex items-start gap-3 mb-4 pb-3 border-b border-amber-800/30">
              <div className="w-10 h-10 rounded-xl bg-amber-900/40 border border-amber-700/40 flex items-center justify-center shrink-0">
                <Info className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-black fs-h3 text-amber-300">Sesión activa</h3>
                <p className="fs-tiny text-amber-500/70 mt-0.5">Hay una ruta en progreso</p>
              </div>
            </div>
            <p className="fs-body text-neutral-300 mb-1">
              Tienes una ruta guardada en el paso {currentStepIndex + 1}/{steps.length}.
            </p>
            <p className="fs-tiny text-neutral-500 mb-4">
              ¿Qué deseas hacer?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => { setShowActiveSessionModal(false); exitMenu(); }}
                className="w-full"
              >
                Continuar
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => { setShowActiveSessionModal(false); setPendingResetAction("route"); }}
                className="w-full"
              >
                Empezar de cero
              </Button>
            </div>
            <Button onClick={() => setShowActiveSessionModal(false)} variant="ghost" size="sm" className="w-full mt-3">
              Cancelar
            </Button>
          </div>
        </div>
      )}
      <DailyTasks gymsCompleted={sessionGymCount} timerElapsedMs={timerElapsed} isOpen={showTasks} onToggle={() => setShowTasks(prev => !prev)} />
      </>
    );
  }

  return (
    <>
    <div className={`app-enter ${appExiting ? "app-exit" : ""} flex bg-neutral-950 text-neutral-200 overflow-hidden font-sans relative`} style={{ height: '100dvh' }}>
      <PokeBackground />
      
      <main className={`flex-1 flex flex-col h-full relative z-10 ${focusStepMode ? "overflow-hidden" : "overflow-y-auto"} overflow-x-hidden ${currentStepIndex === -1 ? "pb-0" : selectedGuideId === "hooh" ? "pb-[calc(var(--footer-hooh-height)+1.5rem)]" : "pb-[calc(var(--footer-routes-height)+2rem)]"}`}>
        {guideLoading && (
          <div className="absolute inset-0 z-50 bg-neutral-950/90 backdrop-blur-sm flex items-center justify-center">
            <LoadingSpinner size="lg" text="Cargando guía..." />
          </div>
        )}
        
        <header className="flex items-center justify-between gap-3 p-3 md:p-3 border-b border-neutral-800 bg-neutral-900/50">
          <div className="flex min-w-0 items-center gap-3">
            <button onClick={() => goToMenu()} title="Volver al menú principal" className="fs-small font-bold tracking-wide text-neutral-400 uppercase hover:text-white transition-colors truncate">
              {getGuide(selectedGuideId)?.title ?? "Guía"}
            </button>
            <div className="w-px h-4 bg-neutral-700 shrink-0" />
            <div className="fs-small text-neutral-500 truncate">
              {currentStepIndex === -1
                ? "Portada"
                : selectedGuideId === "hooh"
                ? <>Paso <span className="font-bold text-neutral-300">{currentStepIndex + 1}</span> / {steps.length}</>
                : <><span className="font-bold text-neutral-300">{currentGymIndex + 1}</span> / {gymGroupCount} gimnasios</>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentStepIndex !== -1 && (
              <Button
                variant={focusStepMode ? "success" : "secondary"}
                size="sm"
                onClick={() => setFocusStepMode((prev) => !prev)}
                className="px-3"
              >
                {focusStepMode ? "Cerrar foco" : "Modo foco"}
              </Button>
            )}
            {isRoutesGuide(selectedGuideId) && (
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-2 bg-neutral-800/60 rounded-xl px-2 py-1">
                  <TimerDisplay isRunning={timerIsRunning} startTime={timerStartTime} elapsedBeforePause={timerElapsed} />
                </div>

                <div className="flex items-center gap-1">
                  {!timerIsRunning ? (
                    <Button variant="primary" size="sm" onClick={startTimer} icon={<Play className="w-3.5 h-3.5 fill-current" />}>Iniciar</Button>
                  ) : (
                    <Button variant="neutral" size="sm" onClick={pauseTimer} className="bg-amber-700 hover:bg-amber-600 border-amber-600/40" icon={<Pause className="w-3.5 h-3.5 fill-current" />}>Pausar</Button>
                  )}

                  <Button variant="ghost" size="sm" iconOnly onClick={requestTimerReset} aria-label="Reiniciar cronómetro" icon={<RotateCcw className="w-3.5 h-3.5" />} />

                  <button type="button" onClick={() => setShowCooldownNotice(true)} className="hidden sm:inline-flex items-center gap-2 px-2 py-1 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700" aria-label="Ver cooldown de gyms">
                    <Clock className="w-4 h-4 text-emerald-400" />
                  </button>
                </div>
              </div>
            )}
            <button onClick={() => goToMenu()} title="Volver al menú principal" className="shrink-0 px-3 py-2 bg-neutral-800 text-neutral-400 rounded-lg hover:bg-neutral-700 fs-tiny font-bold uppercase tracking-wider">
              Menú
            </button>
          </div>
        </header>

        {currentStepIndex !== -1 && (selectedGuideId === 'hooh' ? (
          <div className="w-full px-2 md:px-4 py-2">
            <div className="mb-2 flex items-center justify-between gap-3 fs-tiny md:fs-small font-bold uppercase tracking-wider text-neutral-400">
              <span className="text-indigo-300">Paso {currentStepIndex + 1}</span>
              <span className="truncate text-white">{currentStep?.title || steps[currentStepIndex]?.title || `Paso ${currentStepIndex + 1}`}</span>
              <span className="text-neutral-500">{currentStepIndex + 1}/{steps.length}</span>
            </div>
            <div
              ref={stepNavRef}
              className="flex-none overflow-x-auto px-2 py-2 md:px-4 md:py-2 border-b border-neutral-800/50 bg-neutral-950/40 scrollbar-thin scroll-smooth"
              style={{ WebkitOverflowScrolling: 'touch' }}
              onWheel={(e) => { e.currentTarget.scrollLeft += e.deltaY * 1.5; }}
            >
              <div className="flex gap-1 min-w-max">
                {steps.map((step, idx) => (
                  <button
                    key={step.id}
                    ref={(el) => { stepButtonRefs.current[idx] = el; }}
                    onClick={() => setCurrentStepIndex(idx)}
                    title={`Ir al paso ${idx + 1}: ${step.title || step.type}`}
                    className={`flex items-center gap-2 px-2 py-2 md:px-3 md:py-2 rounded-lg fs-tiny font-bold whitespace-nowrap transition-all ${
                      idx === currentStepIndex
                        ? "bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                        : idx < currentStepIndex
                        ? "bg-neutral-800/60 text-neutral-300 hover:bg-neutral-700/80"
                        : "bg-neutral-800/30 text-neutral-400 hover:bg-neutral-700/60"
                    }`}
                  >
                    <span className="tabular-nums w-3 md:w-4 text-center text-[10px] md:text-xs">{idx + 1}</span>
                    <span>{renderIcon(step.type)}</span>
                    <span className="max-w-[70px] md:max-w-[90px] truncate text-[10px] md:text-xs">{step.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : currentGymGroup && (
          <div className="w-full px-2 md:px-4 py-2">
            <div className="mb-2 flex items-center gap-2 fs-tiny md:fs-small font-bold uppercase tracking-wider text-neutral-400">
              <span className="text-indigo-300 shrink-0">Gimnasio {currentGymIndex + 1}/{gymGroupCount}</span>
              <span className="text-neutral-500 shrink-0 ml-auto">{currentGymGroup.region}</span>
            </div>
            <div
              ref={stepNavRef}
              className="flex-none overflow-x-auto px-2 py-2 md:px-4 md:py-2 border-b border-neutral-800/50 bg-neutral-950/40 scrollbar-thin scroll-smooth"
              style={{ WebkitOverflowScrolling: 'touch' }}
              onWheel={(e) => { e.currentTarget.scrollLeft += e.deltaY * 1.5; }}
            >
              <div className="flex gap-1 min-w-max">
                {gymGroups.map((group, idx) => (
                  <button
                    key={group.gymStep.id}
                    ref={(el) => { stepButtonRefs.current[idx] = el; }}
                    onClick={() => setCurrentStepIndex(steps.indexOf(group.gymStep))}
                    title={`Ir al gimnasio ${idx + 1}: ${group.gymStep.title}`}
                    className={`flex items-center gap-2 px-3 py-2 md:px-3 md:py-2 rounded-lg fs-tiny font-bold whitespace-nowrap transition-all ${
                      idx === currentGymIndex
                        ? "bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                        : idx < currentGymIndex
                        ? "bg-neutral-800/60 text-neutral-300 hover:bg-neutral-700/80"
                        : "bg-neutral-800/30 text-neutral-400 hover:bg-neutral-700/60"
                    }`}
                  >
                    <span className="tabular-nums w-4 md:w-5 text-center text-[10px] md:text-xs font-black">{idx + 1}</span>
                    {group.region !== (idx > 0 ? gymGroups[idx - 1].region : '') && (
                      <span className="ml-1 px-2 py-1 rounded fs-[9px] md:fs-tiny font-bold uppercase tracking-wider bg-neutral-950 text-neutral-500 border border-neutral-700/60">{group.region}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
          <div className="flex-1 flex flex-col items-center justify-center p-2 md:p-8 lg:p-12 overflow-y-auto overflow-x-hidden">
          <div key={slideKey} className={`w-full ${focusStepMode ? 'h-full max-w-full rounded-none' : 'max-w-6xl'} bg-neutral-900/80 backdrop-blur-sm rounded-2xl border border-neutral-800 p-2 md:p-5 lg:p-8 shadow-2xl relative text-center smooth-transition ${slideClass} scroll-mb-[var(--footer-routes-height)] ${focusStepMode ? 'fixed inset-0 z-40 overflow-y-auto overflow-x-hidden' : 'max-h-[calc(100dvh-14rem)] overflow-y-auto overflow-x-hidden'}`}>
            
            <div className="absolute -top-6 -right-6 w-24 h-24 opacity-[0.04] pointer-events-none select-none">
              <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/25.gif" alt="" className="w-full h-full object-contain" />
            </div>

            <div className="flex flex-col items-center gap-2 mb-3 md:gap-4 md:mb-6">
              {currentStepIndex === -1 ? (
                <>
                  <div className="w-full flex mb-2">
                    <button onClick={() => goToMenu()} title="Volver al menú" className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 rounded-lg fs-tiny font-bold uppercase tracking-wider self-start">← Menú</button>
                  </div>
                  {selectedGuideId === "hooh" ? (
                    <>
                      <div className="w-24 h-24 md:w-32 md:h-32 mb-1 poke-aura poke-glow-amber">
                        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/250.gif" alt="Ho-Oh" className="w-full h-full object-contain" />
                      </div>
                      <h2 className="fs-h2 font-black tracking-tight text-white">Ho-Oh Farming</h2>
                      <p className="fs-body text-neutral-400">Derrota a Ho-Oh (Revancha) en 10 turnos — ~8 min · ~97.000 PokéYen</p>
                    </>
                  ) : selectedGuideId === "guide2" ? (
                    <>
                      <div className="flex items-center justify-center gap-2 mb-1">
                        {[468, 530, 9, 584, 142, 157].map(id => (
                          <div key={id} className="w-10 h-10 md:w-14 md:h-14 poke-aura poke-glow-teal" style={{ animationDelay: `${[0, 0.3, 0.6, 0.9, 1.2, 1.5][[468, 530, 9, 584, 142, 157].indexOf(id)]}s` }}>
                            <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`} alt="" className="w-full h-full object-contain" />
                          </div>
                        ))}
                      </div>
                      <h2 className="fs-h2 font-black tracking-tight text-white">25 GYMS 1H</h2>
                      <p className="fs-body text-neutral-400">Ruta alternativa — 25 gimnasios · 5 regiones · leads optimizados</p>
                    </>
                  ) : (
                    <>
                  <a href="https://www.youtube.com/watch?v=himBCqDN2-I" target="_blank" rel="noopener noreferrer" title="Ver video de muestra de la ruta" className="w-full max-w-sm mx-auto mb-4 block group">
                    <div className="relative rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl">
                      <img src="https://img.youtube.com/vi/himBCqDN2-I/maxresdefault.jpg" alt="Video de muestra de la ruta" className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                        <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-600/40 group-hover:scale-110 transition-transform">
                          <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8 ml-1"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.516 0-9.387.507A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.507 9.386.507 9.386.507s7.518 0 9.387-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                        </div>
                      </div>
                    </div>
                  </a>
                  <p className="fs-body text-neutral-400">{description}</p>
                  </>)}
                  {(() => {
                    const guide = getGuide(selectedGuideId);
                    return guide ? <GuideCredits guide={guide} mode="full" /> : null;
                  })()}
                  
                  {steps[0] && (
                    <div className="w-full bg-neutral-950 rounded-xl border border-neutral-800 p-4 mt-4 max-h-[55vh] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-900">
                      <div className="fs-tiny md:fs-small text-neutral-500 uppercase font-bold tracking-widest mb-3">{selectedGuideId === "hooh" ? "Primer turno" : "Primer gimnasio"}</div>
                      <div className="flex items-center justify-center gap-3">
                        <span className="p-3 bg-neutral-900 rounded-lg">{renderIcon(steps[0].type)}</span>
                        <span className="fs-h3 font-black text-white">{steps[0].title}</span>
                        {steps[0].region && <span className="fs-small font-bold uppercase tracking-widest px-3 py-2 rounded border bg-neutral-900 text-neutral-400 border-neutral-800">{steps[0].region}</span>}
                      </div>
                      {steps[0].type === "gym" && steps[0].gym && gymCoords[steps[0].gym as keyof typeof gymCoords] && (
                        <div className="w-full max-w-[180px] md:max-w-[200px] mx-auto mt-4 relative aspect-square rounded-lg border border-neutral-700/50 overflow-hidden bg-neutral-950 shadow-inner group">
                          <img src={regionMap[gymCoords[steps[0].gym as keyof typeof gymCoords].region as keyof typeof regionMap]} alt="Map" className="absolute inset-0 w-full h-full object-contain opacity-70" />
                          <div className="absolute inset-0 bg-indigo-900/10 mix-blend-color" />
                          <div className="absolute w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-[0_0_8px_rgba(239,68,68,0.8)] -translate-x-1/2 -translate-y-1/2 animate-bounce" style={{ left: `${gymCoords[steps[0].gym as keyof typeof gymCoords].x}%`, top: `${gymCoords[steps[0].gym as keyof typeof gymCoords].y}%` }} />
                        </div>
                      )}
                    </div>
                  )}
                  <button onClick={() => { setStartChecks([false, false, false]); setShowStartCheck(true); }} className="w-full max-w-md h-14 mx-auto bg-indigo-600 hover:bg-indigo-500 text-white fs-body font-black rounded-2xl transition-all shadow-lg shadow-indigo-900/30">
                    ▶ Comenzar ruta
                  </button>
                </>
              ) : selectedGuideId === 'hooh' ? (
                <>
                  {currentStep!.type !== "gym" && (
                    <div className="reveal-1 flex flex-col sm:flex-row items-center justify-center gap-2 md:gap-3 w-full">
                      <span className="p-2 md:p-3 bg-neutral-950 rounded-xl border border-neutral-800 shrink-0">{renderIcon(currentStep!.type)}</span>
                      <h2 className="fs-h3 font-black tracking-tight text-white">{currentStep!.title}</h2>
                      {currentStep!.region && <span className="fs-tiny md:fs-small font-bold uppercase tracking-widest px-2 md:px-2 py-1 rounded shrink-0 border bg-neutral-950 text-neutral-400 border-neutral-800">{currentStep!.region}</span>}
                    </div>
                  )}

                  {currentStep!.type === "gym" && currentStep!.gym && gymCoords[currentStep!.gym as keyof typeof gymCoords] && (
                    <div className="grid w-full max-w-[960px] grid-cols-1 gap-4 lg:grid-cols-[minmax(180px,1fr)_minmax(260px,320px)_minmax(180px,1fr)] items-start mx-auto">
                      <div className="flex flex-col gap-3 rounded-3xl border border-neutral-800 bg-neutral-950 p-3 shadow-inner">
                        <div className="fs-tiny md:fs-small uppercase font-black tracking-widest text-indigo-400">Leads</div>
                        <div className="flex flex-wrap justify-center gap-2">{currentStep!.lead ? renderWithSprites(currentStep!.lead) : <span className="text-neutral-500">Sin leads</span>}</div>
                      </div>

                      <div className="rounded-3xl border border-neutral-800 overflow-hidden bg-neutral-950 shadow-inner mx-auto w-full max-w-[320px]">
                        <div className="p-3 border-b border-neutral-800 bg-neutral-900 text-neutral-300 uppercase fs-tiny font-black tracking-widest">Ubicación</div>
                        <div className="relative aspect-[4/3] w-full">
                          <img src={regionMap[gymCoords[currentStep!.gym as keyof typeof gymCoords].region as keyof typeof regionMap]} alt="Region Map" className="absolute inset-0 w-full h-full object-contain opacity-90" />
                          <div className="absolute inset-0 bg-black/20" />
                          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 text-center pointer-events-none">
                            <div className="text-[1.2rem] md:text-[1.35rem] font-black text-white">{currentStep!.gym || currentStep!.title}</div>
                            {currentStep!.region && <div className="mt-2 inline-flex items-center justify-center rounded-full border border-white/15 bg-black/30 px-2 py-1 text-[0.62rem] uppercase tracking-widest text-neutral-300">{currentStep!.region}</div>}
                          </div>
                          <div className="absolute w-5 h-5 md:w-6 md:h-6 bg-red-500 rounded-full border-2 border-white shadow-[0_0_22px_rgba(239,68,68,0.85)] z-10 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ left: `${gymCoords[currentStep!.gym as keyof typeof gymCoords].x}%`, top: `${gymCoords[currentStep!.gym as keyof typeof gymCoords].y}%` }} />
                        </div>
                        <div className="px-4 py-3 border-t border-neutral-800 bg-neutral-950 flex justify-center">
                          <button type="button" onClick={() => setMapPreview({ src: regionMap[gymCoords[currentStep!.gym as keyof typeof gymCoords].region as keyof typeof regionMap], gym: currentStep!.gym || currentStep!.title, region: currentStep!.region ?? "", x: gymCoords[currentStep!.gym as keyof typeof gymCoords].x, y: gymCoords[currentStep!.gym as keyof typeof gymCoords].y })} className="inline-flex items-center gap-2 rounded-2xl border border-neutral-700 px-3 py-2 text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 transition">
                            <span>👁️</span> Ver posición
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 rounded-3xl border border-neutral-800 bg-neutral-950 p-3 shadow-inner">
                        <div className="fs-tiny md:fs-small uppercase font-black tracking-widest text-emerald-400">Cambios Seguros</div>
                        <div className="flex flex-wrap justify-center gap-2">{currentStep!.switchTo ? renderWithSprites(currentStep!.switchTo) : <span className="text-neutral-500">Sin cambios</span>}</div>
                      </div>
                    </div>
                  )}
                </>
              ) : currentGymGroup && (
              <>
                {currentGymGroup.gymStep.gym && (
                  <div className="rounded-3xl border border-neutral-800 overflow-hidden bg-neutral-950 shadow-inner w-full max-w-[240px] mx-auto">
                    <div className="p-3 border-b border-neutral-800 bg-neutral-900 text-neutral-300 uppercase fs-tiny font-black tracking-widest">Ubicación</div>
                    <div className="relative aspect-[4/3] w-full">
                      <img src={regionMap[gymCoords[currentGymGroup.gymStep.gym as keyof typeof gymCoords].region as keyof typeof regionMap]} alt="Region Map" className="absolute inset-0 w-full h-full object-contain opacity-90" />
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 text-center pointer-events-none">
                        <div className="text-[1.45rem] md:text-[1.55rem] font-black text-white">{currentGymGroup.gymStep.title}</div>
                        <div className="mt-2 inline-flex items-center justify-center rounded-full border border-white/15 bg-black/30 px-3 py-1 text-[0.63rem] uppercase tracking-widest text-neutral-300">{currentGymGroup.region}</div>
                      </div>
                      <div className="absolute w-5 h-5 md:w-6 md:h-6 bg-red-500 rounded-full border-2 border-white shadow-[0_0_22px_rgba(239,68,68,0.85)] z-10 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ left: `${gymCoords[currentGymGroup.gymStep.gym as keyof typeof gymCoords].x}%`, top: `${gymCoords[currentGymGroup.gymStep.gym as keyof typeof gymCoords].y}%` }} />
                    </div>
                    <div className="px-4 py-3 border-t border-neutral-800 bg-neutral-950 flex justify-center">
                      <button type="button" onClick={() => setMapPreview({ src: regionMap[gymCoords[currentGymGroup.gymStep.gym as keyof typeof gymCoords].region as keyof typeof regionMap], gym: currentGymGroup.gymStep.title, region: currentGymGroup.region, x: gymCoords[currentGymGroup.gymStep.gym as keyof typeof gymCoords].x, y: gymCoords[currentGymGroup.gymStep.gym as keyof typeof gymCoords].y })} className="inline-flex items-center gap-2 rounded-2xl border border-neutral-700 px-3 py-2 text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 transition">
                        <span>👁️</span> Ver posición
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

            {currentStep && selectedGuideId === 'hooh' && (<>
            
            {currentStep.type === "gym" && currentStep.actions && (
              <div className="space-y-2 md:space-y-4">
                <div className="reveal-5 bg-neutral-950 p-2 md:p-4 rounded-xl border border-neutral-800">
                  <div className="fs-tiny md:fs-small text-amber-400 uppercase font-black tracking-widest mb-1.5 md:mb-3 text-center">Estrategia vs Variantes</div>
                  <ul className="space-y-1 md:space-y-2">
                    {currentStep.actions.map((act, i) => {
                      const parts = act.split("→");
                      return (
                        <li key={i} className="flex flex-col sm:flex-row items-center justify-center gap-1 md:gap-2 fs-tiny md:fs-body bg-neutral-900 p-1 md:p-2 rounded border border-neutral-800">
                          {parts.length > 1 ? (
                            <><span className="font-bold text-white">{parts[0].trim()}</span> <span className="text-neutral-500 hidden sm:inline">→</span> <span className="text-neutral-300">{parts[1].trim()}</span></>
                          ) : <span className="text-center">{act}</span>}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}

            {currentStep.type === "prep" && (
              <div className="space-y-2 md:space-y-4">
                {currentStep.heal && (
                  <div className="reveal-2 flex items-center justify-center gap-2 bg-red-950/20 border border-red-900/30 p-2 md:p-4 rounded-xl text-red-400 fs-tiny md:fs-body font-bold">
                    <Heart className="w-3.5 h-3.5 md:w-5 md:h-5 fill-current" /> Curar equipo en el Centro Pokémon
                  </div>
                )}
                {currentStep.items && currentStep.items.length > 0 && (
                  <div className="reveal-3 bg-neutral-950 p-2 md:p-4 rounded-xl border border-neutral-800">
                    <div className="fs-tiny md:fs-small text-blue-400 uppercase font-black tracking-widest mb-1.5 md:mb-3 flex items-center justify-center gap-1.5 md:gap-2"><Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5"/> Equipar Objetos</div>
                    <ul className="space-y-1 md:space-y-2">
                      {currentStep.items.map((it, i) => {
                        const isScarf = it.item.toLowerCase().includes("panuelo") || it.item.toLowerCase().includes("pañuelo");
                        return (
                          <li key={i} className={`flex flex-col sm:flex-row items-center justify-center gap-1 md:gap-2 p-1.5 md:p-3 rounded border ${isScarf ? 'bg-indigo-900/40 border-indigo-500/50' : 'bg-neutral-900 border-neutral-800 opacity-60'}`}>
                            <span className={`fs-tiny md:fs-body ${isScarf ? 'text-white' : 'text-neutral-400'}`}>{renderWithSprites(it.pokemon, " • ")}</span>
                            <span className={`${isScarf ? 'text-indigo-400 bg-indigo-950 px-2 md:px-3 py-0.5 md:py-1 fs-tiny md:fs-small shadow-[0_0_10px_rgba(99,102,241,0.2)]' : 'text-neutral-500 bg-neutral-950 px-1.5 md:px-2 py-0.5 fs-tiny'} font-bold rounded uppercase tracking-wider`}>
                              ➔ {it.item}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
                {currentStep.travel && (
                  <div className="reveal-4 flex items-center justify-center gap-2 bg-teal-950/20 border border-teal-900/30 p-2 md:p-4 rounded-xl text-teal-400 fs-tiny md:fs-body font-bold">
                    <Compass className="w-3.5 h-3.5 md:w-5 md:h-5" /> Viajar hacia {currentStep.travel}
                  </div>
                )}
              </div>
            )}

            {currentStep.type === "note" && (
              <div className="reveal-2 bg-amber-950/20 border border-amber-900/30 p-3 md:p-6 rounded-xl text-amber-400 fs-tiny md:fs-body font-bold text-center">
                {currentStep.description}
              </div>
            )}

            {currentStep.type === "turn" && currentStep.turnData && (
              <div className="w-full">
                <div className="bg-neutral-900/80 backdrop-blur-sm rounded-xl border border-neutral-800 p-3 md:p-5 shadow-lg">
                  <div className="space-y-3 md:space-y-4">
                    {currentStep.turnData.map((action, i) => {
                      const BADGE_STYLES: Record<string, string> = {
                        blue: "bg-blue-500/15 text-blue-300 border-blue-600/30",
                        red: "bg-red-500/15 text-red-300 border-red-600/30",
                        yellow: "bg-yellow-500/15 text-yellow-300 border-yellow-600/30",
                      };
                      return (
                        <div key={i} className="flex items-start gap-3 p-2 md:p-3 bg-neutral-950/60 rounded-lg border border-neutral-800/50">
                          <span className="text-xl shrink-0 mt-0.5 w-7 text-center">{action.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold fs-body text-white">{action.pokemon}</span>
                              {action.type === "switch" && <span className="fs-tiny font-bold text-amber-400">🔄</span>}
                              {action.type === "move" && <span className="fs-tiny font-bold text-emerald-400">✔</span>}
                              <span className={`fs-body ${action.type === "none" ? "text-neutral-600 italic" : action.type === "switch" ? "text-amber-300 font-semibold" : "text-neutral-200"}`}>
                                {action.action}
                              </span>
                            </div>
                            {action.conditionals && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {action.conditionals.map((c, ci) => (
                                  <span key={ci} className={`fs-tiny font-bold px-2.5 py-0.5 rounded-full border ${BADGE_STYLES[c.color] || BADGE_STYLES.blue}`}>
                                    {c.icon} {c.target} <span className="font-normal opacity-75">→ {c.move}</span>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {currentStep.description && (
                  <p className="fs-tiny text-neutral-500 text-center mt-2">{currentStep.description}</p>
                )}
              </div>
            )}
            </>)}

            {currentGymGroup && selectedGuideId !== 'hooh' && (
              <div className="space-y-3 md:space-y-5 w-full">
                {(currentGymGroup.gymStep.lead || currentGymGroup.gymStep.switchTo) && (
                  <div className="flex flex-col sm:flex-row justify-center gap-1.5 md:gap-3">
                    {currentGymGroup.gymStep.lead && (
                      <div className="reveal-3 bg-neutral-950 p-2 md:p-3 rounded-xl border border-neutral-800 flex-1 min-w-[140px]">
                        <div className="fs-tiny md:fs-small text-indigo-400 uppercase font-black tracking-widest mb-1 md:mb-1.5">Leads</div>
                        <div className="flex justify-center">{renderWithSprites(currentGymGroup.gymStep.lead)}</div>
                      </div>
                    )}
                    {currentGymGroup.gymStep.switchTo && (
                      <div className="reveal-4 bg-neutral-950 p-2 md:p-3 rounded-xl border border-neutral-800 flex-1 min-w-[140px]">
                        <div className="fs-tiny md:fs-small text-emerald-400 uppercase font-black tracking-widest mb-1 md:mb-1.5">Cambios Seguros</div>
                        <div className="flex justify-center">{renderWithSprites(currentGymGroup.gymStep.switchTo)}</div>
                      </div>
                    )}
                  </div>
                )}
                {currentGymGroup.gymStep.actions && (
                  <div className="reveal-5 bg-neutral-950 p-2 md:p-3 rounded-xl border border-neutral-800">
                    <div className="fs-tiny md:fs-small text-amber-400 uppercase font-black tracking-widest mb-1 md:mb-2 text-center">Estrategia vs Variantes</div>
                    <ul className="space-y-1">
                      {currentGymGroup.gymStep.actions.map((act, i) => {
                        const parts = act.split("→");
                        return (
                          <li key={i} className="flex flex-col sm:flex-row items-center justify-center gap-1 fs-tiny md:fs-small bg-neutral-900 p-1 md:p-1.5 rounded border border-neutral-800">
                            {parts.length > 1 ? (
                              <><span className="font-bold text-white">{parts[0].trim()}</span> <span className="text-neutral-500 hidden sm:inline">→</span> <span className="text-neutral-300">{parts[1].trim()}</span></>
                            ) : <span className="text-center">{act}</span>}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
                {currentGymGroup.subBattles.map((sub) => (
                  <div key={sub.id} className="bg-neutral-950 p-2 md:p-3 rounded-xl border border-neutral-800/60">
                    <div className="flex items-center justify-center gap-2 mb-1.5">
                      <span className="p-1 bg-neutral-900 rounded-lg">{renderIcon("gym")}</span>
                      <h3 className="fs-small font-black text-white">{sub.title}</h3>
                    </div>
                    {(sub.lead || sub.switchTo) && (
                      <div className="flex flex-col sm:flex-row justify-center gap-1.5 mb-1.5">
                        {sub.lead && (
                          <div className="bg-neutral-900/60 p-1.5 rounded-lg border border-neutral-800/50 flex-1">
                            <div className="fs-tiny text-indigo-400/80 uppercase font-black tracking-widest mb-0.5 text-center">Leads</div>
                            <div className="flex justify-center">{renderWithSprites(sub.lead)}</div>
                          </div>
                        )}
                        {sub.switchTo && (
                          <div className="bg-neutral-900/60 p-1.5 rounded-lg border border-neutral-800/50 flex-1">
                            <div className="fs-tiny text-emerald-400/80 uppercase font-black tracking-widest mb-0.5 text-center">Cambios</div>
                            <div className="flex justify-center">{renderWithSprites(sub.switchTo)}</div>
                          </div>
                        )}
                      </div>
                    )}
                    {sub.actions && (
                      <ul className="space-y-0.5">
                        {sub.actions.map((act, i) => {
                          const parts = act.split("→");
                          return (
                            <li key={i} className="flex flex-col sm:flex-row items-center justify-center gap-1 fs-tiny bg-neutral-900/40 p-1 rounded border border-neutral-800/40">
                              {parts.length > 1 ? (
                                <><span className="font-bold text-white/90">{parts[0].trim()}</span> <span className="text-neutral-600 hidden sm:inline">→</span> <span className="text-neutral-400">{parts[1].trim()}</span></>
                              ) : <span className="text-center text-neutral-400">{act}</span>}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ))}
                {currentGymGroup.extras.map((extra) => (
                  <div key={extra.id}>
                    {extra.type === "prep" && extra.items && extra.items.length > 0 && (
                      <div className="reveal bg-neutral-950 p-2 md:p-3 rounded-xl border border-neutral-800">
                        <div className="fs-tiny md:fs-small text-blue-400 uppercase font-black tracking-widest mb-1 md:mb-2 flex items-center justify-center gap-1.5 md:gap-2"><Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5"/> Equipar Objetos</div>
                        <ul className="space-y-1">
                          {extra.items.map((it, i) => {
                            const isScarf = it.item.toLowerCase().includes("panuelo") || it.item.toLowerCase().includes("pañuelo");
                            return (
                              <li key={i} className={`flex flex-col sm:flex-row items-center justify-center gap-1 p-1.5 md:p-2 rounded border ${isScarf ? 'bg-indigo-900/40 border-indigo-500/50' : 'bg-neutral-900 border-neutral-800 opacity-60'}`}>
                                <span className={`fs-tiny md:fs-small ${isScarf ? 'text-white' : 'text-neutral-400'}`}>{renderWithSprites(it.pokemon, " • ")}</span>
                                <span className={`${isScarf ? 'text-indigo-400 bg-indigo-950 px-2 py-0.5 fs-tiny shadow-[0_0_10px_rgba(99,102,241,0.2)]' : 'text-neutral-500 bg-neutral-950 px-1.5 py-0.5 fs-tiny'} font-bold rounded uppercase tracking-wider`}>
                                  ➔ {it.item}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                    {extra.type === "prep" && extra.heal && (
                      <div className="reveal flex items-center justify-center gap-2 bg-red-950/20 border border-red-900/30 p-2 md:p-3 rounded-xl text-red-400 fs-tiny md:fs-body font-bold">
                        <Heart className="w-3.5 h-3.5 md:w-5 md:h-5 fill-current" /> Curar equipo en el Centro Pokémon
                      </div>
                    )}
                    {extra.type === "prep" && extra.travel && (
                      <div className="reveal flex items-center justify-center gap-2 bg-teal-950/20 border border-teal-900/30 p-2 md:p-3 rounded-xl text-teal-400 fs-tiny md:fs-body font-bold">
                        <Compass className="w-3.5 h-3.5 md:w-5 md:h-5" /> Viajar hacia {extra.travel}
                      </div>
                    )}
                    {extra.type === "note" && (
                      <div className="reveal bg-amber-950/20 border border-amber-900/30 p-2 md:p-4 rounded-xl text-amber-400 fs-tiny md:fs-body font-bold text-center">
                        {extra.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
          </div>

          {currentStepIndex !== -1 && (<>
          <div className="reveal w-full max-w-4xl mt-4 md:mt-5">
            <button onClick={() => setShowTeam(true)} title="Ver el equipo Pokémon recomendado para esta ruta" className="w-full bg-neutral-900/80 border border-violet-500/20 hover:border-violet-400/40 rounded-2xl p-3 md:p-4 flex items-center gap-3 group transition-all hover:bg-neutral-800/80">
              {selectedGuideId === "hooh" ? (
                <div className="flex items-center -space-x-2 shrink-0">
                  <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${POKEMON_ARTWORK.Chandelure}.gif`} alt="" className="w-7 h-7 md:w-8 md:h-8 object-contain relative z- poke-aura-sm poke-glow-white" loading="lazy" />
                  <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${POKEMON_ARTWORK.Rotom}.gif`} alt="" className="w-7 h-7 md:w-8 md:h-8 object-contain relative z- poke-aura-sm poke-glow-white" loading="lazy" />
                  <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${POKEMON_ARTWORK.Lunatone}.gif`} alt="" className="w-7 h-7 md:w-8 md:h-8 object-contain relative z- poke-aura-sm poke-glow-white" loading="lazy" />
                </div>
              ) : selectedGuideId === "guide2" ? (
                <div className="flex items-center -space-x-2 shrink-0">
                  <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${POKEMON_ARTWORK.Togekiss}.gif`} alt="" className="w-7 h-7 md:w-8 md:h-8 object-contain relative z- poke-aura-sm poke-glow-white" loading="lazy" />
                  <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${POKEMON_ARTWORK.Excadrill}.gif`} alt="" className="w-7 h-7 md:w-8 md:h-8 object-contain relative z- poke-aura-sm poke-glow-white" loading="lazy" />
                  <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${POKEMON_ARTWORK.Blastoise}.gif`} alt="" className="w-7 h-7 md:w-8 md:h-8 object-contain relative z- poke-aura-sm poke-glow-white" loading="lazy" />
                  <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${POKEMON_ARTWORK.Vanilluxe}.gif`} alt="" className="w-7 h-7 md:w-8 md:h-8 object-contain relative z- poke-aura-sm poke-glow-white" loading="lazy" />
                  <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${POKEMON_ARTWORK.Aerodactyl}.gif`} alt="" className="w-7 h-7 md:w-8 md:h-8 object-contain relative z- poke-aura-sm poke-glow-white" loading="lazy" />
                  <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${POKEMON_ARTWORK.Typhlosion}.gif`} alt="" className="w-7 h-7 md:w-8 md:h-8 object-contain relative z- poke-aura-sm poke-glow-white" loading="lazy" />
                </div>
              ) : (
                <div className="flex items-center -space-x-2 shrink-0">
                  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/635.gif" alt="" className="w-7 h-7 md:w-8 md:h-8 object-contain relative z- poke-aura-sm poke-glow-white" loading="lazy" />
                  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/110.gif" alt="" className="w-7 h-7 md:w-8 md:h-8 object-contain relative z- poke-aura-sm poke-glow-white" loading="lazy" />
                  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/468.gif" alt="" className="w-7 h-7 md:w-8 md:h-8 object-contain relative z- poke-aura-sm poke-glow-white" loading="lazy" />
                  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/157.gif" alt="" className="w-7 h-7 md:w-8 md:h-8 object-contain relative z- poke-aura-sm poke-glow-white" loading="lazy" />
                  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/584.gif" alt="" className="w-7 h-7 md:w-8 md:h-8 object-contain relative z- poke-aura-sm poke-glow-white" loading="lazy" />
                  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/9.gif" alt="" className="w-7 h-7 md:w-8 md:h-8 object-contain relative z- poke-aura-sm poke-glow-white" loading="lazy" />
                </div>
              )}
              <div className="flex-1 text-left min-w-0">
                <div className="fs-small md:fs-body font-black text-white group-hover:text-violet-300 transition-colors">Equipo de la Run</div>
                <div className="fs-tiny text-neutral-500 truncate">{selectedGuideId === "hooh" ? "Chandelure · Rotom (Horno) · Lunatone" : selectedGuideId === "guide2" ? "Togekiss · Excadrill · Blastoise · Vanilluxe · Aerodactyl · Typhlosion" : "Hydreigon · Weezing · Togekiss · Typhlosion · Vanilluxe · Blastoise"}</div>
              </div>
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-violet-400/60 group-hover:text-violet-400 transition-colors shrink-0" />
            </button>
          </div>
          </>)}
        </div>
      </main>

      {currentStepIndex !== -1 && selectedGuideId !== "none" && (
        <CategoryFooter
          guideId={selectedGuideId}
          nav={{
            onPrev: handlePrev,
            onNext: handleNext,
            onCompleteGym: completeGym,
            onFinish: requestFinishRun,
            onRouteReset: requestRouteReset,
            prevDisabled: selectedGuideId === "hooh" ? currentStepIndex <= 0 : currentGymIndex <= 0,
            nextDisabled:
              selectedGuideId === "hooh"
                ? currentStepIndex === steps.length - 1
                : currentGymIndex === gymGroupCount - 1,
            isLastStep:
              selectedGuideId === "hooh"
                ? currentStepIndex === steps.length - 1
                : currentGymIndex === gymGroupCount - 1,
            showCompleteGym: shouldShowCompleteGym(selectedGuideId) && currentGymIndex >= 0,
            progressPercent:
              selectedGuideId === "hooh"
                ? Math.round(((currentStepIndex + 1) / steps.length) * 100)
                : Math.round(((currentGymIndex + 1) / gymGroupCount) * 100),
            progressLabel:
              selectedGuideId === "hooh"
                ? `${Math.round(((currentStepIndex + 1) / steps.length) * 100)}% completado · Turno ${currentStepIndex + 1}/${steps.length}`
                : `Gimnasio ${currentGymIndex + 1} / ${gymGroupCount} · ${Math.round(((currentGymIndex + 1) / gymGroupCount) * 100)}%`,
          }}
          gym={{
            timerIsRunning,
            timerStartTime,
            timerElapsed,
            onStartTimer: startTimer,
            onPauseTimer: pauseTimer,
            onResetTimer: requestTimerReset,
            cooldownEndAt: cooldown.endAt,
            onShowCooldownNotice: () => setShowCooldownNotice(true),
            onStartCooldown: () => requestGymCooldownStart(),
            onEditCooldown: openCooldownEditor,
            sessionGymCount,
            totalGyms: gymGroupCount,
          }}
        />
      )}

      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-neutral-800 border border-neutral-700 shadow-2xl rounded px-2.5 py-1.5 text-white fs-small md:fs-body font-bold animate-in slide-in-from-bottom-4 fade-in">
          {toastMessage}
        </div>
      )}

      {storageWarning && !showResumePrompt && (
        <div className="fixed top-16 right-3 left-3 sm:left-auto z-50 max-w-md bg-amber-950/95 border border-amber-700/60 shadow-2xl rounded-xl px-3 py-2 text-amber-100 fs-small">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 mt-0.5 shrink-0 text-amber-300" />
            <span className="flex-1">{storageWarning}</span>
            <button onClick={() => setStorageWarning(null)} className="text-amber-300 hover:text-white font-black">×</button>
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
                onClick={() => requestGymCooldownStart()}
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
                  <p className="fs-tiny text-neutral-500 mt-0.5">{selectedGuideId === "hooh" ? "Chandelure · Rotom (Horno) · Lunatone" : selectedGuideId === "guide2" ? "Togekiss · Excadrill · Blastoise · Vanilluxe · Aerodactyl · Typhlosion" : "Weezing con Cinta Elegida · Vanilluxe con Pañuelo Elegido · resto con Gafas Elegidas"}</p>
                </div>
                <button onClick={() => closeTeam()} className="text-neutral-500 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className={`grid gap-2 p-3 ${selectedGuideId === "hooh" ? "grid-cols-1 sm:grid-cols-3" : selectedGuideId === "guide2" ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}>

                {selectedGuideId === "hooh" ? (
                  <>
                    <div className="bg-neutral-950 border border-indigo-500/20 rounded-xl p-3">
                      <div className="flex items-center gap-3 mb-2">
                        <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${POKEMON_ARTWORK.Chandelure}.gif`} alt="Chandelure" className="w-10 h-10 object-contain poke-aura-sm poke-glow-white" loading="lazy" />
                        <div>
                          <div className="font-black fs-small text-indigo-300">Chandelure</div>
                          <div className="fs-tiny text-neutral-500">Absor. Fuego · Modesta · Hechizo</div>
                        </div>
                      </div>
                      <div className="fs-tiny text-neutral-400 mb-2">EVs: 252 SpA / 58 SpD / 200 Spe</div>
                      <div className="fs-tiny text-neutral-500 mb-1.5">IVs: 25 PS / - Atk / 25 Def / 31 SpA / 25 SpD / 31 Spe</div>
                      <div className="grid grid-cols-2 gap-1">
                        {['Velo Sagrado','Protección','Más Psique','Bola Sombra'].map(m => <span key={m} className="fs-tiny bg-indigo-950/50 border border-indigo-800/30 px-1.5 py-0.5 rounded text-indigo-300">{m}</span>)}
                      </div>
                    </div>

                    <div className="bg-neutral-950 border border-orange-500/20 rounded-xl p-3">
                      <div className="flex items-center gap-3 mb-2">
                        <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${POKEMON_ARTWORK.Rotom}.gif`} alt="Rotom" className="w-10 h-10 object-contain poke-aura-sm poke-glow-white" loading="lazy" />
                        <div>
                          <div className="font-black fs-small text-orange-300">Rotom (Horno)</div>
                          <div className="fs-tiny text-neutral-500">Levitación · Mansa · Arena Fina</div>
                        </div>
                      </div>
                      <div className="fs-tiny text-neutral-400 mb-2">EVs: 6 PS / 252 SpA / 252 SpD</div>
                      <div className="fs-tiny text-neutral-500 mb-1.5">IVs: 25 PS / - Atk / 25 Def / 31 SpA / 25 SpD / - Spe</div>
                      <div className="grid grid-cols-2 gap-1">
                        {['Maquinación','Poder Oculto (Tierra)','Rayo','Pantalla de Luz'].map(m => <span key={m} className="fs-tiny bg-orange-950/50 border border-orange-800/30 px-2 py-1 rounded text-orange-300">{m}</span>)}
                      </div>
                    </div>

                    <div className="bg-neutral-950 border border-sky-500/20 rounded-xl p-3">
                      <div className="flex items-center gap-3 mb-2">
                        <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${POKEMON_ARTWORK.Lunatone}.gif`} alt="Lunatone" className="w-10 h-10 object-contain poke-aura-sm poke-glow-white" loading="lazy" />
                        <div>
                          <div className="font-black fs-small text-sky-300">Lunatone</div>
                          <div className="fs-tiny text-neutral-500">Levitación · Mansa · Piedra Dura</div>
                        </div>
                      </div>
                      <div className="fs-tiny text-neutral-400 mb-2">EVs: 96 PS / 252 SpA / 166 SpD</div>
                      <div className="fs-tiny text-neutral-500 mb-1.5">IVs: 25 PS / - Atk / 25 Def / 31 SpA / 25 SpD / 0 Spe</div>
                      <div className="grid grid-cols-2 gap-1">
                        {['Espacio Raro','Protección','Más Psique','Joya de Luz'].map(m => <span key={m} className="fs-tiny bg-sky-950/50 border border-sky-800/30 px-2 py-1 rounded text-sky-300">{m}</span>)}
                      </div>
                    </div>
                  </>
                ) : selectedGuideId === "guide2" ? (
                <>
                <div className="bg-neutral-950 border border-teal-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${POKEMON_ARTWORK.Togekiss}.gif`} alt="Togekiss" className="w-10 h-10 object-contain poke-aura-sm poke-glow-white" loading="lazy" />
                    <div>
                      <div className="font-black fs-small text-teal-300">Togekiss</div>
                      <div className="fs-tiny text-neutral-500">Dicha · Modesta · Pañuelo Elegido</div>
                    </div>
                  </div>
                  <div className="fs-tiny text-neutral-400 mb-1.5">EVs: 4 Def / 252 SpA / 252 Spe</div>
                  <div className="grid grid-cols-2 gap-1">
                    {['Hyper Voice','Vuelo','Aire Corte'].map(m => <span key={m} className="fs-tiny bg-teal-950/50 border border-teal-800/30 px-2 py-1 rounded text-teal-300">{m}</span>)}
                  </div>
                </div>
                <div className="bg-neutral-950 border border-amber-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${POKEMON_ARTWORK.Excadrill}.gif`} alt="Excadrill" className="w-10 h-10 object-contain poke-aura-sm poke-glow-white" loading="lazy" />
                    <div>
                      <div className="font-black fs-small text-amber-300">Excadrill</div>
                      <div className="fs-tiny text-neutral-500">Rompemoldes · Firme · Cinta Elegida</div>
                    </div>
                  </div>
                  <div className="fs-tiny text-neutral-400 mb-1.5">EVs: 252 Atk / 4 Def / 252 Spe</div>
                  <div className="grid grid-cols-2 gap-1">
                    {['Terremoto','Avalancha','Ayuda'].map(m => <span key={m} className="fs-tiny bg-amber-950/50 border border-amber-800/30 px-2 py-1 rounded text-amber-300">{m}</span>)}
                  </div>
                </div>
                <div className="bg-neutral-950 border border-blue-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${POKEMON_ARTWORK.Blastoise}.gif`} alt="Blastoise" className="w-10 h-10 object-contain poke-aura-sm poke-glow-white" loading="lazy" />
                    <div>
                      <div className="font-black fs-small text-blue-300">Blastoise</div>
                      <div className="fs-tiny text-neutral-500">Torrente · Modesta · Pañuelo Elegido</div>
                    </div>
                  </div>
                  <div className="fs-tiny text-neutral-400 mb-1.5">EVs: 252 SpA / 4 HP / 252 Spe</div>
                  <div className="fs-tiny text-neutral-500 mb-1.5">IVs: 0 Atk</div>
                  <div className="grid grid-cols-2 gap-1">
                    {['Chorro de Agua','Surf','Ventisca','Pulso Oscuro'].map(m => <span key={m} className="fs-tiny bg-blue-950/50 border border-blue-800/30 px-2 py-1 rounded text-blue-300">{m}</span>)}
                  </div>
                </div>
                <div className="bg-neutral-950 border border-cyan-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${POKEMON_ARTWORK.Vanilluxe}.gif`} alt="Vanilluxe" className="w-10 h-10 object-contain poke-aura-sm poke-glow-white" loading="lazy" />
                    <div>
                      <div className="font-black fs-small text-cyan-300">Vanilluxe</div>
                      <div className="fs-tiny text-neutral-500">Nevada · Modesta · Pañuelo Elegido</div>
                    </div>
                  </div>
                  <div className="fs-tiny text-neutral-400 mb-1.5">EVs: 252 SpA / 4 Def / 252 Spe</div>
                  <div className="fs-tiny text-neutral-500 mb-1.5">IVs: 0 Atk</div>
                  <div className="grid grid-cols-2 gap-1">
                    {['Ventisca','Viento Hielo','Rayo Hielo'].map(m => <span key={m} className="fs-tiny bg-cyan-950/50 border border-cyan-800/30 px-2 py-1 rounded text-cyan-300">{m}</span>)}
                  </div>
                </div>
                <div className="bg-neutral-950 border border-purple-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${POKEMON_ARTWORK.Aerodactyl}.gif`} alt="Aerodactyl" className="w-10 h-10 object-contain poke-aura-sm poke-glow-white" loading="lazy" />
                    <div>
                      <div className="font-black fs-small text-purple-300">Aerodactyl</div>
                      <div className="fs-tiny text-neutral-500">Cabeza Roca · Firme · Lupa</div>
                    </div>
                  </div>
                  <div className="fs-tiny text-neutral-400 mb-1.5">EVs: 252 Atk / 4 Def / 252 Spe</div>
                  <div className="grid grid-cols-2 gap-1">
                    {['Avalancha','Día Soleado','Protección'].map(m => <span key={m} className="fs-tiny bg-purple-950/50 border border-purple-800/30 px-2 py-1 rounded text-purple-300">{m}</span>)}
                  </div>
                </div>
                <div className="bg-neutral-950 border border-orange-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${POKEMON_ARTWORK.Typhlosion}.gif`} alt="Typhlosion" className="w-10 h-10 object-contain poke-aura-sm poke-glow-white" loading="lazy" />
                    <div>
                      <div className="font-black fs-small text-orange-300">Typhlosion</div>
                      <div className="fs-tiny text-neutral-500">Mar Llamas · Modesta · Gafas Elegidas</div>
                    </div>
                  </div>
                  <div className="fs-tiny text-neutral-400 mb-1.5">EVs: 252 SpA / 4 HP / 252 Spe</div>
                  <div className="grid grid-cols-2 gap-1">
                    {['Estallido','Ayuda','Corte'].map(m => <span key={m} className="fs-tiny bg-orange-950/50 border border-orange-800/30 px-2 py-1 rounded text-orange-300">{m}</span>)}
                  </div>
                </div>
                </>) : (
                <>
                <div className="bg-neutral-950 border border-indigo-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${POKEMON_ARTWORK.Hydreigon}.gif`} alt="Hydreigon" className="w-10 h-10 object-contain poke-aura-sm poke-glow-white" loading="lazy" />
                    <div>
                      <div className="font-black fs-small text-indigo-300">H1 — Hydreigon</div>
                      <div className="fs-tiny text-neutral-500">Levitación · Modesta · Gafas Elegidas</div>
                    </div>
                  </div>
                  <div className="fs-tiny text-neutral-400 mb-1.5">EVs: 6 HP / 212 SpA / 40 SpD / 252 Spe</div>
                  <div className="fs-tiny text-neutral-500 mb-1.5">IVs: Max 14 HP / X Atk / Max 14 Def / 31 Spa / Low Spd / 31 Spe</div>
                  <div className="grid grid-cols-2 gap-1">
                    {['Surf','Día Soleado','Danza Lluvia','Viento Afín'].map(m => <span key={m} className="fs-tiny bg-indigo-950/50 border border-indigo-800/30 px-2 py-1 rounded text-indigo-300">{m}</span>)}
                  </div>
                </div>

                <div className="bg-neutral-950 border border-purple-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${POKEMON_ARTWORK.Weezing}.gif`} alt="Weezing" className="w-10 h-10 object-contain poke-aura-sm poke-glow-white" loading="lazy" />
                    <div>
                      <div className="font-black fs-small text-purple-300">W1 — Weezing</div>
                      <div className="fs-tiny text-neutral-500">Gas Reactivo · Firme · Cinta Elegida</div>
                    </div>
                  </div>
                  <div className="fs-tiny text-neutral-400 mb-1.5">EVs: 252 Atk / 6 SpD / 252 Spe</div>
                  <div className="fs-tiny text-neutral-500 mb-1.5">IVs: 31 HP / 31 Atk / High Def / X Spa / 31 Spd / 31 Spe</div>
                  <div className="grid grid-cols-2 gap-1">
                    {['Explosión','Buena Baza','Incinerar','Día Soleado'].map(m => <span key={m} className="fs-tiny bg-purple-950/50 border border-purple-800/30 px-2 py-1 rounded text-purple-300">{m}</span>)}
                  </div>
                </div>

                <div className="bg-neutral-950 border border-sky-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${POKEMON_ARTWORK.Togekiss}.gif`} alt="Togekiss" className="w-10 h-10 object-contain poke-aura-sm poke-glow-white" loading="lazy" />
                    <div>
                      <div className="font-black fs-small text-sky-300">TO — Togekiss</div>
                      <div className="fs-tiny text-neutral-500">Dicha · Modesta · Pañuelo Elegido</div>
                    </div>
                  </div>
                  <div className="fs-tiny text-neutral-400 mb-1.5">EVs: 252 SpA / 6 SpD / 252 Spe</div>
                  <div className="fs-tiny text-neutral-500 mb-1.5">IVs: X HP / X Atk / X Def / 31 Spa / X Spd / 31 Spe</div>
                  <div className="grid grid-cols-2 gap-1">
                    {['Vozarrón','Psicocarga','Señal Luminosa','Psíquico'].map(m => <span key={m} className="fs-tiny bg-sky-950/50 border border-sky-800/30 px-2 py-1 rounded text-sky-300">{m}</span>)}
                  </div>
                </div>

                <div className="bg-neutral-950 border border-orange-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${POKEMON_ARTWORK.Typhlosion}.gif`} alt="Typhlosion" className="w-10 h-10 object-contain poke-aura-sm poke-glow-white" loading="lazy" />
                    <div>
                      <div className="font-black fs-small text-orange-300">TY — Typhlosion</div>
                      <div className="fs-tiny text-neutral-500">Mar Llamas · Modesta · Gafas Elegidas</div>
                    </div>
                  </div>
                  <div className="fs-tiny text-neutral-400 mb-1.5">EVs: 252 SpA / 6 SpD / 252 Spe</div>
                  <div className="fs-tiny text-neutral-500 mb-1.5">IVs: X HP / X Atk / X Def / 31 Spa / X Spd / 31 Spe</div>
                  <div className="grid grid-cols-2 gap-1">
                    {['Estallido','Rapidez','Corte','Refuerzo'].map(m => <span key={m} className="fs-tiny bg-orange-950/50 border border-orange-800/30 px-2 py-1 rounded text-orange-300">{m}</span>)}
                  </div>
                </div>

                <div className="bg-neutral-950 border border-cyan-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${POKEMON_ARTWORK.Vanilluxe}.gif`} alt="Vanilluxe" className="w-10 h-10 object-contain poke-aura-sm poke-glow-white" loading="lazy" />
                    <div>
                      <div className="font-black fs-small text-cyan-300">Vanilluxe @ Pañuelo Elegido</div>
                      <div className="fs-tiny text-neutral-500">Nevada · Miedosa · Lv. 100</div>
                    </div>
                  </div>
                  <div className="fs-tiny text-neutral-400 mb-1.5">EVs: 10 HP / 252 SpA / 248 Spe</div>
                  <div className="fs-tiny text-neutral-500 mb-1.5">IVs: X HP / X Atk / X Def / 31 Spa / X Spd / 31 Spe</div>
                  <div className="grid grid-cols-2 gap-1">
                    {['Ventisca','Vozarrón','Hidropulso','Foco Resplandor'].map(m => <span key={m} className="fs-tiny bg-cyan-950/50 border border-cyan-800/30 px-2 py-1 rounded text-cyan-300">{m}</span>)}
                  </div>
                </div>

                <div className="bg-neutral-950 border border-blue-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${POKEMON_ARTWORK.Blastoise}.gif`} alt="Blastoise" className="w-10 h-10 object-contain poke-aura-sm poke-glow-white" loading="lazy" />
                    <div>
                      <div className="font-black fs-small text-blue-300">BW — Blastoise</div>
                      <div className="fs-tiny text-neutral-500">Torrente · Modesta · Gafas Elegidas</div>
                    </div>
                  </div>
                  <div className="fs-tiny text-neutral-400 mb-1.5">EVs: 252 SpA / 10 SpD / 248 Spe</div>
                  <div className="fs-tiny text-neutral-500 mb-1.5">IVs: 31 HP / 31 Spe · High Spd / 31 Spa</div>
                  <div className="grid grid-cols-2 gap-1">
                    {['Salpicar','Refuerzo','Ventisca'].map(m => <span key={m} className="fs-tiny bg-blue-950/50 border border-blue-800/30 px-2 py-1 rounded text-blue-300">{m}</span>)}
                  </div>
                </div>
                </>)}

              </div>
              <div className="px-5 py-3 bg-neutral-950 border-t border-neutral-800 fs-tiny text-neutral-600 text-center">
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
                  <div className={`fs-small font-black uppercase tracking-wider ${startChecks[0] ? 'text-emerald-300' : 'text-red-300'}`}>Moneda Amuleto / Incienso Duplo</div>
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
            <button onClick={() => setSkipChecklist(prev => { const next = !prev; setLS("skip_checklist", String(next)); return next; })} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-neutral-800/50 transition-colors">
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
            <button onClick={() => setSkipCountdown(prev => { const next = !prev; setLS("skip_countdown", String(next)); return next; })} className="mt-8 flex items-center justify-center gap-2 mx-auto py-1.5 px-3 rounded-lg hover:bg-neutral-800/50 transition-colors">
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${skipCountdown ? 'bg-indigo-500 border-indigo-500' : 'border-neutral-600'}`}>
                {skipCountdown && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
              <span className={`fs-tiny font-semibold ${skipCountdown ? 'text-neutral-400' : 'text-neutral-600'}`}>No mostrar cuenta atrás</span>
            </button>
          </div>
        </div>
      )}
    </div>

    {mapPreview && (
      <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setMapPreview(null)}>
        <div className="relative w-full max-w-3xl rounded-[28px] overflow-hidden border border-neutral-800 bg-neutral-950 shadow-2xl" onClick={e => e.stopPropagation()}>
          <button type="button" onClick={() => setMapPreview(null)} className="absolute right-4 top-4 z-20 rounded-full border border-neutral-700 bg-black/60 p-2 text-neutral-200 hover:text-white hover:bg-black/80 transition">
            <X className="w-5 h-5" />
          </button>
          <div className="relative aspect-square sm:aspect-[4/3] w-full bg-black">
            <img src={mapPreview.src} alt={`Mapa de ${mapPreview.gym}`} className="absolute inset-0 w-full h-full object-contain" />
            <div className="absolute inset-0 bg-black/25" />
            <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/70 px-3 py-1 text-[0.7rem] uppercase tracking-[0.22em] text-neutral-200">{mapPreview.region}</div>
            <div className="absolute left-4 bottom-4 rounded-full bg-black/80 px-3 py-2 text-sm font-black text-white">{mapPreview.gym}</div>
            <div className="absolute w-6 h-6 md:w-8 md:h-8 bg-red-500 rounded-full border-2 border-white shadow-[0_0_18px_rgba(239,68,68,0.8)] -translate-x-1/2 -translate-y-1/2" style={{ left: `${mapPreview.x}%`, top: `${mapPreview.y}%` }} />
          </div>
          <div className="px-5 py-4 text-center text-neutral-400 fs-small">Haz clic fuera o presiona cerrar para volver</div>
        </div>
      </div>
    )}

    {resetConfirmModal}
    {resumePromptModal}
    {showCooldownNotice && (
      <CooldownNoticeModal cooldown={cooldown} onDismiss={() => setShowCooldownNotice(false)} />
    )}
    {showActiveSessionModal && (
      <div className="fixed inset-0 z-[75] bg-black/85 flex items-center justify-center p-3">
        <div className="bg-neutral-900 rounded-2xl border border-amber-700/50 w-full max-w-sm p-5 shadow-2xl shadow-amber-950/30">
          <div className="flex items-start gap-3 mb-4 pb-3 border-b border-amber-800/30">
            <div className="w-10 h-10 rounded-xl bg-amber-900/40 border border-amber-700/40 flex items-center justify-center shrink-0">
              <Info className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-black fs-h3 text-amber-300">Sesión activa</h3>
              <p className="fs-tiny text-amber-500/70 mt-0.5">Hay una ruta en progreso</p>
            </div>
          </div>
          <p className="fs-body text-neutral-300 mb-1">
            Tienes una ruta guardada en el paso {currentStepIndex + 1}/{steps.length}.
          </p>
          <p className="fs-tiny text-neutral-500 mb-4">
            ¿Qué deseas hacer?
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => { setShowActiveSessionModal(false); exitMenu(); }}
              className="py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black fs-body"
            >
              Continuar
            </button>
            <button
              onClick={() => { setShowActiveSessionModal(false); setPendingResetAction("route"); }}
              className="py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-black fs-body"
            >
              Empezar cero
            </button>
          </div>
          <button onClick={() => setShowActiveSessionModal(false)} className="w-full mt-2 py-1.5 text-neutral-500 hover:text-white fs-tiny font-bold transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    )}
    <DailyTasks gymsCompleted={sessionGymCount} timerElapsedMs={timerElapsed} isOpen={showTasks} onToggle={() => setShowTasks(prev => !prev)} />
    </>
  );
}

