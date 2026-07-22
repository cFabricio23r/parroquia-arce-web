import type { Chapel } from '@/payload-types'
import { formatFeastDate } from '@/lib/months'
import { ContactLinks, hasContact } from './ContactLinks'
import { MapLink, hasLocation } from './MapLink'

/**
 * Una ermita dentro de la pagina de su sector. No hay ruta propia
 * `/ermitas/[slug]`: todo lo que el visitante busca cabe aca.
 *
 * Cada bloque se renderiza solo si tiene contenido. Hoy casi todos los campos
 * estan vacios, asi que el estado vacio es el normal.
 */
export function ChapelCard({ chapel }: { chapel: Chapel }) {
  const feasts = (chapel.patronalFeasts ?? []).filter((f) => f?.name)
  const schedule = (chapel.massSchedule ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  const cover = typeof chapel.cover === 'object' && chapel.cover?.url ? chapel.cover : null

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-border">
      {cover && (
        <div className="[aspect-ratio:16/7]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover.url as string} alt={cover.alt} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="p-6">
        <h3 className="font-display text-[22px] font-medium">{chapel.name}</h3>
        {chapel.patronOrDedication && (
          <p className="mt-1 text-[15px] text-muted">{chapel.patronOrDedication}</p>
        )}

        {feasts.length > 0 && (
          <div className="mt-5">
            <h4 className="mb-2 text-[12px] font-bold uppercase tracking-[.1em] text-muted">
              Fiestas patronales
            </h4>
            <ul className="flex flex-col gap-1 text-[14.5px]">
              {feasts.map((f, i) => {
                const when = formatFeastDate(f.day, f.month)
                return (
                  <li key={f.id ?? i}>
                    <span className="font-bold">{f.name}</span>
                    {when && <span className="text-muted"> · {when}</span>}
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {schedule.length > 0 && (
          <div className="mt-5">
            <h4 className="mb-2 text-[12px] font-bold uppercase tracking-[.1em] text-muted">
              Horario de misas
            </h4>
            <ul className="flex flex-col gap-1 text-[14.5px]">
              {schedule.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>
        )}

        {/* La tarjeta NO cuelga de un <Link> — el detalle del sector la renderiza
            suelta — asi que el boton del mapa puede ir con su ancla. */}
        {hasLocation(chapel.location) && (
          <div className="mt-5">
            <h4 className="mb-2 text-[12px] font-bold uppercase tracking-[.1em] text-muted">
              Ubicación
            </h4>
            <MapLink location={chapel.location} />
          </div>
        )}

        {hasContact(chapel.contact) && (
          <div className="mt-5">
            <h4 className="mb-2 text-[12px] font-bold uppercase tracking-[.1em] text-muted">
              Contacto
            </h4>
            <ContactLinks contact={chapel.contact} />
          </div>
        )}
      </div>
    </div>
  )
}
