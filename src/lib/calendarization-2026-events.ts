import type { EventType } from './event-types'

export type CalendarizationRow = {
  d: number
  m: 9 | 10 | 11 | 12
  title: string
  location: string
  audience: string
  responsible: string
  start: string | null
  end?: string | null
  type?: EventType
  note?: string
  slugSuffix?: string
}

const SV_OFFSET_HOURS = 6
export const DEFAULT_START = '08:00'
export const DEFAULT_END = '17:00'

const CATEQUESIS_LUGARES =
  'Salón Tepeyac, Salón Luis Chávez y González, Salón Monseñor Romero, Casa de oración Las Vegas y ermita Sagrado Corazón Flor Amarilla'
const SALON_LCG = 'Salón Luis Chávez y González'
const SALON_MR = 'Salón Monseñor Romero'
const SALON_JP2 = 'Salón San Juan Pablo II'
const SALON_TEPEYAC = 'Salón El Tepeyac'
const TEMPLO = 'Templo parroquial'
const TEMPLO_Y_ERMITAS = 'Templo parroquial y ermitas'
const CASA_RETIRO = 'Casa de retiro Pbro. Oscar Álvarez'
const AFUERA_TEMPLO = 'Afuera del templo'
const PARROQUIA = 'Parroquia'
const MIN_COMUNIDADES = 'Ministerio de comunidades'
const COM_EVANGELIZACION = 'Comisión de Evangelización'
const COM_FORMACION = 'Com. Formación'
const PASTORAL_SOCIAL = 'Pastoral Social'
const PASTORAL_JUVENIL = 'Pastoral Juvenil'
const TODO_EL_DIA = 'Todo el día.'
const HORA_PENDIENTE = 'Hora pendiente.'
const EN_LAS_MISAS = 'Se celebra en las misas del día.'
const COMUNIDADES_FE = 'Hermanos que perseveran en las comunidades de fe'
const NINOS = 'Niños y niñas'

const row = (r: CalendarizationRow): CalendarizationRow => r
const casaOracion = (d: number, m: 9 | 10 | 11 | 12, start = '18:00', end = '19:00') =>
  row({ d, m, title: 'Casa de Oración', location: SALON_MR, audience: 'Hnos. del sector', responsible: 'Sector Nº 1', start, end, type: 'sector' })
const casaReunion = (d: number, m: 9 | 10, start = '18:00', end = '19:00') =>
  row({ d, m, title: 'Casa de Reunión', location: SALON_MR, audience: 'Evangelizados', responsible: 'Sector Nº 1', start, end, type: 'sector' })
const moduloFormacion = (d: number, m: 9 | 10 | 11) =>
  row({ d, m, title: '2º. Módulo de Formación', location: 'Salón Mons. Luis Chávez y G.', audience: PARROQUIA, responsible: COM_FORMACION, start: '14:00', end: '16:00' })
const comisionEvangelizacion = (d: number, m: 9 | 10 | 11 | 12) =>
  row({ d, m, title: 'Reunión de Comisión de Evangelización', location: SALON_LCG, audience: COM_EVANGELIZACION, responsible: 'Párroco', start: '19:15', end: '20:30', type: 'reunion' })
const coordinacionParroquial = (d: number, m: 9 | 10 | 11 | 12) =>
  row({ d, m, title: 'Reunión de Coordinación Parroquial', location: SALON_LCG, audience: PARROQUIA, responsible: 'Coordinador Parroquial', start: '19:15', end: '20:15', type: 'reunion' })
const catequesisComunidades = (d: number, m: 9 | 10 | 11 | 12, end = '09:00') =>
  row({ d, m, title: 'Catequesis parroquial comunidades de fe', location: CATEQUESIS_LUGARES, audience: 'Pastores y co pastores de comunidades de fe', responsible: MIN_COMUNIDADES, start: '07:00', end })
const diaMisericordia = (d: number, m: 9 | 10 | 11 | 12) =>
  row({ d, m, title: 'Día de la Misericordia', location: SALON_JP2, audience: PARROQUIA, responsible: PASTORAL_SOCIAL, start: '07:00', end: '09:00' })
const pastoralSocialMensual = (d: number, m: 9 | 10 | 11 | 12) =>
  row({ d, m, title: 'Reunión mensual de la Pastoral Social', location: SALON_JP2, audience: PARROQUIA, responsible: PASTORAL_SOCIAL, start: '09:00', end: '11:00', type: 'reunion' })
const consejoPJ = (d: number, m: 9 | 10 | 11 | 12) =>
  row({ d, m, title: 'Reunión de consejo de Pastoral Juvenil', location: SALON_LCG, audience: 'Coordinadores generales', responsible: PASTORAL_JUVENIL, start: '10:15', end: '11:45', type: 'reunion' })
const catequesisIam = (d: number, m: 9 | 10 | 11, start = '10:30', end = '12:00') =>
  row({ d, m, title: 'Catequesis IAM', location: 'Salita del Limón', audience: 'Asesores IAM', responsible: 'Secretariado', start, end })
const santaMisaNinos = (d: number, m: 9 | 10 | 11 | 12) =>
  row({ d, m, title: 'Santa Misa de niños', location: TEMPLO_Y_ERMITAS, audience: 'Niños', responsible: 'Línea de Acción Niñez, Juventud y Vocación', start: '09:00', type: 'misa', note: 'Misa 9:00 am.' })
const predicadores = (d: number, m: 9 | 10) =>
  row({ d, m, title: 'Formación Escuela de Predicadores', location: SALON_MR, audience: 'Agentes de pastoral', responsible: 'Escuela de predicadores', start: '08:00', end: '11:00' })
const reunionRcc = (d: number, m: 9 | 10 | 11 | 12) =>
  row({ d, m, title: 'Reunión de la Comisión RCC', location: SALON_JP2, audience: 'Comisión RCC', responsible: 'Comisión RCC', start: '08:30', end: '11:30', type: 'reunion' })
const ministeriosAlabanza = (d: number, m: 9 | 10 | 12) =>
  row({ d, m, title: 'Reunión Ministerios de Alabanza', location: 'Cafetín parroquial', audience: 'Ministerios de alabanza', responsible: 'Ministerios de alabanza', start: '10:30', end: '12:00', type: 'reunion' })
const visitaComunidades = (d: number, m: 9 | 10 | 11, sector: number, location: string, start = '15:00') =>
  row({ d, m, title: `Visita del ministerio de comunidades sector ${sector}`, location, audience: COMUNIDADES_FE, responsible: MIN_COMUNIDADES, start, type: 'grupo' })
const catequistasComunidades = (d: number, m: 9 | 10 | 11 | 12, audience = 'Catequistas comunidades de fe', end = '09:00') =>
  row({ d, m, title: 'Catequesis para catequistas comunidades de fe', location: SALON_LCG, audience, responsible: MIN_COMUNIDADES, start: '07:30', end })
const apostolesAuxiliares = (d: number, m: 9 | 10, sector: string) =>
  row({ d, m, title: 'Reunión de apóstoles y auxiliares', location: sector, audience: 'Todos los apóstoles y auxiliares', responsible: 'Flor Alfaro', start: '14:00', end: '16:00', type: 'reunion' })
const reunionCoordinadores = (d: number, m: 9 | 10 | 12) =>
  row({ d, m, title: 'REUNION DE COORDINADORES', location: 'Salita El Limón', audience: 'Coordinadores', responsible: 'Escuela en la Fe', start: '10:30', end: '11:30', type: 'reunion' })
const atencionAdultoMayor = (d: number, m: 9 | 10 | 11 | 12) =>
  row({ d, m, title: 'Atención al adulto mayor', location: SALON_LCG, audience: PARROQUIA, responsible: PASTORAL_SOCIAL, start: '14:00' })
const misaSantisimaVirgen = (d: number, m: 9 | 10 | 11 | 12) =>
  row({ d, m, title: 'Misa Santísima Virgen María', location: TEMPLO, audience: PARROQUIA, responsible: 'Párroco', start: '06:00', type: 'misa' })
const novenaInmaculada = (d: number, m: 11 | 12, title: string, location = 'Sectores', start = '19:00') =>
  row({ d, m, title, location, audience: PARROQUIA, responsible: 'Sectores', start, type: 'novena' })

const SEPTIEMBRE: CalendarizationRow[] = [
  misaSantisimaVirgen(5, 9),
  row({ d: 5, m: 9, title: 'Inauguración del Mes de la Biblia', location: TEMPLO_Y_ERMITAS, audience: PARROQUIA, responsible: COM_EVANGELIZACION, start: '19:00' }),
  moduloFormacion(5, 9),
  catequesisComunidades(6, 9),
  row({ d: 6, m: 9, title: 'Retiro de consagración comunidades de fe', location: 'Casa de Retiro', audience: 'Hermanos que perseveran en casa de reunión', responsible: MIN_COMUNIDADES, start: '08:00', end: '16:00', type: 'retiro' }),
  diaMisericordia(6, 9),
  pastoralSocialMensual(6, 9),
  consejoPJ(6, 9),
  reunionCoordinadores(6, 9),
  catequesisIam(6, 9, '07:30', '10:30'),
  row({ d: 6, m: 9, title: 'Turno Comisión de Sonido', location: AFUERA_TEMPLO, audience: PARROQUIA, responsible: 'Comisión de Sonido', start: null, type: 'grupo', note: `${TODO_EL_DIA} Mantenimiento del sonido parroquial.` }),
  row({ d: 8, m: 9, title: 'Solemnidad de la Natividad de la Santísima Virgen María', location: TEMPLO_Y_ERMITAS, audience: PARROQUIA, responsible: 'Liturgia', start: null, type: 'misa', note: EN_LAS_MISAS }),
  comisionEvangelizacion(8, 9),
  casaOracion(12, 9, '16:00', '18:00'),
  casaReunion(12, 9, '18:00', '19:00'),
  visitaComunidades(12, 9, 12, 'Ermita sector 12'),
  row({ d: 12, m: 9, title: 'Asamblea General de comunidades RCC', location: 'Ermita Sector 15 - Flor Amarilla', audience: 'Toda la RCC', responsible: 'RCC San José Obrero', start: '18:00', end: '20:00', type: 'reunion' }),
  moduloFormacion(12, 9),
  santaMisaNinos(13, 9),
  catequistasComunidades(13, 9, ''),
  row({ d: 13, m: 9, title: 'Turno Sector 21', location: AFUERA_TEMPLO, audience: PARROQUIA, responsible: 'Sector 21', start: null, type: 'sector', note: TODO_EL_DIA }),
  row({ d: 13, m: 9, title: 'Aniversario de pastoral juvenil', location: CASA_RETIRO, audience: 'Servidores de PJ', responsible: PASTORAL_JUVENIL, start: '09:00', end: '11:00', type: 'grupo' }),
  apostolesAuxiliares(13, 9, 'Sector #22'),
  atencionAdultoMayor(16, 9),
  casaOracion(19, 9, '16:00', '18:00'),
  casaReunion(19, 9, '18:00', '19:00'),
  moduloFormacion(19, 9),
  row({ d: 19, m: 9, title: 'Retiro de niños IAM', location: CASA_RETIRO, audience: 'IAM', responsible: 'Secretariado', start: '08:00', end: '16:00', type: 'retiro' }),
  row({ d: 20, m: 9, title: '3ra Asamblea de líderes', location: CASA_RETIRO, audience: 'Líderes de las fuerzas vivas', responsible: COM_EVANGELIZACION, start: '08:00', end: '12:00' }),
  comisionEvangelizacion(22, 9),
  casaOracion(26, 9, '16:00', '18:00'),
  casaReunion(26, 9, '18:00', '19:00'),
  visitaComunidades(26, 9, 13, 'Ermita sector 13'),
  moduloFormacion(26, 9),
  row({ d: 26, m: 9, title: 'Misa patronal Sector 10 (San Miguel Arcángel)', location: CASA_RETIRO, audience: PARROQUIA, responsible: 'Sector 10', start: '19:00', type: 'patronal' }),
  row({ d: 27, m: 9, title: 'Consejo parroquial', location: 'Templo, frente a la urna', audience: 'Consejo parroquial', responsible: 'Párroco', start: '14:00', end: '16:00', type: 'reunion' }),
  predicadores(27, 9),
  reunionRcc(27, 9),
  ministeriosAlabanza(27, 9),
  row({ d: 27, m: 9, title: 'Excursión RCC sector 14', location: 'Pendiente', audience: PARROQUIA, responsible: 'RCC Divina Providencia', start: null, type: 'grupo', note: `${TODO_EL_DIA} Para compra y mantenimiento del equipo de sonido de los ministerios de alabanzas.` }),
  coordinacionParroquial(29, 9),
]

const OCTUBRE: CalendarizationRow[] = [
  misaSantisimaVirgen(3, 10),
  casaOracion(3, 10),
  visitaComunidades(3, 10, 14, 'Ermita del sector 14'),
  moduloFormacion(3, 10),
  row({ d: 3, m: 10, title: 'Celebración Día del Niño', location: 'Cada sector', audience: NINOS, responsible: 'Escuela en la Fe', start: '14:00', end: '16:00' }),
  row({ d: 3, m: 10, title: 'Excursión Ministerio Nazaret y Consejo Económico', location: 'Pendiente', audience: PARROQUIA, responsible: 'Ministerio Nazaret y Consejo Económico', start: null, type: 'grupo', note: `${TODO_EL_DIA} Fondos para caja chica.` }),
  row({ d: 3, m: 10, title: 'Misa Santa Teresita del Niño Jesús (Patrona IAM)', location: TEMPLO, audience: 'IAM', responsible: 'IAM', start: '14:30', type: 'misa' }),
  catequesisComunidades(4, 10),
  apostolesAuxiliares(4, 10, 'Sector #10'),
  row({ d: 4, m: 10, title: 'Turno Comisión de Ornato', location: AFUERA_TEMPLO, audience: PARROQUIA, responsible: 'Comisión de Ornato', start: null, type: 'grupo', note: TODO_EL_DIA }),
  diaMisericordia(4, 10),
  pastoralSocialMensual(4, 10),
  consejoPJ(4, 10),
  row({ d: 4, m: 10, title: 'Retiro y Consagración Ministerios de alabanza', location: CASA_RETIRO, audience: 'Ministerios de alabanza', responsible: 'Ministerios de alabanza', start: null, type: 'retiro', note: TODO_EL_DIA }),
  catequesisIam(4, 10),
  comisionEvangelizacion(6, 10),
  row({ d: 7, m: 10, title: 'Misa patronal Sector 3 (Nuestra Sra. del Rosario)', location: TEMPLO, audience: PARROQUIA, responsible: 'Sector 3', start: '19:00', type: 'patronal' }),
  row({ d: 10, m: 10, title: 'Excursión Comisión de Evangelización', location: 'Libre', audience: PARROQUIA, responsible: COM_EVANGELIZACION, start: null, type: 'grupo', note: `${TODO_EL_DIA} Fondos para caja chica.` }),
  casaOracion(10, 10),
  row({ d: 10, m: 10, title: 'Asamblea General de comunidades RCC', location: SALON_TEPEYAC, audience: 'Toda la RCC', responsible: 'RCC Maria Auxiliadora', start: '18:00', end: '20:00', type: 'reunion' }),
  moduloFormacion(10, 10),
  row({ d: 10, m: 10, title: 'Misa para niños y niñas', location: PARROQUIA, audience: NINOS, responsible: 'Sacerdote Escuela en la Fe', start: '15:00', end: '16:00', type: 'misa' }),
  santaMisaNinos(11, 10),
  row({ d: 11, m: 10, title: 'Reunión de representantes de comunidades de fe', location: SALON_LCG, audience: 'Representantes de comunidades de fe', responsible: MIN_COMUNIDADES, start: '09:00', end: '11:00', type: 'reunion' }),
  catequistasComunidades(11, 10, COMUNIDADES_FE),
  row({ d: 11, m: 10, title: 'Turno Pastoral de Comunicaciones', location: AFUERA_TEMPLO, audience: PARROQUIA, responsible: 'Pastoral de Comunicaciones', start: '06:00', end: '12:00', type: 'grupo', note: 'Mantenimiento y compra de equipo de transmisión.' }),
  coordinacionParroquial(13, 10),
  row({ d: 14, m: 10, title: 'Canonización San Romero', location: TEMPLO_Y_ERMITAS, audience: PARROQUIA, responsible: 'Comisión Monseñor Romero', start: null, type: 'misa', note: EN_LAS_MISAS }),
  atencionAdultoMayor(14, 10),
  casaOracion(17, 10),
  row({ d: 17, m: 10, title: 'Excursión sector #1', location: 'Libre', audience: PARROQUIA, responsible: 'Sector Nº 1', start: null, type: 'sector', note: `${TODO_EL_DIA} Fondos para fiesta de nuestra patrona Inmaculada.` }),
  row({ d: 17, m: 10, title: 'Vigilia de comunidades de fe', location: 'Templo', audience: COMUNIDADES_FE, responsible: MIN_COMUNIDADES, start: '19:00', end: '24:00', type: 'vigilia' }),
  row({ d: 17, m: 10, title: 'Excursión RCC Ciudad Arce', location: 'Por definir', audience: PARROQUIA, responsible: 'RCC Ciudad Arce', start: null, type: 'grupo', note: `${TODO_EL_DIA} Obtener fondo para ayuda solidaria de los hermanos del movimiento y aminorar gastos en el seminario Vida en El Espíritu Santo.` }),
  moduloFormacion(17, 10),
  row({ d: 18, m: 10, title: 'Turno IAM y JUMI para Fondos del Domund', location: TEMPLO_Y_ERMITAS, audience: PARROQUIA, responsible: 'IAM y JUMI', start: null, type: 'grupo', note: TODO_EL_DIA }),
  row({ d: 18, m: 10, title: 'Reunión Comisión de Formación', location: SALON_LCG, audience: PARROQUIA, responsible: COM_FORMACION, start: '07:15', end: '09:00', type: 'reunion' }),
  comisionEvangelizacion(20, 10),
  casaOracion(24, 10),
  visitaComunidades(24, 10, 15, 'Ermita del sector 15'),
  row({ d: 24, m: 10, title: 'Peregrinación Templo de Esquipulas', location: 'Esquipulas, Guatemala', audience: 'Toda la comunidad', responsible: 'Hermandad del Santo Entierro', start: '04:00', end: '20:00' }),
  row({ d: 24, m: 10, title: 'Misa Patronal Sector 21 en honor a San Juan Pablo II', location: 'Ermita del Sector 21', audience: PARROQUIA, responsible: 'Sector 21', start: '19:00', type: 'patronal' }),
  moduloFormacion(24, 10),
  row({ d: 24, m: 10, title: 'Excursión Sector 4', location: 'Pendiente', audience: PARROQUIA, responsible: 'Sector 4', start: null, type: 'sector', note: HORA_PENDIENTE }),
  row({ d: 24, m: 10, title: 'Retiro Espiritual niños IAM', location: CASA_RETIRO, audience: 'IAM', responsible: 'Secretariado', start: null, type: 'retiro', note: TODO_EL_DIA }),
  row({ d: 25, m: 10, title: 'Retiro Espiritual niños IAM', location: CASA_RETIRO, audience: 'IAM', responsible: 'Secretariado', start: null, type: 'retiro', note: TODO_EL_DIA }),
  row({ d: 25, m: 10, title: 'Consejo parroquial', location: 'Templo, frente a la urna', audience: 'Consejo parroquial', responsible: 'Párroco', start: '14:00', end: '16:00', type: 'reunion' }),
  predicadores(25, 10),
  reunionRcc(25, 10),
  row({ d: 25, m: 10, title: 'Turno Sector 5', location: AFUERA_TEMPLO, audience: PARROQUIA, responsible: 'Sector 5', start: null, type: 'sector', note: TODO_EL_DIA }),
  reunionCoordinadores(25, 10),
  ministeriosAlabanza(25, 10),
  row({ d: 25, m: 10, title: 'Excursión Sector 20', location: 'Pendiente', audience: PARROQUIA, responsible: 'Sector 20', start: null, type: 'sector', note: `${TODO_EL_DIA} Puertas de la ermita.` }),
  row({ d: 28, m: 10, title: '5ta Jornada de oración (Santidad y paz)', location: TEMPLO_Y_ERMITAS, audience: PARROQUIA, responsible: 'Hermandad del Santo Entierro', start: '19:15', end: '20:30', type: 'jornada' }),
  row({ d: 31, m: 10, title: '3er Convivio parroquial y Víspera de todos los santos', location: 'Pendiente', audience: PARROQUIA, responsible: 'Renovación Carismática', start: '14:00', end: '18:00' }),
]

const NOVIEMBRE: CalendarizationRow[] = [
  row({ d: 1, m: 11, title: 'Solemnidad de Todos los Santos', location: TEMPLO, audience: PARROQUIA, responsible: 'Liturgia', start: '12:00', type: 'misa' }),
  diaMisericordia(1, 11),
  pastoralSocialMensual(1, 11),
  consejoPJ(1, 11),
  row({ d: 1, m: 11, title: 'Inicia aviso y motivación para confirmas 2026', location: TEMPLO, audience: PARROQUIA, responsible: COM_FORMACION, start: null, note: 'Misas dominicales.' }),
  catequesisIam(1, 11),
  row({ d: 2, m: 11, title: 'Fieles difuntos', location: TEMPLO, audience: PARROQUIA, responsible: 'Liturgia', start: '09:00', type: 'misa' }),
  comisionEvangelizacion(3, 11),
  visitaComunidades(6, 11, 17, 'Ermita sector 17', '19:00'),
  misaSantisimaVirgen(7, 11),
  casaOracion(7, 11),
  row({ d: 7, m: 11, title: 'Excursión sector 21', location: 'Pendiente', audience: PARROQUIA, responsible: 'Sector 21', start: null, type: 'sector', note: TODO_EL_DIA }),
  row({ d: 7, m: 11, title: 'Retiro de motivación de PJ', location: CASA_RETIRO, audience: 'Jóvenes de PJ', responsible: PASTORAL_JUVENIL, start: null, type: 'retiro', note: TODO_EL_DIA }),
  moduloFormacion(7, 11),
  row({ d: 7, m: 11, title: 'Segundo retiro', location: SALON_MR, audience: NINOS, responsible: 'Sacerdote Escuela en la Fe', start: '08:00', end: '12:00', type: 'retiro' }),
  row({ d: 7, m: 11, title: 'Misa patronal sector 19 en honor a San Carlos Borromeo', location: TEMPLO, audience: PARROQUIA, responsible: 'Sector 19', start: '19:00', type: 'patronal' }),
  catequesisComunidades(8, 11, '21:00'),
  row({ d: 8, m: 11, title: 'Retiro de motivación de PJ', location: CASA_RETIRO, audience: 'Jóvenes de PJ', responsible: PASTORAL_JUVENIL, start: null, type: 'retiro', note: TODO_EL_DIA }),
  row({ d: 8, m: 11, title: 'Reunión del Seguimiento del Plan', location: 'Parroquia, Enfrente de la Urna', audience: 'Grupos y Movimientos de Crecimiento', responsible: 'Coordinación Parroquial', start: '14:00', end: '15:30', type: 'reunion' }),
  row({ d: 8, m: 11, title: 'Rifa Comisión de Formación', location: TEMPLO, audience: PARROQUIA, responsible: COM_FORMACION, start: '06:00', note: 'Gastos de confirmas, Retiro P.P. y formaciones. Misa de 6:00.' }),
  coordinacionParroquial(10, 11),
  atencionAdultoMayor(11, 11),
  row({ d: 14, m: 11, title: '2do Retiro de Planificación pastoral', location: 'Pendiente', audience: 'Consejo parroquial', responsible: COM_EVANGELIZACION, start: null, type: 'retiro', note: TODO_EL_DIA }),
  casaOracion(14, 11),
  row({ d: 14, m: 11, title: 'Reunión de padres de familia', location: 'Cada sector', audience: 'Padres de familia', responsible: 'Escuela en la Fe', start: '15:00', end: '16:00', type: 'reunion' }),
  santaMisaNinos(15, 11),
  row({ d: 15, m: 11, title: '2do Retiro de Planificación pastoral', location: 'Pendiente', audience: 'Consejo parroquial', responsible: COM_EVANGELIZACION, start: null, type: 'retiro', note: TODO_EL_DIA }),
  row({ d: 15, m: 11, title: 'Convivio Nacional', location: 'Anfiteatro Ciudadela Don Bosco', audience: 'MEC', responsible: 'MEC', start: '06:00' }),
  catequistasComunidades(15, 11, 'Catequistas comunidades de fe', '21:00'),
  row({ d: 15, m: 11, title: '1ra Formación para Servidores de Seminario Vida en El Espíritu Santo', location: SALON_TEPEYAC, audience: 'Servidores RCC', responsible: 'RCC Ciudad Arce', start: '08:00', end: '16:00' }),
  comisionEvangelizacion(17, 11),
  casaOracion(21, 11),
  row({ d: 21, m: 11, title: 'Vigilia General de comunidades RCC', location: 'Ermita Sector 15 - Flor Amarilla', audience: 'Toda la RCC', responsible: 'Comisión RCC / Ciudad Arce', start: '18:00', end: '23:00', type: 'vigilia' }),
  row({ d: 21, m: 11, title: 'Peregrinación y excursión', location: 'Pendiente', audience: 'Sector 6', responsible: 'Apóstoles', start: null, type: 'sector', note: HORA_PENDIENTE }),
  row({ d: 21, m: 11, title: 'Finaliza 2o. Módulo de formación', location: SALON_LCG, audience: PARROQUIA, responsible: COM_FORMACION, start: '14:00', end: '16:00' }),
  row({ d: 21, m: 11, title: 'Finaliza 2º. Módulo de Formación', location: SALON_LCG, audience: PARROQUIA, responsible: COM_FORMACION, start: '06:00', end: '17:00', slugSuffix: 'jornada' }),
  row({ d: 22, m: 11, title: 'Solemnidad de Cristo Rey', location: TEMPLO_Y_ERMITAS, audience: PARROQUIA, responsible: 'Liturgia y sectores', start: null, type: 'misa', note: EN_LAS_MISAS }),
  row({ d: 22, m: 11, title: 'Consejo parroquial', location: 'Templo, frente a la urna', audience: 'Consejo parroquial', responsible: 'Párroco', start: '14:00', end: '16:00', type: 'reunion' }),
  row({ d: 22, m: 11, title: 'Convivio general de comunidades de fe', location: 'Terreno Padre Erick Muñoz', audience: COMUNIDADES_FE, responsible: MIN_COMUNIDADES, start: '08:00', end: '16:00' }),
  row({ d: 22, m: 11, title: 'Retiro Escuela de Predicadores', location: SALON_MR, audience: 'Agentes de pastoral', responsible: 'Escuela de predicadores', start: '08:00', end: '11:00', type: 'retiro' }),
  row({ d: 22, m: 11, title: 'Formación en preparación al año 2026', location: SALON_TEPEYAC, audience: PARROQUIA, responsible: COM_FORMACION, start: '07:00', end: '12:00' }),
  row({ d: 22, m: 11, title: 'Rifa Ministerio de alabanza Shaday', location: 'Pendiente', audience: PARROQUIA, responsible: 'Ministerio Shaday', start: null, type: 'grupo', note: `${EN_LAS_MISAS} Mantenimiento de instrumentos.` }),
  row({ d: 25, m: 11, title: 'Rifa Ministerio de alabanza Nuestra Sra. de Guadalupe', location: 'Misas', audience: PARROQUIA, responsible: 'Ministerio Ntra. Sra. de Guadalupe', start: '18:30', type: 'grupo', note: 'Mantenimiento de instrumentos.' }),
  row({ d: 28, m: 11, title: 'Misa patronal sector 8 en honor a La Virgen de la Medalla Milagrosa', location: 'Ermita del sector 8', audience: PARROQUIA, responsible: 'Sector 8', start: '16:00', type: 'patronal' }),
  row({ d: 28, m: 11, title: 'Encuentro Conyugal', location: 'A definir', audience: 'MEC', responsible: 'MEC', start: null, type: 'grupo', note: TODO_EL_DIA }),
  row({ d: 28, m: 11, title: 'Excursión Sector 3', location: 'Pendiente', audience: PARROQUIA, responsible: 'Sector 3', start: null, type: 'sector', note: `${TODO_EL_DIA} Para cubrir gastos de fiestas patronales.` }),
  novenaInmaculada(29, 11, 'Primer Día Novena a la Inmaculada Concepción de María', TEMPLO, '06:00'),
  row({ d: 29, m: 11, title: 'Encuentro Conyugal', location: 'A definir', audience: 'MEC', responsible: 'MEC', start: null, type: 'grupo', note: TODO_EL_DIA }),
  reunionRcc(29, 11),
  row({ d: 29, m: 11, title: 'Excursión Sector 12', location: 'Guatemala', audience: 'Comunidad San Antonio', responsible: 'Sector nº 12', start: null, type: 'sector', note: `${TODO_EL_DIA} Mantenimiento de sonido.` }),
  row({ d: 29, m: 11, title: 'Catequesis IAM', location: 'Salita del Limón', audience: 'IAM', responsible: 'Secretariado', start: '10:30', end: '12:00' }),
  novenaInmaculada(30, 11, 'Segundo Día Novena a la Inmaculada Concepción de María'),
]

const DICIEMBRE: CalendarizationRow[] = [
  novenaInmaculada(1, 12, 'Tercer Día Novena a la Inmaculada Concepción de María'),
  comisionEvangelizacion(1, 12),
  novenaInmaculada(2, 12, 'Cuarto Día Novena a la Inmaculada Concepción de María'),
  novenaInmaculada(3, 12, 'Quinto Día Novena a la Inmaculada Concepción de María'),
  novenaInmaculada(4, 12, 'Sexto Día Novena a la Inmaculada Concepción de María'),
  row({ d: 4, m: 12, title: 'Confesiones', location: PARROQUIA, audience: NINOS, responsible: 'Sacerdote Escuela en la Fe', start: '08:00' }),
  novenaInmaculada(5, 12, 'Séptimo Día Novena a la Inmaculada Concepción de María'),
  misaSantisimaVirgen(5, 12),
  row({ d: 5, m: 12, title: 'Primeras comuniones', location: TEMPLO, audience: PARROQUIA, responsible: 'Escuela Básica en la fe', start: '09:00', type: 'misa' }),
  novenaInmaculada(6, 12, 'Octavo Día Novena a la Inmaculada Concepción de María', TEMPLO, '06:00'),
  catequesisComunidades(6, 12),
  reunionRcc(6, 12),
  diaMisericordia(6, 12),
  pastoralSocialMensual(6, 12),
  consejoPJ(6, 12),
  row({ d: 6, m: 12, title: 'Convivencia Comisión de Formación', location: 'Pendiente', audience: COM_FORMACION, responsible: COM_FORMACION, start: null, note: HORA_PENDIENTE }),
  ministeriosAlabanza(6, 12),
  row({ d: 6, m: 12, title: 'Despedida niños de 15 años IAM', location: SALON_MR, audience: 'IAM, PJ, Ministerio de Jóvenes RCC, JUMI', responsible: 'IAM', start: '14:00', end: '16:00' }),
  novenaInmaculada(7, 12, 'Noveno Día Novena a la Inmaculada Concepción de María'),
  row({ d: 8, m: 12, title: 'Misa Patronal de la Solemnidad de la Inmaculada Concepción de la Virgen María', location: 'Estadio La Joyita', audience: PARROQUIA, responsible: 'Comisión Fiestas patronales', start: '16:00', type: 'patronal' }),
  row({ d: 11, m: 12, title: 'Misa patronal, sector 17 Nuestra Señora de Guadalupe', location: 'Ermita del sector 17', audience: PARROQUIA, responsible: 'Sector 17', start: '19:00', type: 'patronal' }),
  row({ d: 12, m: 12, title: 'Misa patronal, sector 6 Nuestra Señora de Guadalupe', location: 'Gruta El Tepeyac', audience: PARROQUIA, responsible: 'Sector 6 y demás sectores', start: '15:00', type: 'patronal' }),
  santaMisaNinos(13, 12),
  row({ d: 13, m: 12, title: 'Convivencia Comisión de Evangelización', location: 'Libre', audience: COM_EVANGELIZACION, responsible: COM_EVANGELIZACION, start: null, note: TODO_EL_DIA }),
  row({ d: 13, m: 12, title: 'Reunión del kerigma', location: SALON_LCG, audience: 'Representantes del kerigma', responsible: MIN_COMUNIDADES, start: '07:30', end: '09:00', type: 'reunion' }),
  catequistasComunidades(13, 12, 'Catequistas de comunidades de fe'),
  row({ d: 13, m: 12, title: 'Reunión de representantes de comunidades de fe', location: SALON_LCG, audience: 'Representantes de comunidades de fe', responsible: MIN_COMUNIDADES, start: '09:00', end: '11:00', type: 'reunion' }),
  row({ d: 13, m: 12, title: '2da Formación para Servidores de Seminario Vida en El Espíritu Santo', location: SALON_TEPEYAC, audience: 'Servidores RCC', responsible: 'RCC Ciudad Arce', start: '08:00', end: '16:00' }),
  row({ d: 13, m: 12, title: 'Matrícula de confirmandos', location: TEMPLO, audience: PARROQUIA, responsible: COM_FORMACION, start: '08:00', end: '09:00' }),
  comisionEvangelizacion(15, 12),
  atencionAdultoMayor(15, 12),
  row({ d: 19, m: 12, title: 'Noche de Oración, Alabanza y Predicación', location: 'Polideportivo La Joyita', audience: PARROQUIA, responsible: 'Consejo Económico', start: '18:00', end: '22:00' }),
  row({ d: 19, m: 12, title: 'Repartir comida a personas necesitadas', location: 'Pendiente', audience: 'IAM', responsible: 'IAM', start: null, note: TODO_EL_DIA }),
  row({ d: 20, m: 12, title: 'Convivencia navideña servidores comunidades de fe', location: CASA_RETIRO, audience: 'Servidores de las comunidades de fe', responsible: MIN_COMUNIDADES, start: '10:00', end: '14:00' }),
  reunionCoordinadores(20, 12),
  row({ d: 20, m: 12, title: 'Matrícula de confirmandos', location: TEMPLO, audience: PARROQUIA, responsible: COM_FORMACION, start: '08:00', end: '09:00' }),
  coordinacionParroquial(22, 12),
  row({ d: 24, m: 12, title: 'Santa Misa de Nochebuena', location: TEMPLO, audience: PARROQUIA, responsible: 'Liturgia', start: '20:00', type: 'misa' }),
  row({ d: 25, m: 12, title: 'Solemnidad de la Natividad de nuestro Señor Jesucristo', location: TEMPLO_Y_ERMITAS, audience: PARROQUIA, responsible: 'Liturgia', start: null, type: 'misa', note: EN_LAS_MISAS }),
  row({ d: 26, m: 12, title: 'Convivio Sectorial', location: SALON_MR, audience: 'Todo el sector', responsible: 'Sector Nº 1', start: '15:00', note: '3:00 p.m. en adelante.' }),
  row({ d: 26, m: 12, title: 'Vigilia zonal', location: SALON_TEPEYAC, audience: 'Zona 1', responsible: 'Apóstoles', start: '18:00', end: '24:00', type: 'vigilia' }),
  row({ d: 26, m: 12, title: 'Misa patronal Sector 13 (San Esteban Protomártir)', location: 'Ermita del sector', audience: PARROQUIA, responsible: 'Sector 13', start: '19:00', type: 'patronal' }),
  row({ d: 27, m: 12, title: 'Convivencia Consejo Parroquial', location: 'Libre', audience: 'Consejo parroquial', responsible: COM_EVANGELIZACION, start: null, note: HORA_PENDIENTE }),
  row({ d: 27, m: 12, title: 'Consejo parroquial', location: 'Templo, frente a la urna', audience: 'Consejo parroquial', responsible: 'Párroco', start: '14:00', end: '16:00', type: 'reunion' }),
  row({ d: 27, m: 12, title: 'Seminario de Vida en El Espíritu Santo', location: CASA_RETIRO, audience: PARROQUIA, responsible: 'RCC Ciudad Arce', start: null, note: TODO_EL_DIA }),
  row({ d: 28, m: 12, title: 'Seminario de Vida en El Espíritu Santo', location: CASA_RETIRO, audience: PARROQUIA, responsible: 'RCC Ciudad Arce', start: null, note: TODO_EL_DIA }),
  comisionEvangelizacion(29, 12),
  row({ d: 29, m: 12, title: 'Seminario de Vida en El Espíritu Santo', location: CASA_RETIRO, audience: PARROQUIA, responsible: 'RCC Ciudad Arce', start: null, note: TODO_EL_DIA }),
  row({ d: 31, m: 12, title: 'Memorias parroquiales', location: TEMPLO, audience: PARROQUIA, responsible: 'Medios de comunicación', start: '18:00' }),
  row({ d: 31, m: 12, title: 'Misa de fin de año', location: TEMPLO, audience: PARROQUIA, responsible: 'Liturgia', start: '20:00', type: 'misa' }),
]

export const septiembreDiciembre2026Rows = [
  ...SEPTIEMBRE,
  ...OCTUBRE,
  ...NOVIEMBRE,
  ...DICIEMBRE,
]

/** "HH:MM" local de El Salvador -> Date UTC del 2026-MM-DD. */
export const toUtc = (m: number, d: number, hhmm: string) => {
  const [rawHour, rawMinute] = hhmm.split(':').map(Number)
  const h = rawHour === 24 ? 0 : rawHour
  const dayOffset = rawHour === 24 ? 1 : 0
  return new Date(Date.UTC(2026, m - 1, d + dayOffset, h + SV_OFFSET_HOURS, rawMinute))
}

const COMBINING_MARKS = /[\u0300-\u036f]/g

export const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .toLowerCase()
    .replace(/º/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '')

export const buildEventSlug = (row: CalendarizationRow) =>
  [
    slugify(row.title),
    '2026',
    String(row.m).padStart(2, '0'),
    String(row.d).padStart(2, '0'),
    row.slugSuffix,
  ]
    .filter(Boolean)
    .join('-')

export const richText = (lines: string[]) => ({
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
