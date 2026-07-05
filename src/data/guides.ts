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
    title: '33 Gyms',
    subtitle: 'Guía secuencial para 33 Gym Reruns',
    category: 'guides',
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
  },
  {
    id: 'hooh',
    title: 'Ho-Oh',
    subtitle: 'Estrategia para derrotar a Ho-Oh en 10 turnos',
    category: 'guides',
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
  },
  {
    id: 'guide2',
    title: '33 Gyms II',
    subtitle: 'Ruta alternativa con leads optimizados',
    category: 'guides',
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
  },
];

export const getGuide = (id: string): GuideMeta | undefined =>
  GUIDES.find(g => g.id === id);

export const getGuidesByCategory = (cat: GuideCategory): GuideMeta[] =>
  GUIDES.filter(g => g.category === cat);
