import 'dotenv/config'
import { getPayload } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import config from '../src/payload.config.js'
import { mkdirSync, writeFileSync } from 'node:fs'

// Content-only import. Never run schema push against the shared database.
const resolved = await config
resolved.db = postgresAdapter({ pool: { connectionString: process.env.DATABASE_URL }, push: false })
const payload = await getPayload({ config: resolved })
const apply = process.env.SEED_CONFIRM === 'cargar'
const result = await payload.find({ collection: 'sectors', where: { slug: { equals: 'sector-1' } }, depth: 0, limit: 2, overrideAccess: true })
if (result.docs.length !== 1) throw new Error('Expected exactly one sector-1')
const sector = result.docs[0]
const slugs = ['mec', 'rcc', 'pastoral-juvenil', 'iam', 'escuela-basica-en-la-fe']
const groups = await payload.find({ collection: 'groups', where: { slug: { in: slugs } }, depth: 0, limit: 10, overrideAccess: true })
if (groups.docs.length !== slugs.length) throw new Error('Missing group relationships')
console.log(JSON.stringify({ sector, groups: groups.docs.map(({ id, name, slug }) => ({ id, name, slug })) }, null, 2))
if (!apply) process.exit(0)

mkdirSync('content-imports/sector-1', { recursive: true })
writeFileSync(`content-imports/sector-1/before-${Date.now()}.json`, JSON.stringify(sector, null, 2))
const upload = async (filename: string, alt: string) => {
  const found = await payload.find({ collection: 'media', where: { filename: { equals: filename } }, limit: 1, depth: 0, overrideAccess: true })
  if (found.docs[0]) return found.docs[0].id
  return (await payload.create({ collection: 'media', data: { alt }, filePath: `C:/Users/fabri/Downloads/${filename}`, overrideAccess: true })).id
}
const logo = await upload('WhatsApp Image 2026-08-13 at 10.33.17 AM.jpeg', 'Logo del sector 1, Barrio El Centro, con San Juan María Vianney y el nombre de la Parroquia Inmaculada Concepción de María')
const photo = await upload('WhatsApp Image 2026-08-13 at 10.33.50 AM.jpeg', 'Comunidad del sector 1 reunida frente al altar, junto a una imagen de San Juan María Vianney')
const updated = await payload.update({ collection: 'sectors', id: sector.id, overrideAccess: true, data: {
  team: [
    { name: 'Yanira Marisol Joya Granados', role: 'Apóstol' },
    { name: 'Fátima Guadalupe Portillo González', role: 'Auxiliar' },
  ],
  patron: { ...sector.patron, name: 'San Juan María Vianney' },
  summary: 'Sector 1, Barrio El Centro. Fiesta patronal en honor a San Juan María Vianney: 4 de agosto. Medios de crecimiento: Comunidades de Fe, Movimiento de Encuentros Conyugales, Renovación Carismática, Pastoral Juvenil, IAM y Escuela Básica en la Fe.',
  logo,
  cover: photo,
  groupPhoto: photo,
  groups: [...new Set([...(sector.groups ?? []).map((g) => typeof g === 'object' ? g.id : g), ...groups.docs.map((g) => g.id)])],
} })
const verified = await payload.findByID({ collection: 'sectors', id: sector.id, depth: 1, overrideAccess: true })
if (verified.team?.length !== 2 || verified.logo == null || verified.groupPhoto == null || verified.summary !== updated.summary || verified.status !== sector.status) throw new Error('Read-back verification failed')
writeFileSync('content-imports/sector-1/after.json', JSON.stringify(verified, null, 2))
console.log(`VERIFIED sector-1 id=${verified.id} status=${verified.status}, team=2, images=2, groups=${verified.groups?.length}`)
process.exit(0)
