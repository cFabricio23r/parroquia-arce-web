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

/** Predicador: foto (con alt) o iniciales decorativas, y el nombre siempre visible. */
export function PreacherBadge({
  name,
  photo,
  tone,
}: {
  name: string
  photo: { url: string; alt: string } | null
  tone: 'dark' | 'light'
}) {
  const dark = tone === 'dark'
  return (
    <div className="flex items-center gap-3">
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo.url} alt={photo.alt} className="h-11 w-11 rounded-full object-cover" />
      ) : (
        <span
          aria-hidden="true"
          className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold ${
            dark ? 'bg-white/15 text-white' : 'bg-blue-tint text-blue'
          }`}
        >
          {initials(name)}
        </span>
      )}
      <span className={`text-[15px] font-semibold ${dark ? 'text-white' : 'text-text'}`}>
        {name}
      </span>
    </div>
  )
}
