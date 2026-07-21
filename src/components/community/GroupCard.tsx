import Link from 'next/link'
import type { Group } from '@/payload-types'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { groupTypeMeta } from '@/lib/group-types'
import { CardMark } from './CardMark'

/**
 * La tarjeta de un grupo en `/grupos` y en la home.
 *
 * Se apoya en `logo` y `perseverance`, que son los campos que la parroquia carga.
 * `summary` y `meeting` estan soportados y se renderizan si existen, pero hoy
 * estan vacios en el 100% de los documentos, asi que el estado sin ellos es el
 * normal y no puede verse roto.
 *
 * `as` existe porque el nivel de encabezado depende de donde cuelgue la tarjeta:
 * h3 en el listado (bajo el h1 del hero), h4 en la home (bajo el h3 de la
 * seccion). Hardcodearlo romperia el orden en una de las dos paginas.
 */
export function GroupCard({ group, as: Heading = 'h3' }: { group: Group; as?: 'h3' | 'h4' }) {
  const meta = groupTypeMeta(group.type)
  const meeting = group.meeting
  const when = [meeting?.day, meeting?.time].filter(Boolean).join(' · ')
  const count = group.perseverance?.count

  return (
    <Link
      href={`/grupos/${group.slug}`}
      className="card-hover group flex h-full flex-col rounded-lg border border-border bg-white p-7"
    >
      <div className="flex items-start justify-between gap-3">
        <CardMark logo={group.logo} name={group.name} variant={meta?.variant} />
        {meta && <Badge variant={meta.variant}>{meta.label}</Badge>}
      </div>

      <Heading className="mb-2 mt-[14px] font-display text-[23px] font-semibold leading-[1.06]">
        {group.name}
      </Heading>

      {group.summary && <p className="text-[14.5px] leading-[1.5] text-muted">{group.summary}</p>}

      {(when || meeting?.place) && (
        <div className="mt-[14px] flex flex-col gap-2">
          {when && (
            <div className="flex items-center gap-[9px] text-[14px] font-semibold text-[#3A4A60]">
              <Icon name="clock" className="h-[15px] w-[15px] flex-none text-sky" />
              {when}
            </div>
          )}
          {meeting?.place && (
            <div className="flex items-center gap-[9px] text-[14px] font-semibold text-[#3A4A60]">
              <Icon name="pin" className="h-[15px] w-[15px] flex-none text-sky" />
              {meeting.place}
            </div>
          )}
        </div>
      )}

      <div className="mt-auto pt-[18px]">
        {count != null && (
          <p className="mb-[10px] flex items-center gap-[7px] text-[12.5px] text-muted">
            <Icon name="users" className="h-[14px] w-[14px] flex-none" />
            {count} {group.perseverance?.label || 'miembros que perseveran'}
          </p>
        )}
        <span className="inline-flex items-center gap-1.5 text-[14.5px] font-bold text-blue">
          Conocer más
          <Icon
            name="arrow"
            className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-[3px]"
          />
        </span>
      </div>
    </Link>
  )
}
