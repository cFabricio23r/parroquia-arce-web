import { getPayload } from 'payload'
import config from '@/payload.config'
import { svParts } from './sv-date'
import { MONTHS } from './months'

/** Reflexion semanal lista para pintar (web). */
export type ReflectionView = {
  slug: string
  title: string
  quote: string | null
  quoteRef: string | null
  preacherName: string
  preacherPhoto: { url: string; alt: string } | null
  /** Primer dia de la semana. Puede venir "2026-11-01" o ISO completo. */
  weekOf: string
  /** Desempata dos reflexiones con el mismo `weekOf`. */
  publishedAt: string | null
  audioUrl: string
  durationMinutes: number | null
  body: unknown | null
}

const str = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v : null)

/** "YYYY-MM-DD" de un `weekOf`. Es un dia de calendario, sin zona horaria. */
const dayKey = (weekOf: string) => weekOf.slice(0, 10)

/**
 * Convierte un doc de Payload (depth >= 1) en vista. Devuelve `null` si falta
 * titulo, slug, predicador, `weekOf` o una URL https de audio: mejor no mostrar
 * la reflexion que mostrar un reproductor roto.
 */
export function toReflectionView(doc: unknown): ReflectionView | null {
  if (!doc || typeof doc !== 'object') return null
  const d = doc as Record<string, unknown>
  const title = str(d.title)
  const slug = str(d.slug)
  const preacherName = str(d.preacherName)
  const weekOf = str(d.weekOf)
  const audio = d.audio
  const audioUrl =
    audio && typeof audio === 'object' ? str((audio as Record<string, unknown>).url) : null
  if (!title || !slug || !preacherName || !weekOf || !audioUrl?.startsWith('https://')) {
    return null
  }

  const photo = d.preacherPhoto
  let preacherPhoto: ReflectionView['preacherPhoto'] = null
  if (photo && typeof photo === 'object') {
    const p = photo as Record<string, unknown>
    const url = str(p.url)
    const alt = str(p.alt)
    if (url && alt) preacherPhoto = { url, alt }
  }

  return {
    slug,
    title,
    quote: str(d.quote),
    quoteRef: str(d.quoteRef),
    preacherName,
    preacherPhoto,
    weekOf,
    publishedAt: str(d.publishedAt),
    audioUrl,
    durationMinutes: typeof d.durationMinutes === 'number' ? d.durationMinutes : null,
    body: d.body ?? null,
  }
}

/**
 * "La de esta semana": la de `weekOf` mas reciente que ya empezo, con "hoy"
 * en horario de El Salvador. Una cargada por adelantado no aparece antes de su
 * semana. Mismo `weekOf`: gana la de `publishedAt` mas reciente.
 */
export function currentReflection(items: ReflectionView[], now: Date): ReflectionView | null {
  const { year, month, day } = svParts(now)
  const today = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  let best: ReflectionView | null = null
  for (const item of items) {
    if (dayKey(item.weekOf) > today) continue
    if (!best) {
      best = item
      continue
    }
    const a = dayKey(item.weekOf)
    const b = dayKey(best.weekOf)
    if (a > b || (a === b && (item.publishedAt ?? '') > (best.publishedAt ?? ''))) best = item
  }
  return best
}

/** "1 al 7 de noviembre" / "28 de octubre al 3 de noviembre". */
export function weekRangeLabel(weekOf: string): string {
  const [y, m, d] = dayKey(weekOf).split('-').map(Number)
  const start = new Date(Date.UTC(y, m - 1, d))
  const end = new Date(Date.UTC(y, m - 1, d + 6))
  const monthName = (dt: Date) => MONTHS[dt.getUTCMonth()].label
  if (start.getUTCMonth() === end.getUTCMonth()) {
    return `${start.getUTCDate()} al ${end.getUTCDate()} de ${monthName(end)}`
  }
  return `${start.getUTCDate()} de ${monthName(start)} al ${end.getUTCDate()} de ${monthName(end)}`
}

/** Reflexiones publicadas, la mas reciente primero. Local API: filtra `status` a mano. */
export async function getReflections({
  limit = 12,
  page = 1,
}: { limit?: number; page?: number } = {}): Promise<{
  docs: ReflectionView[]
  hasNextPage: boolean
}> {
  const payload = await getPayload({ config: await config })
  const res = await payload.find({
    collection: 'reflections',
    where: { status: { equals: 'published' } },
    sort: '-weekOf',
    depth: 1,
    limit,
    page,
  })
  return {
    docs: res.docs.map(toReflectionView).filter((v): v is ReflectionView => v !== null),
    hasNextPage: res.hasNextPage,
  }
}
