/**
 * Tipos de evento: unica fuente de verdad para el CMS y la web.
 *
 * Antes cada lugar derivaba la etiqueta del valor con `.replace('-', ' ')`, asi
 * que el admin y las insignias del sitio mostraban "hora santa" y "reunion",
 * en minuscula y sin tilde. Los VALORES no se tocan: ya hay eventos guardados
 * con ellos en la base.
 */
export const EVENT_TYPE_LABELS = {
  misa: 'Misa',
  vigilia: 'Vigilia',
  'hora-santa': 'Hora santa',
  jornada: 'Jornada',
  reunion: 'Reunión',
  novena: 'Novena',
  retiro: 'Retiro',
  sector: 'Sector',
  grupo: 'Grupo',
  patronal: 'Fiesta patronal',
} as const

export type EventType = keyof typeof EVENT_TYPE_LABELS

/** Options listas para un campo `select` de Payload. */
export const eventTypeOptions = Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => ({
  label,
  value,
}))

/** Etiqueta para mostrar. Devuelve '' si el evento no tiene tipo. */
export const eventTypeLabel = (value?: string | null) =>
  value && value in EVENT_TYPE_LABELS ? EVENT_TYPE_LABELS[value as EventType] : ''
