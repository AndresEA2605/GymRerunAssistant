"use client";

import React from "react";
import { getFooterVariant } from "@/lib/guide-footer";
import RoutesFooter, { type GymModuleActions, type RouteFooterActions } from "./RoutesFooter";
import HoOhFooter from "./HoOhFooter";

interface CategoryFooterProps {
  guideId: string;
  nav: RouteFooterActions;
  gym: GymModuleActions;
}

export default function CategoryFooter({ guideId, nav, gym }: CategoryFooterProps) {
  const variant = getFooterVariant(guideId);

  if (variant === "routes") {
    return <RoutesFooter guideId={guideId} nav={nav} gym={gym} />;
  }

  if (variant === "hooh") {
    return <HoOhFooter nav={nav} />;
  }

  return null;
}
