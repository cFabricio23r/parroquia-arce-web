# REVIEW — Un día con la parroquia en el bolsillo

**Entregado:** `renders/app-parroquia-vertical.mp4` · 1080×1920 · 30 fps · 36 s · 9.1 MB.

## Decisiones creativas
- Historia A ("un día"): 5 horas del día = 5 pantallas reales de la app (Inicio/Evangelio, Radio, Agenda, Rezar, Sectores), frase "Tu parroquia, todo el día." y cierre con logo, QR y parroquiaciudadarce.org/app.
- Colores y tipografías de la marca del sitio (Newsreader + Hanken Grotesk, paleta de globals.css). El cielo cambia de color con la hora; el sol se vuelve luna y la luna se vuelve el logo.
- No construidas: B "Todo en un toque" (tipografía al ritmo) y C "Antes y ahora" (pantalla dividida). Ver STORYLINES.md.

## Qué se midió / qué no
- `hyperframes check`: sin errores ni advertencias. Hojas de revisión (beats, cortes, teléfono 360 px) revisadas.
- Audio medido, no escuchado: los efectos (whoosh, chime, pop) caen en 5.9, 11.4, 16.9, 22.4, 28.0, 31.2 y 32.2 s.
- **Sin música**: la biblioteca de música necesita iniciar sesión gratis en HeyGen (`npx hyperframes auth login`).

## Lo más débil
- La parte baja del teléfono en reposo baja de 1330 px (zona de botones de Instagram/TikTok); ahí solo queda la barra de pestañas, nada de texto.
- Mientras se hace el acercamiento, el teléfono se corta en una línea recta bajo el título (máscara intencional para no tapar el texto).
