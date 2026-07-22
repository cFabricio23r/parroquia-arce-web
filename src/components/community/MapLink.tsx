import { Icon } from '@/components/ui/Icon'

export type LocationData = {
  address?: string | null
  mapUrl?: string | null
}

const isUrl = (value?: string | null) => !!value && /^https?:\/\//i.test(value.trim())

/** True si hay algo que mostrar. Lo usa quien decide si dibuja el bloque. */
export function hasLocation(location?: LocationData | null): boolean {
  if (!location) return false
  return Boolean(location.address?.trim() || location.mapUrl?.trim())
}

/**
 * La ubicacion de un sector o una ermita: la direccion en texto y, si hay enlace,
 * un boton "Ver en el mapa".
 *
 * La guarda que importa es `isUrl(address)`. Antes de que existiera `mapUrl`, el
 * editor pegaba el link de Google Maps dentro de `address` y la web lo imprimia
 * crudo. Aunque los datos ya se migraron, la guarda se queda: si mañana alguien
 * vuelve a pegar un link ahi, se trata como enlace y no como texto. Nunca se
 * muestra una URL como si fuera una direccion.
 *
 * `linkless` es para la tarjeta del listado, que ya es un <Link>: una <a> dentro
 * de otra <a> es HTML invalido y el navegador la desanida. En ese modo se muestra
 * solo el texto, y si no hay texto no se muestra nada.
 */
export function MapLink({
  location,
  className = '',
  linkless = false,
}: {
  location?: LocationData | null
  className?: string
  linkless?: boolean
}) {
  if (!hasLocation(location)) return null

  const address = location?.address?.trim() || ''
  const text = isUrl(address) ? null : address
  const url = location?.mapUrl?.trim() || (isUrl(address) ? address : null)

  if (linkless) {
    if (!text) return null
    return (
      <p className={`flex items-start gap-[7px] leading-snug ${className}`}>
        <Icon name="pin" className="mt-[3px] h-[15px] w-[15px] flex-none text-sky" />
        {text}
      </p>
    )
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {text && (
        <p className="flex items-start gap-[7px] text-[14.5px] leading-snug">
          <Icon name="pin" className="mt-[3px] h-[15px] w-[15px] flex-none text-sky" />
          {text}
        </p>
      )}
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-1.5 rounded-pill border border-border bg-white px-[13px] py-[7px] text-[13.5px] font-bold text-blue transition-colors hover:border-blue"
        >
          <Icon name="pin" className="h-[14px] w-[14px] flex-none" />
          Ver en el mapa
        </a>
      )}
    </div>
  )
}
