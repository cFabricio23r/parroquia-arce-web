import { getPayload } from 'payload'
import config from '../src/payload.config.js'

/**
 * Carga el contenido del sector 12 (Canton La Reforma) que entrego la parroquia
 * el 2026-08-13: formulario "INFORMACION PAGINA WEB" + historia manuscrita en
 * hoja aparte + 5 fotos ("sector 12.zip").
 *
 * Llena el documento `sector-12` que creo seed-sectors-organigrama.ts y crea la
 * ermita en `chapels`. Es la segunda ermita del sitio, despues de Las Cruces:
 * hasta ahora no se creaban ermitas porque no sabiamos cuales estan construidas
 * — de esta hay fotos de la fachada, asi que existe.
 *
 * Es IDEMPOTENTE: si el sector ya tiene historia, o la ermita ya existe, saltea.
 * Las imagenes se suben una sola vez, solo si hay algo que crear.
 *
 * Todo queda en `draft`. Publica la parroquia.
 *
 * QUEDA PENDIENTE de confirmacion (ver el informe del 2026-08-13):
 *   - La historia se titula "en la Joyita 2 zona" pero cierra con "esta
 *     comunidad de La Reforma", y el Anexo 1 dice que el sector 12 es Canton La
 *     Reforma (el 10 es La Joyita, Primera Zona). El `name` del sector NO se
 *     toca: queda como lo dice el Anexo 1.
 *   - De los 5 medios de crecimiento del formulario solo se enlazan 3. Ver ABAJO.
 *   - Faltan el logo del sector y la foto de la comunidad, que el formulario pide.
 *
 * Uso:
 *   Simulacion:  npx payload run scripts/seed-sector-12.ts
 *   De verdad:   SEED_CONFIRM=cargar npx payload run scripts/seed-sector-12.ts
 *
 * Las imagenes salen de SECTOR12_ASSETS_DIR.
 */

const ASSETS =
  process.env.SECTOR12_ASSETS_DIR ??
  'C:/Users/fabri/AppData/Local/Temp/claude/C--Parroquia-Ciudad-Arce/c6671ef3-60f0-4b56-aa57-c5071628bbd8/scratchpad/sector12'

/** Lexical: un parrafo por linea. Mismo helper que seed-groups-2026-08.ts. */
const richText = (lines: string[]) => ({
  root: {
    type: 'root',
    format: '' as const,
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: lines.map((text) => ({
      type: 'paragraph',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      textFormat: 0,
      children: [
        { type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 },
      ],
    })),
  },
})

/**
 * Los `alt` estan escritos a mano mirando cada foto. El vault ya arrastra 27
 * medias con el nombre de archivo como `alt`; esta carga no suma ninguna mas.
 * Sin numeros que no se puedan verificar: un dato inventado en un `alt` se lee
 * como un hecho.
 */
const ASSET_LIST = {
  fachada: {
    file: 'WhatsApp Image 2026-08-13 at 3.06.20 PM.jpeg',
    alt: 'Fachada de la Ermita San Antonio de Padua: campanario con dos campanas tras una reja celeste, cruz en la cima y portón azul de entrada',
  },
  altar: {
    file: 'WhatsApp Image 2026-08-13 at 3.06.21 PM (1).jpeg',
    alt: 'Presbiterio de la ermita con el altar vestido de blanco, el crucifijo al centro y la imagen de San Antonio de Padua en el nicho de la derecha',
  },
  patrono: {
    file: 'WhatsApp Image 2026-08-13 at 3.06.21 PM.jpeg',
    alt: 'Imagen de San Antonio de Padua con el Niño en brazos y un ramo de lirios, en su nicho rodeado de flores blancas',
  },
  sagrario: {
    file: 'WhatsApp Image 2026-08-13 at 3.06.20 PM (1).jpeg',
    alt: 'Crucifijo sobre el sagrario de madera, flanqueado por arreglos de lirios blancos y girasoles',
  },
  custodia: {
    file: 'WhatsApp Image 2026-08-13 at 3.06.22 PM.jpeg',
    alt: 'Custodia dorada con el Santísimo expuesto sobre el altar, entre velas encendidas y lirios blancos',
  },
} as const

type Slot = keyof typeof ASSET_LIST

/** Transcripcion de la hoja manuscrita. Se corrige ortografia, no contenido. */
const HISTORY = [
  'La Ermita San Antonio de Padua se encuentra en La Joyita, segunda zona.',
  'Fue aproximadamente en el año 1951 que el hermano José Villagranco donó el terreno para la construcción de la Ermita. Con mucho esfuerzo se empezó a construir: se salía a pedir donaciones y así la construyeron poco a poco. En un inicio fue de adobe y teja, entre los años 1957 a 1963; en ese tiempo solo se rezaba el rosario y se daba catequesis.',
  'Entre el año 1957 a 1964 donaron las imágenes de la Ermita y las campanas, ya que lo último que se realizó fue el campanario, en 1964. Desde esa época ya se realizaba la misa patronal cada 13 de junio.',
  'La Ermita actual se construyó en los años 1975 a 1980, ya de ladrillo y duralita, siendo el encargado el hermano José Marroquín.',
  'Desde esos años se fue trabajando duro para poder tener un coro y la Legión de María, en el año 1994. Se formó la Renovación Carismática y el grupo juvenil, y en el año 1998 se formó la primera pequeña comunidad, ya estando el Padre Óscar Álvarez.',
  'Y así, desde este tiempo, se viene luchando en esta comunidad de La Reforma.',
]

/**
 * De los 5 medios de crecimiento que lista el formulario solo se enlazan 3.
 *
 *   "Escuela en la Fe"        → escuela-basica-en-la-fe  ✓ seguro
 *   "JAM" (sic)               → iam                      ✓ seguro, es IAM
 *   "Renovación Carismática"  → rcc                      ✓ seguro
 *   "Comunidades de Fe"       → ¿pequenas-comunidades?   ✗ sin confirmar
 *   "Grupo Juvenil"           → ¿pastoral-juvenil?       ✗ sin confirmar, puede
 *                               ser un grupo propio del sector
 *
 * Enlazar mal es peor que no enlazar: la relacion se dibuja como "grupos con
 * presencia en el sector" y mandaria al visitante a la ficha equivocada.
 */
const GROUP_SLUGS = ['escuela-basica-en-la-fe', 'iam', 'rcc']

const payload = await getPayload({ config })
const dryRun = process.env.SEED_CONFIRM !== 'cargar'

// --- Que hay que hacer y que no --------------------------------------------
const found = await payload.find({
  collection: 'sectors',
  where: { slug: { equals: 'sector-12' } },
  limit: 1,
  depth: 0,
  overrideAccess: true,
})
const sector = found.docs[0]
if (!sector) {
  console.error('\nNo existe sector-12. Corré primero seed-sectors-organigrama.ts\n')
  process.exit(1)
}

const sectorNeedsContent = !(sector as unknown as Record<string, unknown>).history
const chapelFound = await payload.find({
  collection: 'chapels',
  where: { slug: { equals: 'ermita-san-antonio-de-padua' } },
  limit: 1,
  depth: 0,
  overrideAccess: true,
})
const chapelNeedsCreate = chapelFound.totalDocs === 0

console.log(`\nSector 12: [${sector.id}] ${sector.slug} (${sector.status})`)
console.log(`  ${sectorNeedsContent ? '~ se llena' : '· ya tiene historia, se saltea'}`)
console.log(`Ermita San Antonio de Padua:`)
console.log(`  ${chapelNeedsCreate ? '+ se crea' : '· ya existe, se saltea'}`)

const groups = await payload.find({
  collection: 'groups',
  where: { slug: { in: GROUP_SLUGS } },
  limit: 50,
  depth: 0,
  overrideAccess: true,
})
console.log(`\nGrupos a enlazar (${groups.totalDocs} de ${GROUP_SLUGS.length}):`)
for (const g of groups.docs) console.log(`  · [${g.id}] ${g.slug}`)
if (groups.totalDocs !== GROUP_SLUGS.length) {
  console.error('\nFaltan grupos en la base. Revisá los slugs antes de seguir.\n')
  process.exit(1)
}

if (!sectorNeedsContent && !chapelNeedsCreate) {
  console.log('\nNada que hacer.')
  process.exit(0)
}

if (dryRun) {
  console.log(`\n[SIMULACION] Se subirian 5 imagenes. No se cambio nada.`)
  console.log('Para ejecutar de verdad:')
  console.log('  SEED_CONFIRM=cargar npx payload run scripts/seed-sector-12.ts\n')
  process.exit(0)
}

// --- Imagenes --------------------------------------------------------------
const uploaded = new Map<Slot, number>()
for (const [slot, asset] of Object.entries(ASSET_LIST) as [Slot, { file: string; alt: string }][]) {
  const media = await payload.create({
    collection: 'media',
    data: { alt: asset.alt },
    filePath: `${ASSETS}/${asset.file}`,
    overrideAccess: true,
  })
  uploaded.set(slot, media.id as number)
  console.log(`  ✓ media [${media.id}] ${slot}`)
}
const ref = (slot: Slot) => uploaded.get(slot)!

// --- Sector ----------------------------------------------------------------
if (sectorNeedsContent) {
  const doc = await payload.update({
    collection: 'sectors',
    id: sector.id,
    data: {
      chapelName: 'San Antonio de Padua',
      history: richText(HISTORY),
      patron: { name: 'San Antonio de Padua', image: ref('patrono') },
      team: [
        { name: 'Cristina Polanco', role: 'Apóstol' },
        { name: 'Alicia del Carmen Genovez', role: 'Auxiliar' },
      ],
      cover: ref('altar'),
      gallery: [ref('sagrario'), ref('custodia')],
      groups: groups.docs.map((g) => g.id),
    },
    overrideAccess: true,
  })
  console.log(`  ✓ sector [${doc.id}] ${doc.slug} actualizado (${doc.status})`)
}

// --- Ermita ----------------------------------------------------------------
if (chapelNeedsCreate) {
  const doc = await payload.create({
    collection: 'chapels',
    data: {
      name: 'Ermita San Antonio de Padua',
      slug: 'ermita-san-antonio-de-padua',
      sector: sector.id,
      patronOrDedication: 'San Antonio de Padua',
      patronalFeasts: [{ name: 'San Antonio de Padua', day: 13, month: '6' }],
      massSchedule: 'Hora Santa: jueves, 6:30 p.m.',
      cover: ref('fachada'),
      status: 'draft',
    },
    overrideAccess: true,
  })
  console.log(`  ✓ ermita [${doc.id}] ${doc.slug} — ${doc.name} (${doc.status})`)
}

console.log('\nListo. Sector 12 y su ermita, en BORRADOR.')
console.log('Pendiente de la parroquia: ubicación (La Joyita 2ª zona vs La Reforma),')
console.log('los 2 medios de crecimiento sin confirmar, el logo y la foto de la comunidad.\n')
process.exit(0)
