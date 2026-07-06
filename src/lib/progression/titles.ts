import type { Title } from './types';

export const TITLES: Title[] = [
  { id: 'entrenador',      name: 'Entrenador',           description: 'Comenzó su aventura',                       icon: '🎓', rarity: 'common',    condition: () => true },
  { id: 'veterano',        name: 'Veterano',             description: 'Completó 10 gimnasios',                     icon: '⚔️', rarity: 'uncommon',  condition: (s) => s.gymsCompleted >= 10 },
  { id: 'lider',           name: 'Líder',                description: 'Completó 25 gimnasios',                     icon: '🏅', rarity: 'rare',      condition: (s) => s.gymsCompleted >= 25 },
  { id: 'campeon',         name: 'Campeón',              description: 'Completó 50 gimnasios',                     icon: '👑', rarity: 'epic',      condition: (s) => s.gymsCompleted >= 50 },
  { id: 'leyenda',         name: 'Leyenda',              description: 'Completó 100 gimnasios',                    icon: '🌟', rarity: 'legendary', condition: (s) => s.gymsCompleted >= 100 },

  { id: 'cazador_hooh',    name: 'Cazador de Ho-Oh',     description: 'Derrotó a Ho-Oh 5 veces',                  icon: '🐦', rarity: 'uncommon',  condition: (s) => s.hoohDefeats >= 5 },
  { id: 'maestro_hooh',    name: 'Maestro de Ho-Oh',     description: 'Derrotó a Ho-Oh 25 veces',                 icon: '🔥', rarity: 'epic',      condition: (s) => s.hoohDefeats >= 25 },
  { id: ' destructor_gyms',name: 'Destructor de Gyms',   description: 'Completó 100 gimnasios',                   icon: '💥', rarity: 'legendary', condition: (s) => s.gymsCompleted >= 100 },

  { id: 'explorador',      name: 'Explorador',           description: 'Jugó en 3 regiones',                        icon: '🗺️', rarity: 'uncommon',  condition: (s) => s.regionsCompleted.length >= 3 },
  { id: 'coleccionista',   name: 'Coleccionista',        description: 'Desbloqueó 10 logros',                     icon: '🏆', rarity: 'rare',      condition: (s) => s.totalAchievements >= 10 },
  { id: 'dedicado',        name: 'Dedicado',             description: 'Jugó 10 horas',                             icon: '⏱️', rarity: 'uncommon',  condition: (s) => s.totalTimeMs >= 36000000 },
  { id: 'nocturno',        name: 'Nocturno',             description: 'Jugó 100 horas',                            icon: '🌙', rarity: 'epic',      condition: (s) => s.totalTimeMs >= 360000000 },
  { id: 'completista',     name: 'Completista',          description: 'Completó 50 rutas',                        icon: '✅', rarity: 'epic',      condition: (s) => s.totalTimeRuns >= 50 },
  { id: 'invicto',         name: 'Invicto',              description: 'Mejor racha de 7 días',                    icon: '🔥', rarity: 'rare',      condition: (_s, _l) => false },
];
