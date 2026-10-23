import { getPayload } from 'payload'
import config from '../src/payload.config.js'
import { actionLineForGroup, zoneForSector } from '../src/lib/parish-structure.js'

/**
 * Rellena los campos nuevos (`sectors.zone`, `groups.actionLine`) en los
 * documentos que YA estaban cargados antes de esta obra. Implementa
 * 06-Workspace/2026-08-13-carga-sectores-grupos-organigrama-design.md
 *
 * Toca documentos PUBLICADOS en produccion, por eso va separado del seed. Es
 * estrictamente ADITIVO: escribe solo esos dos campos y nada mas. No renombra,
 * no cambia `status`, no toca historia, equipo ni fotos.
 *
 * Es IDEMPOTENTE: si el campo ya tiene valor, saltea el documento.
 *
 * El `consejo-economico` queda sin `actionLine` a proposito: cuelga del Consejo
 * Parroquial, no de una linea de accion.
 *
 * Uso:
 *   Simulacion:  npx payload run scripts/backfill-organigrama.ts
 *   De verdad:   SEED_CONFIRM=cargar npx payload run scripts/backfill-organigrama.ts
 */

const payload = await getPayload({ config })
const dryRun = process.env.SEED_CONFIRM !== 'cargar'

type Change = {
  collection: 'sectors' | 'groups'
  id: number
  slug: string
  field: string
  value: string
}
const changes: Change[] = []

// --- Sectores: zone --------------------------------------------------------
const sectors = await payload.find({
  collection: 'sectors',
  limit: 500,
  depth: 0,
  overrideAccess: true,
})
for (const doc of sectors.docs) {
  const d = doc as unknown as Record<string, unknown>
  if (d.zone) continue
  if (typeof d.number !== 'number') continue
  const zone = zoneForSector(d.number)
  if (!zone) continue
  changes.push({
    collection: 'sectors',
    id: doc.id as number,
    slug: String(d.slug),
    field: 'zone',
    value: `zona-${zone}`,
  })
}

// --- Grupos: actionLine ----------------------------------------------------
const groups = await payload.find({
  collection: 'groups',
  limit: 500,
  depth: 0,
  overrideAccess: true,
})
for (const doc of groups.docs) {
  const d = doc as unknown as Record<string, unknown>
  if (d.actionLine) continue
  const line = actionLineForGroup(String(d.slug))
  if (!line) {
    console.log(`  · sin linea de accion (fuera del organigrama): ${d.slug}`)
    continue
  }
  changes.push({
    collection: 'groups',
    id: doc.id as number,
    slug: String(d.slug),
    field: 'actionLine',
    value: line,
  })
}

console.log(`\nCambios a aplicar: ${changes.length}`)
for (const c of changes) {
  console.log(`  ~ ${c.collection}[${c.id}] ${c.slug}: ${c.field} = ${c.value}`)
}

if (changes.length === 0) {
  console.log('\nNada que hacer.')
  process.exit(0)
}

if (dryRun) {
  console.log(`\n[SIMULACION] Se actualizarian ${changes.length} documentos. No se cambio nada.`)
  console.log('Para ejecutar de verdad:')
  console.log('  SEED_CONFIRM=cargar npx payload run scripts/backfill-organigrama.ts\n')
  process.exit(0)
}

for (const c of changes) {
  await payload.update({
    collection: c.collection,
    id: c.id,
    data: { [c.field]: c.value },
    overrideAccess: true,
  })
  console.log(`  ✓ ${c.collection}[${c.id}] ${c.slug}: ${c.field} = ${c.value}`)
}

console.log(`\nListo. ${changes.length} documentos actualizados.\n`)
process.exit(0)
