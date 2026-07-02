"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, Target, CheckCircle, Clock } from "lucide-react";
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
        if (Date.now() - parsed.lastResetAt < RESET_MS) {
          return parsed;
        }
      }
    }
  } catch {}
  return { tasks: DAILY_TASKS_SEED.map(t => ({ ...t })), lastResetAt: Date.now() };
}

function saveTasks(state: DailyTasksState) {
  try {
    localStorage.setItem(TASKS_LS_KEY, JSON.stringify(state));
  } catch {}
}

interface DailyTasksProps {
  gymsCompleted: number;
  isOpen: boolean;
  onToggle: () => void;
}

export default function DailyTasks({ gymsCompleted, isOpen, onToggle }: DailyTasksProps) {
  const [tasksState, setTasksState] = useState<DailyTasksState>(loadTasks);

  useEffect(() => {
    setTasksState(prev => {
      const elapsed = Date.now() - prev.lastResetAt;
      if (elapsed >= RESET_MS) {
        const fresh: DailyTasksState = {
          tasks: DAILY_TASKS_SEED.map(t => ({ ...t })),
          lastResetAt: Date.now(),
        };
        saveTasks(fresh);
        return fresh;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    setTasksState(prev => {
      const updated = prev.tasks.map(task => {
        const current = Math.min(gymsCompleted, task.targetCount);
        return {
          ...task,
          currentCount: current,
          completed: current >= task.targetCount,
        };
      });
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

  return (
    <>
      <button
        onClick={onToggle}
        title="Tareas diarias"
        className={`fixed right-3 z-50 p-2.5 rounded-xl shadow-lg transition-all ${
          isOpen
            ? "bg-indigo-600 text-white shadow-indigo-500/30"
            : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 shadow-black/30"
        }`}
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 84px)" }}
      >
        <Target className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex justify-end" onClick={onToggle}>
          <div
            className="w-full max-w-xs bg-neutral-900 border-l border-neutral-800 h-full overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-950">
              <div>
                <h3 className="font-black fs-h3 text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-400" />
                  Tareas Diarias
                </h3>
                <p className="fs-tiny text-neutral-500 mt-0.5">
                  {completedCount}/{totalCount} completadas · Reset en {timeUntilReset}
                </p>
              </div>
              <button onClick={onToggle} className="text-neutral-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 space-y-3">
              {tasksState.tasks.map(task => {
                const pct = Math.min(100, Math.round((task.currentCount / task.targetCount) * 100));
                return (
                  <div
                    key={task.id}
                    className={`rounded-xl p-3 border transition-all ${
                      task.completed
                        ? "bg-emerald-950/30 border-emerald-700/50"
                        : "bg-neutral-950 border-neutral-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {task.completed && (
                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                          <span className={`font-black fs-small ${task.completed ? 'text-emerald-300' : 'text-white'}`}>
                            {task.label}
                          </span>
                        </div>
                        <p className="fs-tiny text-neutral-500 mt-0.5">{task.description}</p>
                      </div>
                      <span className={`fs-tiny font-bold whitespace-nowrap ${task.completed ? 'text-emerald-400' : 'text-indigo-400'}`}>
                        {task.currentCount}/{task.targetCount}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          task.completed
                            ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                            : "bg-gradient-to-r from-indigo-600 to-indigo-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-neutral-800 p-3 bg-neutral-950/50">
              <div className="flex items-center gap-2 text-neutral-500 fs-tiny">
                <Clock className="w-3.5 h-3.5" />
                <span>Las tareas se reinician automáticamente cada 18h</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
