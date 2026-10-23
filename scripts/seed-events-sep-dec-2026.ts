import { getPayload } from 'payload'
import config from '../src/payload.config.js'
import {
  DEFAULT_END,
  DEFAULT_START,
  buildEventSlug,
  richText,
  septiembreDiciembre2026Rows,
  toUtc,
} from '../src/lib/calendarization-2026-events.js'

/**
 * Carga la agenda parroquial de septiembre a diciembre de 2026.
 *
 * Fuente: `C:/Users/fabri/Downloads/Calendarización 2026.pdf`.
 * No borra eventos existentes: hace upsert por slug, para conservar la agenda
 * de julio-agosto y permitir repetir el script sin duplicar.
 *
 * Uso:
 *   Simulación:  npx payload run scripts/seed-events-sep-dec-2026.ts
 *   De verdad:   SEED_CONFIRM=crear npx payload run scripts/seed-events-sep-dec-2026.ts
 */

const payload = await getPayload({ config })
const dryRun = process.env.SEED_CONFIRM !== 'crear'
const now = new Date().toISOString()

const slugs = septiembreDiciembre2026Rows.map(buildEventSlug)
const duplicateSlugs = slugs.filter((slug, index) => slugs.indexOf(slug) !== index)

if (duplicateSlugs.length > 0) {
  console.error(`Slugs duplicados: ${[...new Set(duplicateSlugs)].join(', ')}`)
  process.exit(1)
}

const existing = await payload.find({
  collection: 'events',
  where: { slug: { in: slugs } },
  limit: 300,
  depth: 0,
  overrideAccess: true,
})

const existingBySlug = new Map(existing.docs.map((doc) => [doc.slug, doc]))
const creates = septiembreDiciembre2026Rows.filter((row) => !existingBySlug.has(buildEventSlug(row)))
const updates = septiembreDiciembre2026Rows.filter((row) => existingBySlug.has(buildEventSlug(row)))

console.log(`\nEventos fuente: ${septiembreDiciembre2026Rows.length}`)
console.log(`Ya existen por slug: ${updates.length}`)
console.log(`A crear: ${creates.length}`)
console.log(`A actualizar: ${updates.length}`)

if (dryRun) {
  console.log('\n[SIMULACION] No se creó ni actualizó nada.')
  console.log('Para ejecutar de verdad:')
  console.log('  SEED_CONFIRM=crear npx payload run scripts/seed-events-sep-dec-2026.ts\n')
  process.exit(0)
}

let created = 0
let updated = 0

for (const row of septiembreDiciembre2026Rows) {
  const slug = buildEventSlug(row)
  const sinHora = row.start === null
  const start = toUtc(row.m, row.d, row.start ?? DEFAULT_START)
  const endHHMM = sinHora ? DEFAULT_END : row.end
  const end = endHHMM ? toUtc(row.m, row.d, endHHMM) : null
  const description = richText([
    ...(row.note ? [row.note] : []),
    `Dirigido a: ${row.audience || 'No especificado'}`,
    `Responsable: ${row.responsible || 'No especificado'}`,
  ])

  const data = {
    title: row.title,
    slug,
    eventType: row.type ?? null,
    description,
    startsAt: start.toISOString(),
    endsAt: end ? end.toISOString() : null,
    locationName: row.location,
    status: 'published' as const,
    publishedAt: now,
    isFeatured: false,
  }

  const current = existingBySlug.get(slug)
  if (current) {
    await payload.update({
      collection: 'events',
      id: current.id,
      data,
      overrideAccess: true,
    })
    updated++
  } else {
    const out = await payload.create({
      collection: 'events',
      data,
      overrideAccess: true,
    })
    existingBySlug.set(slug, out)
    created++
  }
}

console.log(`\nCreados: ${created}`)
console.log(`Actualizados: ${updated}`)
console.log('Agenda septiembre-diciembre 2026 cargada.')
process.exit(0)
