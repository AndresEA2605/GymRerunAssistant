"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";
import { FooterProgress } from "./FooterProgress";
import type { RouteFooterActions } from "./RoutesFooter";

interface HoOhFooterProps {
  nav: RouteFooterActions;
}

export default function HoOhFooter({ nav }: HoOhFooterProps) {
  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-25 bg-neutral-950/95 border-t border-amber-500/25 backdrop-blur-md"
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
              aria-label="Turno anterior"
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
              aria-label={nav.isLastStep ? "Finalizar run Ho-Oh" : "Siguiente turno"}
              className="flex-1 min-w-[160px]"
              icon={<ChevronRight className="w-4 h-4" />}
            >
              {nav.isLastStep ? "¡Finalizar!" : "Siguiente"}
            </Button>

            <div className="hidden md:flex items-center gap-2 ml-1 pl-4 border-l border-neutral-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={nav.onRouteReset}
                aria-label="Reiniciar guía"
                className="hover:bg-neutral-800 px-3"
              >
                Reiniciar
              </Button>
            </div>
          </div>

          <div className="flex md:hidden items-center justify-center">
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
        </div>
      </div>
    </footer>
  );
}
