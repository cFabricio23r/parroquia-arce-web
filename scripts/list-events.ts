import { getPayload } from 'payload'
import config from '../src/payload.config.js'

/**
 * Solo lectura: lista los eventos que hay en la base. No modifica nada.
 * Uso: npx payload run scripts/list-events.ts
 */
const payload = await getPayload({ config })

const res = await payload.find({ collection: 'events', limit: 500, depth: 0, sort: 'startsAt' })

console.log(`\nEventos en la base: ${res.totalDocs}\n`)
for (const e of res.docs) {
  console.log(`  [${e.id}] ${e.status}  ${e.startsAt}  ${e.slug}  — ${e.title} @ ${e.locationName}`)
}
process.exit(0)
