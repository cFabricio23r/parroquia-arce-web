/**
 * La estructura de la parroquia segun el PLAN PASTORAL 2023-2025.
 *
 * Fuentes, las tres del mismo PDF:
 *   - Sectores: Anexo 1 (pag. 36), que da numero, ubicacion y patrono.
 *   - Zonas:    "Organigrama de distribucion de zonas parroquiales" (pag. 32).
 *   - Grupos:   "Organigrama de distribucion de lineas de accion" (pag. 31).
 *
 * El plan esta VENCIDO (es agosto de 2026), pero los sectores, sus patronos y el
 * organigrama no caducan con el trienio. Si aparece un plan 2026-2028, hay que
 * revalidar esta tabla contra el.
 *
 * Esto es una TRANSCRIPCION. El riesgo no es el codigo, es copiar mal el PDF:
 * por eso vive como datos puros y la fijan los tests de
 * tests/unit/parish-structure.spec.tsx.
 */

/** Las 5 zonas del organigrama. */
export type ParishZone = 1 | 2 | 3 | 4 | 5

export type ParishSector = {
  number: number
  /** Ubicacion tal como la nombra el Anexo 1. */
  location: string
  patron: string
  zone: ParishZone
}

/**
 * Los 22 sectores. **No hay sector 18**: el Anexo 1 salta del 17 al 19 y el
 * organigrama de zonas tampoco lo lista. Se le consulta a la parroquia.
 *
 * Los sectores 15 y 16 tienen mas de una sub-ubicacion con patrono propio y el
 * modelo guarda un patrono por sector:
 *   15 · Colonia Emiliani → San Jeronimo Emiliani
 *        Canton Flor Amarilla, Zona 1 y la pista → Sagrado Corazon de Jesus
 *   16 · El Transito → Nuestra Senora del Transito
 *        Canton El Tigre → Maria Auxiliadora
 *        El Carmen → Nuestra Senora del Carmen
 * Aca va la PRIMERA fila de cada uno. Las otras 3 quedan sin representar hasta
 * que la parroquia decida si son ermitas de `chapels`. No se inventan ermitas:
 * no sabemos cuales estan construidas. (El sector 15 ya esta cargado en la base
 * con la SEGUNDA fila; ese documento no se toca.)
 */
export const PARISH_SECTORS: readonly ParishSector[] = [
  { number: 1, location: 'Barrio El Centro', patron: 'San Juan María Vianney', zone: 1 },
  { number: 2, location: 'Barrio La Esperanza', patron: 'Nuestra Señora de Lourdes', zone: 2 },
  { number: 3, location: 'Barrio El Rosario', patron: 'Nuestra Señora del Rosario', zone: 2 },
  { number: 4, location: 'Barrio San José', patron: 'San José esposo de la Virgen', zone: 2 },
  {
    number: 5,
    location: 'Barrio San Jacinto, Pasaje Costa Rica',
    patron: 'San Antonio de Padua',
    zone: 1,
  },
  { number: 6, location: 'Colonia El Tepeyac', patron: 'Nuestra Señora de Guadalupe', zone: 1 },
  { number: 7, location: 'Colonia Las Vegas', patron: 'Nuestra Señora Santa Ana', zone: 3 },
  {
    number: 8,
    location: 'Cantón Las Cruces, Las Acostas y Los Mangos',
    patron: 'Nuestra Señora de Fátima',
    zone: 1,
  },
  {
    number: 9,
    location: 'Cantón La Nueva Esperanza',
    patron: 'San José esposo de la Virgen',
    zone: 4,
  },
  { number: 10, location: 'Cantón La Joyita, Primera Zona', patron: 'San Miguel Arcángel', zone: 4 },
  { number: 11, location: 'Colonia San Carlos II', patron: 'María Auxiliadora', zone: 4 },
  { number: 12, location: 'Cantón La Reforma', patron: 'San Antonio de Padua', zone: 4 },
  { number: 13, location: 'Colonia Italia', patron: 'San Esteban Protomártir', zone: 3 },
  {
    number: 14,
    location: 'Colonia Divina Providencia y San Andrés',
    patron: 'Divina Providencia',
    zone: 5,
  },
  {
    number: 15,
    location: 'Colonia Emiliani, Flor Amarilla',
    patron: 'San Jerónimo Emiliani',
    zone: 5,
  },
  {
    number: 16,
    location: 'El Tránsito, Flor Amarilla',
    patron: 'Nuestra Señora del Tránsito',
    zone: 5,
  },
  { number: 17, location: 'Colonia La Joya', patron: 'Nuestra Señora de Guadalupe', zone: 3 },
  { number: 19, location: 'Colonia San Carlos I', patron: 'San Carlos Borromeo', zone: 2 },
  { number: 20, location: 'Pequeña Inglaterra', patron: 'San Joaquín', zone: 4 },
  { number: 21, location: 'Colonia Loma Linda y Las Brisas', patron: 'San Juan Pablo II', zone: 3 },
  { number: 22, location: 'Colonia Ciudad Obrera', patron: 'San José Obrero', zone: 4 },
  { number: 23, location: 'Las Acostas y Los Mangos', patron: 'Óscar Arnulfo Romero', zone: 1 },
]

/** El slug con el que vive en la base. Los 3 cargados usan `sector-N`. */
export const sectorSlug = (number: number): string => `sector-${number}`

/** El nombre con el que vive en la base: "Sector 8, Las Cruces, Las Acostas y Los Mangos". */
export const sectorName = (s: ParishSector): string => `Sector ${s.number}, ${s.location}`

export const zoneForSector = (number: number): ParishZone | null =>
  PARISH_SECTORS.find((s) => s.number === number)?.zone ?? null
