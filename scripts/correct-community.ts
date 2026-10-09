import 'dotenv/config'
import { getPayload } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import config from '../src/payload.config.js'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import type { Group, Sector } from '../src/payload-types.js'

const resolved = await config
resolved.db = { ...postgresAdapter({ pool: { connectionString: process.env.DATABASE_URL }, push: false }), allowIDOnCreate: false, defaultIDType: 'number', name: 'postgres' }
const payload = await getPayload({ config: resolved })
const apply = process.env.CONTENT_CONFIRM === 'corregir'
const dir = 'content-audits/2026-10-06/corrections'
mkdirSync(dir, { recursive: true })
const sectors = (await payload.find({ collection: 'sectors', limit: 500, depth: 0, overrideAccess: true })).docs
const groups = (await payload.find({ collection: 'groups', limit: 500, depth: 0, overrideAccess: true })).docs
const chapels = (await payload.find({ collection: 'chapels', limit: 500, depth: 0, overrideAccess: true })).docs
writeFileSync(`${dir}/before-${Date.now()}.json`, JSON.stringify({ sectors, groups, chapels }, null, 2))

const paragraph = (text: string) => ({ type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', textFormat: 0, children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 }] })
const rich = (lines: string[]) => ({ root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children: lines.map(paragraph) } }) as Group['description']
const clean = (s: string) => s.replace(/\s+/g, ' ').trim()
const fixes: [string, string][] = [
  ['Padre Oscar Alvarez', 'Padre Óscar Álvarez'], ['Padre Oscar', 'Padre Óscar'], ['Mons. Oscar', 'Mons. Óscar'],
  ['fue dirigía', 'fue dirigida'], ['es dirigía', 'es dirigida'], ['Comisión paso', 'Comisión pasó'],
  ['Celebracion de Palabra', 'Celebración de la Palabra'], ['Nuestra Señora de Fatima', 'Nuestra Señora de Fátima'],
  ['Sagrado Corazon de Jesus', 'Sagrado Corazón de Jesús'], ['San Jose Obrero', 'San José Obrero'],
]
const rewriteRich = (value: Group['description']) => {
  if (!value) return value
  const copy = JSON.parse(JSON.stringify(value))
  const walk = (node: Record<string, unknown>) => {
    if (typeof node.text === 'string') {
      // Preserve run boundary spaces; trimming every run joins adjacent words.
      node.text = node.text.replace(/ {2,}/g, ' ')
      for (const [from, to] of fixes) node.text = (node.text as string).split(from).join(to)
    }
    if (node.format === 'justify') node.format = ''
    if (Array.isArray(node.children)) node.children.forEach(walk)
    if (node.root && typeof node.root === 'object') walk(node.root as Record<string, unknown>)
  }
  walk(copy)
  return copy as Group['description']
}
const normalizeContact = (c: Sector['contact']) => {
  if (!c) return c
  const copy = { ...c }
  for (const key of ['phone', 'whatsapp'] as const) {
    const raw = copy[key]
    if (!raw) continue
    const digits = raw.replace(/\D/g, '')
    if (!digits) { copy[key] = null; continue }
    copy[key] = digits.length === 8 ? `+503 ${digits.slice(0, 4)}-${digits.slice(4)}` : raw.trim()
  }
  if (copy.email) copy.email = copy.email.trim().toLowerCase()
  return copy
}
const normalizeTeam = (team: Sector['team']) => team?.map(m => ({ ...m, name: clean(m.name), role: m.role ? clean(m.role).replace(/^Apostol$/, 'Apóstol').replace(/^Sub Coordinador$/, 'Subcoordinador').replace('Auxiliar-Tesorero', 'Auxiliar y tesorero').replace('comunidad de Fe', 'comunidad de fe').replace('Catequista de Confirmas.', 'Catequista de Confirmación') : m.role }))

const summaries: Record<string, string> = {
  'escuela-de-predicadores': 'Escuela parroquial de formación para la predicación, iniciada en 2006 con participantes de los distintos sectores.',
  'escuela-basica-en-la-fe': 'Formación gradual en la fe para niños y niñas, acompañada por catequistas de los sectores parroquiales.',
  iam: 'Infancia y Adolescencia Misionera: acompaña a los niños después de su primera comunión en distintos sectores de la parroquia.',
  mec: 'Movimiento de Encuentros Conyugales: evangelización y grupos de crecimiento para matrimonios de Ciudad Arce.',
  'comision-de-liturgia': 'Comisión parroquial fundada en 1996, que también acompaña la formación de acólitos para el servicio en el altar.',
  rcc: 'La Renovación Carismática Católica reúne comunidades de Ciudad Arce para la evangelización, la formación y el servicio parroquial.',
  'comision-de-formacion': 'Formación para los sacramentos de iniciación cristiana y otros espacios de aprendizaje de la fe católica.',
  jumi: 'Juventud Misionera: servicio misionero y formación de líderes, con presencia en la parroquia desde 2016.',
  'consejo-economico': 'Consejo encargado de promover y recolectar aportaciones para los bienes y servicios de la misión evangelizadora parroquial.',
}
const plans: { collection: string; id: number; data: unknown }[] = []
for (const g of groups) {
  const data: Partial<Group> = { team: normalizeTeam(g.team), contact: normalizeContact(g.contact), description: rewriteRich(g.description), history: rewriteRich(g.history) }
  if (summaries[g.slug] && !g.summary) data.summary = summaries[g.slug]
  if (g.slug === 'rcc') data.name = 'Comisión de Renovación Carismática Católica'
  if (g.slug === 'comision-de-formacion') data.name = 'Comisión de Formación'
  if (g.slug === 'consejo-economico') {
    data.name = 'Consejo Económico'
    data.description = rich(['El Consejo Económico fue creado para promover y recolectar la aportación económica de los fieles. Estos recursos se utilizan para adquirir bienes y servicios destinados al proceso evangelizador de la parroquia.'])
  }
  if (g.slug === 'jumi') data.description = rich(['Somos un grupo de servicio misionero que busca animar a otros grupos y movimientos, salir más allá de las fronteras y llegar a quienes más lo necesitan.', 'Nuestra base es la Arquidiócesis de San Salvador. En la parroquia estamos presentes desde 2016 y buscamos formar líderes misioneros.'])
  if (!g.description && ['iam', 'mec', 'comision-de-liturgia', 'comision-de-formacion', 'escuela-de-predicadores'].includes(g.slug)) data.description = rich([summaries[g.slug]])
  if (g.slug === 'escuela-de-predicadores') {
    data.meeting = { ...g.meeting, day: 'Último domingo del mes', place: 'Salón multiusos Monseñor Romero' }
    data.howToJoin = 'Comunícate con la hermana Jesús Barrera mediante el contacto de WhatsApp.'
    if (data.history) {
      const root = data.history.root
      root.children = root.children.filter((node) => !JSON.stringify(node).includes('A lo largo de los años, el desarrollo de las promociones se ha estructurado de la siguiente manera:'))
      for (const node of root.children) if (node.type === 'heading') node.tag = 'h2'
    }
  }
  if (g.slug === 'rcc' && data.history) {
    const nodes = data.history.root.children
    const listStart = nodes.findIndex(n => JSON.stringify(n).includes('Comunidad San Antonio de Padua'))
    if (listStart >= 0) {
      // Existing literal bullet paragraphs become a semantic list, without changing names.
      const bullets = nodes.filter(n => JSON.stringify(n).includes('• Comunidad'))
      if (bullets.length) {
        const list = { type: 'list', listType: 'bullet', tag: 'ul', start: 1, format: '', indent: 0, version: 1, direction: 'ltr', children: bullets.map((n, i) => ({ ...n, type: 'listitem', value: i + 1, children: (n.children as { text: string }[]).map(c => ({ ...c, text: c.text?.replace(/^\s*•\s*/, '') })) })) }
        data.history.root.children = nodes.flatMap(n => n === bullets[0] ? [list] : bullets.includes(n) ? [] : [n]) as typeof nodes
      }
    }
    data.description = rich([summaries.rcc])
  }
  plans.push({ collection: 'groups', id: g.id, data })
}

const patronNames: Record<number, string> = { 8: 'Nuestra Señora de Fátima', 15: 'Sagrado Corazón de Jesús', 22: 'San José Obrero' }
for (const s of sectors) {
  const data: Partial<Sector> = { team: normalizeTeam(s.team), contact: normalizeContact(s.contact), history: rewriteRich(s.history), description: rewriteRich(s.description) }
  if (!s.patron?.name && s.number && patronNames[s.number]) data.patron = { ...s.patron, name: patronNames[s.number] }
  if (s.chapelName) data.chapelName = fixes.reduce((t, [from, to]) => t.split(from).join(to), s.chapelName.trim())
  if (!s.summary && s.number) data.summary = `${s.name}. Patrono: ${data.patron?.name ?? s.patron?.name ?? s.chapelName ?? ''}.`
  if (s.number === 1) {
    data.summary = 'Comunidad católica del Barrio El Centro, bajo el patronazgo de San Juan María Vianney.'
    data.description = rich(['La fiesta patronal en honor a San Juan María Vianney se celebra el 4 de agosto.', 'Medios de crecimiento: Comunidades de Fe, Movimiento de Encuentros Conyugales, Renovación Carismática, Pastoral Juvenil, IAM y Escuela Básica en la Fe.'])
  }
  if (s.number === 10) {
    data.summary = 'Sector de La Joyita, primera zona, que se reúne en la Casa de Retiros Presbítero Óscar Álvarez.'
    data.description = rich(['El patrono del sector es San Miguel Arcángel. Su fiesta patronal se celebra el 29 de septiembre.', 'Los lunes se realiza el Rosario a la Virgen. Los miércoles se reúne el Grupo de Oración abierto.', 'Medios de crecimiento: Comunidades de Fe, Encuentros Conyugales, Renovación, Grupo Juvenil, IAM y Escuela Básica en la Fe.'])
  }
  if (s.number === 13) {
    data.summary = 'Comunidad católica de Colonia Italia, con la ermita San Esteban Protomártir y un aula para la Escuela Básica en la Fe.'
    data.description = rich(['La fiesta patronal en honor a San Esteban Protomártir se celebra el 26 de diciembre.', 'Medios de crecimiento: Comunidades de Fe, Escuela de Formación Básica en la Fe e Infancia y Adolescencia Misionera (IAM).'])
    data.history = rich(['La comunidad católica del sector 13, Colonia Italia, tiene sus inicios entre 2001 y 2002. Originalmente pertenecía a la parroquia del Congo; luego pasó a formar parte de la Parroquia Inmaculada Concepción de María de Ciudad Arce.', 'Gracias al esfuerzo de los hermanos, actualmente contamos con nuestra ermita y un aula para la Escuela Básica en la Fe, mientras se continúa con los trabajos pastorales y de infraestructura.'])
  }
  plans.push({ collection: 'sectors', id: s.id, data })
}
for (const c of chapels) plans.push({ collection: 'chapels', id: c.id, data: { contact: normalizeContact(c.contact), patronOrDedication: c.patronOrDedication ? fixes.reduce((t, [from, to]) => t.split(from).join(to), c.patronOrDedication) : c.patronOrDedication, patronalFeasts: c.patronalFeasts?.map(f => ({ ...f, name: fixes.reduce((t, [from, to]) => t.split(from).join(to), f.name) })), massSchedule: c.massSchedule ? fixes.reduce((t, [from, to]) => t.split(from).join(to), c.massSchedule) : c.massSchedule } })

const alts: Record<number, string> = {
  9: 'Logo de Juventud Misionera de la Arquidiócesis de San Salvador',
  10: 'Equipo de la Comisión de Formación reunido frente a una pared con imágenes religiosas',
  11: 'Fachada de un salón parroquial con una cruz sobre el techo',
  12: 'Altar de San José Obrero con flores y una cruz sobre la imagen del santo',
  13: 'Altar con la imagen de San José, flores y una cruz al fondo',
  14: 'Comunidad reunida en círculo dentro de un salón durante una actividad',
  15: 'Altar adornado con flores blancas y amarillas junto a una imagen de San José',
  16: 'Comunidad participando en una celebración ante un altar adornado con flores',
  17: 'Composición con el Sagrado Corazón de Jesús, la fachada de una ermita y una foto comunitaria',
  18: 'Celebración eucarística en una ermita con fieles y ministros frente al altar',
  19: 'Altar adornado con flores, velas e imágenes de ángeles a ambos lados',
  20: 'Logo de la Renovación Carismática Católica de Ciudad Arce, con una cruz, paloma y llama',
  21: 'Integrantes de la Renovación Carismática Católica reunidos en el templo',
  22: 'Grupo de la Renovación Carismática Católica de pie entre los bancos del templo',
  23: 'Comunidad reunida para una fotografía frente al presbiterio',
  25: 'Altar adornado con flores ante una imagen de la Virgen en una ermita',
  26: 'Fieles reunidos frente a un altar con flores e imágenes religiosas',
  27: 'Representación de la crucifixión con participantes reunidos al aire libre',
  28: 'Comunidad participando en una celebración dentro de una ermita',
  29: 'Grupo de jóvenes posando frente al altar de una ermita',
  30: 'Fieles reunidos en los bancos de una ermita durante una celebración',
  31: 'Comunidad reunida dentro de una ermita durante una actividad',
  32: 'Fieles sentados en bancos y sillas dentro de una ermita',
  53: 'Altar con crucifijo, velas y flores en un templo',
  54: 'Integrantes de la Escuela de Predicadores reunidos en el templo',
}
for (const [id, alt] of Object.entries(alts)) plans.push({ collection: 'media', id: Number(id), data: { alt } })
writeFileSync(`${dir}/preview.json`, JSON.stringify(plans, null, 2))
console.log(`PREVIEW ${plans.length} document updates; sectors=${sectors.length}, groups=${groups.length}, chapels=${chapels.length}`)
if (!apply) process.exit(0)
const beforeMedia = await Promise.all(Object.keys(alts).map(id => payload.findByID({ collection: 'media', id: Number(id), depth: 0, overrideAccess: true })))
writeFileSync(`${dir}/before-media-${Date.now()}.json`, JSON.stringify(beforeMedia, null, 2))
for (const p of plans) {
  // The preview mixes four collection shapes; Payload validates each at runtime.
  await payload.update({ collection: p.collection as 'sectors', id: p.id, data: p.data as Partial<Sector>, overrideAccess: true })
}

type ImageSource = { file: string; source: string; license: string; licenseUrl?: string; author: string; title: string }
const sources = JSON.parse(readFileSync('content-audits/2026-10-06/patron-images.json', 'utf8')) as Record<string, ImageSource>
const mapping: Record<number, string | number> = { 1: 'vianney', 2: 'lourdes', 3: 'rosario', 4: 'jose', 5: 49, 6: 'guadalupe', 7: 'ana', 8: 'fatima', 9: 'jose', 11: 'auxiliadora', 13: 64, 15: 'sagrado', 16: 'transito', 17: 'guadalupe', 19: 'carlos', 20: 'joaquin', 21: 'juanpablo', 22: 'jose', 23: 'romero' }
const imageAlts: Record<string, string> = { vianney: 'Retrato de San Juan María Vianney, el Cura de Ars', lourdes: 'Imagen histórica de Nuestra Señora de Lourdes en la gruta de Massabielle', rosario: 'Pintura de Nuestra Señora del Rosario con el Niño Jesús', jose: 'San José sosteniendo al Niño Jesús, pintura de Guido Reni', guadalupe: 'Imagen de Nuestra Señora de Guadalupe con las manos juntas', ana: 'Santa Ana junto a la Virgen María y el Niño Jesús, pintura de Leonardo da Vinci', auxiliadora: 'Imagen de María Auxiliadora con el Niño Jesús durante una procesión en Madrid', transito: 'El Tránsito de la Virgen, pintura de Carlo Saraceni', carlos: 'Retrato de San Carlos Borromeo vestido de cardenal', joaquin: 'San Joaquín con un bastón, pintura de Pedro Ruiz González', juanpablo: 'San Juan Pablo II con mitra y báculo durante una celebración', romero: 'Retrato de Monseñor Óscar Arnulfo Romero', sagrado: 'Sagrado Corazón de Jesús, pintura de Pompeo Batoni', fatima: 'Imagen de Nuestra Señora de Fátima junto a tres palomas en Bombarral, Portugal' }
const uploaded = new Map<string, number>()
const linked: { sector: number; media: number }[] = []
for (const s of sectors) {
  if (!s.number || s.patron?.image || mapping[s.number] == null) continue
  const key = mapping[s.number]
  let id: number
  if (typeof key === 'number') id = key
  else {
    const source = sources[key]
    if (!source || !existsSync(source.file)) throw new Error(`Missing reviewed image: ${key}`)
    if (!uploaded.has(key)) {
      const filename = `patron-${key}.jpg`
      const found = await payload.find({ collection: 'media', where: { filename: { equals: filename } }, depth: 0, limit: 1, overrideAccess: true })
      const credit = `${source.author || 'Autor no identificado'} · ${source.license} · ${source.source}${source.licenseUrl ? ` · ${source.licenseUrl}` : ''}`
      const media = found.docs[0] ?? await payload.create({ collection: 'media', data: { alt: imageAlts[key], caption: `Imagen de referencia del patrono; no es una fotografía de la ermita local. Fuente: ${source.source}`, credit }, file: { data: readFileSync(source.file), mimetype: 'image/jpeg', name: filename, size: readFileSync(source.file).length }, overrideAccess: true })
      uploaded.set(key, media.id)
    }
    id = uploaded.get(key)!
  }
  const current = await payload.findByID({ collection: 'sectors', id: s.id, depth: 0, overrideAccess: true })
  await payload.update({ collection: 'sectors', id: s.id, data: { patron: { ...current.patron, image: id } }, overrideAccess: true })
  linked.push({ sector: s.number, media: id })
}
const afterSectors = (await payload.find({ collection: 'sectors', depth: 1, limit: 500, overrideAccess: true })).docs
const afterGroups = (await payload.find({ collection: 'groups', depth: 1, limit: 500, overrideAccess: true })).docs
const afterChapels = (await payload.find({ collection: 'chapels', depth: 1, limit: 500, overrideAccess: true })).docs
if (afterSectors.length !== sectors.length || afterGroups.length !== groups.length || afterChapels.length !== chapels.length) throw new Error('Document count changed')
for (const s of afterSectors) if (s.status !== sectors.find(b => b.id === s.id)?.status) throw new Error('Publication changed')
for (const g of afterGroups) if (g.status !== groups.find(b => b.id === g.id)?.status) throw new Error('Publication changed')
for (const c of afterChapels) if (c.status !== chapels.find(b => b.id === c.id)?.status) throw new Error('Publication changed')
for (const l of linked) if (!afterSectors.find(s => s.number === l.sector)?.patron?.image) throw new Error('Missing patron relationship')
writeFileSync(`${dir}/after.json`, JSON.stringify({ sectors: afterSectors, groups: afterGroups, chapels: afterChapels }, null, 2))
writeFileSync(`${dir}/result.json`, JSON.stringify({ updates: plans.length, newImages: [...uploaded.entries()], linked, pending: ['Sector 14: la fuente dice Divina Providencia sin identificar la representación concreta. No se asignó una advocación mariana por suposición.'] }, null, 2))
console.log(`VERIFIED ${plans.length} updates, ${uploaded.size} sourced images, ${linked.length} patron links, unchanged document counts and publication states`)
process.exit(0)
