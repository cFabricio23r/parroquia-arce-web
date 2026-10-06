import 'dotenv/config'
import { getPayload } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import config from '../src/payload.config.js'
import { mkdirSync, writeFileSync } from 'node:fs'

// Import content without schema changes; default to a read-only preview.
const resolved = await config
resolved.db = postgresAdapter({ pool: { connectionString: process.env.DATABASE_URL }, push: false })
const payload = await getPayload({ config: resolved })
const result = await payload.find({ collection: 'sectors', where: { slug: { equals: 'sector-10' } }, depth: 0, limit: 2, overrideAccess: true })
if (result.docs.length !== 1) throw new Error('Expected exactly one sector-10')
const sector = result.docs[0]
// Grupo Juvenil and Comunidades de Fe are preserved literally in the summary.
const slugs = ['mec', 'rcc', 'iam', 'escuela-basica-en-la-fe']
const groups = await payload.find({ collection: 'groups', where: { slug: { in: slugs } }, depth: 0, limit: 10, overrideAccess: true })
if (groups.docs.length !== slugs.length) throw new Error('Missing group relationships')
console.log(JSON.stringify({ sector, groups: groups.docs.map(({ id, name, slug }) => ({ id, name, slug })) }, null, 2))
if (process.env.SEED_CONFIRM !== 'cargar') process.exit(0)

mkdirSync('content-imports/sector-10', { recursive: true })
writeFileSync(`content-imports/sector-10/before-${Date.now()}.json`, JSON.stringify(sector, null, 2))
const assets = [
  ['238440.jpg', 'Logo del sector 10 con San Miguel Arcángel y el lema Dios es mi defensa'],
  ['238442.jpg', 'Comunidad del sector 10 reunida alrededor de una imagen del Sagrado Corazón y arreglos florales'],
  ['238450.jpg', 'Imagen de San Miguel Arcángel junto a flores de colores y velas encendidas'],
  ['238448.jpg', 'Altar adornado con flores y una imagen de San Miguel Arcángel, patrono del sector 10'],
  ['238444.jpg', 'Imagen de la Virgen de Guadalupe rodeada de flores en un nicho al aire libre'],
  ['238446.jpg', 'Celebración eucarística ante el altar con flores y una imagen de San Miguel Arcángel al fondo'],
] as const
const ids: number[] = []
for (const [filename, alt] of assets) {
  const found = await payload.find({ collection: 'media', where: { filename: { equals: filename } }, limit: 1, depth: 0, overrideAccess: true })
  const media = found.docs[0] ?? await payload.create({ collection: 'media', data: { alt }, filePath: `C:/Users/fabri/Downloads/${filename}`, overrideAccess: true })
  ids.push(media.id)
}
const summary = 'La Joyita, primera zona. Lugar de reunión: Casa de Retiros Presbítero Óscar Álvarez. Fiesta patronal: 29 de septiembre, en honor a San Miguel Arcángel. Lunes: Rosario a la Virgen. Miércoles: Grupo de Oración abierto. Medios de crecimiento: Comunidades de Fe, Encuentros Conyugales, Renovación, Grupo Juvenil, IAM y Escuela Básica en la Fe.'
await payload.update({ collection: 'sectors', id: sector.id, overrideAccess: true, data: {
  summary,
  chapelName: 'Casa de Retiros Presbítero Óscar Álvarez',
  team: [
    { name: 'Rubia del Carmen Pichinte', role: 'Apóstol' },
    { name: 'Daniel Moreno', role: 'Apóstol' },
    { name: 'Victoria Edith Salinas', role: 'Apóstol' },
  ],
  patron: { ...sector.patron, name: 'San Miguel Arcángel', image: ids[2] },
  logo: ids[0], cover: ids[1], groupPhoto: ids[1],
  gallery: [...new Set([...(sector.gallery ?? []).map((m) => typeof m === 'object' ? m.id : m), ...ids.slice(3)])],
  groups: [...new Set([...(sector.groups ?? []).map((g) => typeof g === 'object' ? g.id : g), ...groups.docs.map((g) => g.id)])],
} })
const verified = await payload.findByID({ collection: 'sectors', id: sector.id, depth: 1, overrideAccess: true })
if (verified.team?.length !== 3 || verified.summary !== summary || verified.status !== sector.status || verified.gallery?.length !== (sector.gallery?.length ?? 0) + 3) throw new Error('Read-back verification failed')
writeFileSync('content-imports/sector-10/after.json', JSON.stringify(verified, null, 2))
console.log(`VERIFIED sector-10 id=${verified.id} status=${verified.status}, team=3, images=6, groups=${verified.groups?.length}`)
process.exit(0)
