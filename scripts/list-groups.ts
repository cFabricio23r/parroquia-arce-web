import { getPayload } from 'payload'
import config from '../src/payload.config.js'

/**
 * Solo lectura: lista los grupos que hay en la base. No modifica nada.
 * Uso: npx payload run scripts/list-groups.ts
 */
const payload = await getPayload({ config })

/** Aplana un richText de Lexical a texto plano, solo para inspeccionar. */
function plain(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const n = node as Record<string, unknown>
  if (typeof n.text === 'string') return n.text
  const children = (n.children ?? (n.root as Record<string, unknown>)?.children) as unknown[] | undefined
  if (!Array.isArray(children)) return ''
  return children.map(plain).join(' ')
}

const res = await payload.find({
  collection: 'groups',
  limit: 500,
  depth: 0,
  sort: 'name',
  overrideAccess: true,
})

console.log(`\nGrupos en la base: ${res.totalDocs}\n`)
for (const g of res.docs) {
  const d = g as unknown as Record<string, unknown>
  const team = (d.team as { name?: string; role?: string }[] | null) ?? []
  const persev = (d.perseverance as { count?: number; label?: string } | null) ?? {}
  console.log(`  [${d.id}] ${d.status}  slug=${d.slug}  type=${d.type ?? '-'}  — ${d.name}`)
  console.log(
    `        logo=${d.logo ?? '-'} cover=${d.cover ?? '-'} groupPhoto=${d.groupPhoto ?? '-'} gallery=${JSON.stringify(d.gallery ?? null)}`,
  )
  console.log(
    `        perseverance=${persev.count ?? '-'} ${persev.label ?? ''}  team=[${team.map((m) => `${m.name}${m.role ? ` (${m.role})` : ''}`).join(', ')}]`,
  )
  console.log(`        description: ${d.description ? JSON.stringify(plain(d.description).slice(0, 400)) : '(vacio)'}`)
  console.log(`        history    : ${d.history ? JSON.stringify(plain(d.history).slice(0, 200)) : '(vacio)'}`)
}
process.exit(0)
