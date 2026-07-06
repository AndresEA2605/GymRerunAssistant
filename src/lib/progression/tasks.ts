import type { TaskDefinition } from './types';

export const TASK_DEFINITIONS: TaskDefinition[] = [
  { id: 'daily_gym_1',     period: 'daily',   category: 'Gym',   label: 'Completa un Gym',                description: 'Derrota a un líder de gimnasio',       targetCount: 1,  xpReward: 100,  coinReward: 10,  condition: (s) => s.gymsCompleted > 0 },
  { id: 'daily_gym_5',     period: 'daily',   category: 'Gym',   label: 'Completa 5 Gyms',                description: 'Derrota a 5 líderes de gimnasio',      targetCount: 5,  xpReward: 250,  coinReward: 25,  condition: (s) => s.gymsCompleted >= 5 },
  { id: 'daily_gym_full',  period: 'daily',   category: 'Gym',   label: 'Completa toda la ruta',          description: 'Termina una ruta completa',             targetCount: 1,  xpReward: 500,  coinReward: 50,  condition: (s) => s.totalTimeRuns > 0 },
  { id: 'daily_hooh',      period: 'daily',   category: 'Ho-Oh', label: 'Derrota a Ho-Oh',                description: 'Gana contra Ho-Oh (Revancha)',         targetCount: 1,  xpReward: 300,  coinReward: 30,  condition: (s) => s.hoohDefeats > 0 },
  { id: 'daily_red',       period: 'daily',   category: 'Red',   label: 'Derrota a Red',                  description: 'Gana contra Red',                      targetCount: 1,  xpReward: 400,  coinReward: 40,  condition: (s) => s.redDefeats > 0 },
  { id: 'daily_npc_1',     period: 'daily',   category: 'NPC',   label: 'Completa un NPC',                description: 'Derrota a un NPC',                     targetCount: 1,  xpReward: 50,   coinReward: 5,   condition: (s) => s.npcsCompleted > 0 },
  { id: 'daily_npc_all',   period: 'daily',   category: 'NPC',   label: 'Completa todos los NPC',         description: 'Derrota a todos los NPC del paso',     targetCount: 5,  xpReward: 300,  coinReward: 30,  condition: (s) => s.npcsCompleted >= 5 },
  { id: 'daily_guide',     period: 'daily',   category: 'Guía',  label: 'Completa una guía',              description: 'Termina cualquier guía',               targetCount: 1,  xpReward: 25,   coinReward: 3,   condition: (s) => s.guidesFinished > 0 },
  { id: 'daily_steps',     period: 'daily',   category: 'App',   label: 'Marca 5 pasos',                  description: 'Avanza 5 pasos en cualquier ruta',     targetCount: 5,  xpReward: 40,   coinReward: 5,   condition: (s) => s.totalStepsCompleted >= 5 },
  { id: 'daily_login',     period: 'daily',   category: 'App',   label: 'Inicia sesión',                  description: 'Accede a tu cuenta',                   targetCount: 1,  xpReward: 10,   coinReward: 1,   condition: () => true },
  { id: 'daily_bonus',     period: 'daily',   category: 'Bonus', label: 'Todas las tareas diarias',        description: 'Completá todas las tareas del día',    targetCount: 1,  xpReward: 500,  coinReward: 50,  condition: () => true },

  { id: 'weekly_gym_20',   period: 'weekly',  category: 'Gym',   label: 'Completa 20 Gyms',               description: 'Derrota a 20 líderes en la semana',    targetCount: 20, xpReward: 2000, coinReward: 200, condition: (s) => s.gymsCompleted >= 20 },
  { id: 'weekly_hooh_5',   period: 'weekly',  category: 'Ho-Oh', label: 'Derrota a Ho-Oh 5 veces',        description: 'Gana contra Ho-Oh 5 veces',            targetCount: 5,  xpReward: 1000, coinReward: 100, condition: (s) => s.hoohDefeats >= 5 },
  { id: 'weekly_red_3',    period: 'weekly',  category: 'Red',   label: 'Completa Red 3 veces',           description: 'Gana contra Red 3 veces',              targetCount: 3,  xpReward: 1500, coinReward: 150, condition: (s) => s.redDefeats >= 3 },
  { id: 'weekly_regions',  period: 'weekly',  category: 'App',   label: 'Completa todas las regiones',    description: 'Juega en todas las regiones',           targetCount: 5,  xpReward: 3000, coinReward: 300, condition: (s) => s.regionsCompleted.length >= 5 },

  { id: 'monthly_gym_100', period: 'monthly', category: 'Gym',   label: '100 Gyms',                       description: 'Derrota a 100 líderes este mes',       targetCount: 100, xpReward: 10000, coinReward: 1000, condition: (s) => s.gymsCompleted >= 100 },
  { id: 'monthly_hooh_30', period: 'monthly', category: 'Ho-Oh', label: '30 Ho-Oh',                       description: 'Gana contra Ho-Oh 30 veces',           targetCount: 30,  xpReward: 7000,  coinReward: 700,  condition: (s) => s.hoohDefeats >= 30 },
  { id: 'monthly_npc_100', period: 'monthly', category: 'NPC',   label: '100 NPC',                        description: 'Derrota a 100 NPC este mes',           targetCount: 100, xpReward: 6000,  coinReward: 600,  condition: (s) => s.npcsCompleted >= 100 },
];
