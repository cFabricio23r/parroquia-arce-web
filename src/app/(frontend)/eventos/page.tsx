import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Event } from '@/payload-types'
import { Container } from '@/components/ui/Container'
import { PageHero } from '@/components/site/PageHero'
import { Badge } from '@/components/ui/Badge'
import { MediaImage } from '@/components/news/MediaImage'
import { Reveal } from '@/components/news/Reveal'

export const metadata: Metadata = { title: 'Agenda parroquial' }
export const revalidate = 300

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const MES_CORTO = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const typeVariant = (t?: string | null): 'blue' | 'sky' | 'amber' => {
  if (t === 'patronal' || t === 'vigilia' || t === 'novena') return 'amber'
  if (t === 'reunion' || t === 'jornada') return 'sky'
  return 'blue'
}
const typeLabel = (t?: string | null) => (t ? t.replace('-', ' ') : '')

/** Agrupa los eventos por "Mes Año" preservando el orden cronológico. */
function groupByMonth(events: Event[]) {
  const groups: { key: string; label: string; events: Event[] }[] = []
  for (const e of events) {
    const d = new Date(e.startsAt)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    const label = `${MESES[d.getMonth()]} ${d.getFullYear()}`
    let g = groups.find((x) => x.key === key)
    if (!g) {
      g = { key, label, events: [] }
      groups.push(g)
    }
    g.events.push(e)
  }
  return groups
}

export default async function EventosPage() {
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection: 'events',
    where: { status: { equals: 'published' } },
    sort: 'startsAt',
    limit: 100,
  })

  const featured = docs.find((e) => e.isFeatured) ?? docs[0]
  const months = groupByMonth(docs)

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Inicio', href: '/' }, { label: 'Eventos' }]}
        title="Agenda"
        emphasis="parroquial"
        lead="Una agenda unificada para que cada sector, grupo y comunidad pueda participar mejor en la vida de la parroquia."
      />

      <section className="py-[clamp(56px,7vw,96px)]">
        <Container>
          {docs.length === 0 ? (
            <p className="text-muted">
              Aún no hay eventos publicados. El equipo parroquial los carga desde el panel.
            </p>
          ) : (
            <>
              {featured && (
                <Reveal>
                  <Link
                    href={`/eventos/${featured.slug}`}
                    className="group relative mb-[38px] flex min-h-[360px] flex-col justify-end overflow-hidden rounded-xl p-10 text-white shadow-md"
                  >
                    <div className="absolute inset-0">
                      <MediaImage cover={featured.cover} />
                    </div>
                    <div
                      className="absolute inset-0"
                      aria-hidden="true"
                      style={{
                        background:
                          'linear-gradient(110deg, rgba(5,23,51,.82) 30%, rgba(5,23,51,.25))',
                      }}
                    />
                    <div className="relative max-w-[60ch]">
                      <span className="text-[12.5px] font-bold uppercase tracking-[.15em] text-sky-light">
                        Evento destacado
                      </span>
                      <h2 className="my-3 font-display text-[clamp(30px,3.8vw,48px)] font-medium leading-[1.04]">
                        {featured.title}
                      </h2>
                      <div className="mt-[22px] flex flex-wrap items-center gap-5 font-bold">
                        <span>
                          📅{' '}
                          {new Date(featured.startsAt).toLocaleDateString('es-SV', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                          })}
                        </span>
                        <span>📍 {featured.locationName}</span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              )}

              {months.map(({ key, label, events }) => (
                <div key={key}>
                  <Reveal className="mb-4 mt-[34px] font-display text-[22px] font-semibold text-blue">
                    {label}
                  </Reveal>
                  <div className="flex flex-col gap-[14px]">
                    {events.map((e) => {
                      const d = new Date(e.startsAt)
                      return (
                        <Reveal key={e.id}>
                          <Link
                            href={`/eventos/${e.slug}`}
                            className="group grid grid-cols-[auto_1fr_auto] items-center gap-6 rounded-lg border border-border bg-white p-[22px_26px] transition-transform duration-200 hover:-translate-y-0.5 max-[600px]:grid-cols-[auto_1fr]"
                          >
                            <span className="grid h-16 w-16 flex-none place-items-center rounded-md bg-blue-tint text-center text-blue">
                              <span className="block font-display text-[26px] font-semibold leading-none">
                                {String(d.getDate()).padStart(2, '0')}
                              </span>
                              <span className="mt-[2px] text-[11px] font-bold uppercase tracking-[.08em]">
                                {MES_CORTO[d.getMonth()]}
                              </span>
                            </span>
                            <div>
                              <h4 className="font-display text-[21px] font-semibold leading-[1.05]">
                                {e.title}
                              </h4>
                              <div className="mt-[5px] flex items-center gap-[7px] text-[14.5px] text-muted">
                                <span className="text-sky" aria-hidden="true">
                                  📍
                                </span>
                                {d.toLocaleTimeString('es-SV', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}{' '}
                                · {e.locationName}
                              </div>
                            </div>
                            {e.eventType && (
                              <Badge variant={typeVariant(e.eventType)} className="max-[600px]:hidden">
                                {typeLabel(e.eventType)}
                              </Badge>
                            )}
                          </Link>
                        </Reveal>
                      )
                    })}
                  </div>
                </div>
              ))}
            </>
          )}
        </Container>
      </section>
    </>
  )
}
