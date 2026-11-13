# REVIEW — Un día con la parroquia en el bolsillo

**Entregado (v2):** `renders/app-parroquia-vertical-v2.mp4` · 1080×1920 · 30 fps · 38 s · 9.8 MB. (v1 sin voz: `renders/app-parroquia-vertical.mp4`.)

## Cambios v2 (pedido: "me siento perdido, falta contexto y audio explicativo")
- Intro de 4.2 s en el cuadro 0: "Parroquia de Ciudad Arce · ¡Nuestra parroquia ya tiene app!".
- Locución en español (voz local Kokoro `ef_dora`, gratis) que explica cada pantalla; guion en `assets/voice/` (vo0–vo7):
  ¿Ya conocés la app de la Parroquia Inmaculada Concepción de María? / Empezá el día leyendo el Evangelio y las lecturas de hoy. /
  Escuchá la radio de la parroquia, en vivo, desde donde estés. / Mirá la agenda: misas, jornadas y actividades, mes a mes. /
  Rezá el Rosario y la Liturgia de las Horas. / Y conocé tu sector, su ermita y sus grupos. / Tu parroquia, todo el día, en una sola app. /
  Escaneá el código, o entrá a parroquiaciudadarce.org/app.
- Voz normalizada a −16 LUFS, pico −1.6 dBFS (medido en el render). Efectos bajados a 0.3.
- **No escuchado**: la pronunciación de la voz sintética no se verificó de oído ni con transcripción (sin acceso al modelo).

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
