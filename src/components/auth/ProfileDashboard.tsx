"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, LogOut, Zap, Flame, Trophy, Star, Flag, Clock, Route, Swords, Users, Footprints, Target, MapPin, Lock, Check, ChevronDown, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProgression } from "@/hooks/useProgression";
import XPBar from "@/components/progression/XPBar";
import { ACHIEVEMENTS } from "@/lib/progression/achievements";
import { TITLES } from "@/lib/progression/titles";
import { RARITY_COLORS } from "@/lib/progression/types";

interface ProfileDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatTime(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function AchievementCard({ id, unlocked }: { id: string; unlocked: boolean }) {
  const def = ACHIEVEMENTS.find(a => a.id === id);
  if (!def) return null;
  const colors = RARITY_COLORS[def.rarity] ?? RARITY_COLORS.common;
  return (
    <div className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border ${unlocked ? colors.border + ' ' + colors.bg : 'border-neutral-800/40 bg-neutral-900/30'} transition-all`}>
      <span className={`text-lg ${unlocked ? '' : 'grayscale opacity-40'}`}>{def.icon}</span>
      <div className="min-w-0 flex-1">
        <div className={`text-xs font-bold truncate ${unlocked ? 'text-white' : 'text-neutral-600'}`}>{def.name}</div>
        <div className={`text-[10px] truncate ${unlocked ? 'text-neutral-400' : 'text-neutral-700'}`}>{def.description}</div>
      </div>
      {unlocked ? (
        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
      ) : (
        <Lock className="w-3 h-3 text-neutral-700 shrink-0" />
      )}
    </div>
  );
}

export default function ProfileDashboard({ isOpen, onClose }: ProfileDashboardProps) {
  const { user, logout } = useAuth();
  const { profile, stats, setActiveTitle, manager, isLoaded } = useProgression();
  const [showTitlePicker, setShowTitlePicker] = useState(false);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const unlockedAchievementIds = Array.isArray(manager?.unlockedAchievements) ? manager.unlockedAchievements : [];
  const unlockedTitleIds = Array.isArray(manager?.unlockedTitles) ? manager.unlockedTitles : [];

  const displayStats = useMemo(() => [
    { icon: <Swords className="w-4 h-4 text-rose-400" />, label: "Gyms", value: stats?.gymsCompleted ?? 0 },
    { icon: <Target className="w-4 h-4 text-amber-400" />, label: "Guías", value: stats?.guidesFinished ?? 0 },
    { icon: <Flag className="w-4 h-4 text-purple-400" />, label: "Ho-Oh", value: stats?.hoohDefeats ?? 0 },
    { icon: <Swords className="w-4 h-4 text-red-400" />, label: "Red", value: stats?.redDefeats ?? 0 },
    { icon: <Users className="w-4 h-4 text-sky-400" />, label: "NPCs", value: stats?.npcsCompleted ?? 0 },
    { icon: <Clock className="w-4 h-4 text-indigo-400" />, label: "Tiempo", value: formatTime(stats?.totalTimeMs ?? 0) },
    { icon: <Footprints className="w-4 h-4 text-teal-400" />, label: "Pasos", value: stats?.totalStepsCompleted ?? 0 },
    { icon: <Route className="w-4 h-4 text-emerald-400" />, label: "Runs", value: stats?.totalTimeRuns ?? 0 },
  ], [stats]);

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/85 backdrop-blur-xl" />

      {!profile || !isLoaded ? (
        <div className="relative flex flex-col items-center gap-3 text-neutral-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          <span className="text-sm font-bold">Cargando perfil...</span>
        </div>
      ) : (
        <div
          className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950 rounded-3xl border border-neutral-700/40 shadow-[0_0_80px_rgba(99,102,241,0.06)]"
          onClick={e => e.stopPropagation()}
        >
          <button onClick={onClose} className="sticky top-3 float-right mr-3 z-20 w-9 h-9 rounded-full bg-neutral-800/60 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>

          <div className="px-6 pb-6 -mt-2">
            {/* Header */}
            <div className="flex items-center gap-4 pt-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-indigo-500/20 shrink-0">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-white font-black text-xl truncate">{user.username}</h2>
                  <span className="shrink-0 px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[9px] font-black uppercase tracking-wider">Nv.{profile.level}</span>
                </div>
                <div className="text-neutral-500 text-sm truncate">{user.email}</div>
              </div>
            </div>

            {/* XP Bar */}
            <div className="mt-4">
              <XPBar level={profile.level} totalXP={profile.totalXP} size="md" showLabel />
            </div>

            {/* Coins + Activity + Streak */}
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-amber-300">{profile.coins ?? 0}</span>
                <span className="text-[10px] text-neutral-600 font-bold">Monedas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-bold text-violet-300">{profile.activityPoints ?? 0}</span>
                <span className="text-[10px] text-neutral-600 font-bold">P. Actividad</span>
              </div>
              <div className="flex items-center gap-1.5 ml-auto">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-bold text-orange-300">{profile.currentStreak ?? 0}</span>
                <span className="text-[10px] text-neutral-600 font-bold">Racha</span>
              </div>
            </div>

            {/* Streak detail */}
            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-950/20 border border-orange-800/20">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-bold text-orange-300">Actual: {profile.currentStreak ?? 0}d</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/20 border border-amber-800/20">
                <Star className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-300">Mejor: {profile.bestStreak ?? 0}d</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/20 border border-indigo-800/20">
                <Trophy className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-indigo-300">Logros: {unlockedAchievementIds.length}/{ACHIEVEMENTS.length}</span>
              </div>
            </div>

            {/* Active Title */}
            <div className="mt-4">
              <div className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 mb-2 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5" />
                Título activo
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowTitlePicker(!showTitlePicker)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-neutral-800/50 border border-neutral-700/30 hover:border-neutral-600/50 transition-all"
                >
                  <div className="flex items-center gap-2">
                    {(() => {
                      const t = TITLES.find(t => t.id === profile.activeTitle);
                      return t ? <><span className="text-lg">{t.icon}</span><span className="text-sm font-bold text-white">{t.name}</span></> : <span className="text-sm text-neutral-500">Sin título</span>;
                    })()}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform ${showTitlePicker ? 'rotate-180' : ''}`} />
                </button>
                {showTitlePicker && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 p-2 rounded-xl bg-neutral-900 border border-neutral-700/50 shadow-xl z-20 max-h-44 overflow-y-auto space-y-1">
                    {TITLES.filter(t => unlockedTitleIds.includes(t.id)).map(t => {
                      const active = profile.activeTitle === t.id;
                      const colors = RARITY_COLORS[t.rarity] ?? RARITY_COLORS.common;
                      return (
                        <button
                          key={t.id}
                          onClick={() => { setActiveTitle(t.id); setShowTitlePicker(false); }}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                            active
                              ? `${colors.bg} ${colors.border} ${colors.text} shadow-sm`
                              : 'border-transparent text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50'
                          }`}
                        >
                          <span className="text-base">{t.icon}</span>
                          <span>{t.name}</span>
                          {active && <Check className="w-3.5 h-3.5 ml-auto shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="mt-4">
              <div className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 mb-2.5 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                Estadísticas
              </div>
              <div className="grid grid-cols-4 gap-2">
                {displayStats.map(s => (
                  <div key={s.label} className="flex flex-col items-center gap-1 px-1 py-2.5 rounded-xl bg-neutral-800/40 border border-neutral-800/30">
                    {s.icon}
                    <span className="text-xs font-black text-white">{s.value}</span>
                    <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Region Progress */}
            <div className="mt-4">
              <div className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Regiones completadas
              </div>
              <div className="flex flex-wrap gap-1.5">
                {stats?.regionsCompleted && stats.regionsCompleted.length > 0 ? (
                  stats.regionsCompleted.map(r => (
                    <span key={r} className="px-2.5 py-1 rounded-full bg-emerald-950/30 border border-emerald-800/30 text-emerald-400 text-[10px] font-bold">
                      {r}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-neutral-600">Ninguna región completada aún</span>
                )}
              </div>
            </div>

            {/* Achievements */}
            <div className="mt-4">
              <div className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 mb-2 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" />
                Logros
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {ACHIEVEMENTS.map(ach => (
                  <AchievementCard key={ach.id} id={ach.id} unlocked={unlockedAchievementIds.includes(ach.id)} />
                ))}
              </div>
            </div>

            {/* Logout */}
            <div className="mt-4 pt-4 border-t border-neutral-800/40">
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
      )}
    </div>,
    document.body
  );
}
