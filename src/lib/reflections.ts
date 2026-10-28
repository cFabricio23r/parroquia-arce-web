import { getPayload } from 'payload'
import config from '@/payload.config'
import { svParts, svStartOfToday } from './sv-date'
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
  createdAt: string | null
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
    createdAt: str(d.createdAt),
    audioUrl,
    durationMinutes: typeof d.durationMinutes === 'number' ? d.durationMinutes : null,
    body: d.body ?? null,
  }
}

/** Desempate: `publishedAt`, y si falta, `createdAt`. */
const tieKey = (v: ReflectionView) => v.publishedAt ?? v.createdAt ?? ''

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
    if (a > b || (a === b && tieKey(item) > tieKey(best))) best = item
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

/**
 * Instante (ISO) del inicio de MANANA en El Salvador. Las reflexiones con
 * `weekOf` menor a esto ya empezaron su semana; las cargadas por adelantado no
 * se ven. El Salvador no tiene horario de verano: un dia son 24 h.
 */
export function visibleUntil(now: Date): string {
  return new Date(svStartOfToday(now).getTime() + 24 * 60 * 60 * 1000).toISOString()
}

/** Reflexiones publicadas, la mas reciente primero. Local API: filtra `status` a mano. */
export async function getReflections({
  limit = 12,
  page = 1,
  before,
}: { limit?: number; page?: number; before?: string } = {}): Promise<{
  docs: ReflectionView[]
  hasNextPage: boolean
}> {
  const payload = await getPayload({ config: await config })
  const res = await payload.find({
    collection: 'reflections',
    where: {
      status: { equals: 'published' },
      // `before` ("YYYY-MM-DD"): solo semanas anteriores a esa, sin pasar de lo ya visible.
      weekOf: { less_than: before && before < visibleUntil(new Date()) ? before : visibleUntil(new Date()) },
    },
    sort: ['-weekOf', '-publishedAt', '-createdAt'],
    depth: 1,
    limit,
    page,
  })
  return {
    docs: res.docs.map(toReflectionView).filter((v): v is ReflectionView => v !== null),
    hasNextPage: res.hasNextPage,
  }
}

/** Una reflexion publicada por slug, o `null`. Local API: filtra `status` a mano. */
export async function getReflectionBySlug(slug: string): Promise<ReflectionView | null> {
  const payload = await getPayload({ config: await config })
  const res = await payload.find({
    collection: 'reflections',
    where: {
      slug: { equals: slug },
      status: { equals: 'published' },
      weekOf: { less_than: visibleUntil(new Date()) },
    },
    sort: ['-weekOf', '-publishedAt', '-createdAt'],
    depth: 1,
    limit: 1,
  })
  return toReflectionView(res.docs[0])
}
