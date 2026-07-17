import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { PageHero } from '@/components/site/PageHero'
import { Badge } from '@/components/ui/Badge'
import { MediaImage } from '@/components/news/MediaImage'
import { Reveal } from '@/components/news/Reveal'

export const metadata: Metadata = { title: 'Agenda parroquial' }

// Contenido estatico portado del demo (web/content/eventos.html). Se bindea a la
// coleccion `events` cuando exista (Fase 1B); ahi vuelven los filtros por chip y
// el link al detalle de cada evento.

type Variant = 'blue' | 'sky' | 'amber'
const meses: { mes: string; eventos: [string, string, string, string, string, Variant][] }[] = [
  {
    mes: 'Mayo 2026',
    eventos: [
      ['24', 'May', 'Vigilia de Pentecostés', '6:00 p.m. · Ermita Las Cruces', 'Vigilia', 'amber'],
      ['29', 'May', 'Hora Santa comunitaria', '7:00 p.m. · Templo parroquial', 'Oración', 'blue'],
      ['31', 'May', 'Rosario comunitario · Sector #8', '5:00 p.m. · Las Cruces', 'Oración', 'blue'],
    ],
  },
  {
    mes: 'Junio 2026',
    eventos: [
      ['02', 'Jun', 'Reunión de servidores', '5:00 p.m. · Salón parroquial', 'Servicio', 'sky'],
      ['08', 'Jun', 'Corpus Christi · Procesión', '9:00 a.m. · Desde el templo', 'Solemnidad', 'amber'],
      ['14', 'Jun', 'Convivencia juvenil', '2:00 p.m. · Salón juvenil', 'Jóvenes', 'amber'],
      ['29', 'Jun', 'San Pedro y San Pablo', '6:00 p.m. · Templo parroquial', 'Celebración', 'blue'],
    ],
  },
]

export default function EventosPage() {
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
          {/* Evento destacado */}
          <Reveal>
            <article className="relative mb-[38px] flex min-h-[360px] flex-col justify-end overflow-hidden rounded-xl p-10 text-white shadow-md">
              <div className="absolute inset-0">
                <MediaImage cover={null} />
              </div>
              <div
                className="absolute inset-0"
                aria-hidden="true"
                style={{
                  background: 'linear-gradient(110deg, rgba(5,23,51,.82) 30%, rgba(5,23,51,.25))',
                }}
              />
              <div className="relative max-w-[60ch]">
                <span className="text-[12.5px] font-bold uppercase tracking-[.15em] text-sky-light">
                  Evento destacado
                </span>
                <h2 className="my-3 font-display text-[clamp(30px,3.8vw,48px)] font-medium leading-[1.04]">
                  Vigilia de Pentecostés
                </h2>
                <p className="max-w-[52ch] text-[16.5px] text-[#D2E2F4]">
                  Una noche de oración que reúne a familias, jóvenes y servidores para prepararnos
                  como parroquia en misión.
                </p>
                <div className="mt-[22px] flex flex-wrap items-center gap-5 font-bold">
                  <span>📅 Sábado 24 de mayo · 6:00 p.m.</span>
                  <span>📍 Ermita Las Cruces</span>
                </div>
              </div>
            </article>
          </Reveal>

          {meses.map(({ mes, eventos }) => (
            <div key={mes}>
              <Reveal className="mb-4 mt-[34px] font-display text-[22px] font-semibold text-blue">
                {mes}
              </Reveal>
              <div className="flex flex-col gap-[14px]">
                {eventos.map(([d, m, title, loc, cat, variant]) => (
                  <Reveal key={title}>
                    <article className="grid grid-cols-[auto_1fr_auto] items-center gap-6 rounded-lg border border-border bg-white p-[22px_26px] max-[600px]:grid-cols-[auto_1fr]">
                      <span className="grid h-16 w-16 flex-none place-items-center rounded-md bg-blue-tint text-center text-blue">
                        <span className="block font-display text-[26px] font-semibold leading-none">
                          {d}
                        </span>
                        <span className="mt-[2px] text-[11px] font-bold uppercase tracking-[.08em]">
                          {m}
                        </span>
                      </span>
                      <div>
                        <h4 className="font-display text-[21px] font-semibold leading-[1.05]">
                          {title}
                        </h4>
                        <div className="mt-[5px] flex items-center gap-[7px] text-[14.5px] text-muted">
                          <span className="text-sky" aria-hidden="true">
                            📍
                          </span>
                          {loc}
                        </div>
                      </div>
                      <Badge variant={variant} className="max-[600px]:hidden">
                        {cat}
                      </Badge>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          ))}
        </Container>
      </section>
    </>
  )
}
