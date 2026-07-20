import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'
import { Icon } from '@/components/ui/Icon'
import config from '@/payload.config'
import { Container } from '@/components/ui/Container'
import { PageHero } from '@/components/site/PageHero'
import { Badge } from '@/components/ui/Badge'
import { Reveal } from '@/components/news/Reveal'

export const metadata: Metadata = { title: 'Grupos y ministerios' }
export const revalidate = 300

const typeMeta: Record<string, { label: string; variant: 'blue' | 'sky' | 'amber' }> = {
  pastoral: { label: 'Pastoral', variant: 'blue' },
  ministerio: { label: 'Ministerio', variant: 'sky' },
  comunidad: { label: 'Comunidad', variant: 'sky' },
  servicio: { label: 'Servicio', variant: 'amber' },
  formacion: { label: 'Formación', variant: 'blue' },
}

export default async function GruposPage() {
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection: 'groups',
    where: { status: { equals: 'published' } },
    sort: 'name',
    limit: 50,
  })

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Inicio', href: '/' }, { label: 'Grupos y ministerios' }]}
        title="Grupos y"
        emphasis="ministerios"
        lead="Espacios para servir, formarse y crecer en fe junto a otros. Encuentra la comunidad donde poner tus dones al servicio de la parroquia."
      />

      <section className="py-[clamp(56px,7vw,96px)]">
        <Container>
          {docs.length === 0 ? (
            <p className="text-muted">
              Aún no hay grupos publicados. El equipo parroquial los carga desde el panel.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-[22px] max-[980px]:grid-cols-2 max-[600px]:grid-cols-1">
              {docs.map((g) => {
                const meta = g.type ? typeMeta[g.type] : undefined
                return (
                  <Reveal key={g.id}>
                    <Link
                      href={`/grupos/${g.slug}`}
                      className="group flex h-full flex-col rounded-lg border border-border bg-white p-7 transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      {meta && (
                        <Badge variant={meta.variant} className="self-start">
                          {meta.label}
                        </Badge>
                      )}
                      <h3 className="my-[14px_0_8px] font-display text-[23px] font-semibold leading-[1.06]">
                        {g.name}
                      </h3>
                      {g.summary && (
                        <p className="text-[14.5px] leading-[1.5] text-muted">{g.summary}</p>
                      )}
                      <div className="my-[18px] flex flex-col gap-2">
                        {(g.meeting?.day || g.meeting?.time) && (
                          <div className="flex items-center gap-[9px] text-[14px] font-semibold text-[#3A4A60]">
                            <Icon name="clock" className="h-[15px] w-[15px] flex-none text-sky" />
                            {[g.meeting?.day, g.meeting?.time].filter(Boolean).join(' · ')}
                          </div>
                        )}
                        {g.meeting?.place && (
                          <div className="flex items-center gap-[9px] text-[14px] font-semibold text-[#3A4A60]">
                            <Icon name="pin" className="h-[15px] w-[15px] flex-none text-sky" />
                            {g.meeting.place}
                          </div>
                        )}
                      </div>
                    </Link>
                  </Reveal>
                )
              })}
            </div>
          )}
        </Container>
      </section>
    </>
  )
}
