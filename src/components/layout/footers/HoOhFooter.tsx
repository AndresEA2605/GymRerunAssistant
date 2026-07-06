"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";
import { FooterProgress } from "./FooterProgress";
import type { RouteFooterActions } from "./RoutesFooter";

interface HoOhFooterProps {
  nav: RouteFooterActions;
}

export function HoOhFooterInner({ nav }: HoOhFooterProps) {
  return (
    <div className="mx-auto w-full max-w-5xl px-3 py-2 sm:px-6">
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={nav.onPrev}
            disabled={nav.prevDisabled}
            aria-label="Turno anterior"
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
            aria-label={nav.isLastStep ? "Finalizar run Ho-Oh" : "Siguiente turno"}
            className="flex-1 min-w-[118px] max-w-[180px]"
            icon={<ChevronRight className="w-4 h-4" />}
          >
            {nav.isLastStep ? "¡Finalizar!" : "Siguiente"}
          </Button>
        </div>

        <div className="flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={nav.onRouteReset}
            className="px-3"
          >
            Reiniciar
          </Button>
        </div>

        <FooterProgress percent={nav.progressPercent} label={nav.progressLabel} />
      </div>
    </div>
  );
}

export default function HoOhFooter({ nav }: HoOhFooterProps) {
  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-25 bg-neutral-950/95 border-t border-amber-500/25 backdrop-blur-md lg:static lg:fixed lg:right-0 lg:top-0 lg:bottom-0 lg:left-auto lg:w-[340px] lg:border-t-0 lg:border-l"
      style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))", paddingTop: "8px" }}
      role="contentinfo"
    >
      <div className="h-full lg:h-full">
        <HoOhFooterInner nav={nav} />
      </div>
    </footer>
  );
}
