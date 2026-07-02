"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, CheckCircle, Clock, MessageCircle, Zap, Timer, Medal, Flame } from "lucide-react";
import { DailyTask, DailyTasksState } from "../types";

interface PoolTask {
  id: string;
  label: string;
  description: string;
  targetCount: number;
  targetElapsedMs?: number;
}

const TASK_POOL: PoolTask[] = [
  { id: "t1", label: "Aquecimento", description: "Completa 3 gimnasios", targetCount: 3 },
  { id: "t2", label: "5 Gyms", description: "Completa 5 gimnasios", targetCount: 5 },
  { id: "t3", label: "10 Gyms", description: "Llega a 10 gimnasios", targetCount: 10 },
  { id: "t4", label: "15 Gyms", description: "Meta principal: completa los 15 gimnasios", targetCount: 15 },
  { id: "t5", label: "20 Gyms", description: "Llega a 20 gimnasios", targetCount: 20 },
  { id: "t6", label: "25 Gyms", description: "Supera los 25 gimnasios", targetCount: 25 },
  { id: "t7", label: "30 Gyms", description: "Casi la full run: 30 gimnasios", targetCount: 30 },
  { id: "t8", label: "Full Run", description: "Completa los 33 gimnasios de una run", targetCount: 33 },
  { id: "t9", label: "Explorador", description: "Descubre 8 gimnasios diferentes", targetCount: 8 },
  { id: "t10", label: "Rápido", description: "Completa 8 gimnasios en menos de 12 min", targetCount: 8, targetElapsedMs: 12 * 60 * 1000 },
  { id: "t11", label: "Express", description: "10 gimnasios en menos de 18 min", targetCount: 10, targetElapsedMs: 18 * 60 * 1000 },
  { id: "t12", label: "Maratón", description: "La run dura más de 30 min", targetCount: 1, targetElapsedMs: 30 * 60 * 1000 },
  { id: "t13", label: "Acelerando", description: "Primeros 3 gimnasios en menos de 4 min", targetCount: 3, targetElapsedMs: 4 * 60 * 1000 },
  { id: "t14", label: "Ritmo Constante", description: "12 gimnasios en menos de 20 min", targetCount: 12, targetElapsedMs: 20 * 60 * 1000 },
  { id: "t15", label: "Calentamiento", description: "Completa 2 gimnasios", targetCount: 2 },
  { id: "t16", label: "Imparable", description: "Completa 18 gimnasios", targetCount: 18 },
  { id: "t17", label: "Medio Camino", description: "Llega a 7 gimnasios", targetCount: 7 },
  { id: "t18", label: "Décimo", description: "Completa exactamente 10 gimnasios", targetCount: 10 },
  { id: "t19", label: "Arrasando", description: "22 gimnasios en la run", targetCount: 22 },
  { id: "t20", label: "Sprint Final", description: "Completa 6 gimnasios seguidos", targetCount: 6 },
];

const TASKS_PER_DAY = 5;
const TASKS_LS_KEY = "pkmmo_daily_tasks";
const RESET_MS = 18 * 60 * 60 * 1000;

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function pickDailyTasks(dateSeed: number): PoolTask[] {
  const rng = seededRandom(dateSeed);
  const pool = [...TASK_POOL];
  const picked: PoolTask[] = [];
  for (let i = 0; i < TASKS_PER_DAY && pool.length > 0; i++) {
    const idx = Math.floor(rng() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked;
}

function getDateSeed(): number {
  const now = Date.now();
  return Math.floor(now / RESET_MS);
}

function poolToTasks(pool: PoolTask[]): DailyTask[] {
  return pool.map(t => ({
    id: t.id,
    label: t.label,
    description: t.description,
    targetCount: t.targetCount,
    targetElapsedMs: t.targetElapsedMs,
    currentCount: 0,
    completed: false,
  }));
}

function loadTasks(): DailyTasksState {
  try {
    const raw = localStorage.getItem(TASKS_LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DailyTasksState;
      if (parsed.lastResetAt && parsed.tasks) {
        if (Date.now() - parsed.lastResetAt < RESET_MS) return parsed;
      }
    }
  } catch {}
  const seed = getDateSeed();
  return { tasks: poolToTasks(pickDailyTasks(seed)), lastResetAt: Date.now() };
}

function saveTasks(state: DailyTasksState) {
  try { localStorage.setItem(TASKS_LS_KEY, JSON.stringify(state)); } catch {}
}

interface DailyTasksProps {
  gymsCompleted: number;
  timerElapsedMs?: number;
  isOpen: boolean;
  onToggle: () => void;
}

export default function DailyTasks({ gymsCompleted, timerElapsedMs = 0, isOpen, onToggle }: DailyTasksProps) {
  const [tasksState, setTasksState] = useState<DailyTasksState>(loadTasks);
  const [panelVisible, setPanelVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setPanelVisible(true));
    } else {
      setPanelVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    setTasksState(prev => {
      const elapsed = Date.now() - prev.lastResetAt;
      if (elapsed >= RESET_MS) {
        const seed = getDateSeed();
        const fresh: DailyTasksState = { tasks: poolToTasks(pickDailyTasks(seed)), lastResetAt: Date.now() };
        saveTasks(fresh);
        return fresh;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    setTasksState(prev => {
      const updated = prev.tasks.map(task => {
        let currentCount: number;
        if (task.targetElapsedMs != null) {
          currentCount = timerElapsedMs >= task.targetElapsedMs && gymsCompleted >= task.targetCount
            ? task.targetCount
            : Math.min(gymsCompleted, task.targetCount);
        } else {
          currentCount = Math.min(gymsCompleted, task.targetCount);
        }
        return {
          ...task,
          currentCount,
          completed: currentCount >= task.targetCount,
        };
      });
      const next: DailyTasksState = { ...prev, tasks: updated };
      saveTasks(next);
      return next;
    });
  }, [gymsCompleted, timerElapsedMs]);

  const timeUntilReset = (() => {
    const elapsed = Date.now() - tasksState.lastResetAt;
    const remaining = Math.max(0, RESET_MS - elapsed);
    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  })();

  const completedCount = tasksState.tasks.filter(t => t.completed).length;
  const totalCount = tasksState.tasks.length;
  const pendingCount = totalCount - completedCount;

  const icons = [Zap, Timer, Medal, Flame, CheckCircle];

  return (
    <>
      <div
        className="fixed right-3 z-50"
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 80px)" }}
      >
        {!isOpen && completedCount < totalCount && (
          <div className="absolute right-14 bottom-1 pointer-events-none select-none animate-bounce-slow">
            <div className="relative bg-indigo-600 text-white fs-tiny font-bold px-3.5 py-2 rounded-2xl shadow-lg whitespace-nowrap leading-tight"
              style={{ borderRadius: "18px 18px 4px 18px" }}
            >
              <span>¡Tareas diarias!</span>
              <div className="absolute -right-1.5 bottom-2 w-3 h-3 bg-indigo-600 rotate-45" style={{ borderRadius: "2px" }} />
            </div>
          </div>
        )}

        <button
          onClick={onToggle}
          title="Tareas diarias"
          className="relative w-14 h-14 rounded-full shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110 active:scale-95"
          style={{
            background: isOpen
              ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
              : "linear-gradient(135deg, #4f46e5, #7c3aed)",
            boxShadow: isOpen
              ? "0 4px 24px rgba(99,102,241,0.5)"
              : "0 4px 16px rgba(0,0,0,0.4)",
          }}
        >
          <MessageCircle className="w-6 h-6 text-white" />
          {pendingCount > 0 && !isOpen && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onToggle} />
          <div
            className={`fixed z-50 right-3 transition-all duration-300 ease-out ${
              panelVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 148px)", maxHeight: "calc(100dvh - 180px)" }}
          >
            <div
              className="w-[340px] max-w-[calc(100vw-24px)] bg-neutral-900/95 backdrop-blur-xl rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="shrink-0 flex items-center justify-between px-4 pt-3 pb-2 border-b border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black fs-small text-white">Tareas Diarias</h3>
                    <p className="fs-tiny text-neutral-500">{completedCount}/{totalCount} · Reset {timeUntilReset}</p>
                  </div>
                </div>
                <button onClick={onToggle} className="w-7 h-7 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-all shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-y-auto p-3 space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-indigo-500/20">
                    <MessageCircle className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-neutral-800 rounded-2xl px-3 py-2 max-w-[260px]"
                    style={{ borderRadius: "4px 16px 16px 16px" }}
                  >
                    <p className="fs-tiny text-neutral-300 leading-relaxed">
                      ¡Tareas del día! Completá gimnasios para ganar. 💪
                    </p>
                    <span className="fs-tiny text-neutral-600 mt-1 block">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {tasksState.tasks.map((task, idx) => {
                  const pct = Math.min(100, Math.round((task.currentCount / task.targetCount) * 100));
                  const Icon = icons[idx % icons.length];
                  return (
                    <div key={task.id} className="flex items-start gap-2 justify-end">
                      <div
                        className={`rounded-2xl px-3 py-2.5 min-w-[200px] max-w-[260px] transition-all ${
                          task.completed
                            ? "bg-emerald-700/40 border border-emerald-600/30"
                            : task.targetElapsedMs != null
                              ? "bg-amber-700/25 border border-amber-600/20"
                              : "bg-indigo-700/30 border border-indigo-600/25"
                        }`}
                        style={{ borderRadius: "16px 4px 16px 16px" }}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          {task.completed && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                          <span className={`font-black fs-tiny ${task.completed ? 'text-emerald-300' : task.targetElapsedMs != null ? 'text-amber-200' : 'text-indigo-200'}`}>
                            {task.label}
                          </span>
                          {task.targetElapsedMs != null && (
                            <Timer className={`w-3 h-3 ${task.completed ? 'text-emerald-400' : 'text-amber-300'}`} />
                          )}
                          <span className={`ml-auto fs-tiny font-bold ${task.completed ? 'text-emerald-400' : task.targetElapsedMs != null ? 'text-amber-300' : 'text-indigo-300'}`}>
                            {task.currentCount}/{task.targetCount}
                          </span>
                        </div>
                        <p className={`fs-tiny ${task.completed ? 'text-emerald-200/70' : task.targetElapsedMs != null ? 'text-amber-200/60' : 'text-indigo-200/60'} mb-2`}>
                          {task.description}
                          {task.targetElapsedMs != null && (
                            <span className="block mt-0.5 font-mono opacity-70">
                              ⏱ {Math.floor(task.targetElapsedMs / 60000)}min
                            </span>
                          )}
                        </p>
                        <div className="w-full h-1.5 bg-black/30 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${
                              task.completed
                                ? "bg-gradient-to-r from-emerald-400 to-emerald-300"
                                : task.targetElapsedMs != null
                                  ? "bg-gradient-to-r from-amber-500 to-orange-400"
                                  : "bg-gradient-to-r from-indigo-500 to-violet-500"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="fs-tiny text-neutral-600 mt-1 block">
                          {task.completed ? "✅ Completada" : `${pct}% completado`}
                        </span>
                      </div>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm ${
                        task.completed
                          ? "bg-emerald-600/30 border border-emerald-500/30"
                          : task.targetElapsedMs != null
                            ? "bg-amber-600/20 border border-amber-500/20"
                            : "bg-indigo-600/20 border border-indigo-500/20"
                      }`}>
                        <Icon className={`w-3.5 h-3.5 ${task.completed ? 'text-emerald-400' : task.targetElapsedMs != null ? 'text-amber-300' : 'text-indigo-300'}`} />
                      </div>
                    </div>
                  );
                })}

                {completedCount === totalCount && (
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-emerald-500/20">
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="bg-emerald-800/30 border border-emerald-700/30 rounded-2xl px-3 py-2 max-w-[260px]"
                      style={{ borderRadius: "4px 16px 16px 16px" }}
                    >
                      <p className="fs-tiny text-emerald-200 font-bold">¡Todas completadas! 🎉</p>
                      <p className="fs-tiny text-emerald-300/70 mt-0.5">Volvé en {timeUntilReset} para nuevas tareas.</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-neutral-600 to-neutral-700 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Clock className="w-3.5 h-3.5 text-neutral-300" />
                  </div>
                  <div className="bg-neutral-800 rounded-2xl px-3 py-2 max-w-[260px]"
                    style={{ borderRadius: "4px 16px 16px 16px" }}
                  >
                    <p className="fs-tiny text-neutral-400">
                      Tareas renovadas cada <span className="font-bold text-neutral-200">18h</span>. ¡Siempre hay nuevos desafíos!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
