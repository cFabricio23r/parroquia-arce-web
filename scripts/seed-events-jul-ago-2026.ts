import { getPayload } from 'payload'
import config from '../src/payload.config.js'

/**
 * Carga la agenda parroquial de julio y agosto de 2026 en la coleccion
 * `events`. **Borra todos los eventos existentes** antes de insertar.
 *
 * Fuente: calendario parroquial entregado por la parroquia (2026-07-21).
 * Los dias de la semana del calendario se verificaron contra 2026
 * (4 jul = sabado, 1 ago = sabado).
 *
 * Zona horaria: los horarios del calendario son de El Salvador (UTC-6, sin
 * horario de verano). Se guardan como UTC sumando 6 horas. El frontend los
 * muestra de vuelta con `src/lib/sv-date.ts`.
 *
 * Uso:
 *   Simulacion:  npx payload run scripts/seed-events-jul-ago-2026.ts
 *   De verdad:   SEED_CONFIRM=borrar npx payload run scripts/seed-events-jul-ago-2026.ts
 */

/** Offset fijo de El Salvador. No tiene horario de verano. */
const SV_OFFSET_HOURS = 6

/** Hora por defecto para los eventos sin hora ("Todo el dia", "Misas"). */
const DEFAULT_START = '08:00'
const DEFAULT_END = '17:00'

type Row = {
  /** Dia del mes */
  d: number
  /** Mes: 7 = julio, 8 = agosto */
  m: 7 | 8
  title: string
  location: string
  /** Columna "Dirigido a" del calendario */
  audience: string
  /** Columna "Responsable" del calendario */
  responsible: string
  /** "HH:MM" en horario de El Salvador, o null si el calendario no la trae */
  start: string | null
  end?: string | null
  type?:
    | 'misa'
    | 'vigilia'
    | 'hora-santa'
    | 'jornada'
    | 'reunion'
    | 'novena'
    | 'retiro'
    | 'sector'
    | 'grupo'
    | 'patronal'
  /** Nota extra (proposito de la colecta, "Todo el dia", hora por confirmar...) */
  note?: string
}

const CATEQUESIS_LUGARES =
  'Salón Tepeyac, Salón Luis Chávez y González, Salón Monseñor Romero, Casa de oración Las Vegas y ermita Sagrado Corazón (Flor Amarilla)'
const CASA_RETIRO = 'Casa de retiro Pbro. Óscar Álvarez'
const SALON_LCG = 'Salón Luis Chávez y González'
const SALON_MR = 'Salón Monseñor Romero'
const SALON_JP2 = 'Salón San Juan Pablo II'
const TEMPLO_Y_ERMITAS = 'Templo parroquial y ermitas'
const COMUNIDADES_AUD = 'Hermanos que perseveran en las comunidades de fe'
const MIN_COMUNIDADES = 'Ministerio de comunidades'
const COM_EVANGELIZACION = 'Comisión de Evangelización'
const TODO_EL_DIA = 'Todo el día.'
const EN_LAS_MISAS = 'Se celebra en las misas del día.'

/** Casa de Oración / Casa de Reunión del Sector Nº 1, que se repiten cada mes. */
const casaOracion = (d: number, m: 7 | 8): Row => ({
  d, m, title: 'Casa de Oración', location: SALON_MR,
  audience: 'Hnos. del sector', responsible: 'Sector Nº 1',
  start: '16:00', end: '18:00', type: 'sector',
})
const casaReunion = (d: number, m: 7 | 8): Row => ({
  d, m, title: 'Casa de Reunión', location: SALON_MR,
  audience: 'Evangelizados', responsible: 'Sector Nº 1',
  start: '18:00', end: '19:00', type: 'sector',
})
const moduloFormacion = (d: number, m: 7 | 8, location = 'Salón Mons. Luis Chávez y González'): Row => ({
  d, m, title: '2.º Módulo de Formación', location,
  audience: 'Parroquia', responsible: 'Comisión de Formación',
  start: '14:00', end: '16:00',
})
const novenaVianney = (d: number, audience = 'Hnos. del sector'): Row => ({
  d, m: 7, title: 'Novena a San Juan María Vianney', location: SALON_MR,
  audience, responsible: 'Sector Nº 1', start: '16:00', end: '18:00', type: 'novena',
})
const cuarentaHoras = (d: number, start: string, end: string, sufijo = ''): Row => ({
  d, m: 7, title: `40 Horas de adoración eucarística${sufijo}`, location: TEMPLO_Y_ERMITAS,
  audience: 'Parroquia', responsible: COM_EVANGELIZACION,
  start, end, type: 'hora-santa',
})
const comisionEvangelizacion = (d: number, m: 7 | 8): Row => ({
  d, m, title: 'Reunión de la Comisión de Evangelización', location: SALON_LCG,
  audience: COM_EVANGELIZACION, responsible: 'Párroco',
  start: '19:15', end: '20:30', type: 'reunion',
})
const catequesisComunidades = (d: number, m: 7 | 8): Row => ({
  d, m, title: 'Catequesis parroquial de comunidades de fe', location: CATEQUESIS_LUGARES,
  audience: 'Pastores y co pastores de comunidades de fe', responsible: MIN_COMUNIDADES,
  start: '07:00', end: '09:00',
})
const visitaComunidades = (d: number, m: 7 | 8, sector: number, location: string, start: string): Row => ({
  d, m, title: `Visita del ministerio de comunidades — sector ${sector}`, location,
  audience: COMUNIDADES_AUD, responsible: MIN_COMUNIDADES, start, type: 'grupo',
})
const retiroPJ = (d: number, note: string): Row => ({
  d, m: 8, title: 'Retiro de inicio de Pastoral Juvenil', location: CASA_RETIRO,
  audience: 'Jóvenes de PJ', responsible: 'Pastoral Juvenil', start: null, type: 'retiro', note,
})

const JULIO: Row[] = [
  { d: 4, m: 7, title: 'Misa de la Santísima Virgen María', location: 'Templo parroquial', audience: 'Parroquia', responsible: 'Párroco', start: '06:00', type: 'misa' },
  casaOracion(4, 7),
  casaReunion(4, 7),
  { d: 4, m: 7, title: 'Tarde de Alabanza', location: 'Pendiente', audience: 'Parroquia', responsible: 'Comisión de Sonido', start: null, note: 'Hora por confirmar. Fondos para gastos de caja chica.' },
  visitaComunidades(4, 7, 8, 'Ermita sector 8', '15:00'),

  { d: 5, m: 7, title: 'Natalicio del Padre Rutilio Grande', location: TEMPLO_Y_ERMITAS, audience: 'Parroquia', responsible: 'Comisión Monseñor Romero', start: null, type: 'misa', note: EN_LAS_MISAS },
  catequesisComunidades(5, 7),
  cuarentaHoras(5, '13:00', '17:00', ' — Inicio'),
  { d: 5, m: 7, title: 'Día de la Misericordia', location: SALON_JP2, audience: 'Parroquia', responsible: 'Pastoral Social', start: '07:00', end: '09:00' },
  { d: 5, m: 7, title: 'Reunión mensual de la Pastoral Social', location: SALON_JP2, audience: 'Parroquia', responsible: 'Pastoral Social', start: '09:00', end: '11:00', type: 'reunion' },
  { d: 5, m: 7, title: 'Reunión del consejo de Pastoral Juvenil', location: SALON_LCG, audience: 'Coordinadores generales', responsible: 'Pastoral Juvenil', start: '10:15', end: '11:45', type: 'reunion' },
  { d: 5, m: 7, title: 'Turno de la Pastoral Vocacional', location: 'Afuera del templo', audience: 'Parroquia', responsible: 'Pastoral Vocacional', start: null, type: 'grupo', note: `${TODO_EL_DIA} Fondos para la pastoral.` },
  { d: 5, m: 7, title: 'Catequesis IAM', location: 'Salita del Limón', audience: 'Asesores IAM', responsible: 'Secretariado', start: '10:30', end: '12:00' },

  cuarentaHoras(6, '19:15', '21:00'),
  cuarentaHoras(7, '19:15', '21:00'),
  cuarentaHoras(8, '19:15', '21:00'),
  cuarentaHoras(9, '19:15', '21:00'),
  cuarentaHoras(10, '19:15', '21:00'),
  cuarentaHoras(11, '15:00', '19:00'),
  cuarentaHoras(12, '13:00', '17:00', ' — Cierre'),

  { d: 12, m: 7, title: 'Santa Misa de niños', location: TEMPLO_Y_ERMITAS, audience: 'Niños', responsible: 'Línea de Acción Niñez, Juventud y Vocación', start: '09:00', type: 'misa' },
  { d: 12, m: 7, title: 'Catequesis para catequistas de comunidades de fe', location: SALON_LCG, audience: 'Catequistas de comunidades de fe', responsible: MIN_COMUNIDADES, start: '07:30', end: '09:00' },
  { d: 12, m: 7, title: 'Turno Sector 1', location: 'Afuera del templo', audience: 'Parroquia', responsible: 'Sector 1', start: null, type: 'sector', note: TODO_EL_DIA },
  { d: 12, m: 7, title: '3.ª formación para servidores', location: CASA_RETIRO, audience: 'Líderes de PJ', responsible: 'Pastoral Juvenil', start: '09:00', end: '11:45' },

  comisionEvangelizacion(14, 7),
  { d: 15, m: 7, title: 'Atención al adulto mayor', location: SALON_LCG, audience: 'Parroquia', responsible: 'Pastoral Social', start: '14:00' },

  casaOracion(18, 7),
  casaReunion(18, 7),
  { d: 18, m: 7, title: 'Misa de comunidades de fe', location: 'Templo parroquial', audience: COMUNIDADES_AUD, responsible: MIN_COMUNIDADES, start: '17:00', type: 'misa' },
  { ...moduloFormacion(18, 7), title: 'Inicia el 2.º Módulo de Formación' },
  { d: 18, m: 7, title: 'Misa patronal Sector 16 — Nuestra Señora del Carmen', location: 'Ermita de El Carmen', audience: 'Parroquia', responsible: 'Sector 16', start: '16:00', type: 'patronal' },
  { d: 18, m: 7, title: 'Misa patronal Sector 20 — San Joaquín', location: 'Ermita Sector 20', audience: 'Parroquia', responsible: 'Sector 20', start: '19:00', type: 'patronal' },
  { d: 18, m: 7, title: 'Excursión Sector 3', location: 'Pendiente', audience: 'Parroquia', responsible: 'Sector 3', start: null, type: 'sector', note: `${TODO_EL_DIA} Para cubrir gastos en diferentes comisiones parroquiales y la misa patronal.` },

  { d: 19, m: 7, title: 'Día deportivo parroquial', location: 'Polideportivo La Joyita', audience: 'Parroquia', responsible: 'Línea de Acción Niñez, Juventud y Vocación', start: null, note: TODO_EL_DIA },
  { d: 19, m: 7, title: 'Turno de los Ministerios María Inmaculada y Nacidos', location: 'Afuera del templo', audience: 'Parroquia', responsible: 'Ministerios María Inmaculada y Nacidos', start: null, type: 'grupo', note: `${TODO_EL_DIA} Fondos para mantenimiento de equipo.` },

  { d: 21, m: 7, title: 'Reunión de Coordinación Parroquial', location: SALON_LCG, audience: 'Parroquia', responsible: 'Coordinador Parroquial', start: '19:15', end: '20:15', type: 'reunion' },

  novenaVianney(23),
  novenaVianney(24),

  casaReunion(25, 7),
  visitaComunidades(25, 7, 9, 'Ermita sector 9', '15:00'),
  { d: 25, m: 7, title: 'Asamblea General de comunidades RCC', location: 'Ermita Sector 22 — Ciudad Obrera', audience: 'Toda la RCC', responsible: 'RCC San Antonio de Padua', start: '18:00', end: '20:00', type: 'reunion' },
  { d: 25, m: 7, title: 'Excursión IAM', location: 'Pendiente', audience: 'IAM', responsible: 'Secretariado', start: null, type: 'grupo', note: TODO_EL_DIA },
  moduloFormacion(25, 7),
  { d: 25, m: 7, title: 'Misa patronal Sector 7 — Santa Ana', location: 'Casa de oración Las Vegas', audience: 'Parroquia', responsible: 'Sector 7', start: '19:00', type: 'patronal' },

  { d: 26, m: 7, title: 'Consejo parroquial', location: 'Templo parroquial, frente a la urna', audience: 'Consejo parroquial', responsible: 'Párroco', start: '14:00', end: '16:00', type: 'reunion' },
  novenaVianney(26, 'Sector Nº 1'),
  { d: 26, m: 7, title: 'Formación de la Escuela de Predicadores', location: SALON_MR, audience: 'Agentes de pastoral', responsible: 'Escuela de Predicadores', start: '08:00', end: '11:00' },
  { d: 26, m: 7, title: 'Reunión de la Comisión RCC', location: 'Salón Juan Pablo II', audience: 'Comisión RCC', responsible: 'Comisión RCC', start: '08:30', end: '11:30', type: 'reunion' },
  { d: 26, m: 7, title: 'Reunión de la Comisión de Formación', location: SALON_LCG, audience: 'Parroquia', responsible: 'Comisión de Formación', start: '07:15', end: '09:00', type: 'reunion' },
  { d: 26, m: 7, title: 'Turno de la Pastoral Social', location: 'Afuera del templo', audience: 'Parroquia', responsible: 'Pastoral Social', start: null, type: 'grupo', note: `${TODO_EL_DIA} Fondos para obras de misericordia.` },
  { d: 26, m: 7, title: 'Reunión de coordinadores', location: 'Salita El Limón', audience: 'Coordinadores', responsible: 'Escuela en la Fe', start: '10:30', end: '11:30', type: 'reunion' },

  novenaVianney(27),
  comisionEvangelizacion(28, 7),
  novenaVianney(28),
  novenaVianney(29),
  novenaVianney(30),
  novenaVianney(31),
]

const AGOSTO: Row[] = [
  { d: 1, m: 8, title: 'Misa de la Santísima Virgen María', location: 'Templo parroquial', audience: 'Parroquia', responsible: 'Párroco', start: '06:00', type: 'misa' },
  { d: 1, m: 8, title: 'Misa patronal Sector 1 — San Juan María Vianney', location: 'Templo parroquial', audience: 'Parroquia', responsible: 'Sector Nº 1', start: '19:00', type: 'patronal' },
  { d: 1, m: 8, title: 'Excursión del Sector 6 al balneario', location: 'Pendiente', audience: 'Sector 6', responsible: 'Apóstoles', start: '05:00', type: 'sector' },
  retiroPJ(1, `${TODO_EL_DIA} Del 1 al 3 de agosto.`),
  moduloFormacion(1, 8),
  { d: 1, m: 8, title: 'Reunión de padres de familia', location: 'Cada sector', audience: 'Padres de familia', responsible: 'Escuela en la Fe', start: '15:00', end: '16:00', type: 'reunion' },
  { d: 1, m: 8, title: 'Excursión Sector 17', location: 'Pendiente', audience: 'Parroquia', responsible: 'Sector 17', start: null, type: 'sector', note: TODO_EL_DIA },

  catequesisComunidades(2, 8),
  { d: 2, m: 8, title: 'Retiro de Fortalecimiento para Servidores RCC', location: 'Ermita Sector 15 — Flor Amarilla', audience: 'Servidores RCC', responsible: 'RCC Divina Providencia', start: '08:00', end: '16:00', type: 'retiro' },
  { d: 2, m: 8, title: 'Reunión de apóstoles y auxiliares — sector 9', location: 'Pendiente', audience: 'Todos los apóstoles y auxiliares', responsible: 'Flor Alfaro', start: '14:00', end: '16:00', type: 'reunion' },
  { d: 2, m: 8, title: 'Turno de Liturgia', location: 'Afuera del templo', audience: 'Parroquia', responsible: 'Liturgia', start: null, type: 'grupo', note: `${TODO_EL_DIA} Fondos para caja chica.` },
  { d: 2, m: 8, title: 'Día de la Misericordia', location: SALON_JP2, audience: 'Parroquia', responsible: 'Pastoral Social', start: '07:00', end: '09:00' },
  { d: 2, m: 8, title: 'Reunión mensual de la Pastoral Social', location: SALON_JP2, audience: 'Parroquia', responsible: 'Pastoral Social', start: '09:00', end: '11:00', type: 'reunion' },
  retiroPJ(2, TODO_EL_DIA),
  { d: 2, m: 8, title: 'Catequesis IAM', location: 'Salita del Limón', audience: 'Asesores IAM', responsible: 'Secretariado', start: '10:30', end: '12:00' },

  retiroPJ(3, TODO_EL_DIA),

  casaOracion(8, 8),
  casaReunion(8, 8),
  moduloFormacion(8, 8),
  { d: 8, m: 8, title: 'Excursión del Ministerio de Alabanza Ntra. Sra. de Guadalupe', location: 'Pendiente', audience: 'Parroquia', responsible: 'Ministerio Ntra. Sra. de Guadalupe', start: null, type: 'grupo', note: `${TODO_EL_DIA} Fondos para mantenimiento de instrumentos.` },
  { d: 8, m: 8, title: 'Excursión Sector 8', location: 'Playa La Puntilla', audience: 'Parroquia', responsible: 'Sector 8', start: null, type: 'sector', note: `${TODO_EL_DIA} Fondos para el sector (ermitas Las Cruces y Las Acostas).` },

  { d: 9, m: 8, title: 'Santa Misa de niños', location: TEMPLO_Y_ERMITAS, audience: 'Niños', responsible: 'Línea de Acción Niñez, Juventud y Vocación', start: '09:00', type: 'misa' },
  { d: 9, m: 8, title: 'Retiro espiritual — zonas 3 y 4', location: CASA_RETIRO, audience: COMUNIDADES_AUD, responsible: MIN_COMUNIDADES, start: '08:00', end: '16:00', type: 'retiro' },
  { d: 9, m: 8, title: 'Turno Sector 19', location: 'Afuera del templo', audience: 'Parroquia', responsible: 'Sector 19', start: null, type: 'sector', note: `${TODO_EL_DIA} Fondos para caja chica.` },

  comisionEvangelizacion(11, 8),
  { d: 12, m: 8, title: '4.ª Jornada de oración — Natalicio de San Romero', location: TEMPLO_Y_ERMITAS, audience: 'Parroquia', responsible: 'Comisión de Formación', start: '19:15', end: '20:30', type: 'jornada' },
  { d: 12, m: 8, title: 'Atención al adulto mayor', location: SALON_LCG, audience: 'Parroquia', responsible: 'Pastoral Social', start: '14:00' },

  visitaComunidades(14, 8, 10, 'Casa de Retiro', '19:00'),

  { d: 15, m: 8, title: 'Natalicio de San Romero', location: TEMPLO_Y_ERMITAS, audience: 'Parroquia', responsible: 'Comisión Monseñor Romero', start: null, type: 'misa', note: EN_LAS_MISAS },
  { d: 15, m: 8, title: 'Solemnidad de la Asunción de la Santísima Virgen María', location: TEMPLO_Y_ERMITAS, audience: 'Parroquia', responsible: 'Liturgia', start: null, type: 'misa', note: EN_LAS_MISAS },
  casaOracion(15, 8),
  casaReunion(15, 8),
  moduloFormacion(15, 8),
  { d: 15, m: 8, title: 'Misa patronal Sector 16 — Nuestra Señora del Tránsito', location: 'Casa de oración en Tránsito', audience: 'Parroquia', responsible: 'Sector 16', start: '16:00', type: 'patronal' },

  { d: 16, m: 8, title: 'Consejo parroquial', location: 'Templo parroquial, frente a la urna', audience: 'Consejo parroquial', responsible: 'Párroco', start: '14:00', end: '16:00', type: 'reunion' },
  { d: 16, m: 8, title: 'Reunión de representantes de comunidades de fe', location: 'Cafetín parroquial', audience: 'Representantes de comunidades de fe', responsible: MIN_COMUNIDADES, start: '09:00', end: '11:00', type: 'reunion' },
  { d: 16, m: 8, title: 'Reunión del kerigma', location: 'Salón Juan Pablo II', audience: 'Representantes del kerigma', responsible: MIN_COMUNIDADES, start: '07:30', end: '09:00', type: 'reunion' },
  { d: 16, m: 8, title: 'Catequesis para catequistas de comunidades de fe', location: 'Cafetín parroquial', audience: 'Catequistas de las comunidades de fe', responsible: MIN_COMUNIDADES, start: '07:30', end: '09:00' },
  { d: 16, m: 8, title: 'Turno RCC Ciudad Arce', location: 'Afuera del templo', audience: 'Parroquia', responsible: 'RCC Ciudad Arce', start: null, type: 'grupo', note: `${TODO_EL_DIA} Fondos propios del movimiento y parroquiales, compra y reparación de equipo de sonido.` },
  { d: 16, m: 8, title: 'Reunión de la Comisión de Formación y Día del Catequista', location: SALON_LCG, audience: 'Parroquia', responsible: 'Comisión de Formación', start: '07:15', end: '09:00', type: 'reunion' },

  { d: 18, m: 8, title: 'Reunión de Coordinación Parroquial', location: SALON_LCG, audience: 'Parroquia', responsible: 'Coordinador Parroquial', start: '19:15', end: '20:15', type: 'reunion' },

  casaOracion(22, 8),
  casaReunion(22, 8),
  moduloFormacion(22, 8, SALON_LCG),

  { d: 23, m: 8, title: '2.º Convivio parroquial y Festival del Maíz', location: 'Casa de retiros Pbro. Óscar Álvarez', audience: 'Parroquia', responsible: 'Pastoral Social', start: '08:00', end: '16:00' },
  { d: 23, m: 8, title: 'Elección y coronación de la Reina parroquial', location: 'Casa de retiros Pbro. Óscar Álvarez', audience: 'Parroquia', responsible: 'Consejo Económico', start: '08:00', end: '16:00', note: 'Fondos para inversiones parroquiales.' },

  comisionEvangelizacion(25, 8),
  visitaComunidades(26, 8, 11, 'Ermita sector 11', '19:00'),

  { d: 29, m: 8, title: 'Excursión juvenil', location: 'Libre', audience: 'Jóvenes de la parroquia', responsible: COM_EVANGELIZACION, start: null, type: 'grupo', note: TODO_EL_DIA },
  casaOracion(29, 8),
  casaReunion(29, 8),
  { d: 29, m: 8, title: 'Asamblea General de comunidades RCC — Aniversario', location: 'Ermita Sector 14 — Divina Providencia', audience: 'Toda la RCC', responsible: 'Comunidad RCC Divina Providencia', start: '18:00', end: '20:00', type: 'reunion' },
  moduloFormacion(29, 8),

  { d: 30, m: 8, title: 'Retiro espiritual — zona 5', location: 'Pendiente', audience: COMUNIDADES_AUD, responsible: MIN_COMUNIDADES, start: '08:00', end: '16:00', type: 'retiro' },
  { d: 30, m: 8, title: 'Formación de la Escuela de Predicadores', location: SALON_MR, audience: 'Agentes de pastoral', responsible: 'Escuela de Predicadores', start: '08:00', end: '11:00' },
  { d: 30, m: 8, title: 'Reunión de la Comisión RCC', location: 'Salón Juan Pablo II', audience: 'Comisión RCC', responsible: 'Comisión RCC', start: '08:30', end: '11:30', type: 'reunion' },
  { d: 30, m: 8, title: 'Turno Sector 7', location: 'Afuera del templo', audience: 'Parroquia', responsible: 'Sector 7', start: null, type: 'sector', note: TODO_EL_DIA },
  { d: 30, m: 8, title: 'Reunión de Seguimiento del Plan', location: 'Parroquia, enfrente de la urna', audience: 'Grupos y movimientos de crecimiento', responsible: 'Coordinación Parroquial', start: '14:00', end: '15:30', type: 'reunion' },
  { d: 30, m: 8, title: 'Reunión de Ministerios de Alabanza', location: 'Cafetín parroquial', audience: 'Ministerios de alabanza', responsible: 'Ministerios de alabanza', start: '10:30', end: '12:00', type: 'reunion' },
]

const ROWS = [...JULIO, ...AGOSTO]

// ---------------------------------------------------------------------------

/** "HH:MM" local de El Salvador -> Date UTC del 2026-MM-DD. */
const toUtc = (m: number, d: number, hhmm: string) => {
  const [h, min] = hhmm.split(':').map(Number)
  return new Date(Date.UTC(2026, m - 1, d, h + SV_OFFSET_HOURS, min))
}

const COMBINING_MARKS = /[̀-ͯ]/g

const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '')

/** Lexical: un parrafo por linea. */
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

const payload = await getPayload({ config })
const dryRun = process.env.SEED_CONFIRM !== 'borrar'

const existing = await payload.find({ collection: 'events', limit: 500, depth: 0 })
console.log(`\nEventos actuales en la base: ${existing.totalDocs}`)
console.log(`Eventos a crear: ${ROWS.length}`)

if (dryRun) {
  console.log('\n[SIMULACION] No se borro ni creo nada.')
  console.log('Para ejecutar de verdad:')
  console.log('  SEED_CONFIRM=borrar npx payload run scripts/seed-events-jul-ago-2026.ts\n')
  const seen = new Set<string>()
  for (const r of ROWS) {
    const slug = `${slugify(r.title)}-2026-${String(r.m).padStart(2, '0')}-${String(r.d).padStart(2, '0')}`
    if (seen.has(slug)) console.error(`  ⚠️  SLUG DUPLICADO: ${slug}`)
    seen.add(slug)
  }
  console.log(`Slugs unicos: ${seen.size} / ${ROWS.length}`)
  process.exit(0)
}

// --- Borrado -----------------------------------------------------------------
for (const doc of existing.docs) {
  await payload.delete({ collection: 'events', id: doc.id })
}
console.log(`🗑️  Borrados ${existing.totalDocs} eventos.`)

// --- Carga -------------------------------------------------------------------
const usedSlugs = new Set<string>()
let creados = 0

for (const r of ROWS) {
  const base = `${slugify(r.title)}-2026-${String(r.m).padStart(2, '0')}-${String(r.d).padStart(2, '0')}`
  let slug = base
  let n = 2
  while (usedSlugs.has(slug)) slug = `${base}-${n++}`
  usedSlugs.add(slug)

  const sinHora = r.start === null
  const start = toUtc(r.m, r.d, r.start ?? DEFAULT_START)
  const endHHMM = sinHora ? DEFAULT_END : r.end
  const end = endHHMM ? toUtc(r.m, r.d, endHHMM) : null

  const lines = [
    ...(r.note ? [r.note] : []),
    `Dirigido a: ${r.audience}`,
    `Responsable: ${r.responsible}`,
  ]

  await payload.create({
    collection: 'events',
    data: {
      title: r.title,
      slug,
      eventType: r.type ?? null,
      description: richText(lines),
      startsAt: start.toISOString(),
      endsAt: end ? end.toISOString() : null,
      locationName: r.location,
      status: 'published',
      publishedAt: new Date().toISOString(),
      isFeatured: false,
    },
  })
  creados++
}

console.log(`✅ Creados ${creados} eventos (julio y agosto de 2026), todos publicados.`)
process.exit(0)
