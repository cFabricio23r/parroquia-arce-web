import type { Media } from '@/payload-types'

export type TeamMember = {
  name?: string | null
  role?: string | null
  photo?: number | Media | null
  id?: string | null
}

/**
 * El equipo de un grupo o de un sector. El orden del array ES la jerarquia, asi
 * que no se ordena nada aca.
 *
 * Dos variantes porque los equipos no son del mismo tamaño: `list` es la columna
 * angosta del aside, que sirve para 2 o 3 personas; `grid` es la seccion a ancho
 * completo, que es lo unico legible cuando el sector cargo 13. `list` sigue
 * siendo el default para no tocar `/grupos/[slug]`.
 *
 * Se usa <img> normal y no next/image, igual que MediaImage, para no configurar
 * remotePatterns con el dominio de Supabase.
 */
export function TeamList({
  members,
  variant = 'list',
}: {
  members?: TeamMember[] | null
  variant?: 'list' | 'grid'
}) {
  const list = (members ?? []).filter((m) => m?.name)
  if (list.length === 0) return null

  const items = list.map((m, i) => {
    const photo = typeof m.photo === 'object' && m.photo !== null && m.photo.url ? m.photo : null
    return (
      <li
        key={m.id ?? i}
        className={
          variant === 'grid'
            ? 'flex items-center gap-3 rounded-xl border border-border bg-white p-4'
            : 'flex items-center gap-3'
        }
      >
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo.url as string}
            alt={photo.alt}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        )}
        <div>
          <p className="text-[15px] font-bold leading-tight">{m.name}</p>
          {m.role && <p className="mt-0.5 text-[13px] text-muted">{m.role}</p>}
        </div>
      </li>
    )
  })

  // En `grid` el encabezado lo pone la pagina: la seccion necesita su propio h2,
  // igual que Historia y Galeria. Dibujar uno aca daria dos "Equipo" anidados.
  if (variant === 'grid') {
    return (
      <ul className="grid grid-cols-3 gap-3 max-[980px]:grid-cols-2 max-[600px]:grid-cols-1">
        {items}
      </ul>
    )
  }

  // El `mt-6` se queda en la variante `list`: `/grupos/[slug]` cuelga su espaciado
  // del aside de ese margen y esta fuera del alcance de esta obra.
  return (
    <div className="mt-6 rounded-xl border border-border bg-bg-soft p-6">
      <h2 className="mb-4 font-display text-[20px] font-medium">Equipo</h2>
      <ul className="flex flex-col gap-4">{items}</ul>
    </div>
  )
}
