"use client";

import React, { useState, useEffect } from "react";
import { LogIn, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import ProfilePanel from "./ProfilePanel";
import SyncModal from "./SyncModal";

export default function AuthButton() {
  const { user, token, isLoading, login, register } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSync, setShowSync] = useState(false);

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
        <button
          onClick={() => setShowLogin(true)}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 hover:border-indigo-500/50 transition-all text-indigo-300 hover:text-indigo-200"
        >
          <LogIn className="w-4 h-4 shrink-0" />
          <span className="fs-tiny font-bold">Iniciar sesión</span>
        </button>
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
