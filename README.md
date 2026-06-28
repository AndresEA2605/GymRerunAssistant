# PokeMMO Gym Rerun Assistant

Mini app estatica para seguir una ruta de Gym Rerun en PokeMMO. Incluye checklist por region, timer de run, cooldowns de 18 horas, historial local y explicaciones directas para objetos como `Blastoise W -> Gafas Elegidas`.

## Usar localmente

Abre `index.html` en el navegador. Tambien puedes levantar un servidor local:

```bash
python -m http.server 4173
```

Luego entra a `http://127.0.0.1:4173`.

## Publicar en GitHub Pages

1. Sube `index.html`, `styles.css`, `app.js`, `README.md` y `.nojekyll` al repositorio.
2. En GitHub ve a `Settings > Pages`.
3. En `Build and deployment`, elige `Deploy from a branch`.
4. Selecciona la rama `main` y la carpeta `/root`.
5. Guarda y espera a que GitHub genere la URL.

La app no necesita build ni dependencias externas de JavaScript.
