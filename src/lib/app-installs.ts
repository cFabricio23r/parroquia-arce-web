import { svParts } from './sv-date'

export type Platform = 'android' | 'ios'
export type InstallProfile = { firstName: string; lastName: string }
export type PingInput = { deviceHash: string; platform: Platform; appVersion: string; profile?: InstallProfile; profileRevision?: number }

export function parseProfile(value: unknown): InstallProfile | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const { firstName, lastName } = value as Record<string, unknown>
  const name = (v: unknown): string | null => {
    if (typeof v !== 'string' || v.length > 240 || /[\p{Cc}\p{Cf}]/u.test(v)) return null
    const normalized = v.trim().replace(/\s+/g, ' ')
    return normalized.length <= 80 ? normalized : null
  }
  const first = name(firstName)
  const last = name(lastName)
  return first === null || last === null ? null : { firstName: first, lastName: last }
}

const HASH_RE = /^[0-9a-f]{64}$/
const VERSION_RE = /^[0-9A-Za-z.+-]{1,20}$/

/**
 * Valida el cuerpo del aviso diario de la app. Devuelve solo los campos
 * conocidos (nada de `status`, `firstSeenAt`, etc. aunque vengan) o `null`.
 * Nunca lanza: cualquier cuerpo raro es `null`.
 */
export function parsePing(body: unknown): PingInput | null {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return null
  const { deviceHash, platform, appVersion } = body as Record<string, unknown>
  if (typeof deviceHash !== 'string' || !HASH_RE.test(deviceHash)) return null
  if (platform !== 'android' && platform !== 'ios') return null
  if (typeof appVersion !== 'string' || !VERSION_RE.test(appVersion)) return null
  if (Object.hasOwn(body, 'profile')) {
    const profile = parseProfile((body as Record<string, unknown>).profile)
    if (!profile) return null
    const revision = (body as Record<string, unknown>).profileRevision
    if (revision !== undefined && (!Number.isSafeInteger(revision) || (revision as number) < 0)) return null
    return { deviceHash, platform, appVersion, profile, ...(revision === undefined ? {} : { profileRevision: revision as number }) }
  }
  return { deviceHash, platform, appVersion }
}

/** ¿Los dos instantes caen el mismo día calendario en El Salvador? */
export function sameSvDay(a: Date | string, b: Date | string): boolean {
  const x = svParts(a)
  const y = svParts(b)
  return x.year === y.year && x.month === y.month && x.day === y.day
}
