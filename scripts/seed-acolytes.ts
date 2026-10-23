import 'dotenv/config'
import { getPayload } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import config from '../src/payload.config.js'
import { mkdirSync, writeFileSync } from 'node:fs'
import type { Group } from '../src/payload-types.js'

const resolved = await config
resolved.db = { ...postgresAdapter({ pool: { connectionString: process.env.DATABASE_URL }, push: false }), allowIDOnCreate: false, defaultIDType: 'number', name: 'postgres' }
const payload = await getPayload({ config: resolved })
const existing = await payload.find({ collection: 'groups', where: { or: [{ slug: { equals: 'escuela-de-acolitos' } }, { name: { contains: 'Acólitos' } }, { name: { contains: 'Acolitos' } }] }, depth: 0, limit: 100, overrideAccess: true })
if (existing.docs.length > 1) throw new Error('Multiple matching groups; do not merge automatically')
mkdirSync('content-imports/acolytes', { recursive: true })
writeFileSync(`content-imports/acolytes/before-${Date.now()}.json`, JSON.stringify(existing.docs, null, 2))
const rich = (lines: string[]): Group['description'] => ({ root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children: lines.map(text => ({ type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', textFormat: 0, children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 }] })) } })
const data: Partial<Group> = {
  name: 'Escuela de Acólitos', slug: 'escuela-de-acolitos', type: 'formacion', status: 'published',
  summary: 'Escuela que acompaña a los niños en su formación para servir al Señor en el altar, abierta en la parroquia desde 2001.',
  description: rich(['La Escuela de Acólitos ofrece a los niños que hacen la Primera Comunión la oportunidad de integrarse y servir al Señor en el altar. La Comisión de Liturgia atiende este grupo desde 2001 y abre la Escuela cada año.', 'Según la información entregada, perseveran 70 niños a nivel parroquial, incluyendo Flor Amarilla, Divina Providencia y Ciudad Obrera. De ese total, 45 pertenecen al grupo de la parroquia.']),
  history: rich(['El 20 de julio de 1996, el padre Óscar Álvarez Orellana fundó la Comisión de Liturgia, integrada por un número considerable de hermanos del área urbana y rural. Desde esa fecha se reunían los sábados de 9 a 11 de la mañana.', 'En esa época, las misas dominicales se celebraban a las 6 y 9 de la mañana y a las 4 de la tarde. Posteriormente, la misa de las 4 de la tarde se trasladó a las 5 de la tarde.', 'En 2001, por disposición del párroco, la comisión asumió la atención del grupo de Acólitos de la parroquia. Así se abrió la Escuela de Acólitos cada año, ofreciendo a los niños que hacen la Primera Comunión la oportunidad de integrarse y servir al Señor en el altar.']),
  team: [{ name: 'Diana Cristina Benítez Jove', role: 'Encargada' }, { name: 'Jessica María López', role: 'Encargada' }],
  perseverance: { count: 70, label: 'niños a nivel parroquial; 45 en el grupo de la parroquia' },
  howToJoin: 'La Escuela abre cada año y ofrece a los niños que hacen la Primera Comunión la oportunidad de integrarse para servir al Señor en el altar.',
}
writeFileSync('content-imports/acolytes/preview.json', JSON.stringify(data, null, 2))
console.log(`PREVIEW Escuela de Acólitos; existing=${existing.docs.length}; total=70, parish subgroup=45; 3 images`)
if (process.env.SEED_CONFIRM !== 'cargar') process.exit(0)
const assets = [
  ['190336.jpg', 'Logo de la Escuela de Acólitos: un acólito junto al altar, una cruz y el lema «Servir al Señor con alegría»'],
  ['190335.jpg', 'Ilustración de un joven con las manos juntas y una custodia en primer plano'],
  ['190332.jpg', 'Grupo de acólitos con vestiduras rojas y blancas junto a un sacerdote frente al altar'],
] as const
const ids: number[] = []
for (const [filename, alt] of assets) {
  const found = await payload.find({ collection: 'media', where: { filename: { equals: filename } }, depth: 0, limit: 2, overrideAccess: true })
  if (found.docs.length > 1) throw new Error(`Duplicate media filename ${filename}`)
  const media = found.docs[0] ?? await payload.create({ collection: 'media', data: { alt }, filePath: `C:/Users/fabri/Downloads/${filename}`, overrideAccess: true })
  ids.push(media.id)
}
data.logo = ids[0]
data.patron = { ...existing.docs[0]?.patron, image: ids[1] }
data.cover = ids[2]
data.groupPhoto = ids[2]
data.publishedAt = existing.docs[0]?.publishedAt ?? new Date().toISOString()
const saved = existing.docs[0] ? await payload.update({ collection: 'groups', id: existing.docs[0].id, data, overrideAccess: true }) : await payload.create({ collection: 'groups', data: data as Omit<Group, 'id' | 'createdAt' | 'updatedAt'>, overrideAccess: true })
const verified = await payload.findByID({ collection: 'groups', id: saved.id, depth: 1, overrideAccess: true })
if (verified.status !== 'published' || verified.team?.length !== 2 || verified.perseverance?.count !== 70 || !verified.history || !verified.description || typeof verified.patron?.image !== 'object' || typeof verified.logo !== 'object' || typeof verified.groupPhoto !== 'object') throw new Error('Read-back verification failed')
for (const media of [verified.logo, verified.patron.image, verified.groupPhoto]) {
  if (!media?.alt || !media.url) throw new Error('Image metadata missing')
  const response = await fetch(media.url)
  if (!response.ok) throw new Error(`Image inaccessible: ${response.status}`)
}
writeFileSync('content-imports/acolytes/after.json', JSON.stringify(verified, null, 2))
console.log(`VERIFIED id=${verified.id}, slug=${verified.slug}, status=${verified.status}; two leaders, 70 total including 45, three accessible images`)
process.exit(0)
