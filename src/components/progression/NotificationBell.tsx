"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, X, Zap, Trophy, Star, Flame, ArrowUp } from "lucide-react";
import { useProgression } from "@/hooks/useProgression";
import type { ProgressionEvent } from "@/lib/progression/types";

const EVENT_ICONS: Record<string, React.ReactNode> = {
  xp_gain:      <Zap className="w-4 h-4 text-amber-400" />,
  level_up:     <ArrowUp className="w-4 h-4 text-indigo-400" />,
  achievement:  <Trophy className="w-4 h-4 text-emerald-400" />,
  title:        <Star className="w-4 h-4 text-purple-400" />,
  task_complete:<Zap className="w-4 h-4 text-blue-400" />,
  streak:       <Flame className="w-4 h-4 text-orange-400" />,
  run_complete: <Trophy className="w-4 h-4 text-violet-400" />,
};

export default function NotificationBell() {
  const { notifications, dismissNotification } = useProgression();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const unread = notifications.length;
  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-full bg-neutral-800/60 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-all"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && unread > 0 && (
        <div className="absolute right-0 top-full mt-2 w-72 max-h-80 overflow-y-auto bg-neutral-900 border border-neutral-700/60 rounded-2xl shadow-2xl shadow-black/50 z-50 py-2">
          {notifications.slice().reverse().map(event => (
            <div key={event.id} className="flex items-start gap-2.5 px-3 py-2.5 hover:bg-neutral-800/60 transition-colors border-b border-neutral-800/30 last:border-0">
              <div className="shrink-0 mt-0.5">{EVENT_ICONS[event.type] || <Zap className="w-4 h-4 text-neutral-400" />}</div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-bold truncate">{event.message}</div>
                {event.detail && <div className="text-neutral-400 text-[10px] truncate">{event.detail}</div>}
                {event.coinAmount && <div className="text-amber-400 text-[10px] font-bold">+{event.coinAmount} monedas</div>}
              </div>
              {event.xpAmount && (
                <div className="shrink-0 text-amber-400 text-[10px] font-black">+{event.xpAmount} XP</div>
              )}
              <button onClick={() => dismissNotification(event.id)} className="shrink-0 text-neutral-600 hover:text-white transition-colors">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      {open && unread === 0 && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-neutral-900 border border-neutral-700/60 rounded-2xl shadow-2xl shadow-black/50 z-50 py-6 text-center">
          <Bell className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
          <p className="text-neutral-500 text-xs">Sin notificaciones</p>
        </div>
      )}
    </div>
  );
}
