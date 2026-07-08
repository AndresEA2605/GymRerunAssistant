const BASE_XP = 250;
const GROWTH_RATE = 1.4;

export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(BASE_XP * Math.pow(level - 1, GROWTH_RATE));
}

export function xpToNextLevel(level: number): number {
  return xpForLevel(level + 1) - xpForLevel(level);
}

export function calculateLevel(totalXP: number): number {
  let level = 1;
  while (xpForLevel(level + 1) <= totalXP) {
    level++;
  }
  return level;
}

export function xpProgressInLevel(totalXP: number): number {
  const level = calculateLevel(totalXP);
  const currentLevelXP = xpForLevel(level);
  const needed = xpToNextLevel(level);
  if (needed === 0) return 100;
  return Math.min(100, ((totalXP - currentLevelXP) / needed) * 100);
}

export function calculateCoinsForXP(xpAmount: number): number {
  return Math.floor(xpAmount * 0.15);
}

const MAX_STREAK_BONUS = 0.5;
const STREAK_BONUS_PER_DAY = 0.10;

export function streakMultiplier(streak: number): number {
  return Math.min(MAX_STREAK_BONUS, streak * STREAK_BONUS_PER_DAY);
}

export function applyStreakMultiplier(baseXP: number, streak: number): number {
  const multiplier = 1 + streakMultiplier(streak);
  return Math.floor(baseXP * multiplier);
}

export const LEVEL_MILESTONES: Record<number, { title?: string; bonusXP?: number; bonusCoins?: number }> = {
  5:  { title: 'Novato', bonusXP: 200, bonusCoins: 50 },
  10: { title: 'Explorador', bonusXP: 500, bonusCoins: 100 },
  15: { title: 'Veterano', bonusXP: 800, bonusCoins: 200 },
  20: { title: 'Líder', bonusXP: 1200, bonusCoins: 300 },
  25: { title: 'Maestro', bonusXP: 1800, bonusCoins: 500 },
  30: { title: 'Campeón', bonusXP: 2500, bonusCoins: 700 },
  40: { title: 'Élite', bonusXP: 4000, bonusCoins: 1000 },
  50: { title: 'Leyenda', bonusXP: 6000, bonusCoins: 1500 },
  75: { title: 'Mítico', bonusXP: 10000, bonusCoins: 3000 },
  100: { title: 'Invicto', bonusXP: 20000, bonusCoins: 5000 },
};
