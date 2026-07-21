/**
 * Logica de programacion de la radio. Pura y sin dependencias de Payload: recibe
 * los programas ya leidos del CMS y responde que suena ahora, que sigue despues y
 * como agrupar la semana.
 *
 * Las horas se guardan en 24 h ("06:00") y se muestran en 12 h ("6:00 a.m.").
 */

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
