import type { Media } from '@/payload-types'
import type { Variant } from '@/components/ui/Badge'

/**
 * Solo el FONDO sale de los tintes de `Badge` (ds.css:132-135). La letra va
 * siempre en `navy`, y no en el color de acento que usa `Badge`.
 *
 * Por que: los pares de `Badge` no llegan a WCAG AA para este tamano.
 * Verificado — `sky-tint`/`sky` da 3.11:1 y `amber-soft`/`#B96E12` da 3.26:1,
 * cuando el monograma (21px, peso 600) exige 4.5:1; el piso de "texto grande"
 * (3:1) pide 24px, o 18.66px en peso 700, y este no califica. Con `navy` los
 * tres tintes quedan entre 13:1 y 15:1.
 *
 * `Badge` sigue con sus pares originales a 12.5px: arreglarlo es otra obra, y
 * esta no lo toca. Lo que no se hace es propagar el problema a un elemento mas
 * grande.
 */
const tints: Record<Variant, string> = {
  blue: 'bg-blue-tint text-navy',
  sky: 'bg-sky-tint text-navy',
  amber: 'bg-amber-soft text-navy',
  live: 'bg-amber text-white',
}

/**
 * El emblema de la tarjeta: el logo del grupo si esta cargado, o un monograma con
 * la inicial sobre el tinte de su tipo.
 *
 * El logo va con `object-contain`, no `cover`: es un isotipo, recortarlo lo
 * arruina. El monograma va `aria-hidden` porque el nombre del grupo viene
 * inmediatamente despues — un lector de pantalla no tiene que oir "C, Consejo
 * Economico".
 *
 * Se usa <img> normal y no next/image, igual que `MediaImage`, para no configurar
 * remotePatterns con el dominio de Supabase.
 */
export function CardMark({
  logo,
  name,
  variant = 'blue',
}: {
  logo?: number | Media | null
  name: string
  variant?: Variant
}) {
  const img = typeof logo === 'object' && logo !== null && logo.url ? logo : null

  if (img) {
    return (
      <div className="flex h-[46px] w-[46px] flex-none items-center justify-center overflow-hidden rounded-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img.url as string} alt={img.alt} className="h-full w-full object-contain" />
      </div>
    )
  }

  return (
    <div
      className={`flex h-[46px] w-[46px] flex-none items-center justify-center rounded-md font-display text-[21px] font-semibold ${tints[variant]}`}
      aria-hidden="true"
    >
      {name.trim().charAt(0).toUpperCase()}
    </div>
  )
}
