import { RouteStep } from "@/types";

const G2_LEAD: Record<string, string[]> = {
  "Lavaridge City (Fire)": ["Aerodactyl", "Blastoise"],
  "Mauville City (Electric)": ["Aerodactyl", "Typhlosion"],
  "Rustboro City (Rock)": ["Aerodactyl", "Excadrill"],
  "Dewford City (Fighting)": ["Togekiss", "Blastoise"],
  "Fortree City (Flying)": ["Aerodactyl", "Vanilluxe"],
  "Eterna City (Grass)": ["Togekiss", "Typhlosion"],
  "Oreburgh City (Rock)": ["Aerodactyl", "Excadrill"],
  "Sunyshore City (Electric)": ["Togekiss", "Blastoise"],
  "Veilstone City (Fighting)": ["Togekiss", "Typhlosion"],
  "Vermilion City (Electric)": ["Aerodactyl", "Excadrill"],
  "Cinnabar Island (Fire)": ["Aerodactyl", "Blastoise"],
  "Pewter City (Rock)": ["Aerodactyl", "Excadrill"],
  "Saffron City (Psychic)": ["Aerodactyl", "Excadrill"],
  "Fuchsia City (Poison)": ["Aerodactyl", "Typhlosion"],
  "Castelia City (Bug)": ["Vanilluxe", "Blastoise"],
  "Mistralton City (Flying)": ["Aerodactyl", "Vanilluxe"],
  "Striaton City (Fire)": ["Aerodactyl", "Blastoise"],
  "Striaton City (Grass)": ["Togekiss", "Typhlosion"],
  "Striaton City (Water)": ["Togekiss", "Excadrill"],
  "Nimbasa City (Electric)": ["Togekiss", "Typhlosion"],
  "Opelucid City (Dragon)": ["Vanilluxe", "Typhlosion"],
  "Icirrus City (Ice)": ["Aerodactyl", "Typhlosion"],
  "Violet City (Flying)": ["Aerodactyl", "Vanilluxe"],
  "Mahogany Town (Ice)": ["Aerodactyl", "Typhlosion"],
  "Goldenrod City (Normal)": ["Excadrill", "Togekiss"],
  "Olivine City (Steel)": ["Togekiss", "Typhlosion"],
  "Azalea Town (Bug)": ["Aerodactyl", "Typhlosion"],
  "Cianwood City (Fighting)": ["Togekiss", "Excadrill"],
};

export const guide2Steps: RouteStep[] = [
  // ═══════════════════════════════════════
  // FIRST HOENN
  // ═══════════════════════════════════════
  {
    id: 1, type: "gym", region: "Hoenn", gym: "Pueblo Lavacalda",
    title: "Lavaridge City (Fire)", lead: G2_LEAD["Lavaridge City (Fire)"],
    actions: ["Aerodactyl → Avalancha", "Blastoise → Salpicar"],
  },
  {
    id: 2, type: "gym", region: "Hoenn", gym: "Ciudad Malvalona",
    title: "Mauville City (Electric)", lead: G2_LEAD["Mauville City (Electric)"],
    actions: ["Aerodactyl → Avalancha", "Typhlosion → Erupción"],
  },
  {
    id: 3, type: "gym", region: "Hoenn", gym: "Ciudad Férrica",
    title: "Rustboro City (Rock)", lead: G2_LEAD["Rustboro City (Rock)"],
    actions: ["Aerodactyl → Avalancha", "Excadrill → Terremoto"],
  },
  {
    id: 4, type: "gym", region: "Hoenn", gym: "Pueblo Azuliza",
    title: "Dewford City (Fighting)", lead: G2_LEAD["Dewford City (Fighting)"],
    actions: ["Togekiss → Vozarrón", "Blastoise → Salpicar"],
  },
  {
    id: 5, type: "gym", region: "Hoenn", gym: "Ciudad Arborada",
    title: "Fortree City (Flying)", lead: G2_LEAD["Fortree City (Flying)"],
    actions: ["Aerodactyl → Avalancha", "Vanilluxe → Ventisca"],
  },
  // Vs Pelipper + Altaria
  {
    id: 6, type: "gym", region: "Hoenn", gym: "Ciudad Arborada",
    title: "Vs Pelipper + Altaria", lead: ["Aerodactyl", "Vanilluxe"],
    actions: ["Aerodactyl → Avalancha", "Vanilluxe → Viento Glacial"],
  },
  {
    id: 7, type: "prep", title: "TP + Heal", heal: true, travel: null,
    description: "Curar equipo antes de viajar a Sinnoh",
  },
  {
    id: 8, type: "prep", title: "Viajar a Sinnoh", heal: false, travel: "Sinnoh",
    description: "Viajar desde Hoenn a Sinnoh",
  },

  // ═══════════════════════════════════════
  // SECOND SINNOH
  // ═══════════════════════════════════════
  {
    id: 9, type: "gym", region: "Sinnoh", gym: "Ciudad Vetusta",
    title: "Eterna City (Grass)", lead: G2_LEAD["Eterna City (Grass)"],
    actions: ["Togekiss → Vozarrón", "Typhlosion → Erupción"],
  },
  // Vs Ninetales — Swap Typhlosion → Vanilluxe
  {
    id: 10, type: "gym", region: "Sinnoh", gym: "Ciudad Vetusta",
    title: "Vs Ninetales", lead: ["Typhlosion", "Togekiss"],
    switchTo: ["Vanilluxe"],
    actions: ["Typhlosion → Erupción (antes del cambio)", "Typhlosion → Vanilluxe (Cambio)", "Togekiss → Vozarrón"],
  },
  {
    id: 11, type: "gym", region: "Sinnoh", gym: "Ciudad Pirita",
    title: "Oreburgh City (Rock)", lead: G2_LEAD["Oreburgh City (Rock)"],
    actions: ["Aerodactyl → Avalancha", "Excadrill → Terremoto"],
  },
  // Vs Tyranitar + Excadrill — 2 turns
  {
    id: 12, type: "gym", region: "Sinnoh", gym: "Ciudad Pirita",
    title: "Vs Tyranitar + Excadrill — Turno 1", lead: ["Aerodactyl", "Excadrill"],
    actions: ["Aerodactyl → Protección", "Excadrill → Terremoto"],
  },
  {
    id: 13, type: "gym", region: "Sinnoh", gym: "Ciudad Pirita",
    title: "Vs Tyranitar + Excadrill — Turno 2", lead: ["Aerodactyl", "Excadrill"],
    actions: ["Aerodactyl → Avalancha", "Excadrill → Terremoto"],
  },
  // Vs Gigalith + Excadrill — 1 turn
  {
    id: 14, type: "gym", region: "Sinnoh", gym: "Ciudad Pirita",
    title: "Vs Gigalith + Excadrill", lead: ["Aerodactyl", "Excadrill"],
    actions: ["Aerodactyl → Avalancha", "Excadrill → Terremoto"],
  },
  {
    id: 15, type: "gym", region: "Sinnoh", gym: "Ciudad Rocavelo",
    title: "Sunyshore City (Electric)", lead: G2_LEAD["Sunyshore City (Electric)"],
    actions: ["Togekiss → Vozarrón", "Blastoise → Salpicar"],
  },
  // Vs Lanturn — Swap Blastoise → Vanilluxe
  {
    id: 16, type: "note", title: "Vs Lanturn",
    description: "Cambio: Blastoise → Vanilluxe. Vanilluxe ataca con Ventisca o Viento Glacial.",
  },
  {
    id: 17, type: "gym", region: "Sinnoh", gym: "Ciudad Rocavelo",
    title: "Veilstone City (Fighting)", lead: G2_LEAD["Veilstone City (Fighting)"],
    actions: ["Togekiss → Vozarrón", "Typhlosion → Erupción"],
  },
  {
    id: 18, type: "prep", title: "TP + Heal", heal: true, travel: null,
    description: "Curar equipo antes de viajar a Kanto",
  },
  {
    id: 19, type: "prep", title: "Viajar a Kanto", heal: false, travel: "Kanto",
    description: "Viajar desde Sinnoh a Kanto",
  },

  // ═══════════════════════════════════════
  // THIRD KANTO
  // ═══════════════════════════════════════
  {
    id: 20, type: "gym", region: "Kanto", gym: "Carmín",
    title: "Vermilion City (Electric)", lead: G2_LEAD["Vermilion City (Electric)"],
    actions: ["Aerodactyl → Avalancha", "Excadrill → Terremoto"],
  },
  {
    id: 21, type: "gym", region: "Kanto", gym: "Isla Canela",
    title: "Cinnabar Island (Fire)", lead: G2_LEAD["Cinnabar Island (Fire)"],
    actions: ["Aerodactyl → Avalancha", "Blastoise → Salpicar"],
  },
  // Vs Ninetales / Torkoal — Swap Aerodactyl → Vanilluxe
  {
    id: 22, type: "gym", region: "Kanto", gym: "Isla Canela",
    title: "Vs Ninetales / Torkoal", lead: ["Aerodactyl", "Blastoise"],
    switchTo: ["Vanilluxe"],
    actions: ["Aerodactyl → Vanilluxe (Cambio)", "Blastoise → Salpicar"],
  },
  {
    id: 23, type: "gym", region: "Kanto", gym: "Plateada",
    title: "Pewter City (Rock)", lead: G2_LEAD["Pewter City (Rock)"],
    actions: ["Aerodactyl → Avalancha", "Excadrill → Terremoto"],
  },
  {
    id: 24, type: "gym", region: "Kanto", gym: "Azulona",
    title: "Saffron City (Psychic)", lead: G2_LEAD["Saffron City (Psychic)"],
    actions: ["Aerodactyl → Avalancha", "Excadrill → Terremoto"],
  },
  {
    id: 25, type: "gym", region: "Kanto", gym: "Fucsia",
    title: "Fuchsia City (Poison)", lead: G2_LEAD["Fuchsia City (Poison)"],
    actions: ["Aerodactyl → Avalancha", "Typhlosion → Erupción"],
  },
  {
    id: 26, type: "prep", title: "TP + Heal", heal: true, travel: null,
    description: "Curar equipo antes de viajar a Unova",
  },
  {
    id: 27, type: "prep", title: "Viajar a Unova", heal: false, travel: "Unova",
    description: "Viajar desde Kanto a Unova",
  },

  // ═══════════════════════════════════════
  // FOURTH UNOVA
  // ═══════════════════════════════════════
  {
    id: 28, type: "gym", region: "Unova", gym: "Porcelana",
    title: "Castelia City (Bug)", lead: G2_LEAD["Castelia City (Bug)"],
    actions: ["Vanilluxe → Ventisca", "Blastoise → Salpicar"],
  },
  {
    id: 29, type: "gym", region: "Unova", gym: "Loza",
    title: "Mistralton City (Flying)", lead: G2_LEAD["Mistralton City (Flying)"],
    actions: ["Aerodactyl → Avalancha", "Vanilluxe → Ventisca"],
  },
  {
    id: 30, type: "gym", region: "Unova", gym: "Striaton",
    title: "Striaton City (Fire)", lead: G2_LEAD["Striaton City (Fire)"],
    actions: ["Aerodactyl → Avalancha", "Blastoise → Salpicar"],
  },
  {
    id: 31, type: "gym", region: "Unova", gym: "Striaton",
    title: "Striaton City (Grass)", lead: G2_LEAD["Striaton City (Grass)"],
    actions: ["Togekiss → Vozarrón", "Typhlosion → Erupción"],
  },
  {
    id: 32, type: "gym", region: "Unova", gym: "Striaton",
    title: "Striaton City (Water)", lead: G2_LEAD["Striaton City (Water)"],
    actions: ["Togekiss → Vozarrón", "Excadrill → Terremoto"],
  },
  // Vs Floatzel — Swap Typhlosion → Vanilluxe
  {
    id: 33, type: "gym", region: "Unova", gym: "Striaton",
    title: "Vs Floatzel", lead: ["Excadrill", "Togekiss"],
    switchTo: ["Vanilluxe"],
    actions: ["Excadrill → Terremoto", "Togekiss → Vanilluxe (Cambio)"],
  },
  // Vs Stoutland + Gyarados
  {
    id: 34, type: "gym", region: "Unova", gym: "Striaton",
    title: "Vs Stoutland + Gyarados", lead: ["Togekiss"],
    actions: ["Usar X-Special", "Togekiss → Vozarrón"],
  },
  {
    id: 35, type: "gym", region: "Unova", gym: "Mayólica",
    title: "Nimbasa City (Electric)", lead: G2_LEAD["Nimbasa City (Electric)"],
    actions: ["Togekiss → Vozarrón", "Typhlosion → Erupción"],
  },
  {
    id: 36, type: "prep", title: "TP + Heal", heal: true, travel: null,
    description: "Curar equipo",
  },
  {
    id: 37, type: "gym", region: "Unova", gym: "Caolín",
    title: "Opelucid City (Dragon)", lead: G2_LEAD["Opelucid City (Dragon)"],
    actions: ["Vanilluxe → Ventisca", "Typhlosion → Erupción"],
  },
  {
    id: 38, type: "gym", region: "Unova", gym: "Fayenza",
    title: "Icirrus City (Ice)", lead: G2_LEAD["Icirrus City (Ice)"],
    actions: ["Aerodactyl → Día Soleado", "Typhlosion → Erupción"],
  },
  {
    id: 39, type: "prep", title: "TP + Heal", heal: true, travel: null,
    description: "Curar equipo antes de viajar a Johto",
  },
  {
    id: 40, type: "prep", title: "Viajar a Johto", heal: false, travel: "Johto",
    description: "Viajar desde Unova a Johto",
  },

  // ═══════════════════════════════════════
  // FIFTH JOHTO
  // ═══════════════════════════════════════
  {
    id: 41, type: "gym", region: "Johto", gym: "Malva",
    title: "Violet City (Flying)", lead: G2_LEAD["Violet City (Flying)"],
    actions: ["Aerodactyl → Avalancha", "Vanilluxe → Ventisca"],
  },
  // Vs Pelipper
  {
    id: 42, type: "gym", region: "Johto", gym: "Malva",
    title: "Vs Pelipper", lead: ["Aerodactyl", "Vanilluxe"],
    actions: ["Aerodactyl → Avalancha", "Vanilluxe → Viento Glacial"],
  },
  // Vs Pidgeot
  {
    id: 43, type: "gym", region: "Johto", gym: "Malva",
    title: "Vs Pidgeot", lead: ["Vanilluxe"],
    actions: ["Usar X-Speed", "Vanilluxe → Ventisca"],
  },
  {
    id: 44, type: "gym", region: "Johto", gym: "Caoba",
    title: "Mahogany Town (Ice)", lead: G2_LEAD["Mahogany Town (Ice)"],
    actions: ["Aerodactyl → Día Soleado", "Typhlosion → Erupción"],
  },
  {
    id: 45, type: "gym", region: "Johto", gym: "Trigal",
    title: "Goldenrod City (Normal)", lead: G2_LEAD["Goldenrod City (Normal)"],
    actions: ["Excadrill → Terremoto", "Togekiss → Vozarrón"],
  },
  // Vs Dodrio
  {
    id: 46, type: "gym", region: "Johto", gym: "Trigal",
    title: "Vs Dodrio", lead: ["Togekiss"],
    actions: ["Usar X-Special", "Togekiss → Vozarrón"],
  },
  // Vs Bellossom
  {
    id: 47, type: "gym", region: "Johto", gym: "Trigal",
    title: "Vs Bellossom", lead: ["Togekiss"],
    actions: ["Usar X-Special", "Togekiss → Vozarrón"],
  },
  {
    id: 48, type: "prep", title: "TP + Heal", heal: true, travel: null,
    description: "Curar equipo",
  },
  {
    id: 49, type: "gym", region: "Johto", gym: "Olivo",
    title: "Olivine City (Steel)", lead: G2_LEAD["Olivine City (Steel)"],
    actions: ["Togekiss → Vozarrón", "Typhlosion → Erupción"],
  },
  // Vs Corsola + Blastoise — Swap Typhlosion → Blastoise
  {
    id: 50, type: "gym", region: "Johto", gym: "Olivo",
    title: "Vs Corsola + Blastoise", lead: ["Togekiss", "Typhlosion"],
    switchTo: ["Blastoise"],
    actions: ["Togekiss → Vozarrón", "Typhlosion → Blastoise (Cambio)"],
  },
  {
    id: 51, type: "gym", region: "Johto", gym: "Azalea",
    title: "Azalea Town (Bug)", lead: G2_LEAD["Azalea Town (Bug)"],
    actions: ["Aerodactyl → Avalancha", "Typhlosion → Erupción"],
  },
  // Si aparece Tyranitar
  {
    id: 52, type: "gym", region: "Johto", gym: "Azalea",
    title: "Si aparece Tyranitar", lead: ["Aerodactyl", "Typhlosion"],
    actions: ["Aerodactyl → Día Soleado", "Typhlosion → Erupción"],
  },
  {
    id: 53, type: "gym", region: "Johto", gym: "Orquídea",
    title: "Cianwood City (Fighting)", lead: G2_LEAD["Cianwood City (Fighting)"],
    actions: ["Togekiss → Corte Aéreo", "Excadrill → Terremoto"],
  },
  // Vs Granbull + Hitmontop
  {
    id: 54, type: "gym", region: "Johto", gym: "Orquídea",
    title: "Vs Granbull + Hitmontop", lead: ["Togekiss", "Excadrill"],
    switchTo: ["Vanilluxe"],
    actions: [
      "Togekiss → Corte Aéreo",
      "Excadrill → Vanilluxe (Cambio)",
      "Vanilluxe → Excadrill (Vuelta)",
    ],
  },
];
