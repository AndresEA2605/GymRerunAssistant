import { RouteStep } from "@/types";

export const hoohSteps: RouteStep[] = [
  {
    id: 1,
    type: "turn",
    title: "Turno 1",
    description: "Configuración inicial de la estrategia",
    turnData: [
      { pokemon: "Chandelure", icon: "🔥", action: "Velo Sagrado", type: "move" },
      { pokemon: "Rotom", icon: "⚡", action: "Maquinación", type: "move" },
      { pokemon: "Lunatone", icon: "🌙", action: "Protección", type: "move" },
    ],
  },
  {
    id: 2,
    type: "turn",
    title: "Turno 2",
    description: "Preparación del campo y buffs",
    turnData: [
      { pokemon: "Chandelure", icon: "🔥", action: "Protección", type: "move" },
      { pokemon: "Rotom", icon: "⚡", action: "Maquinación", type: "move" },
      { pokemon: "Lunatone", icon: "🌙", action: "Espacio Raro", type: "move" },
    ],
  },
  {
    id: 3,
    type: "turn",
    title: "Turno 3",
    description: "Primer ataque ofensivo según el legendario",
    turnData: [
      { pokemon: "Chandelure", icon: "🔥", action: "Cambiar a Lunatone", type: "switch" },
      {
        pokemon: "Rotom", icon: "⚡", action: "Ataque según legendario", type: "move",
        conditionals: [
          { target: "Suicune", move: "Poder Oculto (Tierra)", color: "blue", icon: "🟦" },
          { target: "Entei", move: "Rayo", color: "red", icon: "🟥" },
          { target: "Raikou", move: "Rayo", color: "yellow", icon: "🟨" },
        ],
      },
      { pokemon: "Lunatone", icon: "🌙", action: "Más Psique (sobre Rotom)", type: "move" },
    ],
  },
  {
    id: 4,
    type: "turn",
    title: "Turno 4",
    description: "Presión continua con switches",
    turnData: [
      { pokemon: "Chandelure", icon: "🔥", action: "Cambiar a Lunatone", type: "switch" },
      {
        pokemon: "Rotom", icon: "⚡", action: "Ataque según legendario", type: "move",
        conditionals: [
          { target: "Suicune", move: "Poder Oculto (Tierra)", color: "blue", icon: "🟦" },
          { target: "Entei", move: "Rayo", color: "red", icon: "🟥" },
          { target: "Raikou", move: "Rayo", color: "yellow", icon: "🟨" },
        ],
      },
      { pokemon: "Lunatone", icon: "🌙", action: "Joya de Luz", type: "move" },
    ],
  },
  {
    id: 5,
    type: "turn",
    title: "Turno 5",
    description: "Cambio defensivo y ataque directo",
    turnData: [
      { pokemon: "Chandelure", icon: "🔥", action: "Cambiar a Lunatone", type: "switch" },
      { pokemon: "Rotom", icon: "⚡", action: "Rayo", type: "move" },
      { pokemon: "Lunatone", icon: "🌙", action: "Joya de Luz", type: "move" },
    ],
  },
  {
    id: 6,
    type: "turn",
    title: "Turno 6",
    description: "Adaptación al legendario en campo",
    turnData: [
      { pokemon: "Chandelure", icon: "🔥", action: "Cambiar a Lunatone", type: "switch" },
      {
        pokemon: "Rotom", icon: "⚡", action: "Ataque según legendario", type: "move",
        conditionals: [
          { target: "Suicune", move: "Poder Oculto (Tierra)", color: "blue", icon: "🟦" },
          { target: "Entei", move: "Rayo", color: "red", icon: "🟥" },
          { target: "Raikou", move: "Rayo", color: "yellow", icon: "🟨" },
        ],
      },
      { pokemon: "Lunatone", icon: "🌙", action: "Joya de Luz", type: "move" },
    ],
  },
  {
    id: 7,
    type: "turn",
    title: "Turno 7",
    description: "Reubicación y soporte",
    turnData: [
      { pokemon: "Chandelure", icon: "🔥", action: "Cambiar a Lunatone", type: "switch" },
      { pokemon: "Rotom", icon: "⚡", action: "Pantalla de Luz", type: "move" },
      { pokemon: "Lunatone", icon: "🌙", action: "Espacio Raro", type: "move" },
    ],
  },
  {
    id: 8,
    type: "turn",
    title: "Turno 8",
    description: "Preparación para el burst final",
    turnData: [
      { pokemon: "Chandelure", icon: "🔥", action: "Más Psique (sobre Rotom)", type: "move" },
      { pokemon: "Rotom", icon: "⚡", action: "Maquinación", type: "move" },
      { pokemon: "Lunatone", icon: "🌙", action: "Joya de Luz", type: "move" },
    ],
  },
  {
    id: 9,
    type: "turn",
    title: "Turno 9",
    description: "Burst ofensivo masivo",
    turnData: [
      { pokemon: "Chandelure", icon: "🔥", action: "Bola Sombra", type: "move" },
      { pokemon: "Rotom", icon: "⚡", action: "Rayo", type: "move" },
      { pokemon: "Lunatone", icon: "🌙", action: "Joya de Luz", type: "move" },
    ],
  },
  {
    id: 10,
    type: "turn",
    title: "Turno 10",
    description: "Remate final",
    turnData: [
      { pokemon: "Chandelure", icon: "🔥", action: "Bola Sombra", type: "move" },
      { pokemon: "Rotom", icon: "⚡", action: "Rayo", type: "move" },
      { pokemon: "Lunatone", icon: "🌙", action: "—", type: "none" },
    ],
  },
];
