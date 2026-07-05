/** 8px grid spacing scale */
export const space = {
  0: "0",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "24px",
  6: "32px",
  8: "48px",
  10: "64px",
} as const;

export const btnHeight = {
  sm: "32px",
  md: "40px",
  lg: "48px",
} as const;

export const radius = {
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  full: "9999px",
} as const;

export type GuideColorKey = "indigo" | "amber" | "teal";

export const GUIDE_POKE_GLOW: Record<GuideColorKey, string> = {
  indigo: "poke-glow-indigo",
  amber: "poke-glow-amber",
  teal: "poke-glow-teal",
};

export const GUIDE_COLORS: Record<
  GuideColorKey,
  { text: string; textLight: string; border: string; borderHover: string; bg: string; badge: string }
> = {
  indigo: {
    text: "text-indigo-400",
    textLight: "text-indigo-300",
    border: "border-indigo-500/40",
    borderHover: "hover:border-indigo-400/60",
    bg: "bg-indigo-500/10",
    badge: "bg-indigo-500/30",
  },
  amber: {
    text: "text-amber-400",
    textLight: "text-amber-300",
    border: "border-amber-500/40",
    borderHover: "hover:border-amber-400/60",
    bg: "bg-amber-500/10",
    badge: "bg-amber-500/30",
  },
  teal: {
    text: "text-teal-400",
    textLight: "text-teal-300",
    border: "border-teal-500/40",
    borderHover: "hover:border-teal-400/60",
    bg: "bg-teal-500/10",
    badge: "bg-teal-500/30",
  },
};

export function getGuideColorClasses(color: string) {
  return GUIDE_COLORS[color as GuideColorKey] ?? GUIDE_COLORS.indigo;
}

export function getGuidePokeGlow(color: string) {
  return GUIDE_POKE_GLOW[color as GuideColorKey] ?? GUIDE_POKE_GLOW.indigo;
}
