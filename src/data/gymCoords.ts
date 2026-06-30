// Gym map coordinates (x%, y% on each region map image)
export const GYM_COORDS = {
  // Johto (Custom Pixel Art Map)
  "Endrino":          { region: "Johto",  x: 82, y: 10 },  // Blackthorn (Top Right)
  "Trigal":           { region: "Johto",  x: 54, y: 49 },  // Goldenrod (Center)
  "Azalea":           { region: "Johto",  x: 54, y: 71 },  // Azalea (Bottom Middle)
  "Olivo":            { region: "Johto",  x: 29, y: 49 },  // Olivine (Middle Left)
  "Orquidea":         { region: "Johto",  x:  7, y: 49 },  // Cianwood (Far Left)
  "Caoba":            { region: "Johto",  x: 71, y: 22 },  // Mahogany (Top Middle-Right)
  "Malva":            { region: "Johto",  x: 82, y: 37 },  // Violet (Middle Right)

  // Hoenn (Sci-fi Stylized Map)
  "Pueblo Azuliza":   { region: "Hoenn",  x: 25, y: 67 },  // Dewford (Big Hexagon Bottom Left)
  "Ciudad Ferrica":   { region: "Hoenn",  x: 14, y: 21 },  // Rustboro (Node Above Petalburg)
  "Ciudad Malvalona": { region: "Hoenn",  x: 37, y: 40 },  // Mauville (Labeled Center)
  "Ciudad Petalia":   { region: "Hoenn",  x: 14, y: 40 },  // Petalburg (Labeled Left)
  "Pueblo Lavacalda": { region: "Hoenn",  x: 37, y: 21 },  // Lavaridge (Node Above Mauville)
  "Ciudad Arborada":  { region: "Hoenn",  x: 53, y: 40 },  // Fortree (Node Right of Mauville)

  // Sinnoh (Sci-fi Stylized Map)
  "Ciudad Vetusta":   { region: "Sinnoh", x: 35, y: 30 },  // Eterna (Glowing Green Crystal Top Left)
  "Ciudad Pirita":    { region: "Sinnoh", x: 45, y: 55 },  // Oreburgh (Approx South East of Jubilife)
  "Ciudad Canal":     { region: "Sinnoh", x: 22, y: 49 },  // Canalave (Labeled Left)
  "Ciudad Rocavelo":  { region: "Sinnoh", x: 81, y: 51 },  // Veilstone (Node Far Right Middle)
  "Pueblo Pastoria":  { region: "Sinnoh", x: 76, y: 67 },  // Pastoria (Node Below Veilstone)

  // Kanto (Sci-fi Stylized Map)
  "Carmin":           { region: "Kanto",  x: 52, y: 75 },  // Vermilion (Labeled Bottom Target)
  "Isla Canela":      { region: "Kanto",  x: 23, y: 64 },  // Cinnabar (Labeled Bottom Left)
  "Plateada":         { region: "Kanto",  x: 22, y: 43 },  // Pewter (Labeled Left)
  "Celeste":          { region: "Kanto",  x: 66, y: 36 },  // Cerulean (Labeled Top Right)
  "Azulona":          { region: "Kanto",  x: 55, y: 49 },  // Celadon (Between Saffron and Left)
  "Fucsia":           { region: "Kanto",  x: 74, y: 58 },  // Fuchsia (Labeled Right)

  // Unova (Sci-fi Stylized Map)
  "Porcelana":        { region: "Unova",  x: 50, y: 78 },  // Castelia (Glowing City Bottom Center)
  "Mayolica":         { region: "Unova",  x: 45, y: 40 },  // Nimbasa (Dots North of Castelia)
  "Fayenza":          { region: "Unova",  x: 30, y: 45 },  // Driftveil (Dots Left of Nimbasa)
  "Loza":             { region: "Unova",  x: 22, y: 30 },  // Mistralton (Dots Far Top Left)
  "Caolin":           { region: "Unova",  x: 55, y: 30 },  // Opelucid (Dome Top Center)
  "Striaton":         { region: "Unova",  x: 84, y: 58 },  // Striaton (Node Bottom Right)
  "Esmalte":          { region: "Unova",  x: 65, y: 48 },  // Nacrene (Dome Right Center)
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
