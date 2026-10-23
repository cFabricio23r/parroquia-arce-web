import 'dotenv/config'
import { getPayload } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import config from '../src/payload.config.js'
import { writeFileSync } from 'node:fs'

const resolved = await config
resolved.db = { ...postgresAdapter({ pool: { connectionString: process.env.DATABASE_URL }, push: false }), allowIDOnCreate: false, defaultIDType: 'number', name: 'postgres' }
const payload = await getPayload({ config: resolved })
const mec = (await payload.find({ collection: 'groups', where: { slug: { equals: 'mec' } }, depth: 0, overrideAccess: true })).docs[0]
const sector = (await payload.find({ collection: 'sectors', where: { number: { equals: 22 } }, depth: 0, overrideAccess: true })).docs[0]
if (!mec?.history || !sector?.history) throw new Error('Missing source histories')
writeFileSync(`content-audits/2026-10-06/corrections/before-format-${Date.now()}.json`, JSON.stringify({ mec, sector }, null, 2))
const text = (node: any): string => node.text ?? (node.children ?? []).map(text).join('')
const normalize = (s: string) => s.replace(/\s+/g, ' ').trim()
const history = structuredClone(mec.history)
const children = history.root.children as any[]
const start = children.findIndex(n => /^2002\s*[–-]\s*2004/.test(text(n)))
if (start < 0) throw new Error('Secretary list source not found')
const entries = children.slice(start)
const list = { type: 'list', listType: 'bullet', tag: 'ul', start: 1, format: '', indent: 0, version: 1, direction: 'ltr', children: entries.map((n, i) => ({ type: 'listitem', value: i + 1, format: '', indent: 0, version: 1, direction: 'ltr', children: n.children })) }
history.root.children = [...children.slice(0, start), list]
if (normalize(text(history.root)) !== normalize(text(mec.history.root))) throw new Error('MEC text changed')
const sectorHistory = structuredClone(sector.history)
const original = text(sectorHistory.root)
const parts = original.split(/(?=Poco a poco y con el apoyo|En los inicios del sector|Fue por el año 2014)/).map(s => s.trim()).filter(Boolean)
if (parts.length !== 4) throw new Error('Sector history boundaries changed')
sectorHistory.root.children = parts.map(s => ({ type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', textFormat: 0, children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: s, version: 1 }] }))
if (normalize(parts.join(' ')) !== normalize(original)) throw new Error('Sector text changed')
await payload.update({ collection: 'groups', id: mec.id, data: { history }, overrideAccess: true })
await payload.update({ collection: 'sectors', id: sector.id, data: { history: sectorHistory }, overrideAccess: true })
const savedMec = await payload.findByID({ collection: 'groups', id: mec.id, depth: 0, overrideAccess: true })
const savedSector = await payload.findByID({ collection: 'sectors', id: sector.id, depth: 0, overrideAccess: true })
if (!savedMec.history?.root.children.some(n => n.type === 'list') || savedSector.history?.root.children.length !== 4) throw new Error('Format did not persist')
console.log('VERIFIED: MEC secretary list and sector 22 four history paragraphs; all source text preserved')
process.exit(0)
