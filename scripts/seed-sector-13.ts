import 'dotenv/config'
import { getPayload } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import config from '../src/payload.config.js'
import { mkdirSync, writeFileSync } from 'node:fs'

const resolved = await config
resolved.db = postgresAdapter({ pool: { connectionString: process.env.DATABASE_URL }, push: false })
const payload = await getPayload({ config: resolved })
const result = await payload.find({ collection: 'sectors', where: { slug: { equals: 'sector-13' } }, depth: 0, limit: 2, overrideAccess: true })
if (result.docs.length !== 1) throw new Error('Expected exactly one sector-13')
const sector = result.docs[0]
const groups = await payload.find({ collection: 'groups', where: { slug: { in: ['iam', 'escuela-basica-en-la-fe'] } }, depth: 0, limit: 10, overrideAccess: true })
if (groups.docs.length !== 2) throw new Error('Missing group relationships')
const chapels = await payload.find({ collection: 'chapels', where: { sector: { equals: sector.id } }, depth: 0, limit: 20, overrideAccess: true })
console.log(JSON.stringify({ sector, chapels: chapels.docs, groups: groups.docs.map(({ id, name }) => ({ id, name })) }, null, 2))
if (process.env.SEED_CONFIRM !== 'cargar') process.exit(0)
mkdirSync('content-imports/sector-13', { recursive: true })
writeFileSync(`content-imports/sector-13/before-${Date.now()}.json`, JSON.stringify({ sector, chapels: chapels.docs }, null, 2))
const assets = [
  ['8.22.50 PM.jpeg', 'Logo del sector 13, Colonia Italia, con San Esteban Protomártir'],
  ['8.22.51 PM (3).jpeg', 'Comunidad reunida para la misa en la ermita San Esteban Protomártir'],
  ['8.22.51 PM (1).jpeg', 'Fachada de la ermita con una cruz sobre el techo y banderines de colores'],
  ['8.22.50 PM (2).jpeg', 'Sagrario dorado bajo el crucifijo, con velas y flores blancas y amarillas'],
  ['8.22.50 PM (1).jpeg', 'Imagen de la Virgen con un rosario junto al sagrario y al crucifijo'],
  ['8.22.51 PM (4).jpeg', 'Comunidad del sector 13 reunida en una calle junto a un altar adornado'],
  ['8.22.51 PM (2).jpeg', 'Interior de la ermita con bancos y el altar adornado con flores'],
  ['8.22.51 PM.jpeg', 'Altar de la ermita con el sagrario, el crucifijo e imágenes religiosas entre flores'],
] as const
const ids: number[] = []
for (const [suffix, alt] of assets) {
  const filename = `WhatsApp Image 2026-10-05 at ${suffix}`
  const found = await payload.find({ collection: 'media', where: { filename: { equals: filename } }, limit: 1, depth: 0, overrideAccess: true })
  const media = found.docs[0] ?? await payload.create({ collection: 'media', data: { alt }, filePath: `C:/Users/fabri/Downloads/${filename}`, overrideAccess: true })
  ids.push(media.id)
}
const historyText = 'La comunidad católica del sector 13, Colonia Italia, tiene sus inicios entre 2001 y 2002. Originalmente pertenecía a la parroquia del Congo; luego pasó a formar parte de la Parroquia Inmaculada Concepción de María de Ciudad Arce. Gracias al esfuerzo de los hermanos, actualmente contamos con nuestra ermita y un aula para la Escuela Básica en la Fe, mientras se continúa con los trabajos pastorales y de infraestructura.'
const history = { root: { type: 'root', format: '' as const, indent: 0, version: 1, direction: 'ltr' as const, children: [{ type: 'paragraph', format: '' as const, indent: 0, version: 1, direction: 'ltr' as const, textFormat: 0, children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: historyText, version: 1 }] }] } }
await payload.update({ collection: 'sectors', id: sector.id, overrideAccess: true, data: {
  chapelName: 'San Esteban Protomártir',
  summary: 'Sector 13, Colonia Italia. Fiesta patronal: 26 de diciembre, en honor a San Esteban Protomártir. Medios de crecimiento: Comunidades de Fe, Escuela de Formación Básica en la Fe e Infancia y Adolescencia Misionera (IAM).',
  history,
  // The source combines Apóstol/Auxiliar; it does not specify Alicia's role.
  team: [{ name: 'Alicia Barraza', role: 'Apóstol / Auxiliar' }],
  patron: { ...sector.patron, name: 'San Esteban Protomártir' },
  logo: ids[0], cover: ids[1], groupPhoto: ids[5],
  gallery: [...new Set([...(sector.gallery ?? []).map((m) => typeof m === 'object' ? m.id : m), ids[2], ids[3], ids[4], ids[6], ids[7]])],
  groups: [...new Set([...(sector.groups ?? []).map((g) => typeof g === 'object' ? g.id : g), ...groups.docs.map((g) => g.id)])],
} })
if (chapels.docs.length === 0) {
  await payload.create({ collection: 'chapels', overrideAccess: true, data: {
    name: 'Ermita San Esteban Protomártir', slug: 'ermita-san-esteban-protomartir-sector-13', sector: sector.id,
    patronOrDedication: 'San Esteban Protomártir', patronalFeasts: [{ name: 'San Esteban Protomártir', day: 26, month: '12' }],
    cover: ids[2], status: sector.status,
  } })
}
const verified = await payload.findByID({ collection: 'sectors', id: sector.id, depth: 1, overrideAccess: true })
const verifiedChapels = await payload.find({ collection: 'chapels', where: { sector: { equals: sector.id } }, depth: 1, overrideAccess: true })
if (verified.team?.[0]?.name !== 'Alicia Barraza' || !verified.history || verified.status !== sector.status || verifiedChapels.docs.length === 0) throw new Error('Read-back verification failed')
writeFileSync('content-imports/sector-13/after.json', JSON.stringify({ sector: verified, chapels: verifiedChapels.docs }, null, 2))
console.log(`VERIFIED sector-13 id=${verified.id} status=${verified.status}, images=8, chapels=${verifiedChapels.totalDocs}`)
process.exit(0)
