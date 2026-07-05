import { GuideCategory } from "@/types";
import { getGuide } from "@/data/guides";

export type FooterVariant = "routes" | "hooh" | "minimal";

export function getFooterVariant(guideId: string): FooterVariant {
  const guide = getGuide(guideId);
  if (!guide) return "minimal";
  if (guide.id === "hooh") return "hooh";
  if (guide.category === "routes") return "routes";
  return "minimal";
}

export function isRoutesGuide(guideId: string): boolean {
  return getFooterVariant(guideId) === "routes";
}

export function showCompleteGym(guideId: string): boolean {
  const guide = getGuide(guideId);
  if (!guide) return false;
  // SOLO mostrar Completar Gym en rutas (category === "routes")
  return guide.id === "gym33" || guide.id === "guide2"; // Ahora también en guide2
}

export function showGymTimer(guideId: string): boolean {
  const guide = getGuide(guideId);
  if (!guide) return false;
  // Mostrar el temporizador únicamente en la ruta principal de Gym Rerun.
  return guide.category === "routes" && guide.id === "gym33";
}

export function getGuideCategoryLabel(category: GuideCategory): string {
  const labels: Record<GuideCategory, string> = {
    routes: "Rutas",
    farming: "Farmeo",
    guides: "Guías",
    resources: "Recursos",
  };
  return labels[category];
}
