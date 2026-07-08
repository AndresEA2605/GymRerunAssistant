"use client";

import React, { createContext, useState, useCallback, useRef, useEffect } from "react";
import { ProgressionManager } from "@/lib/progression/manager";
import type { ProgressionEvent, UserProfile, UserStatistics, TaskProgress } from "@/lib/progression/types";
import { useAuth } from "@/hooks/useAuth";
import LevelUpOverlay from "@/components/progression/LevelUpOverlay";
import XPToast, { showXPToast } from "@/components/progression/XPToast";

interface ProgressionContextType {
  manager: ProgressionManager | null;
  isLoaded: boolean;
  profile: UserProfile | null;
  stats: UserStatistics | null;
  notifications: ProgressionEvent[];
  grantXP: (amount: number, reason: string) => void;
  incrementStat: (key: keyof UserStatistics, amount?: number) => void;
  addRegion: (region: string) => void;
  checkTasks: () => void;
  claimTask: (taskId: string) => void;
  getTaskProgress: (taskId: string) => TaskProgress;
  setActiveTitle: (titleId: string) => void;
  dismissNotification: (id: string) => void;
  refreshFromServer: () => Promise<void>;
}

export const ProgressionContext = createContext<ProgressionContextType | null>(null);

export function ProgressionProvider({ children }: { children: React.ReactNode }) {
  const { user, token, refreshSession } = useAuth();
  const [manager, setManager] = useState<ProgressionManager | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [notifications, setNotifications] = useState<ProgressionEvent[]>([]);
  const managerRef = useRef<ProgressionManager | null>(null);
  const refreshSessionRef = useRef(refreshSession);
  const lastSaveRef = useRef<number>(0);
  const pendingSaveRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    refreshSessionRef.current = refreshSession;
  }, [refreshSession]);
  const loadFromServer = useCallback(async () => {
    if (!token) {
      setManager(null);
      setIsLoaded(true);
      return;
    }
    try {
      const res = await fetch("/api/auth/progression", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (data.ok) {
        const mgr = ProgressionManager.fromRedis(data.progression);
        if (user) mgr.initProfile(user.id, user.username);
        managerRef.current = mgr;
        setManager(mgr);
      } else {
        const mgr = new ProgressionManager();
        if (user) mgr.initProfile(user.id, user.username);
        managerRef.current = mgr;
        setManager(mgr);
      }
    } catch {
      const mgr = new ProgressionManager();
      if (user) mgr.initProfile(user.id, user.username);
      managerRef.current = mgr;
      setManager(mgr);
    }
    setIsLoaded(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.id, user?.username]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadFromServer(); }, [loadFromServer]);

  const saveToServer = useCallback(async (mgr: ProgressionManager) => {
    if (!token) return;
    // Debounce: batch saves - only write to Redis at most once every 2 minutes
    const now = Date.now();
    const MIN_SAVE_INTERVAL = 2 * 60 * 1000;
    if (pendingSaveRef.current) {
      clearTimeout(pendingSaveRef.current);
    }
    const doSave = async () => {
      lastSaveRef.current = Date.now();
      pendingSaveRef.current = null;
      try {
        await fetch("/api/auth/progression", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, data: mgr.toRedis() }),
        });
      } catch (e) { console.error("Progression save failed:", e); }
    };
    const timeSinceLast = now - lastSaveRef.current;
    if (timeSinceLast >= MIN_SAVE_INTERVAL) {
      // Enough time passed — save immediately
      await doSave();
    } else {
      // Schedule a save after the remaining interval
      pendingSaveRef.current = setTimeout(doSave, MIN_SAVE_INTERVAL - timeSinceLast);
    }
  }, [token]);

  const flushNotifications = useCallback((mgr: ProgressionManager) => {
    const newNotes = mgr.consumeNotifications();
    if (newNotes.length > 0) {
      setNotifications(prev => [...prev, ...newNotes].slice(-20));
    }
  }, []);

  const grantXP = useCallback((amount: number, reason: string) => {
    if (!managerRef.current) return;
    managerRef.current.grantXP(amount, reason);
    setManager(new ProgressionManager(managerRef.current.toRedis()));
    flushNotifications(managerRef.current);
    saveToServer(managerRef.current);
    showXPToast(amount, reason);
  }, [saveToServer, flushNotifications]);

  const incrementStat = useCallback((key: keyof UserStatistics, amount: number = 1) => {
    if (!managerRef.current) return;
    managerRef.current.incrementStat(key, amount);
    setManager(new ProgressionManager(managerRef.current.toRedis()));
    flushNotifications(managerRef.current);
    saveToServer(managerRef.current);
  }, [saveToServer, flushNotifications]);

  const addRegion = useCallback((region: string) => {
    if (!managerRef.current) return;
    managerRef.current.addRegion(region);
    saveToServer(managerRef.current);
  }, [saveToServer]);

  const checkTasks = useCallback(() => {
    if (!managerRef.current) return;
    managerRef.current.checkTasks();
    setManager(new ProgressionManager(managerRef.current.toRedis()));
    flushNotifications(managerRef.current);
    saveToServer(managerRef.current);
  }, [saveToServer, flushNotifications]);

  const claimTask = useCallback((taskId: string) => {
    if (!managerRef.current) return;
    managerRef.current.claimTaskReward(taskId);
    setManager(new ProgressionManager(managerRef.current.toRedis()));
    flushNotifications(managerRef.current);
    saveToServer(managerRef.current);
  }, [saveToServer, flushNotifications]);

  const getTaskProgress = useCallback((taskId: string): TaskProgress => {
    return managerRef.current?.getTaskProgress(taskId) ?? { id: taskId, currentCount: 0, completed: false, claimed: false };
  }, []);

  const setActiveTitle = useCallback((titleId: string) => {
    if (!managerRef.current) return;
    managerRef.current.setActiveTitle(titleId);
    setManager(new ProgressionManager(managerRef.current.toRedis()));
    saveToServer(managerRef.current);
  }, [saveToServer]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const refreshFromServer = useCallback(async () => {
    await loadFromServer();
  }, [loadFromServer]);

  return (
    <ProgressionContext.Provider value={{
      manager, isLoaded,
      profile: manager?.profile ?? null,
      stats: manager?.statistics ?? null,
      notifications,
      grantXP, incrementStat, addRegion,
      checkTasks, claimTask, getTaskProgress,
      setActiveTitle, dismissNotification, refreshFromServer,
    }}>
      <LevelUpOverlay />
      <XPToast />
      {children}
    </ProgressionContext.Provider>
  );
}
