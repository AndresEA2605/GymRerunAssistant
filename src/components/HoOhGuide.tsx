"use client";

import React, { useState, memo } from "react";
import { X, Info } from "lucide-react";
import { HOOH_TEAM, HOOH_TURNS, HOOH_GUIDE, HoOhPokemon, HoOhTurn, TurnConditional } from "@/data/hoohGuide";

const SPRITE_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated";

type AccentMap = Record<string, { border: string; bg: string; text: string }>;

const ACCENTS: AccentMap = {
  indigo: { border: "border-indigo-500/20", bg: "bg-indigo-950/50", text: "text-indigo-300" },
  orange: { border: "border-orange-500/20", bg: "bg-orange-950/50", text: "text-orange-300" },
  sky:    { border: "border-sky-500/20",    bg: "bg-sky-950/50",    text: "text-sky-300" },
};

const BADGE_COLORS: Record<string, string> = {
  blue:   "bg-blue-500/20 text-blue-300 border-blue-600/30",
  red:    "bg-red-500/20 text-red-300 border-red-600/30",
  yellow: "bg-yellow-500/20 text-yellow-300 border-yellow-600/30",
};

const PokeballSVG = ({ opacity = 0.18 }: { opacity?: number }) => (
  <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", opacity }}>
    <circle cx="50" cy="50" r="47" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="3"/>
    <path d="M 3 50 A 47 47 0 0 1 97 50 Z" fill="rgba(220,50,50,0.22)"/>
    <line x1="3" y1="50" x2="97" y2="50" stroke="rgba(255,255,255,0.35)" strokeWidth="3"/>
    <circle cx="50" cy="50" r="14" fill="rgba(10,10,15,0.8)" stroke="rgba(255,255,255,0.35)" strokeWidth="3"/>
    <circle cx="50" cy="50" r="7" fill="rgba(255,255,255,0.12)"/>
  </svg>
);

const POKEBALLS = [
  { x:"8%",  dur:32, del:0  }, { x:"22%", dur:26, del:7  },
  { x:"38%", dur:38, del:3  }, { x:"55%", dur:29, del:14 },
  { x:"70%", dur:35, del:5  }, { x:"84%", dur:24, del:19 },
  { x:"15%", dur:42, del:11 }, { x:"62%", dur:31, del:22 },
  { x:"90%", dur:45, del:2  },
];
const SIZES = [28, 20, 36, 16, 24, 32, 18, 22, 30];
const STARS = Array.from({length: 18}, (_, i) => ({
  x: `${(i * 37 + 11) % 100}%`,
  y: `${(i * 53 + 7)  % 100}%`,
  s: (i % 3) + 2,
  dur: 1.8 + (i % 5) * 0.6,
  del: (i * 0.37) % 4,
}));

const PokeBackground = memo(() => (
  <>
    <div className="aurora-bg" />
    {POKEBALLS.map((pb, i) => (
      <div
        key={i}
        className="pokeball-float"
        style={{
          "--pb-x": pb.x,
          "--pb-dur": `${pb.dur}s`,
          "--pb-del": `${pb.del}s`,
          width:  SIZES[i],
          height: SIZES[i],
        } as React.CSSProperties}
      >
        <PokeballSVG opacity={0.13 + (i % 3) * 0.03} />
      </div>
    ))}
    {STARS.map((s, i) => (
      <div
        key={i}
        className="star-twinkle"
        style={{
          left:   s.x,
          top:    s.y,
          width:  s.s,
          height: s.s,
          "--tw-dur": `${s.dur}s`,
          "--tw-del": `${s.del}s`,
        } as React.CSSProperties}
      />
    ))}
  </>
));
PokeBackground.displayName = "PokeBackground";

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

const PokemonCard = ({ pokemon, index }: { pokemon: HoOhPokemon; index: number }) => {
  const a = ACCENTS[pokemon.accent as keyof typeof ACCENTS] || ACCENTS.indigo;
  return (
    <div className={`reveal-${index + 2} bg-neutral-950/80 backdrop-blur-sm border ${a.border} rounded-xl p-3 md:p-4 transition-all hover:border-opacity-40 hover:bg-neutral-950/90 shadow-lg shadow-black/20`}>
      <div className="flex items-center gap-2.5 mb-2.5">
        <SpriteImg
          src={`${SPRITE_BASE}/${pokemon.spriteId}.gif`}
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
        <span className={`fs-tiny font-bold px-2 py-0.5 rounded-full ${a.bg} border ${a.border} ${a.text}`}>
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
  <div className="flex flex-wrap gap-1.5 mt-1.5">
    {conditionals.map((c, i) => (
      <span
        key={i}
        className={`fs-tiny font-bold px-2.5 py-0.5 rounded-full border ${BADGE_COLORS[c.color] || BADGE_COLORS.blue} shadow-sm`}
      >
        {c.icon} {c.target}
        <span className="ml-1 font-normal opacity-80">→ {c.move}</span>
      </span>
    ))}
  </div>
);

const TurnCard = ({ turnData, index }: { turnData: HoOhTurn; index: number }) => {
  const getActionIcon = (type: string) => {
    if (type === "switch") return "🔄";
    if (type === "none") return "";
    return "✔";
  };

  return (
    <div className={`reveal-${(index % 6) + 1} bg-neutral-900/70 backdrop-blur-sm rounded-xl border border-neutral-800 p-3 md:p-4 transition-all hover:border-neutral-700 hover:bg-neutral-900/85 shadow-lg shadow-black/20 smooth-transition`}>
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-800/60">
        <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center fs-tiny font-black text-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.15)]">
          {turnData.turn}
        </div>
        <span className="font-black fs-small text-white uppercase tracking-wider">
          Turno {turnData.turn}
        </span>
      </div>

      <div className="space-y-2.5">
        {turnData.actions.map((action, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <span className="text-lg shrink-0 mt-0.5 w-6 text-center">{action.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold fs-small text-white">{action.pokemon}</span>
                {action.type !== "none" && (
                  <span className="fs-tiny text-emerald-400 font-bold shrink-0">
                    {getActionIcon(action.type)}
                  </span>
                )}
                {action.type === "none" ? (
                  <span className="fs-small text-neutral-600 italic">—</span>
                ) : action.type === "switch" ? (
                  <span className="fs-small text-amber-400 font-semibold">{action.action}</span>
                ) : (
                  <span className="fs-small text-neutral-200">{action.action}</span>
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
    <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col menu-enter">
      <PokeBackground />

      <header className="relative z-10 flex items-center justify-between px-4 py-3 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800 shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors fs-small font-bold group"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
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
      </header>

      <div className="relative z-10 flex-1 overflow-y-auto scanlines">
        <div className="max-w-4xl mx-auto px-3 py-6 md:px-6 md:py-10 space-y-6 md:space-y-10">

          {/* Hero / Title Section */}
          <div className="reveal-1 text-center space-y-3 relative">
            <div className="absolute -top-10 -left-10 w-32 h-32 opacity-[0.03] pointer-events-none select-none">
              <img src={`${SPRITE_BASE}/250.gif`} alt="" className="w-full h-full object-contain" />
            </div>
            <span className="fs-tiny uppercase tracking-widest font-black text-indigo-400 border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 rounded-full inline-block">
              PokeMMO Boss Strategy
            </span>
            <h2 className="fs-hero2 font-black text-white leading-tight" style={{ textShadow: '0 0 60px rgba(99,102,241,0.3)' }}>
              {HOOH_GUIDE.title}
            </h2>
            <p className="fs-small text-neutral-500">
              por <span className="font-bold text-neutral-300">{HOOH_GUIDE.author}</span>
            </p>
            <p className="fs-body text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              {HOOH_GUIDE.description}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            {HOOH_GUIDE.stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`reveal-${i + 2} bg-neutral-900/70 backdrop-blur-sm border border-neutral-800 rounded-xl p-3 md:p-4 text-center hover:border-neutral-700 transition-all hover:bg-neutral-900/85 smooth-transition shadow-lg shadow-black/20`}
              >
                <div className="text-xl md:text-2xl mb-1 icon-bounce">{stat.icon}</div>
                <div className={`fs-h3 font-black ${stat.color}`}>{stat.value}</div>
                <div className="fs-tiny text-neutral-500 uppercase tracking-wider mt-0.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Earnings Note */}
          <div className="reveal-4 bg-amber-950/20 backdrop-blur-sm border border-amber-700/30 rounded-xl p-3 md:p-4 text-center shadow-lg shadow-black/10">
            <p className="fs-small text-amber-300 font-bold">
              💰 {HOOH_GUIDE.earnings.total}
            </p>
            <p className="fs-tiny text-amber-200/60 mt-0.5">
              {HOOH_GUIDE.earnings.note}
            </p>
          </div>

          {/* Team Section */}
          <div>
            <h3 className="reveal-2 fs-h3 font-black text-white mb-3 md:mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-violet-900/40 border border-violet-700/30 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              </div>
              Equipo Recomendado
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
              {HOOH_TEAM.map((p, i) => (
                <PokemonCard key={p.name} pokemon={p} index={i} />
              ))}
            </div>
          </div>

          {/* Strategy Section */}
          <div>
            <h3 className="reveal-2 fs-h3 font-black text-white mb-3 md:mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-900/40 border border-amber-700/30 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
              </div>
              Estrategia Paso a Paso
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
              {HOOH_TURNS.map((t, i) => (
                <TurnCard key={t.turn} turnData={t} index={i} />
              ))}
            </div>
          </div>

          {/* Extra Info Card */}
          <div className="reveal-3 bg-neutral-900/70 backdrop-blur-sm border border-neutral-800 rounded-xl p-4 md:p-5 hover:border-neutral-700 transition-all smooth-transition shadow-lg shadow-black/20">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-900/40 border border-blue-700/30 flex items-center justify-center shrink-0 mt-0.5">
                <Info className="w-4.5 h-4.5 text-blue-400" />
              </div>
              <div>
                <h4 className="font-black fs-body text-blue-300 mb-1">{HOOH_GUIDE.extraInfo.title}</h4>
                <p className="fs-small text-neutral-400 leading-relaxed">
                  {HOOH_GUIDE.extraInfo.content}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="reveal-4 w-full bg-neutral-800/50 rounded-full h-1 overflow-hidden">
            <div className="progress-shimmer h-full rounded-full" style={{ width: "100%" }} />
          </div>

          {/* Footer */}
          <div className="text-center pb-6">
            <p className="fs-tiny text-neutral-600">
              Guía creada por <span className="font-semibold text-neutral-500">{HOOH_GUIDE.author}</span> · PokeMMO
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
