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
  return getFooterVariant(guideId) === "routes";
}

export function showGymTimer(guideId: string): boolean {
  const guide = getGuide(guideId);
  if (!guide) return false;
  // Solo mostrar timer en guías de categoría "routes" (gym reruns)
  // NO mostrar en Ho-Oh (farming) ni en otras categorías
  return guide.category === "routes";
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
