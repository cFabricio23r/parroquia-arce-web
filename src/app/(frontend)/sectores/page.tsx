import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { Container } from '@/components/ui/Container'
import { PageHero } from '@/components/site/PageHero'
import { MediaImage } from '@/components/news/MediaImage'
import { Reveal } from '@/components/news/Reveal'
import { Icon } from '@/components/ui/Icon'

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
                  <Link
                    href={`/sectores/${s.slug}`}
                    className="card-hover group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-white"
                  >
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
                          <Icon name="pin" className="h-[15px] w-[15px] flex-none text-sky" />
                          {s.location.address}
                        </div>
                      )}
                      {s.summary && (
                        <p className="mt-3 text-[14px] leading-[1.5] text-muted">{s.summary}</p>
                      )}
                      <div className="mt-auto pt-[18px]">
                        {s.chapelName && (
                          <p className="mb-[10px] text-[13px] font-bold text-blue">
                            {s.chapelName}
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
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  )
}
