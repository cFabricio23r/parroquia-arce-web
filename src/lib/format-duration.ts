const whole = (seconds: number) => (Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0)

/** "3:34" o "1:02:05". Para mostrar en pantalla. */
export function formatClock(seconds: number): string {
  const total = whole(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`
}

const unit = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

/** "3 minutos 34 segundos". Para lectores de pantalla (aria-valuetext). */
export function spokenDuration(seconds: number): string {
  const total = whole(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const parts: string[] = []
  if (h > 0) parts.push(unit(h, 'hora', 'horas'))
  if (m > 0) parts.push(unit(m, 'minuto', 'minutos'))
  if (s > 0 || parts.length === 0) parts.push(unit(s, 'segundo', 'segundos'))
  return parts.join(' ')
}
