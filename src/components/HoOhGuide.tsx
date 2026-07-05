"use client";

import React, { useState } from "react";
import { X, Info } from "lucide-react";
import { HOOH_TEAM, HOOH_TURNS, HOOH_GUIDE, HoOhPokemon, HoOhTurn, TurnConditional } from "@/data/hoohGuide";

const SPRITE_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";

type AccentMap = Record<string, { border: string; bg: string; text: string; ring: string }>;

const ACCENTS: AccentMap = {
  indigo: { border: "border-indigo-500/20", bg: "bg-indigo-950/50", text: "text-indigo-300", ring: "bg-indigo-600" },
  orange: { border: "border-orange-500/20", bg: "bg-orange-950/50", text: "text-orange-300", ring: "bg-orange-600" },
  sky:    { border: "border-sky-500/20",    bg: "bg-sky-950/50",    text: "text-sky-300",    ring: "bg-sky-600" },
};

const BADGE_COLORS: Record<string, string> = {
  blue:   "bg-blue-500/20 text-blue-300 border-blue-600/30",
  red:    "bg-red-500/20 text-red-300 border-red-600/30",
  yellow: "bg-yellow-500/20 text-yellow-300 border-yellow-600/30",
};

const SpriteImg = ({ src, name, className = "" }: { src: string; name: string; className?: string }) => {
  const [errored, setErrored] = useState(false);
  return errored ? (
    <span className={`inline-block bg-neutral-800 rounded ${className || "w-10 h-10"}`} />
  ) : (
    <img
      src={src}
      alt={name}
      className={`object-contain ${className}`}
      loading="lazy"
      onError={() => setErrored(true)}
    />
  );
};

const PokemonCard = ({ pokemon }: { pokemon: HoOhPokemon }) => {
  const a = ACCENTS[pokemon.accent as keyof typeof ACCENTS] || ACCENTS.indigo;
  return (
    <div className={`bg-neutral-950 border ${a.border} rounded-xl p-3 md:p-4 transition-all hover:border-opacity-40`}>
      <div className="flex items-center gap-2.5 mb-2.5">
        <SpriteImg
          src={`${SPRITE_BASE}/${pokemon.spriteId}.png`}
          name={pokemon.name}
          className="w-10 h-10 md:w-12 md:h-12"
        />
        <div className="min-w-0">
          <div className={`font-black fs-small ${a.text}`}>
            {pokemon.name}{pokemon.form ? ` (${pokemon.form})` : ""}
          </div>
          <div className="fs-tiny text-neutral-500">
            Lv. {pokemon.level} · {pokemon.ability} · {pokemon.nature}
          </div>
        </div>
      </div>

      <div className="fs-tiny text-neutral-400 mb-1.5">
        EVs:{" "}
        {Object.entries(pokemon.evs)
          .map(([k, v]) => `${v} ${k}`)
          .join(" / ")}
      </div>
      <div className="fs-tiny text-neutral-500 mb-2">
        IVs:{" "}
        {Object.entries(pokemon.ivs)
          .map(([k, v]) => `${v} ${k === "Ataque" ? "Atk" : k}`)
          .join(" · ")}
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        <span className={`fs-tiny font-bold px-1.5 py-0.5 rounded ${a.bg} border ${a.border} ${a.text}`}>
          {pokemon.item}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1">
        {pokemon.moves.map((m) => (
          <span
            key={m}
            className={`fs-tiny ${a.bg} border ${a.border} px-1.5 py-0.5 rounded ${a.text}`}
          >
            {m}
          </span>
        ))}
      </div>
    </div>
  );
};

const ConditionalBadges = ({ conditionals }: { conditionals: TurnConditional[] }) => (
  <div className="flex flex-wrap gap-1.5 mt-1">
    {conditionals.map((c, i) => (
      <span
        key={i}
        className={`fs-tiny font-bold px-2 py-0.5 rounded-full border ${BADGE_COLORS[c.color] || BADGE_COLORS.blue}`}
      >
        {c.icon} {c.target}
        <span className="ml-1 font-normal opacity-80">→ {c.move}</span>
      </span>
    ))}
  </div>
);

const TurnCard = ({ turnData }: { turnData: HoOhTurn }) => {
  const getActionIcon = (type: string) => {
    if (type === "switch") return "🔄";
    if (type === "none") return "";
    return "✔";
  };

  return (
    <div className="bg-neutral-900/80 backdrop-blur-sm rounded-xl border border-neutral-800 p-3 md:p-4 transition-all hover:border-neutral-700 shadow-lg">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-800/60">
        <span className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center fs-tiny font-black text-indigo-400">
          {turnData.turn}
        </span>
        <span className="font-black fs-small text-white uppercase tracking-wider">
          Turno {turnData.turn}
        </span>
      </div>

      <div className="space-y-2">
        {turnData.actions.map((action, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <span className="text-base shrink-0 mt-0.5 w-5 text-center">{action.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold fs-small text-white">{action.pokemon}</span>
                {action.type !== "none" && (
                  <span className="fs-tiny text-emerald-400 font-bold shrink-0">
                    {getActionIcon(action.type)}
                  </span>
                )}
                {action.type === "none" ? (
                  <span className="fs-small text-neutral-600 italic">Sin acción</span>
                ) : action.type === "switch" ? (
                  <span className="fs-small text-amber-400">{action.action}</span>
                ) : (
                  <span className="fs-small text-neutral-300">{action.action}</span>
                )}
              </div>
              {action.conditionals && <ConditionalBadges conditionals={action.conditionals} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface HoOhGuideProps {
  onClose: () => void;
}

export default function HoOhGuide({ onClose }: HoOhGuideProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-950 border-b border-neutral-800 shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors fs-small font-bold"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          Volver al menú
        </button>
        <h1 className="fs-small font-black text-indigo-400 uppercase tracking-widest truncate mx-2">
          {HOOH_GUIDE.title}
        </h1>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-all shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-3 py-4 md:px-6 md:py-8 space-y-5 md:space-y-8">

          {/* Title Section */}
          <div className="text-center space-y-2">
            <span className="fs-tiny uppercase tracking-widest font-black text-indigo-400 border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 rounded-full inline-block">
              PokeMMO Boss Strategy
            </span>
            <h2 className="fs-hero2 font-black text-white leading-tight">
              {HOOH_GUIDE.title}
            </h2>
            <p className="fs-small text-neutral-400">
              por <span className="font-bold text-neutral-300">{HOOH_GUIDE.author}</span>
            </p>
            <p className="fs-body text-neutral-400 max-w-2xl mx-auto">
              {HOOH_GUIDE.description}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            {HOOH_GUIDE.stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 md:p-4 text-center hover:border-neutral-700 transition-all"
              >
                <div className="text-xl md:text-2xl mb-1">{stat.icon}</div>
                <div className={`fs-h3 font-black ${stat.color}`}>{stat.value}</div>
                <div className="fs-tiny text-neutral-500 uppercase tracking-wider mt-0.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Earnings Note */}
          <div className="bg-amber-950/15 border border-amber-700/30 rounded-xl p-3 md:p-4 text-center">
            <p className="fs-small text-amber-300 font-semibold">
              💰 {HOOH_GUIDE.earnings.total}
            </p>
            <p className="fs-tiny text-amber-200/60 mt-0.5">
              {HOOH_GUIDE.earnings.note}
            </p>
          </div>

          {/* Team Section */}
          <div>
            <h3 className="fs-h3 font-black text-white mb-3 md:mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              Equipo Recomendado
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
              {HOOH_TEAM.map((p) => (
                <PokemonCard key={p.name} pokemon={p} />
              ))}
            </div>
          </div>

          {/* Strategy Section */}
          <div>
            <h3 className="fs-h3 font-black text-white mb-3 md:mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
              Estrategia Paso a Paso
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
              {HOOH_TURNS.map((t) => (
                <TurnCard key={t.turn} turnData={t} />
              ))}
            </div>
          </div>

          {/* Extra Info Card */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 md:p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-900/40 border border-blue-700/30 flex items-center justify-center shrink-0 mt-0.5">
                <Info className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h4 className="font-black fs-body text-blue-300 mb-1">{HOOH_GUIDE.extraInfo.title}</h4>
                <p className="fs-small text-neutral-400 leading-relaxed">
                  {HOOH_GUIDE.extraInfo.content}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pb-4">
            <p className="fs-tiny text-neutral-600">
              Guía creada por <span className="font-semibold text-neutral-500">{HOOH_GUIDE.author}</span> · PokeMMO
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
