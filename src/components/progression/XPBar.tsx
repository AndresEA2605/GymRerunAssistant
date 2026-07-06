"use client";

import React from "react";
import { Zap } from "lucide-react";
import { xpProgressInLevel, xpForLevel, xpToNextLevel } from "@/lib/progression/xp";

interface XPBarProps {
  level: number;
  totalXP: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export default function XPBar({ level, totalXP, size = "md", showLabel = true, className = "" }: XPBarProps) {
  const progress = xpProgressInLevel(totalXP);
  const currentLevelXP = xpForLevel(level);
  const needed = xpToNextLevel(level);
  const current = totalXP - currentLevelXP;

  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-4" };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Zap className={`${size === "sm" ? "w-3 h-3" : "w-4 h-4"} text-amber-400 fill-amber-400`} />
            <span className={`font-black text-white ${size === "sm" ? "text-xs" : "text-sm"}`}>Nivel {level}</span>
          </div>
          <span className={`${size === "sm" ? "text-[10px]" : "text-xs"} text-neutral-500 font-bold`}>
            {current} / {needed} XP
          </span>
        </div>
      )}
      <div className={`w-full ${heights[size]} bg-neutral-800 rounded-full overflow-hidden`}>
        <div
          className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 rounded-full transition-all duration-700 ease-out relative"
          style={{ width: `${Math.max(progress, 2)}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20 rounded-full" />
        </div>
      </div>
      {showLabel && (
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-neutral-600 font-bold">{needed} XP para nivel {level + 1}</span>
          <span className="text-[10px] text-neutral-600 font-bold">{progress.toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
}
