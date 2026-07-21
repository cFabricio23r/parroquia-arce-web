import Link from 'next/link'
import type { Group } from '@/payload-types'

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
    <div className="mt-6 rounded-xl border border-border bg-bg-soft p-6">
      <h2 className="mb-4 font-display text-[20px] font-medium">Grupos en el sector</h2>
      <ul className="flex flex-col gap-2 text-[14.5px]">
        {list.map((g) => (
          <li key={g.id}>
            <Link href={`/grupos/${g.slug}`} className="text-blue hover:underline">
              {g.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
