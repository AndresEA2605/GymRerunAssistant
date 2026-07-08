# PokeMMO Gym Rerun Assistant

Mini app estatica para seguir una ruta de Gym Rerun en PokeMMO. Incluye checklist por region, timer de run, cooldowns de 18 horas, historial local y explicaciones directas para objetos como `Blastoise W -> Gafas Elegidas`.

## Uso del Atajo de Teclado Global (Hotkey)

Para poder ir marcando la guía "paso a paso" sin tener que salirte del juego (PokeMMO), puedes usar **AutoHotkey**:

1. Descarga e instala [AutoHotkey](https://www.autohotkey.com/).
2. Haz doble clic en el archivo `GymRerun_Hotkey.ahk` que se encuentra en este repositorio.
3. Asegúrate de tener la pestaña de la guía abierta en tu navegador web.
4. Mientras juegas a PokeMMO, simplemente presiona **F4**. 

El script enviará automáticamente la señal a la página para marcar tu siguiente paso y te regresará inmediatamente al juego, haciendo que no pierdas tiempo cambiando de ventana manualmente.

**Nota:** Cambio menor aplicado el 2026-07-02 para forzar un commit/push.

## Configuración de correo para recuperar contraseña

Para que el formulario de recuperación envíe el correo con el código, crea un archivo .env.local con tus credenciales SMTP o Gmail. Ejemplo:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-correo@gmail.com
SMTP_PASS=tu-contraseña-de-app
SMTP_FROM=tu-correo@gmail.com
```

> En Gmail suele requerirse una contraseña de aplicación, no la contraseña habitual de la cuenta.

### En Vercel
Agrega estas variables en el Proyecto > Settings > Environment Variables:
- SMTP_HOST=smtp.gmail.com
- SMTP_PORT=587
- SMTP_SECURE=false
- SMTP_USER=andresgarci518@gmail.com
- SMTP_PASS=rxluzcptdeemhzlw
- SMTP_FROM=andresgarci518@gmail.com

Si usas Gmail, también puedes usar GMAIL_USER / GMAIL_PASS / GMAIL_FROM como alias.
