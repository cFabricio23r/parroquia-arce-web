import type { Setting } from '@/payload-types'

export type AppDownload =
  | {
      ready: true
      url: string
      version: string | null
      sizeMb: number | null
    }
  | { ready: false }

/** `https://` con dominio de verdad: un prefijo solo dejaria un boton que no lleva a nada. */
export function isDownloadUrl(value: string): boolean {
  if (!value.startsWith('https://') || /\s/.test(value)) return false
  try {
    return new URL(value).hostname.length > 0
  } catch {
    return false
  }
}

/**
 * Unica fuente de verdad de "la descarga de la app esta lista". La pagina /app,
 * el pie y la portada leen esto, nunca `settings.app.*` suelto: asi un enlace
 * vacio o `http://` no se convierte en un boton roto en ningun lado.
 */
export function deriveAppDownload(settings: Pick<Setting, 'app'> | null | undefined): AppDownload {
  const app = settings?.app
  const url = app?.androidUrl?.trim() ?? ''
  if (app?.available !== true || !isDownloadUrl(url)) return { ready: false }

  const version = app.version?.trim() || null
  const size = typeof app.sizeMb === 'number' ? Math.round(app.sizeMb) : NaN
  return { ready: true, url, version, sizeMb: size >= 1 ? size : null }
}

/** La linea bajo el boton: "Versión 0.1.0 · 135 MB", o lo que haya cargado. */
export function formatAppMeta(d: { version: string | null; sizeMb: number | null }): string | null {
  const parts = [d.version && `Versión ${d.version}`, d.sizeMb && `${d.sizeMb} MB`].filter(Boolean)
  return parts.length ? parts.join(' · ') : null
}
