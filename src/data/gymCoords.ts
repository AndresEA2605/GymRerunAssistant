// Gym map coordinates (x%, y% on each region map image)
// Johto map pins
const GYM_COORDS = {
  // Johto
  "Endrino":          { region: "Johto",  x: 72, y: 18 },  // Blackthorn
  "Trigal":           { region: "Johto",  x: 55, y: 42 },  // Goldenrod
  "Azalea":           { region: "Johto",  x: 40, y: 65 },  // Azalea
  "Olivo":            { region: "Johto",  x: 18, y: 48 },  // Olivine
  "Orquidea":         { region: "Johto",  x: 30, y: 28 },  // Ecruteak
  "Caoba":            { region: "Johto",  x: 78, y: 30 },  // Mahogany
  "Malva":            { region: "Johto",  x: 62, y: 22 },  // Violet (approx)
  // Hoenn
  "Pueblo Azuliza":   { region: "Hoenn",  x: 45, y: 28 },
  "Ciudad Ferrica":   { region: "Hoenn",  x: 60, y: 55 },
  "Ciudad Malvalona": { region: "Hoenn",  x: 38, y: 48 },
  "Ciudad Petalia":   { region: "Hoenn",  x: 22, y: 62 },
  "Pueblo Lavacalda": { region: "Hoenn",  x: 72, y: 38 },
  "Ciudad Arborada":  { region: "Hoenn",  x: 55, y: 72 },
  // Sinnoh
  "Ciudad Vetusta":   { region: "Sinnoh", x: 30, y: 35 },
  "Ciudad Pirita":    { region: "Sinnoh", x: 52, y: 25 },
  "Ciudad Canal":     { region: "Sinnoh", x: 65, y: 42 },
  "Ciudad Rocavelo":  { region: "Sinnoh", x: 40, y: 55 },
  "Pueblo Pastoria":  { region: "Sinnoh", x: 72, y: 65 },
  // Kanto
  "Carmin":           { region: "Kanto",  x: 65, y: 70 },
  "Isla Canela":      { region: "Kanto",  x: 18, y: 82 },
  "Plateada":         { region: "Kanto",  x: 42, y: 28 },
  "Celeste":          { region: "Kanto",  x: 75, y: 35 },
  "Azulona":          { region: "Kanto",  x: 55, y: 50 },
  "Fucsia":           { region: "Kanto",  x: 35, y: 70 },
  // Unova
  "Porcelana":        { region: "Unova",  x: 50, y: 30 },
  "Mayolica":         { region: "Unova",  x: 30, y: 45 },
  "Fayenza":          { region: "Unova",  x: 65, y: 45 },
  "Loza":             { region: "Unova",  x: 40, y: 60 },
  "Caolin":           { region: "Unova",  x: 60, y: 60 },
  "Striaton":         { region: "Unova",  x: 50, y: 75 },
  "Esmalte":          { region: "Unova",  x: 75, y: 30 },
};

const REGION_MAP = {
  Johto:  "/images/maps/map_johto.png",
  Hoenn:  "/images/maps/map_hoenn.png",
  Sinnoh: "/images/maps/map_sinnoh.png",
  Kanto:  "/images/maps/map_kanto.png",
  Unova:  "/images/maps/map_unova.png",
};

const REGION_COLOR = {
  Johto:  "text-yellow-400  border-yellow-500/30 bg-yellow-500/10",
  Hoenn:  "text-red-400     border-red-500/30    bg-red-500/10",
  Sinnoh: "text-blue-400    border-blue-500/30   bg-blue-500/10",
  Kanto:  "text-orange-400  border-orange-500/30 bg-orange-500/10",
  Unova:  "text-slate-300   border-slate-500/30  bg-slate-500/10",
};

export { GYM_COORDS, REGION_MAP, REGION_COLOR };
