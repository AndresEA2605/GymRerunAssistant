"use client";

import React from "react";
import { LogOut, Zap, Trophy, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import UserStats from "./UserStats";

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfilePanel({ isOpen, onClose }: ProfilePanelProps) {
  const { user, stats, logout } = useAuth();

  if (!isOpen || !user) return null;

  const xpForNext = user.level * 100;
  const xpProgress = ((user.xp % 100) / 100) * 100;

  return (
    <div className="fixed inset-0 z-[90]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="fixed top-16 right-4 w-80 bg-neutral-900/95 backdrop-blur-xl rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-neutral-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-500/20">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-white font-black text-lg truncate">{user.username}</div>
              <div className="text-neutral-400 text-sm truncate">{user.email}</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-bold text-neutral-400">Nivel {user.level}</span>
              </div>
              <span className="text-xs text-neutral-500">{user.xp % 100} / 100 XP</span>
            </div>
            <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>
        </div>

        {stats && (
          <div className="p-4 border-b border-neutral-800">
            <UserStats stats={stats} />
          </div>
        )}

        <div className="p-3">
          <button
            onClick={() => { logout(); onClose(); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors text-sm font-bold"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}
