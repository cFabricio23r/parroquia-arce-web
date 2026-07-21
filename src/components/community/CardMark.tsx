import type { Media } from '@/payload-types'
import type { Variant } from '@/components/ui/Badge'

/** Los mismos pares tinte/texto que usa `Badge` (ds.css:132-135). */
const tints: Record<Variant, string> = {
  blue: 'bg-blue-tint text-blue',
  sky: 'bg-sky-tint text-sky',
  amber: 'bg-amber-soft text-[#B96E12]',
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
