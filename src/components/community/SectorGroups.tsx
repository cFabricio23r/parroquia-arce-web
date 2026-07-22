import Link from 'next/link'
import type { Group } from '@/payload-types'
import { Icon } from '@/components/ui/Icon'
import { SidebarCard } from './SidebarCard'

/**
 * Los grupos con presencia en el sector, enlazados a su detalle.
 *
 * IMPORTANTE: filtra `status === 'published'` a mano. La Local API de Payload usa
 * `overrideAccess: true` por defecto, asi que los documentos que llegan poblados
 * en una relacion NO pasaron por `publishedOnly`. Sin este filtro, un grupo en
 * borrador aparece en el sitio publico.
 */
export function SectorGroups({ groups }: { groups?: (number | Group)[] | null }) {
  const list = (groups ?? []).filter(
    (g): g is Group =>
      typeof g === 'object' && g !== null && g.status === 'published' && Boolean(g.slug),
  )
  if (list.length === 0) return null

  return (
    <SidebarCard icon="users" title="Grupos en el sector" className="mt-6">
      <ul className="flex flex-col gap-1 text-[14.5px]">
        {list.map((g) => (
          <li key={g.id}>
            <Link
              href={`/grupos/${g.slug}`}
              className="group -mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-[7px] font-semibold text-blue transition-colors hover:bg-blue-tint"
            >
              <span className="min-w-0">{g.name}</span>
              <Icon
                name="arrow"
                className="h-4 w-4 flex-none transition-transform duration-150 group-hover:translate-x-[3px]"
              />
            </Link>
          </li>
        ))}
      </ul>
    </SidebarCard>
  )
}
