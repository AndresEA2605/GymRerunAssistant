"use strict";

const COOLDOWN_MS = 18 * 60 * 60 * 1000;
const STORAGE_KEY = "pokemmo_gym_rerun_v3";
const HISTORY_KEY = "pokemmo_gym_rerun_history_v1";

const regions = [
  {
    id: "johto",
    name: "1. Johto",
    color: "#c19a24",
    gyms: [
      {
        id: "j1",
        num: 1,
        name: "Endrino",
        type: "Dragon",
        tone: "green",
        steps: ["Inicio: Weezing + Hydreigon", "Cambiar a: Vanilluxe + Togekiss"],
        moves: [
          ["Dragonite", "Surf"],
          ["Blastoise", "Dia Soleado"],
          ["Resto", "Viento Afin"],
        ],
        after: [],
      },
      {
        id: "j2",
        num: 2,
        name: "Trigal",
        type: "Normal",
        tone: "neutral",
        steps: ["CURAR antes de entrar", "Equipo: Typhlosion en slot 2 + Blastoise W"],
        moves: [],
        after: [{ kind: "item", text: "Blastoise W -> Gafas Elegidas" }],
      },
      {
        id: "j3",
        num: 3,
        name: "Azalea",
        type: "Bicho",
        tone: "green",
        steps: ["Equipo: Weezing variable + Blastoise W"],
        moves: [
          ["Butterfree o Ledian", "Golpe Bajo"],
          ["Resto", "Incinerar"],
        ],
        after: [
          { kind: "special", text: "Usar Channel Glitch para salir" },
          { kind: "item", text: "Weezing -> Gafas Negras" },
        ],
      },
      {
        id: "j4",
        num: 4,
        name: "Olivo",
        type: "Acero",
        tone: "neutral",
        steps: ["Equipo: Weezing variable + Typhlosion"],
        moves: [
          ["Metagross", "T1 -> Dia Soleado, T2 -> Golpe Bajo"],
          ["Resto", "Golpe Bajo"],
        ],
        after: [{ kind: "item", text: "Weezing -> Cinta Elegida" }],
      },
      {
        id: "j5",
        num: 5,
        name: "Orquidea",
        type: "Lucha",
        tone: "amber",
        steps: ["Inicio: Weezing + Hydreigon", "Usar Dia Soleado", "Cambiar a: Typhlosion + Togekiss"],
        moves: [],
        after: [
          { kind: "item", text: "Togekiss -> Panuelo Elegido" },
          { kind: "heal", text: "CURAR" },
        ],
      },
      {
        id: "j6",
        num: 6,
        name: "Caoba",
        type: "Hielo",
        tone: "blue",
        steps: ["Inicio: Weezing + Hydreigon variable", "Cambiar a: Typhlosion + Togekiss"],
        moves: [
          ["Glalie", "Dia Soleado"],
          ["Resto", "Surf"],
        ],
        after: [{ kind: "item", text: "Typhlosion -> Panuelo Elegido" }],
      },
      {
        id: "j7",
        num: 7,
        name: "Malva",
        type: "Volador",
        tone: "violet",
        steps: ["Equipo: Typhlosion + Vanilluxe"],
        moves: [],
        after: [
          { kind: "travel", text: "VIAJAR A HOENN" },
          { kind: "item", text: "Blastoise W -> Panuelo Elegido" },
        ],
      },
    ],
  },
  {
    id: "hoenn",
    name: "2. Hoenn",
    color: "#b94d36",
    gyms: [
      {
        id: "h1",
        num: 1,
        name: "Pueblo Azuliza",
        type: "Lucha",
        tone: "amber",
        steps: ["CURAR antes de entrar", "Equipo: Blastoise W + Togekiss"],
        moves: [],
        after: [],
      },
      {
        id: "h2",
        num: 2,
        name: "Ciudad Ferrica",
        type: "Roca",
        tone: "red",
        steps: ["Equipo: Weezing + Blastoise W", "Usar Golpe Bajo con Weezing"],
        moves: [],
        after: [{ kind: "item", text: "Blastoise W -> Gafas Elegidas" }],
      },
      {
        id: "h3",
        num: 3,
        name: "Ciudad Malvalona",
        type: "Electrico",
        tone: "amber",
        steps: ["Equipo: Typhlosion + Togekiss"],
        moves: [],
        after: [
          { kind: "item", text: "Typhlosion -> Gafas Elegidas" },
          { kind: "item", text: "Togekiss -> Gafas Elegidas" },
        ],
      },
      {
        id: "h4",
        num: 4,
        name: "Ciudad Petalia",
        type: "Normal",
        tone: "neutral",
        steps: ["CURAR antes de entrar", "Inicio: Weezing + Hydreigon", "Usar Surf"],
        moves: [
          ["Stantler, Spinda, Blissey o Chansey", "Cambiar a: Typhlosion + Togekiss (Psicocarga a Blissey)"],
          ["Spinda (Turno 4)", "Cambiar a: Vanilluxe + Togekiss"],
        ],
        after: [{ kind: "item", text: "Hydreigon -> Gafas Elegidas" }],
      },
      {
        id: "h5",
        num: 5,
        name: "Pueblo Lavacalda",
        type: "Fuego",
        tone: "red",
        steps: ["Equipo: Togekiss + Blastoise W"],
        moves: [],
        after: [],
      },
      {
        id: "h6",
        num: 6,
        name: "Ciudad Arborada",
        type: "Volador",
        tone: "violet",
        steps: ["CURAR antes de entrar", "Inicio: Weezing + Hydreigon", "Cambiar a: Typhlosion + Togekiss"],
        moves: [
          ["Swellow + Tropius", "Dia Soleado"],
          ["Altaria + Swellow", "Viento Afin"],
          ["Resto", "Surf + Explosion"],
        ],
        after: [
          { kind: "item", text: "Blastoise W -> Panuelo Elegido" },
          { kind: "heal", text: "CURAR EN PORTUAL" },
          { kind: "travel", text: "VIAJAR A SINNOH" },
        ],
      },
    ],
  },
  {
    id: "sinnoh",
    name: "3. Sinnoh",
    color: "#2e70a8",
    gyms: [
      {
        id: "s1",
        num: 1,
        name: "Ciudad Vetusta",
        type: "Planta",
        tone: "green",
        steps: ["Inicio: Weezing + Hydreigon", "Cambiar a: Typhlosion + Togekiss"],
        moves: [
          ["Whimsicott, Vileplume o Lilligant", "Viento Afin"],
          ["Roserade o Amoonguss", "Surf"],
        ],
        after: [{ kind: "item", text: "Vanilluxe -> Gafas Elegidas" }],
      },
      {
        id: "s2",
        num: 2,
        name: "Ciudad Pirita",
        type: "Roca",
        tone: "red",
        steps: ["CURAR antes de entrar", "Inicio: Weezing + Hydreigon", "Usar Surf"],
        moves: [
          ["Excadrill", "Cambiar a: Typhlosion + Togekiss"],
          ["Resto", "Cambiar a: Togekiss + Blastoise W"],
        ],
        after: [{ kind: "item", text: "Blastoise W -> Gafas Elegidas" }],
      },
      {
        id: "s3",
        num: 3,
        name: "Ciudad Canal",
        type: "Acero",
        tone: "neutral",
        steps: ["CURAR antes de entrar", "Inicio: Weezing + Hydreigon", "Usar Surf"],
        moves: [
          ["Pelipper", "Cambiar a: Togekiss + Blastoise W"],
          ["Gigalith + Aron", "Cambiar a: Typhlosion + Togekiss"],
          ["Bastiodon", "Cambiar a: Vanilluxe + Blastoise W"],
        ],
        after: [{ kind: "item", text: "Vanilluxe -> Panuelo Elegido" }],
      },
      {
        id: "s4",
        num: 4,
        name: "Ciudad Rocavelo",
        type: "Lucha",
        tone: "amber",
        steps: ["CURAR antes de entrar", "Inicio: Weezing variable + Hydreigon"],
        moves: [
          ["Lucario o Wobbuffet", "Surf -> Cambiar a: Typhlosion + Togekiss"],
          ["Resto", "Viento Afin -> Cambiar a: Typhlosion + Togekiss"],
        ],
        after: [{ kind: "item", text: "Hydreigon -> Panuelo Elegido" }],
      },
      {
        id: "s5",
        num: 5,
        name: "Pueblo Pastoria",
        type: "Agua",
        tone: "blue",
        steps: ["CURAR antes de entrar", "Inicio: Weezing + Hydreigon", "Cambiar a: Typhlosion + Togekiss"],
        moves: [
          ["Ludicolo, Mantine o Poliwrath", "Viento Afin"],
          ["Resto", "Surf + Explosion"],
        ],
        after: [{ kind: "travel", text: "VIAJAR A KANTO" }],
      },
    ],
  },
  {
    id: "kanto",
    name: "4. Kanto",
    color: "#d28f22",
    gyms: [
      {
        id: "k1",
        num: 1,
        name: "Carmin",
        type: "Electrico",
        tone: "amber",
        steps: ["Curar si algun Pokemon recibio dano", "Equipo: Typhlosion + Togekiss", "Si hay lluvia -> Usar Rapidez"],
        moves: [],
        after: [],
      },
      {
        id: "k2",
        num: 2,
        name: "Isla Canela",
        type: "Fuego",
        tone: "red",
        steps: ["CURAR antes de entrar", "Inicio: Weezing + Hydreigon variable", "Cambiar a: Togekiss + Blastoise W"],
        moves: [
          ["Moltres, Arcanine o Flareon", "Viento Afin"],
          ["Typhlosion o Charizard", "Surf"],
        ],
        after: [],
      },
      {
        id: "k3",
        num: 3,
        name: "Plateada",
        type: "Roca",
        tone: "red",
        steps: ["CURAR antes de entrar", "Inicio: Weezing + Hydreigon", "Usar Surf", "Cambiar a: Togekiss + Blastoise W", "Psicocarga contra Sandslash o Chansey"],
        moves: [],
        after: [{ kind: "item", text: "Blastoise W -> Panuelo Elegido" }],
      },
      {
        id: "k4",
        num: 4,
        name: "Celeste",
        type: "Agua",
        tone: "blue",
        steps: ["CURAR antes de entrar", "Inicio: Weezing + Hydreigon", "Cambiar a: Typhlosion + Togekiss"],
        moves: [
          ["Carracosta", "Dia Soleado"],
          ["Resto", "Viento Afin"],
        ],
        after: [],
      },
      {
        id: "k5",
        num: 5,
        name: "Azulona",
        type: "Planta",
        tone: "green",
        steps: ["CURAR antes de entrar", "Inicio: Weezing + Hydreigon", "Cambiar a: Typhlosion + Togekiss"],
        moves: [
          ["Whimsicott", "Surf"],
          ["Resto", "Viento Afin"],
        ],
        after: [{ kind: "item", text: "Togekiss -> Panuelo Elegido" }],
      },
      {
        id: "k6",
        num: 6,
        name: "Fucsia",
        type: "Veneno",
        tone: "violet",
        steps: ["Equipo: Typhlosion en slot 1 + Togekiss"],
        moves: [
          ["Tentacruel", "Psiquico"],
          ["Nidoqueen", "Senal Luminosa"],
          ["Resto", "Vozarron"],
        ],
        after: [
          { kind: "heal", text: "CURAR EN CARMIN" },
          { kind: "item", text: "Typhlosion -> Panuelo Elegido" },
          { kind: "travel", text: "VIAJAR A UNOVA" },
        ],
      },
    ],
  },
  {
    id: "unova",
    name: "5. Unova",
    color: "#30343b",
    gyms: [
      {
        id: "u1",
        num: 1,
        name: "Porcelana",
        type: "Bicho",
        tone: "green",
        steps: ["Equipo: Typhlosion + Blastoise W"],
        moves: [],
        after: [],
      },
      {
        id: "u2",
        num: 2,
        name: "Mayolica",
        type: "Electrico",
        tone: "amber",
        steps: ["Equipo: Blastoise W + Togekiss"],
        moves: [],
        after: [{ kind: "item", text: "Typhlosion -> Gafas Elegidas" }],
      },
      {
        id: "u3",
        num: 3,
        name: "Fayenza",
        type: "Roca",
        tone: "red",
        steps: ["Equipo: Weezing + Blastoise W", "Usar Golpe Bajo / Salpicar", "Si Weezing cae -> entrar Vanilluxe"],
        moves: [],
        after: [{ kind: "item", text: "Weezing -> Panuelo Elegido" }],
      },
      {
        id: "u4",
        num: 4,
        name: "Loza",
        type: "Volador",
        tone: "violet",
        steps: ["CURAR antes de entrar", "Equipo: Blastoise W + Vanilluxe"],
        moves: [
          ["Unfezant", "Cambiar a Weezing en T1 por Blastoise W. Usar Golpe Bajo en T2 y T3"],
        ],
        after: [
          { kind: "item", text: "Togekiss -> Gafas Elegidas" },
          { kind: "item", text: "Weezing -> Cinta Elegida" },
        ],
      },
      {
        id: "u5",
        num: 5,
        name: "Caolin",
        type: "Dragon",
        tone: "green",
        steps: ["Inicio: Weezing + Hydreigon", "Usar Surf"],
        moves: [
          ["Hydreigon", "Cambiar a: Typhlosion + Togekiss"],
          ["Resto", "Cambiar a: Vanilluxe + Togekiss"],
        ],
        after: [{ kind: "item", text: "Blastoise W -> Gafas Elegidas" }],
      },
      {
        id: "u6",
        num: 6,
        name: "Striaton",
        type: "Fuego / Planta / Agua",
        tone: "neutral",
        battles: 3,
        steps: [
          "CURAR antes de entrar",
          "Lider Fuego -> Equipo: Togekiss + Blastoise W",
          "Lider Planta -> Equipo: Typhlosion + Togekiss",
          "Lider Agua -> Equipo: Typhlosion + Togekiss",
          "Estrategia: Refuerzo + Vozarron",
          "Si alguno cae -> entrar Weezing y usar Golpe Bajo",
        ],
        moves: [],
        after: [],
      },
      {
        id: "u7",
        num: 7,
        name: "Esmalte",
        type: "Normal",
        tone: "neutral",
        steps: ["Inicio: Weezing + Hydreigon", "Usar Danza Lluvia", "Cambiar a: Togekiss + Blastoise W"],
        moves: [],
        after: [],
      },
    ],
  },
];

const toneColors = {
  green: ["#e2f2e9", "#167c5a"],
  amber: ["#faead4", "#b06016"],
  red: ["#f8dfd9", "#b94332"],
  blue: ["#dfecf6", "#2d6fa8"],
  violet: ["#ebe8f7", "#5b5797"],
  neutral: ["#f0efe8", "#62645c"],
};

const defaultState = {
  currentRegion: "johto",
  open: {},
  done: {},
  steps: {},
  cooldowns: {},
  run: {
    running: false,
    startedAt: null,
    elapsedBeforePause: 0,
  },
  filters: {
    query: "",
    pendingOnly: false,
  },
};

let state = loadState();
let tickId = null;
let toastId = null;

const elements = {
  progressCount: document.querySelector("#progressCount"),
  progressBar: document.querySelector("#progressBar"),
  progressText: document.querySelector("#progressText"),
  runTimer: document.querySelector("#runTimer"),
  runStatus: document.querySelector("#runStatus"),
  cooldownTimer: document.querySelector("#cooldownTimer"),
  cooldownName: document.querySelector("#cooldownName"),
  regionTabs: document.querySelector("#regionTabs"),
  regionTitle: document.querySelector("#regionTitle"),
  regionMeta: document.querySelector("#regionMeta"),
  routeList: document.querySelector("#routeList"),
  historyList: document.querySelector("#historyList"),
  searchInput: document.querySelector("#searchInput"),
  pendingOnly: document.querySelector("#pendingOnly"),
  toast: document.querySelector("#toast"),
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return saved ? mergeState(clone(defaultState), saved) : clone(defaultState);
  } catch {
    return clone(defaultState);
  }
}

function mergeState(base, saved) {
  return {
    ...base,
    ...saved,
    open: { ...base.open, ...(saved.open || {}) },
    done: { ...base.done, ...(saved.done || {}) },
    steps: { ...base.steps, ...(saved.steps || {}) },
    cooldowns: { ...base.cooldowns, ...(saved.cooldowns || {}) },
    run: { ...base.run, ...(saved.run || {}) },
    filters: { ...base.filters, ...(saved.filters || {}) },
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function allGyms() {
  return regions.flatMap((region) => region.gyms.map((gym) => ({ ...gym, regionId: region.id, regionName: region.name })));
}

function totalBattles() {
  return allGyms().reduce((sum, gym) => sum + (gym.battles || 1), 0);
}

function totalStops() {
  return allGyms().length;
}

function doneBattles() {
  return allGyms().reduce((sum, gym) => sum + (state.done[gym.id] ? gym.battles || 1 : 0), 0);
}

function regionById(regionId) {
  return regions.find((region) => region.id === regionId) || regions[0];
}

function countRegionBattles(region) {
  return region.gyms.reduce((sum, gym) => sum + (gym.battles || 1), 0);
}

function countDoneRegionBattles(region) {
  return region.gyms.reduce((sum, gym) => sum + (state.done[gym.id] ? gym.battles || 1 : 0), 0);
}

function normalize(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatTime(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((unit) => String(unit).padStart(2, "0")).join(":");
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function stepKey(gymId, section, index) {
  return `${gymId}:${section}:${index}`;
}

function checkedStepsForGym(gym) {
  const total = gym.steps.length + gym.moves.length + gym.after.length;
  let checked = 0;
  gym.steps.forEach((_, index) => {
    if (state.steps[stepKey(gym.id, "step", index)]) checked += 1;
  });
  gym.moves.forEach((_, index) => {
    if (state.steps[stepKey(gym.id, "move", index)]) checked += 1;
  });
  gym.after.forEach((_, index) => {
    if (state.steps[stepKey(gym.id, "after", index)]) checked += 1;
  });
  return { checked, total };
}

function explainStep(raw) {
  const step = raw.trim();
  const lower = normalize(step);

  if (lower === "curar" || lower.startsWith("curar ")) {
    return "Ve al Centro Pokemon mas cercano, cura todo el equipo y revisa que tengas PP antes de entrar.";
  }

  if (lower.includes("curar en ")) {
    const place = step.replace(/curar en /i, "").trim();
    return `Ve al Centro Pokemon de ${place}, cura todo el equipo y continua desde ahi.`;
  }

  if (lower.startsWith("curar si")) {
    return "Si algun Pokemon recibio dano, cura antes de hablar con el lider.";
  }

  if (lower.startsWith("inicio:")) {
    return `Antes de hablar con el lider, pon como Pokemon activos en slots 1 y 2: ${step.split(":").slice(1).join(":").trim()}.`;
  }

  if (lower.startsWith("equipo:")) {
    return `Antes de entrar al gym, ordena el equipo para iniciar con: ${step.split(":").slice(1).join(":").trim()}.`;
  }

  if (lower.startsWith("cambiar a:")) {
    return `Cuando toque cambiar dentro del combate, manda al campo a: ${step.split(":").slice(1).join(":").trim()}.`;
  }

  if (lower.startsWith("cambiar ") && step.includes("->")) {
    return explainItemChange(step.replace(/^Cambiar\s+/i, ""));
  }

  if (lower.startsWith("t1")) {
    return `Turno 1: ${step.replace(/^T1\s*->\s*/i, "")}.`;
  }

  if (lower.startsWith("t2")) {
    return `Turno 2: ${step.replace(/^T2\s*/i, "").replace(/^contra\s+/i, "contra ")}.`;
  }

  if (lower.startsWith("contra ") && step.includes("->")) {
    const [target, action] = step.replace(/^Contra\s+/i, "").split("->").map((part) => part.trim());
    return `Cuando el rival saque ${target}, cambia o actua asi: ${action}.`;
  }

  if (lower.startsWith("vs ") && step.includes("->")) {
    const [target, action] = step.replace(/^Vs\s+/i, "").split("->").map((part) => part.trim());
    return `Cuando veas ${target}, haz esto: ${action}.`;
  }

  if (lower.startsWith("resto") && step.includes("->")) {
    return `Para los Pokemon restantes del lider: ${step.split("->").slice(1).join("->").trim()}.`;
  }

  if (lower.startsWith("si ") && step.includes("->")) {
    const [condition, action] = step.split("->").map((part) => part.trim());
    return `Condicion: ${condition}. Si pasa, haz: ${action}.`;
  }

  if (lower.startsWith("gym de ") && step.includes("->")) {
    const [gym, leads] = step.split("->").map((part) => part.trim());
    return `${gym}: antes de hablar con el lider, pon como leads a ${leads}.`;
  }

  if (lower.startsWith("estrategia:")) {
    return `Plan del combate: ${step.replace(/^Estrategia:\s*/i, "")}.`;
  }

  if (lower.startsWith("usar ")) {
    return `En este punto usa: ${step.replace(/^Usar\s+/i, "")}.`;
  }

  if (step.includes("->")) {
    const [left, right] = step.split("->").map((part) => part.trim());
    return `${left}: ${right}.`;
  }

  return step.endsWith(".") ? step : `${step}.`;
}

function explainMove(move) {
  const [target, action] = move;
  if (normalize(target) === "resto") {
    return `Contra los demas Pokemon del lider, usa ${action}.`;
  }
  return `Cuando aparezca ${target}, usa ${action}.`;
}

function explainAfter(action) {
  if (action.kind === "item") return explainItemChange(action.text);
  if (action.kind === "heal") return explainStep(action.text);
  if (action.kind === "travel") {
    const destination = action.text.replace(/VIAJAR A\s*/i, "").trim();
    return `Cuando termines este gym, viaja a ${destination} y sigue con la siguiente region.`;
  }
  return `${action.text}.`;
}

function explainItemChange(text) {
  const [pokemon, item] = text.split("->").map((part) => part.trim());
  if (!pokemon || !item) return text;
  return `Antes de continuar: abre Equipo, selecciona ${pokemon}, elige dar objeto y equipale ${item}. Verifica que ${item} quede visible en ${pokemon}.`;
}

function renderTabs() {
  elements.regionTabs.innerHTML = regions
    .map((region) => {
      const done = countDoneRegionBattles(region);
      const total = countRegionBattles(region);
      const active = region.id === state.currentRegion ? " active" : "";
      return `
        <button type="button" class="${active.trim()}" data-region="${region.id}">
          <strong>${escapeHtml(region.name)}</strong>
          <small>${done}/${total} combates</small>
        </button>
      `;
    })
    .join("");
}

function renderSummary() {
  const done = doneBattles();
  const total = totalBattles();
  const percent = total ? Math.round((done / total) * 100) : 0;
  elements.progressCount.textContent = `${done}/${total} combates`;
  elements.progressText.textContent = `${done} de ${total} combates marcados en ${totalStops()} paradas`;
  elements.progressBar.style.width = `${percent}%`;

  const region = regionById(state.currentRegion);
  elements.regionTitle.textContent = region.name;
  elements.regionMeta.textContent = `${countDoneRegionBattles(region)}/${countRegionBattles(region)} combates`;
}

function renderRunTimer() {
  const elapsed = currentElapsed();
  elements.runTimer.textContent = formatTime(elapsed);
  if (state.run.running) {
    elements.runStatus.textContent = "En progreso";
  } else if (elapsed > 0) {
    elements.runStatus.textContent = "Pausado";
  } else {
    elements.runStatus.textContent = "Sin iniciar";
  }

  document.querySelector("[data-action='start-run']").hidden = state.run.running || elapsed > 0;
  document.querySelector("[data-action='pause-run']").hidden = !state.run.running;
  document.querySelector("[data-action='resume-run']").hidden = state.run.running || elapsed === 0;
  document.querySelector("[data-action='finish-run']").hidden = !state.run.running && elapsed === 0;
}

function renderCooldown() {
  const now = Date.now();
  const active = allGyms()
    .map((gym) => ({ gym, remaining: (state.cooldowns[gym.id] || 0) - now }))
    .filter((entry) => entry.remaining > 0)
    .sort((a, b) => a.remaining - b.remaining)[0];

  if (!active) {
    elements.cooldownTimer.textContent = "--";
    elements.cooldownName.textContent = "Ningun gym en cooldown";
    return;
  }

  elements.cooldownTimer.textContent = formatTime(active.remaining);
  elements.cooldownName.textContent = `${active.gym.name} vuelve primero`;
}

function matchesFilters(gym) {
  if (state.filters.pendingOnly && state.done[gym.id]) return false;
  const query = normalize(state.filters.query.trim());
  if (!query) return true;
  const haystack = normalize(
    [
      gym.name,
      gym.type,
      gym.regionName,
      ...gym.steps,
      ...gym.moves.flat(),
      ...gym.after.map((item) => item.text),
    ].join(" ")
  );
  return haystack.includes(query);
}

function renderRoute() {
  const region = regionById(state.currentRegion);
  const gyms = region.gyms.map((gym) => ({ ...gym, regionName: region.name })).filter(matchesFilters);

  if (!gyms.length) {
    elements.routeList.innerHTML = `<p class="empty-state">No hay gimnasios que coincidan con el filtro actual.</p>`;
    return;
  }

  elements.routeList.innerHTML = gyms.map(renderGymCard).join("");
}

function renderGymCard(gym) {
  const [bg, color] = toneColors[gym.tone || "neutral"];
  const done = Boolean(state.done[gym.id]);
  const open = Boolean(state.open[gym.id]);
  const cooldown = cooldownText(gym.id);
  const className = ["gym-card", done ? "done" : "", cooldown.active ? "cooldown" : ""].filter(Boolean).join(" ");
  const checked = checkedStepsForGym(gym);
  const battleLabel = gym.battles && gym.battles > 1 ? `${gym.battles} combates` : "1 combate";

  return `
    <article class="${className}" id="gym-${escapeHtml(gym.id)}">
      <button class="gym-summary" type="button" data-action="toggle-card" data-gym="${escapeHtml(gym.id)}">
        <span class="gym-number" style="background:${bg};color:${color}">${gym.num}</span>
        <span class="gym-title">
          <strong>${escapeHtml(gym.name)}</strong>
          <small>${escapeHtml(gym.type)} - ${battleLabel}</small>
        </span>
        <span class="gym-status">${cooldown.label || `${checked.checked}/${checked.total} pasos`}</span>
      </button>
      <button class="check-button ${done ? "done" : ""}" type="button" data-action="toggle-gym" data-gym="${escapeHtml(gym.id)}" aria-label="${done ? "Desmarcar" : "Marcar"} ${escapeHtml(gym.name)}">${done ? "OK" : ""}</button>
      ${open ? renderGymBody(gym) : ""}
    </article>
  `;
}

function renderGymBody(gym) {
  return `
    <div class="gym-body">
      ${renderStepSection("Haz esto", gym.steps, gym.id, "step", explainStep)}
      ${renderStepSection("Movimientos por rival", gym.moves, gym.id, "move", explainMove)}
      ${renderStepSection("Antes del siguiente gym", gym.after, gym.id, "after", explainAfter)}
    </div>
  `;
}

function renderStepSection(title, items, gymId, section, formatter) {
  if (!items.length) return "";
  return `
    <section>
      <h3 class="section-label">${title}</h3>
      <ul class="step-list">
        ${items
          .map((item, index) => {
            const key = stepKey(gymId, section, index);
            const checked = Boolean(state.steps[key]);
            return `
              <li class="${checked ? "checked" : ""}">
                <label>
                  <input type="checkbox" data-action="toggle-step" data-gym="${escapeHtml(gymId)}" data-section="${section}" data-index="${index}" ${checked ? "checked" : ""}>
                  <span>${escapeHtml(formatter(item))}</span>
                </label>
              </li>
            `;
          })
          .join("")}
      </ul>
    </section>
  `;
}

function renderHistory() {
  const history = loadHistory();
  if (!history.length) {
    elements.historyList.innerHTML = `<p class="empty-state">Aun no hay runs completadas.</p>`;
    return;
  }

  const bestElapsed = Math.min(...history.map((item) => item.elapsed));
  elements.historyList.innerHTML = `
    <div class="history-list">
      ${history
        .map((item, index) => {
          const best = item.elapsed === bestElapsed ? " - mejor" : "";
          return `
            <div class="history-row">
              <span>#${index + 1} - ${formatDate(item.finishedAt)} - ${item.battles}/${totalBattles()} combates${best}</span>
              <strong>${formatTime(item.elapsed)}</strong>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function cooldownText(gymId) {
  const end = state.cooldowns[gymId];
  if (!end) return { active: false, label: "" };
  const remaining = end - Date.now();
  if (remaining <= 0) return { active: false, label: "Cooldown listo" };
  return { active: true, label: formatTime(remaining) };
}

function currentElapsed() {
  if (!state.run.running || !state.run.startedAt) return state.run.elapsedBeforePause || 0;
  return (state.run.elapsedBeforePause || 0) + (Date.now() - state.run.startedAt);
}

function startRun() {
  state.run.running = true;
  state.run.startedAt = Date.now();
  state.run.elapsedBeforePause = 0;
  saveState();
  startTicker();
  showToast("Run iniciada.");
}

function pauseRun() {
  if (!state.run.running) return;
  state.run.elapsedBeforePause = currentElapsed();
  state.run.running = false;
  state.run.startedAt = null;
  saveState();
  render();
  showToast("Run pausada.");
}

function resumeRun() {
  if (state.run.running) return;
  state.run.running = true;
  state.run.startedAt = Date.now();
  saveState();
  startTicker();
  showToast("Run reanudada.");
}

function finishRun() {
  const elapsed = currentElapsed();
  if (!elapsed) return;
  const history = loadHistory();
  history.unshift({
    finishedAt: Date.now(),
    elapsed,
    battles: doneBattles(),
  });
  saveHistory(history.slice(0, 20));

  state.run.running = false;
  state.run.startedAt = null;
  state.run.elapsedBeforePause = 0;
  saveState();
  render();
  showToast("Run guardada en el historial.");
}

function resetProgress() {
  const ok = confirm("Esto borra checks, pasos y cooldowns. El historial se conserva. Continuar?");
  if (!ok) return;
  state.done = {};
  state.steps = {};
  state.cooldowns = {};
  state.open = {};
  state.run = clone(defaultState.run);
  saveState();
  render();
  showToast("Checks reiniciados.");
}

function clearHistory() {
  const ok = confirm("Limpiar historial de runs?");
  if (!ok) return;
  saveHistory([]);
  renderHistory();
  showToast("Historial limpio.");
}

function toggleCard(gymId) {
  state.open[gymId] = !state.open[gymId];
  saveState();
  renderRoute();
}

function toggleGym(gymId) {
  const gym = allGyms().find((item) => item.id === gymId);
  if (!gym) return;
  const nextValue = !state.done[gymId];
  state.done[gymId] = nextValue;
  if (nextValue) {
    state.cooldowns[gymId] = Date.now() + COOLDOWN_MS;
    markAllGymSteps(gym, true);
    if (!state.run.running && currentElapsed() === 0) startRun();
  } else {
    delete state.cooldowns[gymId];
  }
  saveState();
  render();
}

function toggleStep(gymId, section, index, checked) {
  state.steps[stepKey(gymId, section, Number(index))] = checked;
  const gym = allGyms().find((item) => item.id === gymId);
  if (gym) {
    const progress = checkedStepsForGym(gym);
    if (progress.total > 0 && progress.checked === progress.total && !state.done[gymId]) {
      state.done[gymId] = true;
      state.cooldowns[gymId] = Date.now() + COOLDOWN_MS;
      if (!state.run.running && currentElapsed() === 0) startRun();
      showToast(`${gym.name} completado.`);
    }
  }
  saveState();
  render();
}

function markAllGymSteps(gym, checked) {
  gym.steps.forEach((_, index) => {
    state.steps[stepKey(gym.id, "step", index)] = checked;
  });
  gym.moves.forEach((_, index) => {
    state.steps[stepKey(gym.id, "move", index)] = checked;
  });
  gym.after.forEach((_, index) => {
    state.steps[stepKey(gym.id, "after", index)] = checked;
  });
}

function goNextPending() {
  const target = allGyms().find((gym) => !state.done[gym.id]);
  if (!target) {
    showToast("No quedan gimnasios pendientes.");
    return;
  }
  state.currentRegion = target.regionId;
  state.open[target.id] = true;
  saveState();
  render();
  requestAnimationFrame(() => {
    document.querySelector(`#gym-${CSS.escape(target.id)}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

function setRegion(regionId) {
  state.currentRegion = regionId;
  saveState();
  render();
}

function showToast(message) {
  window.clearTimeout(toastId);
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  toastId = window.setTimeout(() => elements.toast.classList.remove("show"), 2400);
}

function startTicker() {
  window.clearInterval(tickId);
  tickId = window.setInterval(() => {
    renderRunTimer();
    renderCooldown();
    renderSummary();
    renderTabs();
    renderRoute();
  }, 1000);
  render();
}

function render() {
  elements.searchInput.value = state.filters.query;
  elements.pendingOnly.checked = state.filters.pendingOnly;
  renderTabs();
  renderSummary();
  renderRunTimer();
  renderCooldown();
  renderRoute();
  renderHistory();
}

document.addEventListener("click", (event) => {
  const actionElement = event.target.closest("[data-action]");
  if (!actionElement) return;

  const action = actionElement.dataset.action;
  if (action === "start-run") startRun();
  if (action === "pause-run") pauseRun();
  if (action === "resume-run") resumeRun();
  if (action === "finish-run") finishRun();
  if (action === "reset-progress") resetProgress();
  if (action === "clear-history") clearHistory();
  if (action === "next-pending") goNextPending();
  if (action === "toggle-card") toggleCard(actionElement.dataset.gym);
  if (action === "toggle-gym") toggleGym(actionElement.dataset.gym);
});

document.addEventListener("change", (event) => {
  if (event.target.matches("[data-action='toggle-step']")) {
    toggleStep(event.target.dataset.gym, event.target.dataset.section, event.target.dataset.index, event.target.checked);
  }

  if (event.target === elements.pendingOnly) {
    state.filters.pendingOnly = elements.pendingOnly.checked;
    saveState();
    renderRoute();
  }
});

elements.searchInput.addEventListener("input", () => {
  state.filters.query = elements.searchInput.value;
  saveState();
  renderRoute();
});

elements.regionTabs.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-region]");
  if (tab) setRegion(tab.dataset.region);
});

if (state.run.running) startTicker();
else {
  render();
  tickId = window.setInterval(() => {
    renderCooldown();
    renderSummary();
    renderTabs();
    renderRoute();
  }, 1000);
}
