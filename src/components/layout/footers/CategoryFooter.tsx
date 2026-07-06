"use client";

import React from "react";
import { getFooterVariant } from "@/lib/guide-footer";
import RoutesFooter, { RoutesFooterInner, type GymModuleActions, type RouteFooterActions } from "./RoutesFooter";
import HoOhFooter, { HoOhFooterInner } from "./HoOhFooter";

interface CategoryFooterProps {
  guideId: string;
  nav: RouteFooterActions;
  gym: GymModuleActions;
}

export default function CategoryFooter({ guideId, nav, gym }: CategoryFooterProps) {
  const variant = getFooterVariant(guideId);

  if (variant === "minimal") return null;

  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-25 bg-neutral-950/95 border-t backdrop-blur-md lg:pl-[280px]"
      style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))", paddingTop: "8px" }}
      role="contentinfo"
    >
      {variant === "routes" && <RoutesFooterInner guideId={guideId} nav={nav} gym={gym} />}
      {variant === "hooh" && <HoOhFooterInner nav={nav} />}
    </footer>
  );
}
