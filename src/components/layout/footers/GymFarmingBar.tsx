"use client";

import React from "react";
import { Play, Pause, RotateCcw, Clock } from "lucide-react";
import Button from "@/components/ui/Button";
import TimerDisplay from "@/components/shared/TimerDisplay";
import CooldownBadge from "@/components/shared/CooldownBadge";

export interface GymFarmingBarProps {
  timerIsRunning: boolean;
  timerStartTime: number | null;
  timerElapsed: number;
  onStartTimer: () => void;
  onPauseTimer: () => void;
  onResetTimer: () => void;
  cooldownEndAt: number | null;
  onShowCooldownNotice: () => void;
  onStartCooldown: () => void;
  onOpenCooldownEditor: () => void;
  sessionGymCount: number;
  totalGyms: number;
}

export default function GymFarmingBar({
  timerIsRunning,
  timerStartTime,
  timerElapsed,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
  cooldownEndAt,
  onShowCooldownNotice,
  onStartCooldown,
  onOpenCooldownEditor,
  sessionGymCount,
  totalGyms,
}: GymFarmingBarProps) {
  return (
    <div className="flex flex-col gap-2 pt-2 border-t border-neutral-800/80">
      <div className="flex items-center justify-between gap-2">
        <span className="fs-tiny font-bold uppercase tracking-wider text-amber-400/90 shrink-0">
          Farmeo Gyms
        </span>
        <span className="fs-tiny text-neutral-500 tabular-nums">
          Sesión: <span className="font-bold text-emerald-400">{sessionGymCount}</span>
          {totalGyms > 0 && (
            <span className="text-neutral-600"> / {totalGyms}</span>
          )}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2 min-w-0 bg-neutral-950/60 border border-neutral-800 rounded-xl px-3 py-2">
          <span className="fs-tiny text-neutral-500 font-semibold shrink-0">Run</span>
          <TimerDisplay
            isRunning={timerIsRunning}
            startTime={timerStartTime}
            elapsedBeforePause={timerElapsed}
          />
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {!timerIsRunning ? (
            <Button
              variant="primary"
              size="sm"
              onClick={onStartTimer}
              icon={<Play className="w-3.5 h-3.5 fill-current" />}
              aria-label="Iniciar cronómetro"
            >
              Iniciar
            </Button>
          ) : (
            <Button
              variant="neutral"
              size="sm"
              onClick={onPauseTimer}
              className="bg-amber-700 hover:bg-amber-600 border-amber-600/40"
              icon={<Pause className="w-3.5 h-3.5 fill-current" />}
              aria-label="Pausar cronómetro"
            >
              Pausar
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={onResetTimer}
            aria-label="Reiniciar cronómetro"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          />
        </div>

        <div className="flex items-center gap-1 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={onShowCooldownNotice}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label="Ver cooldown de gyms"
          >
            <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="fs-tiny text-neutral-500 font-semibold">Reset</span>
            <CooldownBadge endAt={cooldownEndAt} />
          </button>
          <Button variant="success" size="sm" onClick={onStartCooldown}>
            18h
          </Button>
          <Button variant="secondary" size="sm" onClick={onOpenCooldownEditor}>
            Ajustar
          </Button>
        </div>
      </div>
    </div>
  );
}
