"use client";

import React, { useState, useEffect, useRef } from "react";
import { LogIn, User, Zap, Trophy, Cloud, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProgression } from "@/hooks/useProgression";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import ProfilePanel from "./ProfilePanel";
import SyncModal from "./SyncModal";

export default function AuthButton() {
  const { user, token, isLoading, login, register } = useAuth();
  const { grantXP } = useProgression();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSync, setShowSync] = useState(false);
  const prevUserRef = useRef(user);

  useEffect(() => {
    if (user && !prevUserRef.current) {
      grantXP(25, "Inicio de sesión");
    }
    prevUserRef.current = user;
  }, [user]);

  useEffect(() => {
    if (user && token) {
      const hasSeenSync = sessionStorage.getItem("pkmmo_sync_seen");
      if (!hasSeenSync) {
        const localStep = localStorage.getItem("pkmmo_gym_step");
        const localHistory = localStorage.getItem("pkmmo_gym_history");
        const localTimer = localStorage.getItem("pkmmo_gym_timer");
        const hasData = (
          (localStep && localStep !== "0" && localStep !== "-1") ||
          (localHistory && localHistory !== "[]") ||
          (localTimer && localTimer !== '{"elapsed":0,"isRunning":false,"startedAt":null}')
        );
        if (hasData) {
          setShowSync(true);
        }
        sessionStorage.setItem("pkmmo_sync_seen", "true");
      }
    }
  }, [user, token]);

  const handleSync = async (mode: 'merge' | 'overwrite_cloud' | 'keep_cloud') => {
    if (!token) return;

    const localData: Record<string, string> = {};
    const keys = ["gym_step", "gym_timer", "gym_history", "gym_cooldown", "all_cooldowns", "daily_tasks", "run_active_gym33", "run_active_hooh", "run_active_guide2", "run_step_gym33", "run_step_hooh", "run_step_guide2"];
    keys.forEach(key => {
      const val = localStorage.getItem(`pkmmo_${key}`);
      if (val) localData[key] = val;
    });

    try {
      const res = await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, localData, mode }),
      });
      const data = await res.json();

      if (data.ok && data.cloudData) {
        Object.entries(data.cloudData).forEach(([key, value]) => {
          localStorage.setItem(`pkmmo_${key}`, value as string);
        });
        window.location.reload();
      }
    } catch {}
  };

  if (isLoading) return null;

  return (
    <>
      {user ? (
        <button
          onClick={() => setShowProfile(!showProfile)}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-neutral-800/60 border border-neutral-700/50 hover:bg-neutral-800 hover:border-neutral-600 transition-all group"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-black shrink-0 shadow-md shadow-indigo-500/20">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 text-left">
            <div className="text-white text-xs font-bold truncate">{user.username}</div>
            <div className="text-neutral-500 text-[10px] font-bold">Nivel {user.level}</div>
          </div>
        </button>
      ) : (
        <div className="space-y-2">
          <button
            onClick={() => setShowRegister(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white transition-all shadow-lg shadow-indigo-500/15"
          >
            <Star className="w-4 h-4 shrink-0 fill-current" />
            <span className="fs-tiny font-black">Registrate gratis</span>
          </button>

          <button
            onClick={() => setShowLogin(true)}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-neutral-800/60 border border-neutral-700/50 hover:bg-neutral-800 hover:border-neutral-600 transition-all text-neutral-300 hover:text-white"
          >
            <LogIn className="w-4 h-4 shrink-0" />
            <span className="fs-tiny font-bold">Ya tengo cuenta</span>
          </button>

          <div className="rounded-xl bg-gradient-to-b from-indigo-950/30 to-violet-950/20 border border-indigo-500/10 p-2.5 space-y-2">
            <div className="fs-[10px] uppercase tracking-[0.2em] text-indigo-400/70 font-black text-center">Beneficios</div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-amber-500/15 flex items-center justify-center shrink-0">
                  <Zap className="w-3 h-3 text-amber-400" />
                </div>
                <span className="fs-[11px] text-neutral-400 font-bold leading-tight">Subí de nivel completando runs</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-emerald-500/15 flex items-center justify-center shrink-0">
                  <Trophy className="w-3 h-3 text-emerald-400" />
                </div>
                <span className="fs-[11px] text-neutral-400 font-bold leading-tight">Desbloqueá logros y recompensas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-blue-500/15 flex items-center justify-center shrink-0">
                  <Cloud className="w-3 h-3 text-blue-400" />
                </div>
                <span className="fs-[11px] text-neutral-400 font-bold leading-tight">Sincronizá tu progreso en la nube</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true); }}
        onLogin={login}
      />

      <RegisterModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }}
        onRegister={register}
      />

      <ProfilePanel
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />

      <SyncModal
        isOpen={showSync}
        onClose={() => setShowSync(false)}
        onSync={handleSync}
      />
    </>
  );
}
