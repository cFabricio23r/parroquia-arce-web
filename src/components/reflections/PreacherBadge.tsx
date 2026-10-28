import React from 'react'

const TITLES = new Set(['hno.', 'hna.', 'fr.', 'hno', 'hna', 'fr'])

/** "Hno. Nombre Apellido" -> "NA". Ignora Hno./Hna./Fr. */
export function initials(name: string): string {
  const words = name.split(/\s+/).filter((w) => w && !TITLES.has(w.toLowerCase()))
  const out = words
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
  return out || name.trim().charAt(0).toUpperCase()
}

/**
 * Predicador: foto (con alt) o iniciales decorativas, y el nombre siempre visible.
 * `lg` (tarjeta de la portada): foto grande arriba, nombre y subtitulo debajo.
 */
export function PreacherBadge({
  name,
  photo,
  tone,
  size = 'md',
  subtitle,
}: {
  name: string
  photo: { url: string; alt: string } | null
  tone: 'dark' | 'light'
  size?: 'md' | 'lg'
  subtitle?: string
}) {
  const dark = tone === 'dark'
  const lg = size === 'lg'
  const avatar = lg ? 'h-28 w-28 ring-4 ring-white/10' : 'h-11 w-11'
  return (
    <div className={lg ? 'flex flex-col items-start gap-4' : 'flex items-center gap-3'}>
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo.url} alt={photo.alt} className={`${avatar} rounded-full object-cover`} />
      ) : (
        <span
          aria-hidden="true"
          className={`flex ${avatar} items-center justify-center rounded-full font-bold ${
            lg ? 'text-[32px]' : 'text-sm'
          } ${dark ? 'bg-white/15 text-white' : 'bg-blue-tint text-blue'}`}
        >
          {initials(name)}
        </span>
      )}
      <div>
        <span
          className={`block font-semibold ${lg ? 'text-[22px] leading-tight' : 'text-[15px]'} ${
            dark ? 'text-white' : 'text-text'
          }`}
        >
          {name}
        </span>
        {subtitle && (
          <span
            className={`mt-1 block ${lg ? 'text-[16px]' : 'text-[14px]'} ${
              dark ? 'text-[#B6C6DD]' : 'text-muted'
            }`}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  )
}
