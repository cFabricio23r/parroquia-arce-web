import type { Media } from '@/payload-types'

export type TeamMember = {
  name?: string | null
  role?: string | null
  photo?: number | Media | null
  id?: string | null
}

/**
 * La lista del equipo en el aside del detalle. El orden del array ES la
 * jerarquia, asi que no se ordena nada aca.
 *
 * Se usa <img> normal y no next/image, igual que MediaImage, para no configurar
 * remotePatterns con el dominio de Supabase.
 */
export function TeamList({ members }: { members?: TeamMember[] | null }) {
  const list = (members ?? []).filter((m) => m?.name)
  if (list.length === 0) return null

  return (
    <div className="mt-6 rounded-xl border border-border bg-bg-soft p-6">
      <h2 className="mb-4 font-display text-[20px] font-medium">Equipo</h2>
      <ul className="flex flex-col gap-4">
        {list.map((m, i) => {
          const photo =
            typeof m.photo === 'object' && m.photo !== null && m.photo.url ? m.photo : null
          return (
            <li key={m.id ?? i} className="flex items-center gap-3">
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
        })}
      </ul>
    </div>
  )
}
