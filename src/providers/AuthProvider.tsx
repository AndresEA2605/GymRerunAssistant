"use client";

import React, { createContext, useState, useEffect, useCallback, useRef } from "react";
import type { User, UserStats } from "@/lib/auth";

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

interface AuthContextType {
  user: User | null;
  stats: UserStats | null;
  token: string | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<{ error?: string }>;
  register: (email: string, username: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateStats: (stats: UserStats) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

function ls() {
  return typeof window !== "undefined" ? localStorage : null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityRef = useRef<NodeJS.Timeout | null>(null);

  const clearInactivity = useCallback(() => {
    if (inactivityRef.current) { clearTimeout(inactivityRef.current); inactivityRef.current = null; }
  }, []);

  const startInactivityTimer = useCallback(() => {
    clearInactivity();
    if (typeof window === "undefined") return;
    inactivityRef.current = setTimeout(() => {
      ls()?.removeItem("pkmmo_auth_token");
      setUser(null);
      setStats(null);
      setToken(null);
    }, INACTIVITY_TIMEOUT_MS);
  }, []);

  const resetInactivity = useCallback(() => {
    if (token) startInactivityTimer();
  }, [token, startInactivityTimer]);

  const refreshSession = useCallback(async () => {
    const stored = ls()?.getItem("pkmmo_auth_token") ?? null;
    if (!stored) {
      setUser(null);
      setStats(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: stored }),
      });
      const data = await res.json();

      if (data.user) {
        setUser(data.user);
        setStats(data.stats || null);
        setToken(stored);
      } else {
        ls()?.removeItem("pkmmo_auth_token");
        setUser(null);
        setStats(null);
        setToken(null);
      }
    } catch {
      setUser(null);
      setStats(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
    refreshRef.current = setInterval(refreshSession, 5 * 60 * 1000);
    return () => {
      if (refreshRef.current) clearInterval(refreshRef.current);
    };
  }, [refreshSession]);

  useEffect(() => {
    if (token) {
      startInactivityTimer();
      const events = ["mousedown", "keydown", "touchstart", "scroll"];
      events.forEach(e => window.addEventListener(e, resetInactivity));
      return () => {
        clearInactivity();
        events.forEach(e => window.removeEventListener(e, resetInactivity));
      };
    } else {
      clearInactivity();
    }
  }, [token, startInactivityTimer, clearInactivity, resetInactivity]);

  const login = useCallback(async (identifier: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const text = await res.text();
      let data: Record<string, unknown>;
      try { data = JSON.parse(text); } catch { return { error: `Respuesta no válida (${res.status}): ${text.substring(0, 200)}` }; }

      if (data.error) return { error: `${data.error}${data.detail ? ` [${data.detail}]` : ''}` };

      ls()?.setItem("pkmmo_auth_token", data.token as string);
      setUser(data.user as User);
      setToken(data.token as string);

      const statsRes = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: data.token }),
      });
      const statsData = await statsRes.json();
      setStats(statsData.stats || null);

      return {};
    } catch (e) {
      return { error: `Error de conexión: ${e instanceof Error ? e.message : String(e)}` };
    }
  }, []);

  const register = useCallback(async (email: string, username: string, password: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });
      const text = await res.text();
      let data: Record<string, unknown>;
      try { data = JSON.parse(text); } catch { return { error: `Respuesta no válida (${res.status}): ${text.substring(0, 200)}` }; }

      if (data.error) return { error: `${data.error}${data.detail ? ` [${data.detail}]` : ''}` };

      ls()?.setItem("pkmmo_auth_token", data.token as string);
      setUser(data.user as User);
      setToken(data.token as string);
      setStats({ totalGyms: 0, totalHoohRuns: 0, totalTimeMs: 0, streaks: { current: 0, best: 0 }, achievements: [] });

      return {};
    } catch (e) {
      return { error: `Error de conexión: ${e instanceof Error ? e.message : String(e)}` };
    }
  }, []);

  const logout = useCallback(async () => {
    clearInactivity();
    if (token) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
      } catch {}
    }
    ls()?.removeItem("pkmmo_auth_token");
    setUser(null);
    setStats(null);
    setToken(null);
  }, [token, clearInactivity]);

  const updateStats = useCallback((newStats: UserStats) => {
    setStats(newStats);
  }, []);

  return (
    <AuthContext.Provider value={{ user, stats, token, isLoading, login, register, logout, refreshSession, updateStats }}>
      {children}
    </AuthContext.Provider>
  );
}
