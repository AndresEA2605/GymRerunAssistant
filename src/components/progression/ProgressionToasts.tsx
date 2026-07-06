"use client";

import React, { useEffect, useState } from "react";
import { Zap, Trophy, Star, Flame, ArrowUp, X } from "lucide-react";
import { useProgression } from "@/hooks/useProgression";
import type { ProgressionEvent } from "@/lib/progression/types";

const EVENT_ICONS: Record<string, React.ReactNode> = {
  xp_gain:      <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />,
  level_up:     <ArrowUp className="w-5 h-5 text-indigo-400" />,
  achievement:  <Trophy className="w-5 h-5 text-emerald-400" />,
  title:        <Star className="w-5 h-5 text-purple-400" />,
  task_complete:<Zap className="w-5 h-5 text-blue-400" />,
  streak:       <Flame className="w-5 h-5 text-orange-400" />,
  run_complete: <Trophy className="w-5 h-5 text-violet-400" />,
};

const EVENT_COLORS: Record<string, string> = {
  xp_gain:      'border-amber-500/30 bg-amber-950/80',
  level_up:     'border-indigo-500/30 bg-indigo-950/80',
  achievement:  'border-emerald-500/30 bg-emerald-950/80',
  title:        'border-purple-500/30 bg-purple-950/80',
  task_complete:'border-blue-500/30 bg-blue-950/80',
  streak:       'border-orange-500/30 bg-orange-950/80',
  run_complete: 'border-violet-500/30 bg-violet-950/80',
};

function Toast({ event, onDismiss }: { event: ProgressionEvent; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 400);
    }, 3500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-400 ${
        EVENT_COLORS[event.type] ?? 'border-neutral-700/30 bg-neutral-900/80'
      } ${visible ? 'opacity-100 translate-y-0 translate-x-0' : 'opacity-0 translate-y-4'}`}
      onClick={onDismiss}
    >
      <div className="shrink-0">{EVENT_ICONS[event.type]}</div>
      <div className="min-w-0 flex-1">
        <div className="text-white text-sm font-bold truncate">{event.message}</div>
        {event.detail && <div className="text-neutral-400 text-xs truncate">{event.detail}</div>}
      </div>
      {event.xpAmount && (
        <div className="shrink-0 text-amber-400 text-xs font-black">+{event.xpAmount} XP</div>
      )}
      <button onClick={(e) => { e.stopPropagation(); onDismiss(); }} className="shrink-0 text-neutral-500 hover:text-white transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function ProgressionToasts() {
  const { notifications, dismissNotification } = useProgression();
  const visible = notifications.slice(-4);

  if (visible.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[300] flex flex-col gap-2 w-80 pointer-events-auto">
      {visible.map(event => (
        <Toast key={event.id} event={event} onDismiss={() => dismissNotification(event.id)} />
      ))}
    </div>
  );
}
