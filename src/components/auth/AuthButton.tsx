"use client";

import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProgression } from "@/hooks/useProgression";
import { XP_VALUES } from "@/lib/progression/xp-values";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import ProfileDashboard from "./ProfileDashboard";
import SyncModal from "./SyncModal";
import PasswordResetRequestModal from "./PasswordResetRequestModal";
import PasswordResetModal from "./PasswordResetModal";

export default forwardRef(function AuthButton(_props, ref) {
  const { user, token, isLoading, login, register } = useAuth();
  const { grantXP, isLoaded } = useProgression();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSync, setShowSync] = useState(false);
  const [showResetRequest, setShowResetRequest] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const prevUserRef = useRef(user);
  const loginXpGrantedRef = useRef(false);

  useImperativeHandle(ref, () => ({
    openRegister: () => setShowRegister(true),
    openLogin: () => setShowLogin(true),
  }));

  useEffect(() => {
    if (!isLoaded) return;
    if (user && !prevUserRef.current && !loginXpGrantedRef.current) {
      grantXP(XP_VALUES.loginBonus, "Inicio de sesión");
      loginXpGrantedRef.current = true;
    }
    prevUserRef.current = user;
  }, [user, isLoaded, grantXP]);

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
    const keys = ["gym_step", "gym_timer", "gym_history", "gym_cooldown", "all_cooldowns", "daily_tasks", "gym_count", "run_active_gym33", "run_active_hooh", "run_active_guide2", "run_step_gym33", "run_step_hooh", "run_step_guide2"];
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

      if (data.ok) {
        window.location.reload();
      }
    } catch {}
  };

  const handleRequestPasswordReset = async (email: string) => {
    try {
      const res = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.error && data.token) {
        setResetEmail(email);
        setResetToken(data.token);
      }
      return data;
    } catch {
      return { error: "No se pudo conectar con el servidor." };
    }
  };

  const handleResetPassword = async (email: string, token: string, password: string) => {
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });
      const data = await res.json();
      return data;
    } catch {
      return { error: "No se pudo conectar con el servidor." };
    }
  };

  if (isLoading) return null;

  return (
    <>
      {user ? (
        <button
          type="button"
          onClick={() => setShowProfile(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800/70 bg-neutral-900/60 px-2 py-1 text-[10px] font-bold text-white transition hover:border-indigo-400/25 hover:bg-neutral-800"
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-[9px] font-black">
            {user.username.charAt(0).toUpperCase()}
          </span>
          <span className="max-w-[60px] truncate">{user.username}</span>
        </button>
      ) : (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowRegister(true)}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-xs transition hover:from-indigo-500 hover:to-violet-500"
          >
            Registrate
          </button>
          <button
            type="button"
            onClick={() => setShowLogin(true)}
            className="inline-flex items-center justify-center rounded-full border border-neutral-700/60 bg-neutral-900/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-200 transition hover:border-indigo-400/30 hover:bg-neutral-800"
          >
            Login
          </button>
        </div>
      )}

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true); }}
        onLogin={login}
        onForgotPassword={() => { setShowLogin(false); setShowResetRequest(true); }}
      />

      <RegisterModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }}
        onRegister={register}
      />

      <PasswordResetRequestModal
        isOpen={showResetRequest}
        onClose={() => setShowResetRequest(false)}
        onRequestReset={async (email) => {
          const result = await handleRequestPasswordReset(email);
          if (!result.error) {
            setShowResetRequest(false);
            setShowResetPassword(true);
          }
          return result;
        }}
      />

      <PasswordResetModal
        isOpen={showResetPassword}
        onClose={() => setShowResetPassword(false)}
        onReset={handleResetPassword}
        email={resetEmail}
        token={resetToken}
      />

      <ProfileDashboard
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
});
