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
