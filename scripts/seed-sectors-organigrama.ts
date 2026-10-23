import { getPayload } from 'payload'
import config from '../src/payload.config.js'
import { PARISH_SECTORS, sectorSlug, sectorName } from '../src/lib/parish-structure.js'

/**
 * Crea los sectores del Anexo 1 del PLAN PASTORAL 2023-2025 que todavia no estan
 * en la base. Implementa
 * 06-Workspace/2026-08-13-carga-sectores-grupos-organigrama-design.md
 *
 * Es IDEMPOTENTE por slug: si el sector ya existe, lo saltea entero. No actualiza
 * nada de lo cargado. Se puede correr dos veces.
 *
 * Todo entra en `draft`. Dev y prod comparten una sola base de Supabase: lo que
 * se crea publicado sale al sitio al instante. Publica la parroquia, cuando cada
 * ficha tenga historia, portada y equipo.
 *
 * Uso:
 *   Simulacion:  npx payload run scripts/seed-sectors-organigrama.ts
 *   De verdad:   SEED_CONFIRM=cargar npx payload run scripts/seed-sectors-organigrama.ts
 */

const payload = await getPayload({ config })
const dryRun = process.env.SEED_CONFIRM !== 'cargar'

const existing = await payload.find({
  collection: 'sectors',
  limit: 500,
  depth: 0,
  overrideAccess: true,
})
const known = new Set(existing.docs.map((d) => d.slug))
const todo = PARISH_SECTORS.filter((s) => !known.has(sectorSlug(s.number)))

console.log(`\nSectores en la base: ${existing.totalDocs}`)
for (const s of PARISH_SECTORS) {
  const slug = sectorSlug(s.number)
  console.log(`  ${known.has(slug) ? '· ya existe, se saltea' : '+ se crea'}  ${slug} — ${s.patron}`)
}

if (todo.length === 0) {
  console.log('\nNada que hacer.')
  process.exit(0)
}

if (dryRun) {
  console.log(`\n[SIMULACION] Se crearian ${todo.length} sectores. No se creo nada.`)
  console.log('Para ejecutar de verdad:')
  console.log('  SEED_CONFIRM=cargar npx payload run scripts/seed-sectors-organigrama.ts\n')
  process.exit(0)
}

for (const s of todo) {
  const doc = await payload.create({
    collection: 'sectors',
    data: {
      name: sectorName(s),
      slug: sectorSlug(s.number),
      number: s.number,
      zone: `zona-${s.zone}`,
      patron: { name: s.patron },
      status: 'draft',
    },
    overrideAccess: true,
  })
  console.log(`  ✓ sector [${doc.id}] ${doc.slug} — ${doc.name} (${doc.status})`)
}

console.log(`\nListo. ${todo.length} sectores creados en BORRADOR.`)
console.log('Publicalos desde /admin cuando tengan historia, portada y equipo.\n')
process.exit(0)
