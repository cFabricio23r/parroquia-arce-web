/**
 * Logica de programacion de la radio. Pura y sin dependencias de Payload: recibe
 * los programas ya leidos del CMS y responde que suena ahora, que sigue despues y
 * como agrupar la semana.
 *
 * Las horas se guardan en 24 h ("06:00") y se muestran en 12 h ("6:00 a.m.").
 */

import { TZ } from './sv-date'

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

/** True solo para "HH:mm" en 24 h. Rechaza el texto libre viejo ("6:00 a.m."). */
export function isValidTime(value: unknown): value is string {
  return typeof value === 'string' && TIME_RE.test(value)
}

/** "06:30" -> 390. Dato invalido -> null (nunca lanza: el CMS puede tener basura vieja). */
export function toMinutes(value: unknown): number | null {
  if (!isValidTime(value)) return null
  const [hours, minutes] = value.split(':')
  return Number(hours) * 60 + Number(minutes)
}

/** "13:30" -> "1:30 p.m.". Dato invalido -> "" para que la UI simplemente no lo muestre. */
export function formatTime12h(value: unknown): string {
  const total = toMinutes(value)
  if (total === null) return ''
  const hours24 = Math.floor(total / 60)
  const minutes = total % 60
  const suffix = hours24 < 12 ? 'a.m.' : 'p.m.'
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12
  return `${hours12}:${String(minutes).padStart(2, '0')} ${suffix}`
}

/** Indice 0 = domingo, para que coincida con el orden de `Date` y de `Intl`. */
export const DAYS = [
  'domingo',
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
] as const

export type Day = (typeof DAYS)[number]

export type Clock = { day: Day; minutes: number }

const EN_TO_DAY: Record<string, Day> = {
  Sunday: 'domingo',
  Monday: 'lunes',
  Tuesday: 'martes',
  Wednesday: 'miercoles',
  Thursday: 'jueves',
  Friday: 'viernes',
  Saturday: 'sabado',
}

/**
 * Que dia y que hora es EN LA PARROQUIA, sin importar el huso del visitante: un
 * feligres en el extranjero quiere saber que esta al aire aca, no alla.
 *
 * Verificado 2026-07-21: `America/El_Salvador` devuelve GMT-06:00 en enero y en
 * julio — El Salvador no tiene horario de verano, asi que no hay casos de borde
 * por cambio de hora. La zona sale de `sv-date` para no repetir el string.
 */
export function parishNow(date: Date = new Date()): Clock {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: TZ,
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  )
  // El `% 24` es defensivo: algunas versiones de ICU emiten "24" a medianoche con
  // hour12:false. La nuestra emite "00" (verificado), pero no cuesta nada.
  const hours = Number(parts.hour) % 24
  return { day: EN_TO_DAY[parts.weekday], minutes: hours * 60 + Number(parts.minute) }
}

/** El dia anterior, dando la vuelta. Lo usan los programas que cruzan medianoche. */
export function dayBefore(day: Day): Day {
  return DAYS[(DAYS.indexOf(day) + DAYS.length - 1) % DAYS.length]
}

/** Lo minimo que necesita la logica de horarios de un programa. */
export type ProgramLike = {
  dayOfWeek?: string | null
  startTime?: string | null
  endTime?: string | null
}

function matchesDay(program: ProgramLike, day: Day): boolean {
  return program.dayOfWeek === 'diario' || program.dayOfWeek === day
}

/**
 * Cuanto dura un programa al que no le cargaron hora de fin.
 *
 * Ninguno de los programas del CMS tenia `endTime` (verificado 2026-07-21: los 6
 * publicados solo tienen hora de inicio). Sin un respaldo, `isOnAir` devolveria
 * siempre false y el heroe diria "Música católica" las 24 horas. Con 60 minutos la
 * radio funciona apenas se cargan los inicios, y la parroquia afina despues los
 * programas que duren distinto.
 */
export const DEFAULT_DURATION_MINUTES = 60

const MINUTES_PER_DAY = 24 * 60

/** El fin real de un programa: el cargado, o una hora despues del inicio. */
function windowOf(program: ProgramLike): { start: number; end: number } | null {
  const start = toMinutes(program.startTime)
  if (start === null) return null
  const end = toMinutes(program.endTime)
  // `end === start` es un dato mal cargado; se trata igual que si faltara.
  if (end === null || end === start) {
    return { start, end: (start + DEFAULT_DURATION_MINUTES) % MINUTES_PER_DAY }
  }
  return { start, end }
}

/**
 * Si la ventana del programa contiene ese momento.
 *
 * `fin > inicio` es una ventana normal del mismo dia. `fin < inicio` significa que
 * cruza medianoche (23:00-01:00): sigue vigente en la madrugada del dia siguiente.
 * Un programa que arranca 23:30 y toma la duracion por defecto cae solo en ese
 * caso, porque el modulo lo hace dar la vuelta.
 *
 * El inicio es inclusivo y el fin exclusivo: a las 07:00 en punto el programa de
 * 06:00-07:00 ya termino y el de 07:00-08:00 ya empezo. Sin solapamiento.
 */
export function isOnAir(program: ProgramLike, now: Clock): boolean {
  const slot = windowOf(program)
  if (slot === null) return false
  const { start, end } = slot

  if (end > start) {
    return matchesDay(program, now.day) && now.minutes >= start && now.minutes < end
  }

  const startedOnItsDay = matchesDay(program, now.day) && now.minutes >= start
  const spillsIntoToday = matchesDay(program, dayBefore(now.day)) && now.minutes < end
  return startedOnItsDay || spillsIntoToday
}

/** El programa al aire, o null si estamos en un hueco (ahi suena musica). */
export function findCurrentProgram<T extends ProgramLike>(programs: T[], now: Clock): T | null {
  return programs.find((program) => isOnAir(program, now)) ?? null
}
