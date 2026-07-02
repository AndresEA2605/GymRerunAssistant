"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle, Clock, MessageCircle } from "lucide-react";
import { DailyTask, DailyTasksState } from "../types";

const DAILY_TASKS_SEED: DailyTask[] = [
  {
    id: "gyms_10",
    label: "10 Gyms",
    description: "Completa 10 gimnasios",
    targetCount: 10,
    currentCount: 0,
    completed: false,
  },
  {
    id: "gyms_15",
    label: "15 Gyms (Diaria)",
    description: "Completa 15 gimnasios — tarea diaria completada",
    targetCount: 15,
    currentCount: 0,
    completed: false,
  },
];

const TASKS_LS_KEY = "pkmmo_daily_tasks";
const RESET_MS = 18 * 60 * 60 * 1000;

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
  return { tasks: DAILY_TASKS_SEED.map(t => ({ ...t })), lastResetAt: Date.now() };
}

function saveTasks(state: DailyTasksState) {
  try { localStorage.setItem(TASKS_LS_KEY, JSON.stringify(state)); } catch {}
}

interface DailyTasksProps {
  gymsCompleted: number;
  isOpen: boolean;
  onToggle: () => void;
}

export default function DailyTasks({ gymsCompleted, isOpen, onToggle }: DailyTasksProps) {
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
        const fresh: DailyTasksState = { tasks: DAILY_TASKS_SEED.map(t => ({ ...t })), lastResetAt: Date.now() };
        saveTasks(fresh);
        return fresh;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    setTasksState(prev => {
      const updated = prev.tasks.map(task => ({
        ...task,
        currentCount: Math.min(gymsCompleted, task.targetCount),
        completed: Math.min(gymsCompleted, task.targetCount) >= task.targetCount,
      }));
      const next: DailyTasksState = { ...prev, tasks: updated };
      saveTasks(next);
      return next;
    });
  }, [gymsCompleted]);

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
        <div
          className={`fixed inset-0 z-50 flex justify-end transition-all duration-300 ease-out ${
            panelVisible ? "bg-black/60" : "bg-transparent pointer-events-none"
          }`}
          onClick={onToggle}
        >
          <div
            className={`w-full max-w-sm bg-neutral-900 h-full overflow-y-auto shadow-2xl border-l border-neutral-800 transition-all duration-300 ease-out ${
              panelVisible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
            }`}
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-gradient-to-b from-neutral-900 to-neutral-900/95 backdrop-blur-sm px-4 pt-4 pb-3 border-b border-neutral-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black fs-body text-white">Tareas Diarias</h3>
                    <p className="fs-tiny text-neutral-500">{completedCount}/{totalCount} · Reset {timeUntilReset}</p>
                  </div>
                </div>
                <button onClick={onToggle} className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 mt-1 shadow-md shadow-indigo-500/20">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div className="bg-neutral-800 rounded-2xl px-3.5 py-2.5 max-w-[85%]"
                  style={{ borderRadius: "4px 18px 18px 18px" }}
                >
                  <p className="fs-small text-neutral-300 leading-relaxed">
                    ¡Hola! Estas son tus tareas disponibles. Completa los gimnasios para ganar. 💪
                  </p>
                  <span className="fs-tiny text-neutral-600 mt-1 block">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              {tasksState.tasks.map((task, idx) => {
                const pct = Math.min(100, Math.round((task.currentCount / task.targetCount) * 100));
                return (
                  <div key={task.id} className="flex items-start gap-2.5 justify-end">
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 max-w-[85%] transition-all ${
                        task.completed
                          ? "bg-emerald-700/40 border border-emerald-600/30"
                          : "bg-indigo-700/30 border border-indigo-600/25"
                      }`}
                      style={{ borderRadius: "18px 4px 18px 18px" }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        {task.completed && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        <span className={`font-black fs-small ${task.completed ? 'text-emerald-300' : 'text-indigo-200'}`}>
                          {task.label}
                        </span>
                        <span className={`ml-auto fs-tiny font-bold ${task.completed ? 'text-emerald-400' : 'text-indigo-300'}`}>
                          {task.currentCount}/{task.targetCount}
                        </span>
                      </div>
                      <p className={`fs-tiny ${task.completed ? 'text-emerald-200/70' : 'text-indigo-200/60'} mb-2`}>
                        {task.description}
                      </p>
                      <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out ${
                            task.completed
                              ? "bg-gradient-to-r from-emerald-400 to-emerald-300"
                              : "bg-gradient-to-r from-indigo-500 to-violet-500"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="fs-tiny text-neutral-600 mt-1.5 block">
                        {task.completed ? "✅ Completada" : `${pct}% completado`}
                      </span>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-md ${
                      task.completed
                        ? "bg-emerald-600/30 border border-emerald-500/30"
                        : "bg-indigo-600/20 border border-indigo-500/20"
                    }`}>
                      <span className={`text-xs font-black ${task.completed ? 'text-emerald-400' : 'text-indigo-300'}`}>
                        {idx + 1}
                      </span>
                    </div>
                  </div>
                );
              })}

              {completedCount === totalCount && (
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 mt-1 shadow-md shadow-emerald-500/20">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-emerald-800/30 border border-emerald-700/30 rounded-2xl px-3.5 py-2.5 max-w-[85%]"
                    style={{ borderRadius: "4px 18px 18px 18px" }}
                  >
                    <p className="fs-small text-emerald-200 font-bold">¡Todas las tareas completadas! 🎉</p>
                    <p className="fs-tiny text-emerald-300/70 mt-0.5">Vuelve cuando se reinicien en {timeUntilReset}.</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 mt-1 shadow-md shadow-indigo-500/20">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div className="bg-neutral-800 rounded-2xl px-3.5 py-2 max-w-[85%]"
                  style={{ borderRadius: "4px 18px 18px 18px" }}
                >
                  <p className="fs-tiny text-neutral-400">
                    Las tareas se reinician automáticamente cada <span className="font-bold text-neutral-200">18h</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
