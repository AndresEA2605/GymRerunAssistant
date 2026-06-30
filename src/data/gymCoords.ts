// Gym map coordinates (x%, y% on each region map image)
export const GYM_COORDS = {
  // Johto
  "Endrino":          { region: "Johto",  x: 85, y: 45 },  // Blackthorn
  "Trigal":           { region: "Johto",  x: 35, y: 55 },  // Goldenrod
  "Azalea":           { region: "Johto",  x: 45, y: 80 },  // Azalea
  "Olivo":            { region: "Johto",  x: 18, y: 45 },  // Olivine
  "Orquidea":         { region: "Johto",  x: 40, y: 30 },  // Ecruteak
  "Caoba":            { region: "Johto",  x: 65, y: 30 },  // Mahogany
  "Malva":            { region: "Johto",  x: 55, y: 40 },  // Violet

  // Hoenn
  "Pueblo Azuliza":   { region: "Hoenn",  x: 18, y: 82 },  // Dewford
  "Ciudad Ferrica":   { region: "Hoenn",  x: 12, y: 45 },  // Rustboro
  "Ciudad Malvalona": { region: "Hoenn",  x: 45, y: 55 },  // Mauville
  "Ciudad Petalia":   { region: "Hoenn",  x: 25, y: 70 },  // Petalburg
  "Pueblo Lavacalda": { region: "Hoenn",  x: 40, y: 30 },  // Lavaridge
  "Ciudad Arborada":  { region: "Hoenn",  x: 65, y: 20 },  // Fortree

  // Sinnoh
  "Ciudad Vetusta":   { region: "Sinnoh", x: 30, y: 30 },  // Eterna
  "Ciudad Pirita":    { region: "Sinnoh", x: 45, y: 60 },  // Oreburgh
  "Ciudad Canal":     { region: "Sinnoh", x: 10, y: 50 },  // Canalave
  "Ciudad Rocavelo":  { region: "Sinnoh", x: 75, y: 45 },  // Veilstone
  "Pueblo Pastoria":  { region: "Sinnoh", x: 65, y: 80 },  // Pastoria

  // Kanto
  "Carmin":           { region: "Kanto",  x: 60, y: 60 },  // Vermilion
  "Isla Canela":      { region: "Kanto",  x: 20, y: 85 },  // Cinnabar
  "Plateada":         { region: "Kanto",  x: 25, y: 30 },  // Pewter
  "Celeste":          { region: "Kanto",  x: 60, y: 20 },  // Cerulean
  "Azulona":          { region: "Kanto",  x: 45, y: 45 },  // Celadon
  "Fucsia":           { region: "Kanto",  x: 50, y: 80 },  // Fuchsia

  // Unova
  "Porcelana":        { region: "Unova",  x: 50, y: 80 },  // Castelia
  "Mayolica":         { region: "Unova",  x: 50, y: 55 },  // Nimbasa
  "Fayenza":          { region: "Unova",  x: 25, y: 50 },  // Driftveil
  "Loza":             { region: "Unova",  x: 18, y: 30 },  // Mistralton
  "Caolin":           { region: "Unova",  x: 68, y: 25 },  // Opelucid
  "Striaton":         { region: "Unova",  x: 82, y: 80 },  // Striaton
  "Esmalte":          { region: "Unova",  x: 70, y: 75 },  // Nacrene
};

export const REGION_MAP = {
  Johto:  "/images/maps/map_johto.png",
  Hoenn:  "/images/maps/map_hoenn.png",
  Sinnoh: "/images/maps/map_sinnoh.png",
  Kanto:  "/images/maps/map_kanto.png",
  Unova:  "/images/maps/map_unova.png",
};

export const REGION_COLOR = {
  Johto:  "text-yellow-400  border-yellow-500/30 bg-yellow-500/10",
  Hoenn:  "text-red-400     border-red-500/30    bg-red-500/10",
  Sinnoh: "text-blue-400    border-blue-500/30   bg-blue-500/10",
  Kanto:  "text-orange-400  border-orange-500/30 bg-orange-500/10",
  Unova:  "text-slate-300   border-slate-500/30  bg-slate-500/10",
};
