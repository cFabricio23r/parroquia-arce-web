import { getPayload } from 'payload'
import config from '../src/payload.config.js'

/**
 * Copia los campos viejos de coordinacion al array `team`:
 *   groups.coordinatorName   -> { name, role: 'Coordinador/a' }
 *   sectors.responsibleName  -> { name, role: 'Responsable' }
 *   sectors.assistants[]     -> { name, role: 'Colaborador/a' }
 *
 * Es idempotente: saltea cualquier documento que ya tenga `team` cargado, asi
 * que se puede correr dos veces sin duplicar a nadie.
 *
 * NO borra los campos viejos. Ese es un paso aparte, supervisado, porque dev y
 * prod comparten una sola base de Supabase.
 *
 * Uso:  npx payload run scripts/migrate-team.ts
 */
type Member = { name: string; role: string }

type LegacyDoc = {
  id: string | number
  team?: unknown[] | null
  coordinatorName?: string | null
  responsibleName?: string | null
  assistants?: { name?: string | null }[] | null
}

const payload = await getPayload({ config })

let migrated = 0
let skipped = 0

for (const collection of ['groups', 'sectors'] as const) {
  const res = await payload.find({ collection, limit: 1000, depth: 0, overrideAccess: true })
  console.log(`\n${collection}: ${res.totalDocs} documentos`)

  for (const raw of res.docs) {
    const doc = raw as unknown as LegacyDoc

    if ((doc.team ?? []).length > 0) {
      skipped++
      continue
    }

    const team: Member[] = []
    if (doc.coordinatorName) team.push({ name: doc.coordinatorName, role: 'Coordinador/a' })
    if (doc.responsibleName) team.push({ name: doc.responsibleName, role: 'Responsable' })
    for (const a of doc.assistants ?? []) {
      if (a?.name) team.push({ name: a.name, role: 'Colaborador/a' })
    }

    if (team.length === 0) {
      skipped++
      continue
    }

    await payload.update({
      collection,
      id: doc.id,
      data: { team },
      overrideAccess: true,
    })
    migrated++
    console.log(`  ✓ ${doc.id}: ${team.map((m) => `${m.name} (${m.role})`).join(', ')}`)
  }
}

console.log(`\nMigrados: ${migrated}. Salteados: ${skipped}.`)
process.exit(0)
