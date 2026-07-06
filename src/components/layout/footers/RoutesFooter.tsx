"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";
import { FooterProgress } from "./FooterProgress";

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

export function RoutesFooterInner({ nav }: Pick<RoutesFooterProps, "nav">) {
  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-3 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={nav.onPrev}
            disabled={nav.prevDisabled}
            aria-label="Gimnasio anterior"
            className="flex-1 min-w-[118px] max-w-[180px]"
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
            className="flex-1 min-w-[118px] max-w-[180px]"
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
              className="flex-1 min-w-[132px] max-w-[190px]"
            >
              Completar Gym
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3 mt-1">
          <Button
            variant="danger"
            size="sm"
            onClick={nav.onFinish}
            aria-label="Terminar ruta"
            className="px-3 shrink-0"
          >
            Terminar
          </Button>
          
          <div className="flex-1">
            <FooterProgress percent={nav.progressPercent} label={nav.progressLabel} />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={nav.onRouteReset}
            aria-label="Reiniciar ruta"
            className="px-3 shrink-0"
          >
            Reiniciar
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function RoutesFooter({ guideId, nav, gym }: RoutesFooterProps) {
  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-25 bg-neutral-950/95 border-t border-indigo-500/30 backdrop-blur-md lg:static lg:fixed lg:right-0 lg:top-0 lg:bottom-0 lg:left-auto lg:w-[340px] lg:border-t-0 lg:border-l"
      style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))", paddingTop: "12px" }}
      role="contentinfo"
    >
      <div className="h-full lg:h-full">
        <RoutesFooterInner nav={nav} />
      </div>
    </footer>
  );
}
