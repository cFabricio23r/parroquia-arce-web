# Skills de Claude Code (redes sociales y video)

Skills de terceros copiadas en el proyecto para que Claude Code las cargue
automáticamente desde `.claude/skills/`. Las licencias originales están en
`.claude/skills-licenses/`.

| Necesidad | Skill(s) | Origen |
|---|---|---|
| Videos de marketing/redes desde un prompt (renderizado HTML → video) | `hyperframes`, `hyperframes-cli`, `hyperframes-registry`, `slideshow` | [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) (Apache-2.0) |
| Convertir una web en video de lanzamiento (`npx hyperframes capture <url>`) | `hyperframes` | idem |
| Edición: cortes, silencios, subtítulos, música, voz | `media-use` | idem |
| Analizar reels/videos virales (gancho, ritmo, transiciones) | `video-perception` (requiere MCP `claude-video-vision`), `reverse-any-video` | [jordanrendric/claude-video-vision](https://github.com/jordanrendric/claude-video-vision) (MIT) |
| Matriz de contenido / guiones para Instagram y TikTok | `content-matrix`, `reels-scripting`, `hook-generator`, `post-writer`, `post-scorer`, `niche-research`, `profile-optimizer`, `voice-builder`, `pinned-comment`, `quote-post`, `post-formatter`, `newsletter-voice`, `analytics-dashboard`, `gemini-carousel`, `gemini-infographic`, `graphic-designer` | [charlie947/social-media-skills](https://github.com/charlie947/social-media-skills) (MIT) |
| Miniaturas (thumbnails) y gráficos | `banana` (requiere MCP `banana`), `youtube-thumbnail` | [AgriciDaniel/banana-claude](https://github.com/AgriciDaniel/banana-claude) (MIT) |

## Requisitos

- **Node.js 22+ y FFmpeg** para HyperFrames y Claude Video Vision.
- **Python 3** para el servidor MCP `banana`.
- Variables de entorno (no se versionan; ver `.env.example`):
  - `GEMINI_API_KEY` — imágenes (banana, carruseles, infografías) y audio de video-vision.
  - `HEYGEN_API_KEY` — opcional, avatares/voz de HeyGen en `media-use`.

## Activar los servidores MCP (manual)

Dos skills necesitan un servidor MCP. No se registran automáticamente en el
repo; actívalos tú mismo si los quieres usar:

```bash
claude mcp add claude-video-vision -- npx -y claude-video-vision@latest
claude mcp add banana -e GEMINI_API_KEY=$GEMINI_API_KEY -- python3 .claude/skills/banana/scripts/mcp_server.py
```

Las generaciones con Gemini/HeyGen son de pago: revisa los costos antes de usarlas.
