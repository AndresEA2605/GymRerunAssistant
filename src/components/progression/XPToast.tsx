"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Zap } from "lucide-react";

interface XPToastEntry {
  id: number;
  amount: number;
  label: string;
}

let _setXPToast: ((entry: XPToastEntry) => void) | null = null;
let _toastId = 0;

export function showXPToast(amount: number, label: string) {
  if (_setXPToast) {
    _setXPToast({ id: ++_toastId, amount, label });
  }
}

export default function XPToast() {
  const [toasts, setToasts] = useState<(XPToastEntry & { visible: boolean })[]>([]);

  useEffect(() => {
    _setXPToast = (entry) => {
      const full = { ...entry, visible: true };
      setToasts(prev => [...prev.slice(-4), full]);
      setTimeout(() => {
        setToasts(prev => prev.map(t => t.id === entry.id ? { ...t, visible: false } : t));
      }, 1800);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== entry.id));
      }, 2600);
    };
    return () => { _setXPToast = null; };
  }, []);

  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed bottom-24 right-4 z-[8000] flex flex-col-reverse gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-xl
            bg-neutral-900/90 border border-indigo-500/40
            shadow-lg shadow-indigo-950/40 backdrop-blur-sm
            transition-[opacity,transform] duration-700 ease-out
            ${t.visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-3 scale-95"}
          `}
        >
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-400/30">
            <Zap className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/30" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-black text-indigo-300">+{t.amount} XP</span>
            <span className="text-[10px] font-medium text-neutral-500 max-w-[140px] truncate">{t.label}</span>
          </div>
        </div>
      ))}
    </div>,
    document.body
  );
}
