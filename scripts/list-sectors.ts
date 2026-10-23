import { getPayload } from 'payload'
import config from '../src/payload.config.js'

/**
 * Solo lectura: lista los sectores y las ermitas que hay en la base. No modifica nada.
 * Uso: npx payload run scripts/list-sectors.ts
 */
const payload = await getPayload({ config })

const sectors = await payload.find({
  collection: 'sectors',
  limit: 500,
  depth: 0,
  sort: 'number',
  overrideAccess: true,
})

console.log(`\nSectores en la base: ${sectors.totalDocs}\n`)
for (const s of sectors.docs) {
  const d = s as unknown as Record<string, unknown>
  const team = (d.team as { name?: string }[] | null) ?? []
  console.log(
    `  [${d.id}] ${d.status}  n=${d.number ?? '-'}  slug=${d.slug}  — ${d.name}` +
      `  ermita=${d.chapelName ?? '-'}  cover=${d.cover ?? '-'}  team=${team.length}`,
  )
}

const chapels = await payload.find({
  collection: 'chapels',
  limit: 500,
  depth: 0,
  sort: 'name',
  overrideAccess: true,
})

console.log(`\nErmitas en la base: ${chapels.totalDocs}\n`)
for (const c of chapels.docs) {
  const d = c as unknown as Record<string, unknown>
  console.log(
    `  [${d.id}] ${d.status}  slug=${d.slug}  — ${d.name}  patrono=${d.patronOrDedication ?? '-'}  sector=${d.sector ?? '-'}`,
  )
}

process.exit(0)
