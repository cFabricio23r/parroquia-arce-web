import type { Variant } from '@/components/ui/Badge'

/**
 * Tipos de grupo: unica fuente de verdad para la tarjeta y los listados.
 *
 * Antes esto vivia duplicado en `grupos/page.tsx` (como `typeMeta`) y en la home
 * (como `groupTypeMeta`). Dos copias de lo mismo derivan: si alguien agrega un
 * tipo en la coleccion, se acuerda de una y se olvida de la otra.
 *
 * Los VALORES son los de la coleccion `groups` y no se tocan: ya hay grupos
 * guardados con ellos en la base.
 */
const GROUP_TYPE_META: Record<string, { label: string; variant: Variant }> = {
  pastoral: { label: 'Pastoral', variant: 'blue' },
  ministerio: { label: 'Ministerio', variant: 'sky' },
  comunidad: { label: 'Comunidad', variant: 'sky' },
  servicio: { label: 'Servicio', variant: 'amber' },
  formacion: { label: 'Formación', variant: 'blue' },
}

/**
 * Etiqueta y variante del badge. Devuelve `null` si el grupo no tiene tipo o si
 * el tipo no esta mapeado — el que llama decide no renderizar el badge.
 */
export const groupTypeMeta = (value?: string | null) =>
  value && value in GROUP_TYPE_META ? GROUP_TYPE_META[value] : null
