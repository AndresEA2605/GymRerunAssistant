"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Trophy, Zap, Star } from "lucide-react";
import { useProgression } from "@/hooks/useProgression";
import { useAuth } from "@/hooks/useAuth";
import { LEVEL_MILESTONES } from "@/lib/progression/xp";

export default function LevelUpOverlay() {
  const { profile } = useProgression();
  const { user } = useAuth();
  const [prevLevel, setPrevLevel] = useState<number | null>(null);
  const [prevUser, setPrevUser] = useState<string | undefined>(user?.id);
  const [showLevel, setShowLevel] = useState<number | null>(null);

  useEffect(() => {
    if (profile) {
      // Si el usuario cambió (ej. acaba de iniciar sesión), reiniciamos el trackeo sin animar
      if (user?.id !== prevUser) {
        setPrevLevel(profile.level);
        setPrevUser(user?.id);
        return;
      }
      
      if (prevLevel === null) {
        setPrevLevel(profile.level);
      } else if (profile.level > prevLevel) {
        setShowLevel(profile.level);
        setPrevLevel(profile.level);
      } else if (profile.level < prevLevel) {
        setPrevLevel(profile.level);
      }
    }
  }, [profile?.level, prevLevel, profile, user?.id, prevUser]);

  if (showLevel === null) return null;

  const milestone = LEVEL_MILESTONES[showLevel];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-500 pointer-events-auto" 
        onClick={() => setShowLevel(null)} 
      />
      <div className="relative animate-in zoom-in-50 fade-in duration-500 slide-in-from-bottom-10 flex flex-col items-center justify-center drop-shadow-[0_0_80px_rgba(99,102,241,0.6)] pointer-events-auto">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-500/30 blur-3xl rounded-full" />
        
        {/* Trophy icon */}
        <div className="relative z-10 p-5 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 shadow-2xl border-4 border-indigo-300 mb-6 animate-bounce">
          <Trophy className="w-16 h-16 text-white" />
          <div className="absolute -top-2 -right-2 p-1.5 rounded-full bg-amber-400 animate-spin-slow">
            <Star className="w-6 h-6 text-amber-900 fill-amber-900" />
          </div>
        </div>

        <h1 className="relative z-10 text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-indigo-200 tracking-tight text-center drop-shadow-xl mb-1">
          ¡NIVEL {showLevel}!
        </h1>
        
        <p className="relative z-10 text-lg md:text-xl font-bold text-indigo-300 mb-2 tracking-wide text-center uppercase">
          {milestone?.title ? `Has alcanzado: ${milestone.title}` : '¡Sigue así!'}
        </p>

        <div className="relative z-10 text-xs font-bold text-indigo-200/60 mb-5 uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full border border-indigo-500/20">
          Siguiente nivel: {showLevel + 1}
        </div>

        {(milestone?.bonusXP || milestone?.bonusCoins) && (
          <div className="relative z-10 flex items-center gap-4 bg-neutral-900/80 border border-indigo-500/30 px-6 py-3 rounded-2xl mb-6">
            {milestone.bonusXP && (
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <span className="font-black text-amber-300">+{milestone.bonusXP} XP</span>
              </div>
            )}
            {milestone.bonusCoins && (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center text-[10px] font-black text-yellow-900">₽</div>
                <span className="font-black text-yellow-300">+{milestone.bonusCoins} Monedas</span>
              </div>
            )}
          </div>
        )}

        <button 
          onClick={() => setShowLevel(null)} 
          className="relative z-10 px-8 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold backdrop-blur-md border border-white/20 transition-all active:scale-95 shadow-xl"
        >
          Entendido
        </button>
      </div>
    </div>,
    document.body
  );
}
