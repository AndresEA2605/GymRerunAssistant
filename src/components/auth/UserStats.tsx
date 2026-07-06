"use client";

import React from "react";
import { Trophy, Swords, Timer, Flame, Zap } from "lucide-react";
import type { UserStats } from "@/lib/auth";

interface UserStatsProps {
  stats: UserStats;
}

export default function UserStats({ stats }: UserStatsProps) {
  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="bg-neutral-800/60 rounded-xl p-2.5 border border-neutral-700/50">
        <div className="flex items-center gap-1.5 mb-1">
          <Swords className="w-3.5 h-3.5 text-indigo-400" />
          <span className="fs-[10px] text-neutral-500 font-bold uppercase tracking-wider">Gyms</span>
        </div>
        <div className="text-white font-black text-lg">{stats.totalGyms}</div>
      </div>

      <div className="bg-neutral-800/60 rounded-xl p-2.5 border border-neutral-700/50">
        <div className="flex items-center gap-1.5 mb-1">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="fs-[10px] text-neutral-500 font-bold uppercase tracking-wider">Ho-Oh</span>
        </div>
        <div className="text-white font-black text-lg">{stats.totalHoohRuns}</div>
      </div>

      <div className="bg-neutral-800/60 rounded-xl p-2.5 border border-neutral-700/50">
        <div className="flex items-center gap-1.5 mb-1">
          <Timer className="w-3.5 h-3.5 text-emerald-400" />
          <span className="fs-[10px] text-neutral-500 font-bold uppercase tracking-wider">Tiempo</span>
        </div>
        <div className="text-white font-black text-lg">{formatTime(stats.totalTimeMs)}</div>
      </div>

      <div className="bg-neutral-800/60 rounded-xl p-2.5 border border-neutral-700/50">
        <div className="flex items-center gap-1.5 mb-1">
          <Flame className="w-3.5 h-3.5 text-red-400" />
          <span className="fs-[10px] text-neutral-500 font-bold uppercase tracking-wider">Racha</span>
        </div>
        <div className="text-white font-black text-lg">{stats.streaks.current}</div>
      </div>
    </div>
  );
}
