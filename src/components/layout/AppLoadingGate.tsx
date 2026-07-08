"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";

export default function AppLoadingGate({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-neutral-950 flex flex-col items-center justify-center gap-8 loading-screen">
        {/* Ambient glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-64 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-48 bg-violet-500/8 blur-3xl rounded-full pointer-events-none" />

        <div className="relative flex flex-col items-center gap-6">
          {/* Pokémon sprite */}
          <div className="relative poke-aura poke-glow-indigo">
            <img
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/94.gif"
              alt="Cargando"
              className="w-24 h-24 object-contain"
              style={{ imageRendering: "auto" }}
            />
          </div>

          {/* Title */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-black text-white tracking-tight">
              POKE ASSISTANT
            </h1>
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
              PokeMMO Speedrun Tool
            </p>
          </div>

          {/* Loading bar */}
          <div className="w-48 h-1 bg-neutral-800 rounded-full overflow-hidden">
            <div className="h-full progress-shimmer rounded-full" style={{ width: "100%" }} />
          </div>

          {/* Bouncing dots */}
          <div className="flex gap-1.5">
            {[0, 150, 300].map((delay, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
