# Handoff — campaña de videos App + Web (para continuar en una sesión nueva)

Leer también `marketing/DECISIONES.md` (propuestas, comentarios del usuario y guion de voz con tiempos).

Rama de trabajo: `claude/agregar-skills-xvyvkt` (todo lo de abajo ya está subido ahí).

## Qué existe

- `.claude/skills/`: skills instaladas (HyperFrames de HeyGen, Claude Video Vision, Banana, pack social-media-skills). Guía en `.claude/skills/README.md`.
- `marketing/brand/`: isotipo oficial de la parroquia (`parroquia-isotipo.svg/png`, exportado de `parroquia-arce-app/src/components/parish-logo.tsx`) e ícono de la app.
- `marketing/video-app/`: video 1 ("Un día con la parroquia en el bolsillo", 38 s, solo pantallas de la app). Versión de referencia, superada por la siguiente.
- `marketing/video-comunidad/`: **video elegido por el usuario** ("La parroquia vive en sus comunidades", 43 s, 9:16). Gancho con foto real → montaje de comunidades con "22 sectores / 24 grupos y ministerios" → cada foto se encoge dentro del teléfono y se convierte en la pantalla real de la app (Sectores, Agenda, Rezar, Radio) → frase → cierre con isotipo, QR y parroquiaciudadarce.org/app. Locución guía con voz sintética. Ver su `REVIEW.md`. Al usuario le encantó; está en pausa hasta tener mejores fotos.
- `marketing/video-web/GUION.md`: guion del video del sitio web (misma línea; la foto entra en una ventana de navegador con `parroquiaciudadarce.org/...`).
- `marketing/PLAN-DISTRIBUCION.md`: piezas por campaña (reel 9:16, story 15 s, video 4:5 para feed de Facebook, portada), variantes de audio (con voz guía / sin voz para el párroco / sin música) y calendario de 2 semanas.

## Qué falta (próximos pasos)

1. **Fotos mejores** (templo parroquial, misa dominical, más sectores, Renovación Carismática…): sacarlas de las publicaciones de Facebook de la página.
   - Camino A (preferido): `GET https://parroquiaciudadarce.org/api/activity` (y `?cursor=…` para más páginas; 9 por página) — el servidor del sitio ya consulta Facebook, no hace falta token. Las imágenes están en `*.fbcdn.net`.
   - Camino B: Graph API directa con `FACEBOOK_PAGE_ACCESS_TOKEN` (página 413231642046564). El token vence el 27/11/2026 (ver `SOCIAL-LIVE.md`).
   - Filtrar por texto de la publicación ("templo", "Renovación Carismática", "Sector N", "misa"...) y usar el texto para pies de foto exactos. No inventar pies de foto.
2. **Capturas reales del sitio web** con Playwright (Chromium ya instalado): tamaño celular 390×844 @3x y escritorio 1440×900 de `/`, `/horarios`, `/sectores` (+ un detalle), `/eventos`, `/actividad`, `/noticias`, `/radio`, `/contacto`.
3. Producir las **8 piezas** del plan (4 por campaña) cuando el usuario lo pida; renders con y sin voz.
4. Opcional, sugerido al usuario: cambiar el favicon del sitio (`src/app/(frontend)/icon.svg`) por el isotipo oficial.

## Notas técnicas para HyperFrames en este entorno

- CLI: `npx hyperframes …` (v0.8.225). Antes de editar, cargar la skill `hyperframes`.
- `cdn.jsdelivr.net` está bloqueado: GSAP va local en `assets/vendor/gsap.min.js` (se obtuvo con `npm pack gsap@3.15.0`). Fuentes de marca locales en `assets/fonts/` (Newsreader + Hanken Grotesk, vía `npm pack @fontsource/...`).
- Voz guía gratis: `python3 -m venv <dir> && <dir>/bin/pip install kokoro-onnx soundfile`, luego `HYPERFRAMES_PYTHON=<dir>/bin/python npx hyperframes tts "<texto>" -v ef_dora -o x.wav`; normalizar con `ffmpeg -af loudnorm=I=-16:TP=-1.5:LRA=11`. Usar `</dev/null` en bucles (npx consume stdin).
- Música: requiere `npx hyperframes auth login` (HeyGen, no se pudo en la nube) o un MP3 del usuario. Plan: entregar versión sin música para usar la biblioteca de IG/TikTok.
- Fotos de la comunidad que ya estaban en el repo: `content-audits/2026-10-06/assets/media-*.jpg`; su sector/grupo está en `content-audits/2026-10-06/snapshot.json`.

## Dominios a permitir en la red del entorno

`parroquiaciudadarce.org`, `fbcdn.net` (y opcional `graph.facebook.com`, `wdpzcgpkuefpcdxgihmn.supabase.co`).
