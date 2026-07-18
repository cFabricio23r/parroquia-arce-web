import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { Container } from '@/components/ui/Container'
import { PageHero } from '@/components/site/PageHero'
import { MediaImage } from '@/components/news/MediaImage'
import { Reveal } from '@/components/news/Reveal'

export const metadata: Metadata = { title: 'Sectores y ermitas' }
export const revalidate = 300

export default async function SectoresPage() {
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection: 'sectors',
    where: { status: { equals: 'published' } },
    sort: 'number',
    limit: 50,
  })

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Inicio', href: '/' }, { label: 'Sectores y ermitas' }]}
        title="Sectores y"
        emphasis="ermitas"
        lead="La parroquia vive en sus comunidades. Encuentra tu sector, su ermita, horarios de misa, responsables y actividades cercanas."
      />

      <section className="py-[clamp(56px,7vw,96px)]">
        <Container>
          {docs.length === 0 ? (
            <p className="text-muted">
              Aún no hay sectores publicados. El equipo parroquial los carga desde el panel.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-[22px] max-[980px]:grid-cols-2 max-[600px]:grid-cols-1">
              {docs.map((s) => (
                <Reveal key={s.id}>
                  <article className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-white">
                    <div className="relative h-[170px]">
                      <MediaImage cover={s.cover} />
                      {s.number != null && (
                        <span className="absolute left-[14px] top-[14px] rounded-pill bg-white/[.92] px-[13px] py-[5px] font-display text-[15px] font-semibold text-blue">
                          Sector #{s.number}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="font-display text-[23px] font-semibold leading-[1.05]">
                        {s.name}
                      </h3>
                      {s.location?.address && (
                        <div className="mt-[7px] flex items-center gap-[7px] text-[13.5px] text-muted">
                          <span className="text-sky" aria-hidden="true">
                            📍
                          </span>
                          {s.location.address}
                        </div>
                      )}
                      {s.summary && (
                        <p className="mt-3 text-[14px] leading-[1.5] text-muted">{s.summary}</p>
                      )}
                      {s.chapelName && (
                        <div className="mt-auto pt-[18px] text-[13px] font-bold text-blue">
                          {s.chapelName}
                        </div>
                      )}
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  )
}
