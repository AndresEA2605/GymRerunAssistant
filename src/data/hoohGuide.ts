export type TurnActionType = "move" | "switch" | "none";

export interface TurnConditional {
  target: string;
  move: string;
  color: string;
  icon: string;
}

export interface TurnAction {
  pokemon: string;
  icon: string;
  action: string;
  type: TurnActionType;
  conditionals?: TurnConditional[];
}

export interface HoOhTurn {
  turn: number;
  actions: TurnAction[];
}

export interface HoOhPokemon {
  name: string;
  form?: string;
  spriteId: number;
  level: number;
  nature: string;
  ability: string;
  ivs: Record<string, string | number>;
  evs: Record<string, number>;
  moves: string[];
  item: string;
  accent: string;
  color: string;
}

export const HOOH_TEAM: HoOhPokemon[] = [
  {
    name: "Chandelure",
    spriteId: 609,
    level: 100,
    nature: "Modesta",
    ability: "Absor. Fuego",
    ivs: { PS: 25, Ataque: "-", Defensa: 25, "Ataque Especial": 31, "Defensa Especial": 25, Velocidad: 31 },
    evs: { "Ataque Especial": 252, "Defensa Especial": 58, Velocidad: 200 },
    moves: ["Velo Sagrado", "Protección", "Más Psique", "Bola Sombra"],
    item: "Hechizo",
    accent: "indigo",
    color: "indigo",
  },
  {
    name: "Rotom",
    form: "Horno",
    spriteId: 479,
    level: 100,
    nature: "Mansa",
    ability: "Levitación",
    ivs: { PS: 25, Ataque: "-", Defensa: 25, "Ataque Especial": 31, "Defensa Especial": 25, Velocidad: "-" },
    evs: { PS: 6, "Ataque Especial": 252, "Defensa Especial": 252 },
    moves: ["Maquinación", "Poder Oculto (Tierra)", "Rayo", "Pantalla de Luz"],
    item: "Arena Fina",
    accent: "orange",
    color: "orange",
  },
  {
    name: "Lunatone",
    spriteId: 337,
    level: 100,
    nature: "Mansa",
    ability: "Levitación",
    ivs: { PS: 25, Ataque: "-", Defensa: 25, "Ataque Especial": 31, "Defensa Especial": 25, Velocidad: 0 },
    evs: { PS: 96, "Ataque Especial": 252, "Defensa Especial": 166 },
    moves: ["Espacio Raro", "Protección", "Más Psique", "Joya de Luz"],
    item: "Piedra Dura",
    accent: "sky",
    color: "sky",
  },
];

export const HOOH_TURNS: HoOhTurn[] = [
  {
    turn: 1,
    actions: [
      { pokemon: "Chandelure", icon: "🔥", action: "Velo Sagrado", type: "move" },
      { pokemon: "Rotom", icon: "⚡", action: "Maquinación", type: "move" },
      { pokemon: "Lunatone", icon: "🌙", action: "Protección", type: "move" },
    ],
  },
  {
    turn: 2,
    actions: [
      { pokemon: "Chandelure", icon: "🔥", action: "Protección", type: "move" },
      { pokemon: "Rotom", icon: "⚡", action: "Maquinación", type: "move" },
      { pokemon: "Lunatone", icon: "🌙", action: "Espacio Raro", type: "move" },
    ],
  },
  {
    turn: 3,
    actions: [
      { pokemon: "Chandelure", icon: "🔥", action: "Cambiar a Lunatone", type: "switch" },
      {
        pokemon: "Rotom",
        icon: "⚡",
        action: "Ataque según legendario",
        type: "move",
        conditionals: [
          { target: "Suicune", move: "Rayo", color: "blue", icon: "🟦" },
          { target: "Entei", move: "Rayo", color: "red", icon: "🟥" },
          { target: "Raikou", move: "Poder Oculto (Tierra)", color: "yellow", icon: "🟨" },
        ],
      },
      { pokemon: "Lunatone", icon: "🌙", action: "Más Psique (sobre Rotom)", type: "move" },
    ],
  },
  {
    turn: 4,
    actions: [
      { pokemon: "Chandelure", icon: "🔥", action: "Cambiar a Lunatone", type: "switch" },
      {
        pokemon: "Rotom",
        icon: "⚡",
        action: "Ataque según legendario",
        type: "move",
        conditionals: [
          { target: "Suicune", move: "Rayo", color: "blue", icon: "🟦" },
          { target: "Entei", move: "Rayo", color: "red", icon: "🟥" },
          { target: "Raikou", move: "Poder Oculto (Tierra)", color: "yellow", icon: "🟨" },
        ],
      },
      { pokemon: "Lunatone", icon: "🌙", action: "Joya de Luz", type: "move" },
    ],
  },
  {
    turn: 5,
    actions: [
      { pokemon: "Chandelure", icon: "🔥", action: "Cambiar a Lunatone", type: "switch" },
      { pokemon: "Rotom", icon: "⚡", action: "Rayo", type: "move" },
      { pokemon: "Lunatone", icon: "🌙", action: "Joya de Luz", type: "move" },
    ],
  },
  {
    turn: 6,
    actions: [
      { pokemon: "Chandelure", icon: "🔥", action: "Cambiar a Lunatone", type: "switch" },
      {
        pokemon: "Rotom",
        icon: "⚡",
        action: "Ataque según legendario",
        type: "move",
        conditionals: [
          { target: "Suicune", move: "Rayo", color: "blue", icon: "🟦" },
          { target: "Entei", move: "Rayo", color: "red", icon: "🟥" },
          { target: "Raikou", move: "Poder Oculto (Tierra)", color: "yellow", icon: "🟨" },
        ],
      },
      { pokemon: "Lunatone", icon: "🌙", action: "Joya de Luz", type: "move" },
    ],
  },
  {
    turn: 7,
    actions: [
      { pokemon: "Chandelure", icon: "🔥", action: "Cambiar a Lunatone", type: "switch" },
      { pokemon: "Rotom", icon: "⚡", action: "Pantalla de Luz", type: "move" },
      { pokemon: "Lunatone", icon: "🌙", action: "Espacio Raro", type: "move" },
    ],
  },
  {
    turn: 8,
    actions: [
      { pokemon: "Chandelure", icon: "🔥", action: "Más Psique (sobre Rotom)", type: "move" },
      { pokemon: "Rotom", icon: "⚡", action: "Maquinación", type: "move" },
      { pokemon: "Lunatone", icon: "🌙", action: "Joya de Luz", type: "move" },
    ],
  },
  {
    turn: 9,
    actions: [
      { pokemon: "Chandelure", icon: "🔥", action: "Bola Sombra", type: "move" },
      { pokemon: "Rotom", icon: "⚡", action: "Rayo", type: "move" },
      { pokemon: "Lunatone", icon: "🌙", action: "Joya de Luz", type: "move" },
    ],
  },
  {
    turn: 10,
    actions: [
      { pokemon: "Chandelure", icon: "🔥", action: "Bola Sombra", type: "move" },
      { pokemon: "Rotom", icon: "⚡", action: "Rayo", type: "move" },
      { pokemon: "Lunatone", icon: "🌙", action: "—", type: "none" },
    ],
  },
];

export const HOOH_GUIDE = {
  title: "Guía para derrotar a HO-OH (10 Turnos)",
  author: "Finya Cabrazo",
  description:
    "Con esta estrategia podrás derrotar a Ho-Oh (Revancha) en únicamente 10 turnos, completando la run en aproximadamente 8 minutos.",
  earnings: {
    total: "~97.000 PokéYen",
    note: "Calculado vendiendo los Señuelos Legendarios a 30.000 cada uno.",
  },
  stats: [
    { label: "Tiempo promedio", value: "8 min", icon: "⏱", color: "text-emerald-400" },
    { label: "Ganancia estimada", value: "97.000", icon: "💰", color: "text-amber-400" },
    { label: "Turnos", value: "10", icon: "🎯", color: "text-indigo-400" },
    { label: "Dificultad", value: "Media", icon: "⭐", color: "text-violet-400" },
  ],
  extraInfo: {
    title: "¿Cómo salir si no tengo Vuelo?",
    content:
      "Si no tienes Vuelo, simplemente inicia un combate contra un Pokémon salvaje, cierra completamente el juego y vuelve a iniciar sesión. Aparecerás automáticamente en el último Centro Pokémon donde curaste a tu equipo.",
  },
};
