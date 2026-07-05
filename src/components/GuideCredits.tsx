"use client";

import React from "react";
import { ExternalLink, Play, BookOpen, MessageCircle, Globe } from "lucide-react";
import { GuideMeta, GuideCredits as GuideCreditsType } from "../types";

interface GuideCreditsProps {
  guide: GuideMeta;
  mode: "compact" | "full";
}

const STATUS_COLORS: Record<string, string> = {
  Original: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  Adaptada: "text-sky-400 bg-sky-500/10 border-sky-500/30",
  Actualizada: "text-amber-400 bg-amber-500/10 border-amber-500/30",
};

const SOURCE_CONFIG: { key: keyof GuideCreditsType['sources']; icon: typeof Play; label: string; color: string }[] = [
  { key: "youtube", icon: Play, label: "YouTube", color: "text-red-400 hover:text-red-300" },
  { key: "docs", icon: BookOpen, label: "Documentación", color: "text-blue-400 hover:text-blue-300" },
  { key: "discord", icon: MessageCircle, label: "Discord", color: "text-violet-400 hover:text-violet-300" },
  { key: "website", icon: Globe, label: "Sitio web", color: "text-emerald-400 hover:text-emerald-300" },
];

export default function GuideCredits({ guide, mode }: GuideCreditsProps) {
  const { credits } = guide;
  const hasSources = Object.values(credits.sources).some(Boolean);

  if (mode === "compact") {
    return (
      <div className="w-full bg-neutral-950/60 border border-neutral-800/50 rounded-xl p-2 md:p-2.5 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="fs-tiny font-bold text-neutral-300 truncate">{credits.author}</span>
            {credits.adaptedBy && (
              <span className="fs-tiny text-neutral-500">·</span>
            )}
            {credits.adaptedBy && (
              <span className="fs-tiny text-neutral-500 truncate">Adaptado por {credits.adaptedBy}</span>
            )}
          </div>
          <span className={`fs-tiny font-bold px-1.5 py-0.5 rounded border shrink-0 ${STATUS_COLORS[credits.status] || STATUS_COLORS.Adaptada}`}>
            {credits.status}
          </span>
        </div>
        {hasSources && (
          <div className="flex items-center gap-1.5">
            {SOURCE_CONFIG.map(({ key, icon: Icon, label, color }) => {
              const url = credits.sources[key];
              if (!url) return null;
              return (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={label}
                  className={`p-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 transition-colors ${color}`}
                >
                  <Icon className="w-3 h-3" />
                </a>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full bg-neutral-950/60 border border-neutral-800/50 rounded-2xl p-3 md:p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 rounded-full bg-gradient-to-b from-indigo-500 to-indigo-700" />
        <span className="fs-small font-black text-neutral-300 uppercase tracking-wider">Créditos</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="fs-tiny text-neutral-500 uppercase tracking-wider">Autor</span>
          <span className="fs-small font-bold text-white">{credits.author}</span>
        </div>
        {credits.adaptedBy && (
          <div className="flex items-center justify-between">
            <span className="fs-tiny text-neutral-500 uppercase tracking-wider">Adaptado por</span>
            <span className="fs-small font-bold text-white">{credits.adaptedBy}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="fs-tiny text-neutral-500 uppercase tracking-wider">Estado</span>
          <span className={`fs-tiny font-bold px-2 py-0.5 rounded border ${STATUS_COLORS[credits.status] || STATUS_COLORS.Adaptada}`}>
            {credits.status}
          </span>
        </div>
        {credits.lastUpdated && (
          <div className="flex items-center justify-between">
            <span className="fs-tiny text-neutral-500 uppercase tracking-wider">Actualizado</span>
            <span className="fs-small font-bold text-neutral-300">{credits.lastUpdated}</span>
          </div>
        )}
      </div>

      {hasSources && (
        <div className="space-y-1.5">
          <span className="fs-tiny text-neutral-500 uppercase tracking-wider">Fuentes</span>
          <div className="flex flex-wrap gap-1.5">
            {SOURCE_CONFIG.map(({ key, icon: Icon, label, color }) => {
              const url = credits.sources[key];
              if (!url) return null;
              return (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 transition-colors fs-tiny font-bold ${color}`}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                  <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
