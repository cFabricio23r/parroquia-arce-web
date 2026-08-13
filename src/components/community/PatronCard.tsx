import type { Group } from '@/payload-types'
import { formatFeastDate } from '@/lib/months'
import { SidebarCard } from './SidebarCard'

type Feast = { name: string; day?: number | null; month?: string | null; id?: string | null }

/**
 * El patrono de un grupo en el aside del detalle.
 *
 * Las tres partes (nombre, imagen, fiestas) son independientes porque los datos
 * reales lo son: la Comision de Liturgia manda nombre e imagen sin fecha, la IAM
 * manda dos patronos con fecha y ninguno en `name`, y la Escuela manda solo la
 * imagen porque dice que no tiene patrono asignado. Si no hay ninguna de las tres,
 * no se dibuja nada — igual que PerseveranceStat y TeamList.
 *
 * Una fiesta sin `name` no cuenta: es la misma guarda que usa ChapelCard.
 */
export function PatronCard({
  patron,
  feasts,
}: {
  patron?: Group['patron'] | null
  feasts?: Feast[] | null
}) {
  const image = typeof patron?.image === 'object' && patron.image?.url ? patron.image : null
  const named = (feasts ?? []).filter((f) => f?.name)
  if (!patron?.name && !image && named.length === 0) return null

  return (
    <SidebarCard icon="calendar" title="Patrono" className="mt-6">
      {image && (
        <div className="mb-4 overflow-hidden rounded-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.url as string}
            alt={image.alt}
            className="max-h-[180px] w-full object-contain"
          />
        </div>
      )}
      {patron?.name && <p className="text-[15.5px] font-bold">{patron.name}</p>}
      {named.length > 0 && (
        <ul className={`flex flex-col gap-1 text-[14.5px] ${patron?.name ? 'mt-3' : ''}`}>
          {named.map((f, i) => {
            const when = formatFeastDate(f.day, f.month)
            return (
              <li key={f.id ?? i}>
                <span className="font-bold">{f.name}</span>
                {when && <span className="text-muted"> · {when}</span>}
              </li>
            )
          })}
        </ul>
      )}
    </SidebarCard>
  )
}
