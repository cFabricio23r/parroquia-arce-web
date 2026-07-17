import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@/payload.config'
import type { News } from '@/payload-types'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/news/Reveal'
import { LeadCard } from '@/components/news/LeadCard'
import { MiniNews } from '@/components/news/MiniNews'
import { FormationCard } from '@/components/news/FormationCard'

export const metadata: Metadata = {
  title: 'Noticias y formación',
}

// ISR: la web casi no golpea Postgres.
export const revalidate = 300

export default async function NoticiasPage() {
  const payload = await getPayload({ config: await config })

  // 1. Destacada: la featured mas reciente; si no hay, la mas reciente a secas.
  const featuredRes = await payload.find({
    collection: 'news',
    where: { status: { equals: 'published' }, isFeatured: { equals: true } },
    sort: '-publishedAt',
    limit: 1,
  })
  // 2. Recientes: hasta 5, para descontar la destacada y quedarnos con 4.
  const recientesRes = await payload.find({
    collection: 'news',
    where: { status: { equals: 'published' } },
    sort: '-publishedAt',
    limit: 5,
  })
  // 3. Formacion: hasta 3.
  const formacionRes = await payload.find({
    collection: 'formation',
    where: { status: { equals: 'published' } },
    sort: '-publishedAt',
    limit: 3,
  })

  const featured: News | undefined = featuredRes.docs[0] ?? recientesRes.docs[0]
  const sideStack = recientesRes.docs.filter((n) => n.id !== featured?.id).slice(0, 4)
  const formacion = formacionRes.docs

  return (
    <>
      {/* Page hero — ds.css:146-153 */}
      <section
        className="border-b border-line-soft"
        style={{ background: 'linear-gradient(180deg, var(--color-bg-soft), #fff)' }}
      >
        <Container>
          <div className="pb-12 pt-[54px]">
            <div className="mb-[18px] flex items-center gap-[9px] text-[13.5px] text-muted">
              <span>Inicio</span>
              <span className="opacity-50">/</span>
              <span>Noticias y formación</span>
            </div>
            <h1 className="font-display text-[clamp(40px,5.4vw,68px)] font-medium leading-[1.02]">
              Noticias y <em className="italic text-blue">formación</em>
            </h1>
            <p className="mt-4 max-w-[60ch] text-[19px] text-muted">
              Avisos oficiales, crónicas de la comunidad y material de formación católica —
              ordenados para no depender solo de redes sociales.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-[clamp(56px,7vw,96px)]">
        <Container>
          {featured ? (
            <div className="mb-10 grid grid-cols-[1.4fr_1fr] gap-6 max-[980px]:grid-cols-1">
              <Reveal>
                <LeadCard item={featured} />
              </Reveal>
              {sideStack.length > 0 && (
                <Reveal className="flex flex-col gap-4">
                  {sideStack.map((n) => (
                    <MiniNews key={n.id} item={n} />
                  ))}
                </Reveal>
              )}
            </div>
          ) : (
            <p className="text-muted">Aún no hay noticias publicadas.</p>
          )}

          {formacion.length > 0 && (
            <>
              <Reveal className="mb-[30px] mt-[54px] flex items-center gap-4">
                <h2 className="whitespace-nowrap font-display text-[32px] font-medium">
                  Formación católica
                </h2>
                <span className="h-px flex-1 bg-border" />
              </Reveal>
              <div className="grid grid-cols-3 gap-[22px] max-[980px]:grid-cols-2 max-[600px]:grid-cols-1">
                {formacion.map((f) => (
                  <Reveal key={f.id}>
                    <FormationCard item={f} />
                  </Reveal>
                ))}
              </div>
            </>
          )}
        </Container>
      </section>
    </>
  )
}
