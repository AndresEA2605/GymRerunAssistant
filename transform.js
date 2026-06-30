const fs = require('fs');
const path = require('path');

const routePath = path.join(__dirname, 'src', 'data', 'route.json');
const rawRoute = JSON.parse(fs.readFileSync(routePath, 'utf-8'));

const optimizedRoute = [];
let currentPrep = null;
let stepIdCounter = 1;

function flushPrep() {
  if (currentPrep) {
    if (Object.keys(currentPrep.items).length > 0 || currentPrep.heal || currentPrep.travel) {
      
      // Convert items object to array
      const itemsArray = [];
      for (const [itemName, pokemonList] of Object.entries(currentPrep.items)) {
        itemsArray.push({ item: itemName, pokemon: pokemonList });
      }

      optimizedRoute.push({
        id: stepIdCounter++,
        type: 'prep',
        title: currentPrep.travel ? `Viaje a ${currentPrep.travel}` : 'Preparación',
        heal: currentPrep.heal,
        travel: currentPrep.travel,
        items: itemsArray.length > 0 ? itemsArray : undefined
      });
    }
    currentPrep = null;
  }
}

function initPrep() {
  if (!currentPrep) {
    currentPrep = {
      heal: false,
      travel: null,
      items: {}
    };
  }
}

for (const step of rawRoute) {
  if (step.type === 'gym' || step.type === 'note') {
    flushPrep();
    step.id = stepIdCounter++;
    // Clean up titles by removing redundant words for gym steps
    if (step.type === 'gym') {
      step.title = step.gym || step.title;
      delete step.description; // We don't need "Líder: Endrino... Orden..."
    }
    optimizedRoute.push(step);
  } else {
    // It's heal, item, or travel
    initPrep();
    if (step.type === 'heal') {
      currentPrep.heal = true;
    } else if (step.type === 'travel') {
      currentPrep.travel = step.region;
    } else if (step.type === 'item') {
      // Parse description: "Pokemon -> Item"
      const parts = step.description.split('->').map(s => s.trim());
      if (parts.length === 2) {
        const pokemon = parts[0];
        const item = parts[1];
        if (!currentPrep.items[item]) {
          currentPrep.items[item] = [];
        }
        if (!currentPrep.items[item].includes(pokemon)) {
            currentPrep.items[item].push(pokemon);
        }
      }
    }
  }
}
flushPrep();

fs.writeFileSync(routePath, JSON.stringify(optimizedRoute, null, 2), 'utf-8');
console.log('Ruta optimizada con éxito.');
