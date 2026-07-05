import { GuideMeta, GuideCategory } from '../types';

export const GUIDE_CATEGORIES: { id: GuideCategory; label: string; icon: string }[] = [
  { id: 'guides', label: 'Guías', icon: '📖' },
  { id: 'farming', label: 'Farmeo', icon: '💰' },
  { id: 'routes', label: 'Rutas', icon: '🗺️' },
  { id: 'resources', label: 'Recursos', icon: '📚' },
];

export const GUIDES: GuideMeta[] = [
  {
    id: 'gym33',
    title: '33 GYMS 1H',
    subtitle: 'Guía secuencial para 33 Gym Reruns',
    category: 'routes',
    icon: '635',
    color: 'indigo',
    credits: {
      author: 'Por definir',
      adaptedBy: 'Dreasy',
      status: 'Adaptada',
      lastUpdated: '2025',
      sources: {
        youtube: 'https://www.youtube.com/watch?v=himBCqDN2-I',
      },
    },
    team: [
      { name: 'Hydreigon', spriteId: 635 },
      { name: 'Weezing', spriteId: 110 },
      { name: 'Togekiss', spriteId: 468 },
      { name: 'Typhlosion', spriteId: 157 },
      { name: 'Vanilluxe', spriteId: 584 },
      { name: 'Blastoise', spriteId: 9 },
    ],
    difficulty: 'Media',
    estimatedCost: '~1.3M PokéYen',
    info: [
      'Pokémon: ~540k (breeding)',
      'Items/TMs: ~780k',
      'Sin amuleto: ~297k/run',
      'Con amuleto: ~446k/run',
      '~45 min por run completa',
    ],
  },
  {
    id: 'hooh',
    title: 'Ho-Oh',
    subtitle: 'Estrategia para derrotar a Ho-Oh en 10 turnos',
    category: 'farming',
    icon: '250',
    color: 'amber',
    credits: {
      author: 'Finya Cabrazo',
      adaptedBy: 'Dreasy',
      status: 'Adaptada',
      lastUpdated: '2025',
      sources: {
        youtube: 'https://www.youtube.com/watch?v=QEwUZKASfeI',
      },
    },
    team: [
      { name: 'Chandelure', spriteId: 609 },
      { name: 'Rotom', spriteId: 479 },
      { name: 'Lunatone', spriteId: 337 },
    ],
    difficulty: 'Media',
    estimatedCost: '~560k PokéYen',
    info: [
      'Pokémon: ~390k (breeding)',
      'TMs/Items: ~170k',
      '10 turnos exactos',
      '~8 min por run',
    ],
  },
  {
    id: 'guide2',
    title: '25 GYMS 1H',
    subtitle: 'Ruta alternativa con leads optimizados',
    category: 'routes',
    icon: '468',
    color: 'teal',
    credits: {
      author: 'MYRROR',
      adaptedBy: 'Dreasy',
      status: 'Adaptada',
      lastUpdated: '2025',
      sources: {
        docs: 'https://docs.google.com/document/d/1GkgTlrZwm2jUO_aD_U9Gha8CaljwRQaMLMMJfpsr4Bc/edit?tab=t.kd1fquq7r0zb',
      },
    },
    team: [
      { name: 'Togekiss', spriteId: 468 },
      { name: 'Excadrill', spriteId: 530 },
      { name: 'Blastoise', spriteId: 9 },
      { name: 'Vanilluxe', spriteId: 584 },
      { name: 'Aerodactyl', spriteId: 142 },
      { name: 'Typhlosion', spriteId: 157 },
    ],
    difficulty: 'Media-Alta',
    estimatedCost: '~850k PokéYen',
    info: [
      'Pokémon: ~610k (breeding)',
      'Items/TMs: ~240k',
      '25 gimnasios alternativos',
      '5 regiones con leads optimizados',
    ],
  },
];

export const getGuide = (id: string): GuideMeta | undefined =>
  GUIDES.find(g => g.id === id);

export const getGuidesByCategory = (cat: GuideCategory): GuideMeta[] =>
  GUIDES.filter(g => g.category === cat);
