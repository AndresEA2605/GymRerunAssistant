"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";
import GymFarmingBar from "./GymFarmingBar";
import { FooterProgress } from "./FooterProgress";
import { showGymTimer } from "@/lib/guide-footer";

export interface RouteFooterActions {
  onPrev: () => void;
  onNext: () => void;
  onCompleteGym: () => void;
  onFinish: () => void;
  onRouteReset: () => void;
  prevDisabled: boolean;
  nextDisabled: boolean;
  isLastStep: boolean;
  showCompleteGym: boolean;
  progressPercent: number;
  progressLabel: string;
}

export interface GymModuleActions {
  timerIsRunning: boolean;
  timerStartTime: number | null;
  timerElapsed: number;
  onStartTimer: () => void;
  onPauseTimer: () => void;
  onResetTimer: () => void;
  cooldownEndAt: number | null;
  onShowCooldownNotice: () => void;
  onStartCooldown: () => void;
  onEditCooldown: () => void;
  sessionGymCount: number;
  totalGyms: number;
}

interface RoutesFooterProps {
  guideId: string;
  nav: RouteFooterActions;
  gym: GymModuleActions;
}

export default function RoutesFooter({ guideId, nav, gym }: RoutesFooterProps) {
  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-30 bg-neutral-900/95 border-t border-indigo-500/30 backdrop-blur-md"
      style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
      role="contentinfo"
    >
      <div className="mx-auto w-full max-w-5xl px-3 py-3 sm:px-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={nav.onPrev}
              disabled={nav.prevDisabled}
              aria-label="Gimnasio anterior"
              icon={<ChevronLeft className="w-4 h-4" />}
            >
              Anterior
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={nav.isLastStep ? nav.onFinish : nav.onNext}
              disabled={!nav.isLastStep && nav.nextDisabled}
              aria-label={nav.isLastStep ? "Finalizar ruta" : "Siguiente gimnasio"}
              icon={<ChevronRight className="w-4 h-4" />}
              className="min-w-[120px] sm:min-w-[140px]"
            >
              {nav.isLastStep ? "Finalizar" : "Siguiente"}
            </Button>

            {nav.showCompleteGym && (
              <Button
                variant="success"
                size="md"
                onClick={nav.onCompleteGym}
                aria-label="Completar gimnasio"
                className="bg-emerald-800/90 hover:bg-emerald-700 border-emerald-600/40"
              >
                Completar Gym
              </Button>
            )}

            <div className="hidden md:flex items-center gap-2 ml-1 pl-3 border-l border-neutral-700">
              <Button variant="danger" size="sm" onClick={nav.onFinish} aria-label="Terminar ruta">
                Terminar
              </Button>
              <Button variant="ghost" size="sm" onClick={nav.onRouteReset} aria-label="Reiniciar ruta">
                Reiniciar
              </Button>
            </div>
          </div>

          <div className="flex md:hidden items-center justify-center gap-2">
            <Button variant="danger" size="sm" onClick={nav.onFinish}>
              Terminar
            </Button>
            <Button variant="ghost" size="sm" onClick={nav.onRouteReset}>
              Reiniciar
            </Button>
          </div>

          <FooterProgress percent={nav.progressPercent} label={nav.progressLabel} />

          {showGymTimer(guideId) && (
            <GymFarmingBar
              timerIsRunning={gym.timerIsRunning}
              timerStartTime={gym.timerStartTime}
              timerElapsed={gym.timerElapsed}
              onStartTimer={gym.onStartTimer}
              onPauseTimer={gym.onPauseTimer}
              onResetTimer={gym.onResetTimer}
              cooldownEndAt={gym.cooldownEndAt}
              onShowCooldownNotice={gym.onShowCooldownNotice}
              onStartCooldown={gym.onStartCooldown}
              onOpenCooldownEditor={gym.onEditCooldown}
              sessionGymCount={gym.sessionGymCount}
              totalGyms={gym.totalGyms}
            />
          )}
        </div>
      </div>
    </footer>
  );
}
