// Gym map coordinates (x%, y% on each region map image)
// Calibrated against the exact generated pixel-art map PNGs

export const GYM_COORDS: Record<string, { region: string; x: number; y: number }> = {
  // ── Johto (HGSS-style pixel art) ──────────────────────────────────
  // Blackthorn City → top-right corner (Ice Path area)
  "Endrino":    { region: "Johto",  x: 86, y:  9 },
  // Goldenrod City → center-left large city
  "Trigal":     { region: "Johto",  x: 46, y: 56 },
  // Azalea Town → bottom center
  "Azalea":     { region: "Johto",  x: 46, y: 83 },
  // Olivine City → left coast
  "Olivo":      { region: "Johto",  x: 19, y: 65 },
  // Cianwood City → far-left island
  "Orquidea":   { region: "Johto",  x:  6, y: 32 },
  // Mahogany Town → upper center
  "Caoba":      { region: "Johto",  x: 52, y: 24 },
  // Violet City → right middle
  "Malva":      { region: "Johto",  x: 82, y: 43 },

  // ── Hoenn (Emerald-style pixel art) ───────────────────────────────
  // Dewford Town → small island bottom-left
  "Pueblo Azuliza":   { region: "Hoenn",  x: 10, y: 71 },
  // Rustboro City → top-left
  "Ciudad Ferrica":   { region: "Hoenn",  x: 11, y: 14 },
  // Mauville City → center
  "Ciudad Malvalona": { region: "Hoenn",  x: 42, y: 51 },
  // Petalburg City → bottom-left
  "Ciudad Petalia":   { region: "Hoenn",  x: 26, y: 79 },
  // Lavaridge Town → top center
  "Pueblo Lavacalda": { region: "Hoenn",  x: 33, y: 16 },
  // Fortree City → top right
  "Ciudad Arborada":  { region: "Hoenn",  x: 72, y: 14 },

  // ── Sinnoh (Platinum-style pixel art) ─────────────────────────────
  // Eterna City → top left (green building with [E])
  "Ciudad Vetusta":  { region: "Sinnoh", x: 16, y: 18 },
  // Oreburgh City → center (marked [O])
  "Ciudad Pirita":   { region: "Sinnoh", x: 32, y: 55 },
  // Canalave City → far left ([C] label)
  "Ciudad Canal":    { region: "Sinnoh", x:  9, y: 60 },
  // Veilstone City → right ([V] label)
  "Ciudad Rocavelo": { region: "Sinnoh", x: 77, y: 46 },
  // Pastoria City → bottom right ([P] label)
  "Pueblo Pastoria": { region: "Sinnoh", x: 79, y: 78 },

  // ── Kanto (FRLG-style pixel art) ──────────────────────────────────
  // Vermilion City → bottom center
  "Carmin":     { region: "Kanto",  x: 59, y: 76 },
  // Cinnabar Island → bottom left
  "Isla Canela":{ region: "Kanto",  x: 31, y: 90 },
  // Pewter City → left middle
  "Plateada":   { region: "Kanto",  x: 18, y: 17 },
  // Cerulean City → top right
  "Celeste":    { region: "Kanto",  x: 64, y: 18 },
  // Celadon City → center
  "Azulona":    { region: "Kanto",  x: 38, y: 48 },
  // Fuchsia City → bottom right
  "Fucsia":     { region: "Kanto",  x: 84, y: 71 },

  // ── Unova (Black/White-style pixel art) ───────────────────────────
  // Castelia City → glowing city bottom center
  "Porcelana":  { region: "Unova",  x: 50, y: 78 },
  // Nimbasa City → dots north of Castelia
  "Mayolica":   { region: "Unova",  x: 45, y: 40 },
  // Driftveil City → dots left of Nimbasa
  "Fayenza":    { region: "Unova",  x: 30, y: 45 },
  // Mistralton City → dots far top left
  "Loza":       { region: "Unova",  x: 22, y: 30 },
  // Opelucid City → dome top center
  "Caolin":     { region: "Unova",  x: 55, y: 30 },
  // Striaton City → node bottom right
  "Striaton":   { region: "Unova",  x: 84, y: 58 },
  // Nacrene City → dome right center
  "Esmalte":    { region: "Unova",  x: 65, y: 48 },
};

export const REGION_MAP: Record<string, string> = {
  Johto:  "/images/maps/map_johto.png",
  Hoenn:  "/images/maps/map_hoenn.png",
  Sinnoh: "/images/maps/map_sinnoh.png",
  Kanto:  "/images/maps/map_kanto.png",
  Unova:  "/images/maps/map_unova.png",
};

export const REGION_COLOR: Record<string, string> = {
  Johto:  "text-yellow-400  border-yellow-500/30 bg-yellow-500/10",
  Hoenn:  "text-red-400     border-red-500/30    bg-red-500/10",
  Sinnoh: "text-blue-400    border-blue-500/30   bg-blue-500/10",
  Kanto:  "text-orange-400  border-orange-500/30 bg-orange-500/10",
  Unova:  "text-slate-300   border-slate-500/30  bg-slate-500/10",
};
