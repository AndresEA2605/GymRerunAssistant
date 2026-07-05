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
    estimatedCost: '~500k PokéYen',
    info: [
      '33 gimnasios secuenciales',
      '~297k sin moneda amuleto',
      '~446k con moneda amuleto',
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
    estimatedCost: '~150k PokéYen',
    info: [
      '10 turnos exactos',
      '~8 min por run',
      '~97k PokéYen por run',
      'Señuelos Legendarios a 30k c/u',
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
    estimatedCost: '~600k PokéYen',
    info: [
      '25 gimnasios alternativos',
      '5 regiones con leads optimizados',
      'Swaps tácticos por tipo',
      'Cobertura completa de tipos',
    ],
  },
];

export const getGuide = (id: string): GuideMeta | undefined =>
  GUIDES.find(g => g.id === id);

export const getGuidesByCategory = (cat: GuideCategory): GuideMeta[] =>
  GUIDES.filter(g => g.category === cat);
