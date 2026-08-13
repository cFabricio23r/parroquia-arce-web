import { getPayload } from 'payload'
import sharp from 'sharp'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import config from '../src/payload.config.js'
import type { Group } from '../src/payload-types.js'

/**
 * Carga los 4 grupos que entrego la parroquia en agosto de 2026, con sus 12
 * imagenes. Implementa 06-Workspace/2026-08-11-grupos-carga-contenido-design.md
 *
 * Fuentes (formulario "INFORMACION PAGINA WEB" lleno por cada grupo):
 *   comision de liturgia.docx · INFORMACION DEL MEC PARA PAGINA WEB.docx
 *   IAM historia.docx · ESCUELA BASICA EN LA FE(1)(1).pdf
 *
 * Es IDEMPOTENTE por slug: si un grupo ya existe, lo saltea entero — no lo
 * actualiza y no vuelve a subir sus imagenes. Se puede correr dos veces.
 *
 * Todo entra en `draft`. Dev y prod comparten una sola base de Supabase: lo que
 * se crea publicado sale al sitio al instante. Publica la parroquia.
 *
 * Uso:
 *   Simulacion:  npx payload run scripts/seed-groups-2026-08.ts
 *   De verdad:   SEED_CONFIRM=cargar npx payload run scripts/seed-groups-2026-08.ts
 *
 * Las imagenes salen de GROUP_ASSETS_DIR (ver el Paso 5.1 del plan).
 */

const ASSETS =
  process.env.GROUP_ASSETS_DIR ??
  'C:/Users/fabri/AppData/Local/Temp/claude/C--Parroquia-Ciudad-Arce/9a9a65c0-4a91-4f1f-806d-a5fe82077b17/scratchpad/img'

/** Lexical: un parrafo por linea. Mismo helper que seed-events-jul-ago-2026.ts. */
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

type Asset = {
  /** Nombre del archivo dentro de ASSETS */
  file: string
  alt: string
  /** Grados a rotar en sentido horario antes de subir. Las dos fotos de la
   *  Escuela vienen acostadas dentro del PDF: el pixel esta rotado, no es
   *  orientacion EXIF, asi que sin esto salen de costado en la web. */
  rotate?: number
}

const A = {
  liturgiaLogo: {
    file: 'liturgia_image1.png',
    alt: 'Logo de la Comisión de Liturgia: una cruz sobre un libro abierto con las letras alfa y omega',
  },
  liturgiaPatron: {
    file: 'liturgia_image2.png',
    alt: 'San Jerónimo escribiendo con una pluma sobre un libro',
  },
  liturgiaGrupo: {
    file: 'liturgia_image3.png',
    // Sin numero a proposito: contar la foto da entre 11 y 12 y nadie lo
    // verifico. Un dato numerico equivocado en un `alt` se lee como un hecho.
    alt: 'Integrantes de la Comisión de Liturgia sentadas en las gradas del presbiterio',
  },
  mecLogo: {
    file: 'mec_image1.jpeg',
    alt: 'Logo del Movimiento de Encuentros Conyugales: una pareja dentro de un corazón bajo una cruz',
  },
  iamLogo: {
    file: 'iam_image3.png',
    alt: 'Logo de la Infancia y Adolescencia Misionera de El Salvador: dos niños sobre el mundo junto a una cruz',
  },
  iamPatron: {
    file: 'iam_image1.png',
    alt: 'Santa Teresita del Niño Jesús y San Francisco Javier, patronos de la IAM',
  },
  iamGrupo: {
    file: 'iam_image4.png',
    alt: 'Los niños y asesores de la IAM con el sacerdote frente al altar en Cuaresma',
  },
  iamGaleria1: {
    file: 'iam_image5.png',
    alt: 'Niños y asesores de la IAM en el encuentro "Tiempo para crecer con Dios en familia"',
  },
  iamGaleria2: {
    file: 'iam_image2.png',
    alt: 'Cuatro integrantes del equipo de la IAM durante una actividad parroquial',
  },
  escuelaGrupo: {
    file: 'escuela_p2_1.jpeg',
    alt: 'Catequistas y niñas de primera comunión frente al altar de la Inmaculada Concepción',
    rotate: 90,
  },
  escuelaGaleria: {
    file: 'escuela_p2_2.jpeg',
    alt: 'Grupo de niños de primera comunión con el sacerdote en el templo parroquial',
    rotate: 90,
  },
  escuelaPatron: {
    file: 'escuela_p3_1.jpeg',
    alt: 'Imagen de la Inmaculada Concepción de María rodeada de ángeles',
  },
} satisfies Record<string, Asset>

type Slot = keyof typeof A

type GroupSeed = {
  slug: string
  name: string
  type: 'pastoral' | 'ministerio' | 'comunidad' | 'servicio' | 'formacion'
  team: { name: string; role: string }[]
  perseverance: { count: number; label: string }
  history: string[]
  description?: string[]
  patron?: { name?: string; image?: Slot }
  // El tipo del mes sale del generado ('1'..'12'), no de un `string` suelto:
  // asi un mes invalido no compila en vez de fallar en la carga.
  patronalFeasts?: NonNullable<Group['patronalFeasts']>
  logo?: Slot
  groupPhoto?: Slot
  gallery?: Slot[]
}

const GROUPS: GroupSeed[] = [
  {
    slug: 'comision-de-liturgia',
    name: 'Comisión de Liturgia',
    type: 'servicio',
    team: [{ name: 'Leda Abrego', role: 'Coordinadora' }],
    perseverance: { count: 24, label: 'miembros que perseveran' },
    history: [
      'El 20 de julio de 1996, Padre Óscar Álvarez Orellana fundó la "Comisión de Liturgia", integrada por un número considerable de hermanos del área urbana y rural, reuniéndose desde esa fecha los días sábados de 9 a 11 de la mañana. Las Misas dominicales en esos días eran a las 6 y 9 de la mañana y 4 de la tarde; posteriormente la misa de las 4 de la tarde se trasladó a las 5 de la tarde.',
      'En el año 2001, por disposición de nuestro Párroco, la comisión asumió el dar atención al grupo de Acólitos de la Parroquia, abriendo la "Escuela de Acólitos" todos los años, dando así la oportunidad a los niños que hacen la Primera Comunión para que se integren a la Escuela y puedan servir al Señor en el Altar.',
    ],
    patron: { name: 'San Jerónimo', image: 'liturgiaPatron' },
    logo: 'liturgiaLogo',
    groupPhoto: 'liturgiaGrupo',
  },
  {
    slug: 'mec',
    name: 'Movimiento de Encuentros Conyugales',
    type: 'comunidad',
    team: [{ name: 'David y Carmen Irene Cartagena', role: 'Secretarios de comunidad' }],
    perseverance: { count: 50, label: 'matrimonios que perseveran' },
    history: [
      'A principios de 1999 tres matrimonios: Germán y Adilia Rauda, Rafael y Ana Ivett López y Luis y Karina Navarro realizaron su Encuentro Conyugal, todos ellos perseveraban en la comunidad de Sitio del Niño. Solicitaron a padre Óscar Álvarez el permiso para la apertura de Encuentros Conyugales en Ciudad Arce y, después de algunos contratiempos, estos tres matrimonios comenzaron la evangelización para formar la comunidad del MEC en Ciudad Arce.',
      'La evangelización rindió fruto y el 3 y 4 de diciembre de 1999, siendo dependientes de la comunidad del Sitio del Niño, seis parejas realizaron su Encuentro Conyugal: Francisco y Sonia Jaime, Mario y Maury Mazariego, Mario y Leny Rodríguez, Jacinto y Margarita Romero, Elías y Gloria Guardado y David y Carmen Irene Cartagena. El grupo se llamó "Familia de Nazaret" y sus animadores fueron Germán y Adilia Rauda.',
      'Entre los años 2000 y 2021, aun siendo comunidad dependiente de Sitio del Niño, se formaron otros cinco grupos de crecimiento, siendo sus animadores: Rafael y Ana Ivett López, Francisco y Sonia Jaime, Mario y Leny Rodríguez, Elías y Gloria Guardado y David y Carmen Irene Cartagena. Llegaron a formar los llamados hermanos del encuentro "cero".',
      'Para ser comunidad independiente, el principal requisito era tener perseverando al menos 20 parejas. Ya cumplido este requisito, las primeras elecciones de secretarios generales se celebraron el miércoles 3 de julio de 2002, siendo elegidos los hermanos David y Carmen Irene Cartagena.',
      'Ya como comunidad independiente, 17 parejas realizaron el Encuentro Conyugal n.º 1 los días 16 y 17 de noviembre de 2002 en la casa de retiro Jerónimo Emiliani, en Sacacoyo. En esa ocasión tomaron grupo los hermanos Walter y Mariquel Linares, Luis y Karina Navarro, y José Antonio y Esperanza Guerrero.',
      'A partir del año 2002 y hasta la fecha se ha continuado con la evangelización de muchos matrimonios que han tenido el encuentro con Cristo a través del Movimiento de Encuentros Conyugales.',
      'Hermanos que han servido como secretarios de comunidad desde 2002:',
      '2002 – 2004: David y Carmen Irene Cartagena',
      '2004 – 2006: Emilio y Marilena Linares',
      '2006 – 2008: David y Carmen Irene Cartagena',
      '2008 – 2010: Elías y Gloria Guardado',
      '2010 – 2011: Wilfredo y Miriam Pleitez',
      '2011 – 2013: Danilo y Dinora Hernández',
      '2013 – 2015: Elías y Gloria Guardado',
      '2015 – 2017: Emilio y Marilena Linares',
      '2017 – 2019: Cristian y Laury Crespín',
      '2019 – 2021: Cristian y Laury Crespín',
      '2021 – 2023: Danilo y Dinora Hernández',
      '2023 – 2025: David y Yanira Martínez',
      '2025 – hasta la fecha: David y Carmen Irene Cartagena',
    ],
    logo: 'mecLogo',
  },
  {
    slug: 'iam',
    name: 'Infancia y Adolescencia Misionera (IAM)',
    type: 'pastoral',
    team: [
      { name: 'Nancy Lisbeth Portillo de Pacheco', role: 'Coordinadora' },
      { name: 'Paula Valladares', role: 'Equipo secretariado' },
      { name: 'Rocío Alvarado', role: 'Equipo secretariado' },
      { name: 'Esmeralda Chávez', role: 'Equipo secretariado' },
    ],
    perseverance: { count: 110, label: 'miembros: 95 niños y 15 asesores' },
    history: [
      'A inicios del año 2010, Monseñor Óscar Álvarez, quien en ese momento era el Párroco de la parroquia, reunió a 4 hermanas a quienes les planteó la idea de dar seguimiento a los niños que hacían su primera comunión. Fue así como él nos envió a formación a Santa Tecla, al Secretariado Nacional de la IAM, para poder conocer sobre su proceso de formación.',
      'Así iniciamos con nuestra infancia, teniendo nuestra primera consagración de niños y asesores el 30 de mayo del 2010. Desde entonces hay equipos de Infancia en varios sectores de nuestra parroquia, dando seguimiento a los niños que hacen su primera comunión.',
    ],
    // Son DOS patronos: no entran en `patron.name`, van como fiestas.
    patron: { image: 'iamPatron' },
    patronalFeasts: [
      { name: 'Santa Teresita del Niño Jesús', day: 1, month: '10' },
      { name: 'San Francisco Javier', day: 3, month: '12' },
    ],
    logo: 'iamLogo',
    groupPhoto: 'iamGrupo',
    gallery: ['iamGaleria1', 'iamGaleria2'],
  },
  {
    slug: 'escuela-basica-en-la-fe',
    name: 'Escuela de Formación Básica en la Fe',
    type: 'formacion',
    team: [
      { name: 'Gladys Alvarado', role: 'Equipo coordinador' },
      { name: 'Maira Erazo', role: 'Equipo coordinador' },
      { name: 'Ernesto Flores', role: 'Equipo coordinador' },
      { name: 'Cristina de Pacheco', role: 'Equipo coordinador' },
    ],
    perseverance: { count: 40, label: 'catequistas' },
    // El unico de los cuatro con los dos campos llenos: "Pedagogia" es lo que
    // hacen hoy (description) y la fundacion es de donde vienen (history).
    description: [
      'Para el proceso de enseñanza aprendizaje utilizamos un material didáctico de acuerdo a la edad, con el que fomentamos los valores religiosos católicos.',
      'Se realizan reuniones cada 2 meses con los padres de familia o responsables de los niños inscritos durante el año.',
      'A la fecha contamos con 40 hermanos y hermanas catequistas a nivel parroquial, y nuestras reuniones como equipo de catequistas son cada dos meses.',
      'La imagen de la Inmaculada Concepción de María nos caracteriza como Parroquia, ya que las primeras comuniones se realizan en el marco de la celebración de las fiestas patronales en honor a la Inmaculada Concepción de María.',
    ],
    history: [
      'La doctrina católica dirigida a niños y niñas de la parroquia dio inicio en el año de 1945, siendo sacerdote el Padre Francisco Ayala Martínez, quien preparó a los hermanos Víctor Rivas y hna. Cristina Gutiérrez como primeros catequistas a nivel parroquial. Se impartía únicamente en el pueblo y el centro de reuniones para la catequesis era el Templo parroquial. Ellos recibieron la formación religiosa impartida por Monseñor Luis Chávez y González en el Arzobispado de San Salvador.',
      'Luego que la Parroquia se organizó por sectores en el año 2004, con el Párroco y ahora Monseñor Óscar Álvarez Orellana, se comenzaron a atender a más niños y niñas con los diferentes catequistas representantes de cada sector.',
      'En la zona rural se daba la doctrina en las ermitas y en la casa de los catequistas; en el casco urbano, la preparación de niños y niñas para la primera comunión se extendió a los barrios o sectores. Hasta la actualidad la doctrina se imparte gradualmente desde los 6 años hasta los 10 años de edad.',
    ],
    // Sin `name`: el documento dice que no tienen patrono asignado por el
    // momento, pero que esta imagen los caracteriza.
    patron: { image: 'escuelaPatron' },
    groupPhoto: 'escuelaGrupo',
    gallery: ['escuelaGaleria'],
  },
]

const payload = await getPayload({ config })
const dryRun = process.env.SEED_CONFIRM !== 'cargar'

// --- Que hay que hacer y que no -------------------------------------------
const existing = await payload.find({
  collection: 'groups',
  limit: 500,
  depth: 0,
  overrideAccess: true,
})
const known = new Set(existing.docs.map((d) => d.slug))
const todo = GROUPS.filter((g) => !known.has(g.slug))

console.log(`\nGrupos en la base: ${existing.totalDocs}`)
for (const g of GROUPS) {
  console.log(`  ${known.has(g.slug) ? '· ya existe, se saltea' : '+ se crea'}  ${g.slug}`)
}

if (todo.length === 0) {
  console.log('\nNada que hacer.')
  process.exit(0)
}

if (dryRun) {
  console.log(`\n[SIMULACION] Se crearian ${todo.length} grupos. No se creo nada.`)
  console.log('Para ejecutar de verdad:')
  console.log('  SEED_CONFIRM=cargar npx payload run scripts/seed-groups-2026-08.ts\n')
  process.exit(0)
}

// --- Imagenes --------------------------------------------------------------
/** Solo se suben las que usan los grupos que realmente se van a crear. */
const needed = new Set<Slot>()
for (const g of todo) {
  for (const slot of [g.logo, g.groupPhoto, g.patron?.image, ...(g.gallery ?? [])]) {
    if (slot) needed.add(slot)
  }
}

const work = await mkdtemp(join(tmpdir(), 'grupos-'))
/** El id de Payload es `string | number` en general; con Postgres siempre es
 *  number, que es lo que los campos `upload` aceptan. */
const uploaded = new Map<Slot, number>()

for (const slot of needed) {
  const asset = A[slot] as Asset
  let filePath = join(ASSETS, asset.file)

  if (asset.rotate) {
    const rotated = join(work, asset.file)
    await writeFile(rotated, await sharp(filePath).rotate(asset.rotate).toBuffer())
    filePath = rotated
    console.log(`  ↻ ${asset.file} rotada ${asset.rotate}°`)
  }

  const media = await payload.create({
    collection: 'media',
    data: { alt: asset.alt },
    filePath,
    overrideAccess: true,
  })
  uploaded.set(slot, media.id as number)
  console.log(`  ✓ media [${media.id}] ${asset.file}`)
}

// --- Grupos ----------------------------------------------------------------
const ref = (slot?: Slot): number | undefined => (slot ? uploaded.get(slot) : undefined)

for (const g of todo) {
  const doc = await payload.create({
    collection: 'groups',
    data: {
      name: g.name,
      slug: g.slug,
      type: g.type,
      status: 'draft',
      team: g.team,
      perseverance: g.perseverance,
      history: richText(g.history),
      ...(g.description ? { description: richText(g.description) } : {}),
      ...(g.patron ? { patron: { name: g.patron.name, image: ref(g.patron.image) } } : {}),
      ...(g.patronalFeasts ? { patronalFeasts: g.patronalFeasts } : {}),
      logo: ref(g.logo),
      groupPhoto: ref(g.groupPhoto),
      gallery: (g.gallery ?? []).map((s) => ref(s)).filter((id): id is number => id != null),
    },
    overrideAccess: true,
  })
  console.log(`  ✓ grupo [${doc.id}] ${doc.slug} — ${doc.name} (${doc.status})`)
}

console.log(`\nListo. ${todo.length} grupos creados en BORRADOR.`)
console.log('Publicalos desde /admin cuando la parroquia los revise.\n')
process.exit(0)
