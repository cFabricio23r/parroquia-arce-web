/**
 * Formateo de fechas en horario de El Salvador.
 *
 * Sin `timeZone` explicito, `toLocale*String` usa la zona del runtime: UTC en
 * Vercel. Un evento guardado a las 19:15 de El Salvador (01:15Z del dia
 * siguiente) se mostraba como "1:00 a. m." y en el dia equivocado. Verificado
 * en produccion el 2026-07-21.
 *
 * El Salvador no tiene horario de verano, pero igual se usa el ID de zona en
 * vez de un offset fijo: si algun dia cambia, `Intl` ya lo sabe.
 */
export const TZ = 'America/El_Salvador'

/** Hora del evento, ej. "7:15 p. m." */
export const svTime = (value: string | Date) =>
  new Date(value).toLocaleTimeString('es-SV', {
    timeZone: TZ,
    hour: 'numeric',
    minute: '2-digit',
  })

/** Fecha del evento con las opciones que se pasen, ej. "sábado, 4 de julio". */
export const svDate = (value: string | Date, options: Intl.DateTimeFormatOptions) =>
  new Date(value).toLocaleDateString('es-SV', { timeZone: TZ, ...options })

/**
 * Partes numericas de la fecha en horario de El Salvador. Necesario porque
 * `getDate()` / `getMonth()` leen la zona del runtime, no la de la parroquia.
 * `month` es 0-11, para indexar los arrays de meses.
 */
export const svParts = (value: string | Date) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(value))
  const get = (type: 'year' | 'month' | 'day') =>
    Number(parts.find((p) => p.type === type)?.value ?? '0')
  return { year: get('year'), month: get('month') - 1, day: get('day') }
}

/** Offset de El Salvador en ese instante, en minutos. "GMT-06:00" -> -360. */
const svOffsetMinutes = (at: Date) => {
  const name = new Intl.DateTimeFormat('en-US', { timeZone: TZ, timeZoneName: 'longOffset' })
    .formatToParts(at)
    .find((p) => p.type === 'timeZoneName')?.value
  const m = name?.match(/GMT([+-])(\d{2}):(\d{2})/)
  if (!m) return -360 // El Salvador es UTC-6; respaldo por si `longOffset` no esta.
  const signo = m[1] === '-' ? -1 : 1
  return signo * (Number(m[2]) * 60 + Number(m[3]))
}

/**
 * Medianoche de HOY en El Salvador, como `Date` en UTC.
 *
 * Es el corte de "a partir de hoy" en las consultas de la agenda: un evento de
 * esta manana sigue apareciendo por la tarde. Se usa el offset real del dia via
 * `Intl` en vez de restar 6 horas fijas, asi no hay que tocar esto si alguna vez
 * cambia la zona.
 */
export const svStartOfToday = (now = new Date()) => {
  const { year, month, day } = svParts(now)
  const medianocheComoUtc = Date.UTC(year, month, day, 0, 0, 0, 0)
  return new Date(medianocheComoUtc - svOffsetMinutes(now) * 60_000)
}
