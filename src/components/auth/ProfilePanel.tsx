"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { LogOut, Zap, Trophy, Shield, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import UserStats from "./UserStats";

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfilePanel({ isOpen, onClose }: ProfilePanelProps) {
  const { user, stats, logout } = useAuth();

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const xpForNext = user.level * 100;
  const xpProgress = ((user.xp % 100) / 100) * 100;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center animate-in fade-in duration-200" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      <div
        className="relative z-10 w-full max-w-sm mx-4 bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950 rounded-3xl border border-neutral-700/50 shadow-[0_0_80px_rgba(99,102,241,0.08)] overflow-hidden animate-in zoom-in-95 fade-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-neutral-800/60 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-all z-10">
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-indigo-500/25 shrink-0">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-white font-black text-xl truncate">{user.username}</div>
              <div className="text-neutral-400 text-sm truncate">{user.email}</div>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-neutral-300">Nivel {user.level}</span>
              </div>
              <span className="text-xs text-neutral-500 font-bold">{user.xp % 100} / {xpForNext} XP</span>
            </div>
            <div className="w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>
        </div>

        {stats && (
          <div className="px-6 pb-4">
            <UserStats stats={stats} />
          </div>
        )}

        <div className="p-4 border-t border-neutral-800/50">
          <button
            onClick={() => { logout(); onClose(); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-red-900/30 hover:border-red-800/50 transition-all text-sm font-bold"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
