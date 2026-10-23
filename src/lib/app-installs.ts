import { svParts } from './sv-date'

export type Platform = 'android' | 'ios'
export type PingInput = { deviceHash: string; platform: Platform; appVersion: string }

const HASH_RE = /^[0-9a-f]{64}$/
const VERSION_RE = /^[0-9A-Za-z.+-]{1,20}$/

/**
 * Valida el cuerpo del aviso diario de la app. Devuelve solo los tres campos
 * conocidos (nada de `status`, `firstSeenAt`, etc. aunque vengan) o `null`.
 * Nunca lanza: cualquier cuerpo raro es `null`.
 */
export function parsePing(body: unknown): PingInput | null {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return null
  const { deviceHash, platform, appVersion } = body as Record<string, unknown>
  if (typeof deviceHash !== 'string' || !HASH_RE.test(deviceHash)) return null
  if (platform !== 'android' && platform !== 'ios') return null
  if (typeof appVersion !== 'string' || !VERSION_RE.test(appVersion)) return null
  return { deviceHash, platform, appVersion }
}

/** ¿Los dos instantes caen el mismo día calendario en El Salvador? */
export function sameSvDay(a: Date | string, b: Date | string): boolean {
  const x = svParts(a)
  const y = svParts(b)
  return x.year === y.year && x.month === y.month && x.day === y.day
}
