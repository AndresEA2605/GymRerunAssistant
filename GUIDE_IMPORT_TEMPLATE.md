# Plantilla para importar una nueva guía a la app

Usa esta plantilla para que una IA convierta un documento de guía en la estructura que consume la app.

## 1) Parámetros que debes entregar

1. Documento de la guía
   - Texto completo o Markdown del recorrido.
   - Idealmente en el mismo orden en que se juega.

2. Información del juego o región
   - Nombre del juego o región.
   - Si aplica, indicar si se trata de una ruta lineal o con viajes entre regiones.

3. Formato deseado de salida
   - Indicar que el resultado debe ser un array de objetos de guía, separado del contenido de la app principal, compatibles con [src/data/route.json](src/data/route.json).
   - Aclarar que no debe incluir lógica de interfaz, componentes ni texto de la app principal.

4. Reglas de estilo
   - Idioma: español.
   - Mantener nombres de Pokémon y movimientos reales o consistentes.
   - Usar frases cortas y accionables.
   - Si la guía menciona objetos especiales, convertirlos a `items`.
   - Si hay atajos o consejos, convertirlos a `type: "note"`.

5. Opcional pero muy útil
   - Lista de equipos recomendados o líderes.
   - Lista de objetos a preparar (gafas, pañuelos, etc.).
   - Indicar si hay pasos de viaje entre regiones.

## 2) Prompt listo para usar

Copia y pega este prompt en la IA:

```text
Convierte este documento de guía en datos para una app de seguimiento de ruta Pokémon.

Objetivo:
Generar un array de objetos compatibles con la estructura de RouteStep usada en src/data/route.json y src/types/index.ts.

Instrucciones:
- Mantén el orden de la ruta tal como aparece en la guía.
- Separa la guía en datos estructurados para la app; no la mezcles con la lógica de la interfaz ni con el contenido principal de la app.
- Crea un paso por cada gimnasio, usando el tipo "gym".
- Si la guía indica preparación previa, crea pasos de tipo "prep".
- Si la guía menciona objetos o equipo especial (por ejemplo: Gafas Elegidas, Pañuelo Elegido), usa el campo "items" dentro del paso prep.
- Si la guía menciona consejos, atajos, trucos o notas importantes, usa el tipo "note".
- Si la guía menciona viajes entre regiones, usa el campo "travel" en el paso prep.
- Usa español claro, frases breves y accionables.
- Mantén nombres de Pokémon consistentes con la guía.
- No inventes información que no aparezca en el documento, salvo que sea evidente y útil para la app.

Estructura esperada por paso:
{
  "id": number,
  "type": "gym" | "prep" | "note",
  "region": "string (opcional)",
  "gym": "string (solo si type is gym)",
  "title": "string",
  "lead": ["string"],
  "switchTo": ["string"],
  "actions": ["string"],
  "heal": true | false,
  "travel": "string | null",
  "items": [{ "item": "string", "pokemon": ["string"] }],
  "description": "string"
}

Requisitos de salida:
- Devuelve solo JSON válido.
- No agregues explicaciones ni texto fuera del JSON.
- Usa el mismo formato que src/data/route.json.
- Mantén ids correlativos y ordenados.
- Si hay varios gimnasios, incluye todos.

Documento de la guía:
[PEGAR AQUÍ EL DOCUMENTO]
```

## 3) Plantilla de ejemplo para el contenido del paso

```json
{
  "id": 1,
  "type": "gym",
  "region": "Johto",
  "gym": "Nombre del gimnasio",
  "title": "Nombre del gimnasio",
  "lead": ["Pokémon 1", "Pokémon 2"],
  "switchTo": ["Pokémon 3", "Pokémon 4"],
  "actions": [
    "Acción 1",
    "Acción 2"
  ]
}
```

```json
{
  "id": 2,
  "type": "prep",
  "title": "Preparación",
  "heal": true,
  "travel": null,
  "items": [
    {
      "item": "Gafas Elegidas",
      "pokemon": ["Blastoise"]
    }
  ]
}
```

```json
{
  "id": 3,
  "type": "note",
  "title": "Atajo o consejo",
  "description": "Descripción del truco o consejo"
}
```

## 4) Consejo útil

Si quieres que la IA haga una conversión mucho más limpia, incluye también una línea como esta al final del prompt:

```text
Prioriza que el resultado sea fácil de leer en la interfaz de la app, con acciones cortas, claras y en español.
```
