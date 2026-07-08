"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, LogOut, Trophy, Flame, Star, Swords, Target, Flag, Clock, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProgression } from "@/hooks/useProgression";

interface ProfileDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileDashboard({ isOpen, onClose }: ProfileDashboardProps) {
  const { user, stats, logout } = useAuth();
  const { profile } = useProgression();

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen || !user) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/85 backdrop-blur-xl" />
      <div
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950 rounded-3xl border border-neutral-700/40 shadow-[0_0_80px_rgba(99,102,241,0.06)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 pt-5 pb-2 bg-gradient-to-b from-neutral-900 to-transparent">
          <h2 className="text-white font-black text-xl">Perfil</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-neutral-800/60 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-all shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 pb-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-indigo-500/20 shrink-0">
                {user.username.charAt(0).toUpperCase()}
              </div>
              {profile && (
                <div className="absolute -bottom-1.5 -right-1.5 bg-indigo-600 border-2 border-neutral-900 rounded-full w-7 h-7 flex items-center justify-center text-[11px] font-black text-white shadow-lg">
                  {profile.level}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-white font-black text-xl truncate">{user.username}</h2>
              <div className="text-neutral-500 text-sm truncate">{user.email}</div>
              {profile && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${Math.min(100, (profile.currentXP / profile.xpToNextLevel) * 100)}%` }} />
                  </div>
                  <span className="text-[10px] font-bold text-neutral-400 shrink-0">{profile.currentXP}/{profile.xpToNextLevel} XP</span>
                </div>
              )}
            </div>
          </div>

          {stats ? (
            <>
              {/* Stats Grid */}
              <div className="mt-6">
                <div className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 mb-2.5 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  Estadísticas
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { icon: <Swords className="w-4 h-4 text-rose-400" />, label: "Regiones", value: Math.floor(stats.totalGyms / 8) },
                    { icon: <Flag className="w-4 h-4 text-purple-400" />, label: "Ho-Oh", value: stats.totalHoohRuns },
                    { icon: <Clock className="w-4 h-4 text-indigo-400" />, label: "Tiempo", value: `${Math.floor(stats.totalTimeMs / 3600000)}h` },
                    { icon: <Trophy className="w-4 h-4 text-amber-400" />, label: "Promedio", value: `${Math.round(stats.totalGyms / Math.max(1, (stats.totalTimeMs || 1) / 86400000))}/d` },
                  ].map(s => (
                    <div key={s.label} className="flex flex-col items-center gap-1 px-1 py-2.5 rounded-xl bg-neutral-800/40 border border-neutral-800/30">
                      {s.icon}
                      <span className="text-xs font-black text-white">{s.value}</span>
                      <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Streaks */}
              <div className="mt-4 flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-950/20 border border-orange-800/20">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-bold text-orange-300">Racha: {stats.streaks.current}d</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/20 border border-amber-800/20">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-300">Mejor: {stats.streaks.best}d</span>
                </div>
              </div>
            </>
          ) : (
            <div className="mt-6 text-center text-neutral-500 fs-tiny">Cargando estadísticas...</div>
          )}

          {/* Logout */}
          <div className="mt-6 pt-4 border-t border-neutral-800/40">
            <button
              onClick={() => { logout(); onClose(); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-red-900/30 hover:border-red-800/50 transition-all text-sm font-bold"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
