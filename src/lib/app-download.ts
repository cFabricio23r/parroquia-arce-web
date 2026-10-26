import type { Setting } from '@/payload-types'

export type AppScreenshot = {
  url: string
  alt: string
  width?: number | null
  height?: number | null
}

export type AppDownload =
  | {
      ready: true
      url: string
      version: string | null
      sizeMb: number | null
      screenshots: AppScreenshot[]
    }
  | { ready: false }

/**
 * Unica fuente de verdad de "la descarga de la app esta lista". La pagina /app,
 * el pie y la portada leen esto, nunca `settings.app.*` suelto: asi un enlace
 * vacio o `http://` no se convierte en un boton roto en ningun lado.
 */
export function deriveAppDownload(settings: Pick<Setting, 'app'> | null | undefined): AppDownload {
  const app = settings?.app
  const url = app?.androidUrl?.trim() ?? ''
  if (app?.available !== true || !url.startsWith('https://')) return { ready: false }

  const version = app.version?.trim() || null
  const size = typeof app.sizeMb === 'number' ? Math.round(app.sizeMb) : NaN
  const screenshots = (app.screenshots ?? []).flatMap((s) =>
    typeof s === 'object' && s && typeof s.url === 'string'
      ? [{ url: s.url, alt: s.alt, width: s.width, height: s.height }]
      : [],
  )

  return { ready: true, url, version, sizeMb: size >= 1 ? size : null, screenshots }
}

/** La linea bajo el boton: "Versión 0.1.0 · 135 MB", o lo que haya cargado. */
export function formatAppMeta(d: { version: string | null; sizeMb: number | null }): string | null {
  const parts = [d.version && `Versión ${d.version}`, d.sizeMb && `${d.sizeMb} MB`].filter(Boolean)
  return parts.length ? parts.join(' · ') : null
}
