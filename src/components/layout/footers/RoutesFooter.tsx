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
      className="fixed bottom-0 left-0 right-0 z-25 bg-neutral-950/95 border-t border-indigo-500/30 backdrop-blur-md"
      style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))", paddingTop: "12px" }}
      role="contentinfo"
    >
      <div className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Button
              variant="secondary"
              size="md"
              onClick={nav.onPrev}
              disabled={nav.prevDisabled}
              aria-label="Gimnasio anterior"
              className="flex-1 min-w-[140px]"
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
              className="flex-1 min-w-[160px]"
              icon={<ChevronRight className="w-4 h-4" />}
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

            <div className="hidden md:flex items-center gap-2 ml-1 pl-4 border-l border-neutral-800">
              <Button
                variant="danger"
                size="sm"
                onClick={nav.onFinish}
                aria-label="Terminar ruta"
                className="hover:bg-red-800 px-3"
              >
                Terminar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={nav.onRouteReset}
                aria-label="Reiniciar ruta"
                className="hover:bg-neutral-800 px-3"
              >
                Reiniciar
              </Button>
            </div>
          </div>

            <div className="flex md:hidden items-center justify-center gap-3">
              <Button
                variant="danger"
                size="sm"
                onClick={nav.onFinish}
                className="hover:bg-red-800 px-3"
              >
                Terminar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={nav.onRouteReset}
                className="hover:bg-neutral-800 px-3"
              >
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
