import type { Media } from '@/payload-types'

/**
 * Renderiza el cover de Supabase, o el gradiente placeholder (ds.css:185-187)
 * cuando no hay imagen. Con depth default, `cover` viene como objeto Media
 * poblado; si es un number (id sin poblar) o null, cae al placeholder.
 *
 * Se usa <img> normal, no next/image, para no tener que configurar
 * remotePatterns con el dominio de Supabase. El listado con ISR no lo necesita.
 */
export function MediaImage({
  cover,
  className = '',
}: {
  cover?: number | Media | null
  className?: string
}) {
  const isPopulated = typeof cover === 'object' && cover !== null && !!cover.url

  if (isPopulated) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={cover.url as string}
        alt={cover.alt}
        className={`h-full w-full object-cover ${className}`}
      />
    )
  }

  // Placeholder — gradiente de ds.css:185-187.
  return (
    <div
      className={`h-full w-full ${className}`}
      aria-hidden="true"
      style={{
        background:
          'radial-gradient(120% 90% at 70% 8%, var(--color-sky-light), transparent 55%), linear-gradient(155deg, var(--color-sky) 0%, var(--color-blue) 55%, var(--color-navy) 100%)',
      }}
    />
  )
}
