import type { Achievement } from './types';

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_gym',       name: 'Primer Gimnasio',       description: 'Completaste tu primer gym',                  icon: '🏟️', rarity: 'common',    xpReward: 50,   condition: (s) => s.gymsCompleted >= 1 },
  { id: 'gym_10',          name: '10 Gimnasios',           description: 'Completaste 10 gimnasios',                   icon: '🏟️', rarity: 'uncommon',  xpReward: 200,  condition: (s) => s.gymsCompleted >= 10 },
  { id: 'gym_50',          name: '50 Gimnasios',           description: 'Completaste 50 gimnasios',                   icon: '🏟️', rarity: 'rare',      xpReward: 500,  condition: (s) => s.gymsCompleted >= 50 },
  { id: 'gym_100',         name: '100 Gimnasios',          description: 'Completaste 100 gimnasios',                  icon: '🏟️', rarity: 'epic',      xpReward: 1000, condition: (s) => s.gymsCompleted >= 100 },
  { id: 'gym_500',         name: 'Destructor de Gyms',     description: 'Completaste 500 gimnasios',                  icon: '💥', rarity: 'legendary', xpReward: 5000, condition: (s) => s.gymsCompleted >= 500 },

  { id: 'first_hooh',      name: 'Primera Ho-Oh',          description: 'Derrotaste a Ho-Oh por primera vez',        icon: '🐦', rarity: 'common',    xpReward: 100,  condition: (s) => s.hoohDefeats >= 1 },
  { id: 'hooh_10',         name: '10 Ho-Oh',               description: 'Derrotaste a Ho-Oh 10 veces',               icon: '🐦', rarity: 'uncommon',  xpReward: 400,  condition: (s) => s.hoohDefeats >= 10 },
  { id: 'hooh_50',         name: 'Maestro de Ho-Oh',       description: 'Derrotaste a Ho-Oh 50 veces',               icon: '🐦', rarity: 'epic',      xpReward: 2000, condition: (s) => s.hoohDefeats >= 50 },
  { id: 'hooh_100',        name: 'Leyenda Ho-Oh',          description: 'Derrotaste a Ho-Oh 100 veces',              icon: '🌟', rarity: 'legendary', xpReward: 10000,condition: (s) => s.hoohDefeats >= 100 },

  { id: 'first_red',       name: 'Primera Red',            description: 'Derrotaste a Red por primera vez',          icon: '🔴', rarity: 'uncommon',  xpReward: 200,  condition: (s) => s.redDefeats >= 1 },
  { id: 'red_10',          name: '10 Red',                  description: 'Derrotaste a Red 10 veces',                 icon: '🔴', rarity: 'rare',      xpReward: 800,  condition: (s) => s.redDefeats >= 10 },
  { id: 'red_50',          name: 'Cazador de Red',          description: 'Derrotaste a Red 50 veces',                 icon: '🔴', rarity: 'legendary', xpReward: 5000, condition: (s) => s.redDefeats >= 50 },

  { id: 'first_npc',       name: 'Primer NPC',             description: 'Derrotaste tu primer NPC',                  icon: '🧑', rarity: 'common',    xpReward: 25,   condition: (s) => s.npcsCompleted >= 1 },
  { id: 'npc_100',         name: '100 NPC',                 description: 'Derrotaste 100 NPC',                        icon: '🧑', rarity: 'rare',      xpReward: 500,  condition: (s) => s.npcsCompleted >= 100 },

  { id: 'first_guide',     name: 'Primera Guía',           description: 'Completaste tu primera guía',               icon: '📖', rarity: 'common',    xpReward: 25,   condition: (s) => s.guidesFinished >= 1 },
  { id: 'guide_10',        name: '10 Guías',               description: 'Completaste 10 guías',                      icon: '📖', rarity: 'uncommon',  xpReward: 200,  condition: (s) => s.guidesFinished >= 10 },

  { id: 'time_1h',         name: '1 Hora Jugada',          description: 'Jugaste más de 1 hora',                     icon: '⏱️', rarity: 'common',    xpReward: 100,  condition: (s) => s.totalTimeMs >= 3600000 },
  { id: 'time_10h',        name: '10 Horas Jugadas',       description: 'Jugaste más de 10 horas',                   icon: '⏱️', rarity: 'uncommon',  xpReward: 500,  condition: (s) => s.totalTimeMs >= 36000000 },
  { id: 'time_100h',       name: '100 Horas Jugadas',      description: 'Jugaste más de 100 horas',                  icon: '⏱️', rarity: 'epic',      xpReward: 3000, condition: (s) => s.totalTimeMs >= 360000000 },

  { id: 'xp_1000',         name: '1,000 XP',               description: 'Acumulaste 1,000 XP',                       icon: '⚡', rarity: 'common',    xpReward: 50,   condition: (s) => s.totalXP >= 1000 },
  { id: 'xp_10000',        name: '10,000 XP',              description: 'Acumulaste 10,000 XP',                      icon: '⚡', rarity: 'uncommon',  xpReward: 200,  condition: (s) => s.totalXP >= 10000 },
  { id: 'xp_100000',       name: '100,000 XP',             description: 'Acumulaste 100,000 XP',                     icon: '⚡', rarity: 'epic',      xpReward: 2000, condition: (s) => s.totalXP >= 100000 },

  { id: 'steps_1000',      name: '1,000 Pasos',            description: 'Completaste 1,000 pasos',                   icon: '👣', rarity: 'rare',      xpReward: 500,  condition: (s) => s.totalStepsCompleted >= 1000 },
  { id: 'runs_100',        name: '100 Rutas',              description: 'Completaste 100 rutas',                     icon: '🏁', rarity: 'rare',      xpReward: 1000, condition: (s) => s.totalTimeRuns >= 100 },
];
