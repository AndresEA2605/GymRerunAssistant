const BASE_XP = 200;
const GROWTH_RATE = 1.35;

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
  return Math.floor(xpAmount * 0.1);
}
