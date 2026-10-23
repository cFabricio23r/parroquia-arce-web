import { getPayload } from 'payload'
import config from '../src/payload.config.js'
import { PARISH_GROUPS } from '../src/lib/parish-structure.js'

/**
 * Crea los grupos del organigrama de lineas de accion del PLAN PASTORAL
 * 2023-2025 que todavia no estan en la base. Implementa
 * 06-Workspace/2026-08-13-carga-sectores-grupos-organigrama-design.md
 *
 * Es IDEMPOTENTE por slug: si el grupo ya existe, lo saltea entero.
 *
 * NO se les pone `type`. El eje que usa la parroquia es la linea de accion, no
 * pastoral/ministerio/comunidad/servicio/formacion — y el `type` de los 4 grupos
 * cargados en agosto ya esta marcado en el vault como una suposicion sin
 * confirmar. El detalle lo dibuja con guarda, asi que vacio no dibuja nada.
 *
 * Todo entra en `draft`, por la base compartida dev/prod.
 *
 * Uso:
 *   Simulacion:  npx payload run scripts/seed-groups-organigrama.ts
 *   De verdad:   SEED_CONFIRM=cargar npx payload run scripts/seed-groups-organigrama.ts
 */

const payload = await getPayload({ config })
const dryRun = process.env.SEED_CONFIRM !== 'cargar'

const existing = await payload.find({
  collection: 'groups',
  limit: 500,
  depth: 0,
  overrideAccess: true,
})
const known = new Set(existing.docs.map((d) => d.slug))
const todo = PARISH_GROUPS.filter((g) => !known.has(g.slug))

console.log(`\nGrupos en la base: ${existing.totalDocs}`)
for (const g of PARISH_GROUPS) {
  console.log(`  ${known.has(g.slug) ? '· ya existe, se saltea' : '+ se crea'}  ${g.slug} — ${g.name}`)
}

if (todo.length === 0) {
  console.log('\nNada que hacer.')
  process.exit(0)
}

if (dryRun) {
  console.log(`\n[SIMULACION] Se crearian ${todo.length} grupos. No se creo nada.`)
  console.log('Para ejecutar de verdad:')
  console.log('  SEED_CONFIRM=cargar npx payload run scripts/seed-groups-organigrama.ts\n')
  process.exit(0)
}

for (const g of todo) {
  const doc = await payload.create({
    collection: 'groups',
    data: {
      name: g.name,
      slug: g.slug,
      actionLine: g.actionLine,
      status: 'draft',
    },
    overrideAccess: true,
  })
  console.log(`  ✓ grupo [${doc.id}] ${doc.slug} — ${doc.name} (${doc.status})`)
}

console.log(`\nListo. ${todo.length} grupos creados en BORRADOR.`)
console.log('Publicalos desde /admin cuando tengan historia, equipo y fotos.\n')
process.exit(0)
