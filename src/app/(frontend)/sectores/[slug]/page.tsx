import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { RichText } from '@payloadcms/richtext-lexical/react'
import config from '@/payload.config'
import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'
import { MediaImage } from '@/components/news/MediaImage'

export const revalidate = 300

async function getSector(slug: string) {
  const payload = await getPayload({ config: await config })
  const res = await payload.find({
    collection: 'sectors',
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    limit: 1,
  })
  return res.docs[0] ?? null
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: await config })
  const res = await payload.find({
    collection: 'sectors',
    where: { status: { equals: 'published' } },
    limit: 500,
    depth: 0,
  })
  return res.docs.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const item = await getSector(slug)
  if (!item) return { title: 'Sector no encontrado' }
  return { title: item.name, description: item.summary ?? undefined }
}

export default async function SectorDetalle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const item = await getSector(slug)
  if (!item) notFound()

  const assistants = (item.assistants ?? []).map((a) => a.name).filter(Boolean)

  return (
    <article>
      <section
        className="border-b border-line-soft"
        style={{ background: 'linear-gradient(180deg, var(--color-bg-soft), #fff)' }}
      >
        <Container>
          <div className="pb-10 pt-[54px]">
            <div className="mb-[18px] flex flex-wrap items-center gap-[9px] text-[13.5px] text-muted">
              <Link href="/" className="hover:text-blue">
                Inicio
              </Link>
              <span className="opacity-50">/</span>
              <Link href="/sectores" className="hover:text-blue">
                Sectores
              </Link>
              <span className="opacity-50">/</span>
              <span className="text-text">{item.name}</span>
            </div>
            {item.number != null && <Badge variant="blue">Sector #{item.number}</Badge>}
            <h1 className="mt-3 max-w-[24ch] text-balance font-display text-[clamp(34px,4.6vw,58px)] font-medium leading-[1.03]">
              {item.name}
            </h1>
            {item.summary && (
              <p className="mt-4 max-w-[60ch] text-[19px] text-muted">{item.summary}</p>
            )}
          </div>
        </Container>
      </section>

      {item.cover && typeof item.cover === 'object' && (
        <Container>
          <div className="mt-10 overflow-hidden rounded-xl [aspect-ratio:16/8] max-[600px]:[aspect-ratio:16/10]">
            <MediaImage cover={item.cover} />
          </div>
        </Container>
      )}

      <section className="py-[clamp(40px,6vw,72px)]">
        <Container>
          <div className="grid grid-cols-[1fr_300px] gap-12 max-[980px]:grid-cols-1">
            <div className="max-w-[70ch]">
              <div className="richtext">
                {item.description ? (
                  <RichText data={item.description} />
                ) : (
                  <p className="text-muted">Pronto habrá más información sobre este sector.</p>
                )}
              </div>
              {item.history && (
                <div className="mt-10">
                  <h2 className="mb-3 font-display text-[26px] font-medium">Historia</h2>
                  <div className="richtext">
                    <RichText data={item.history} />
                  </div>
                </div>
              )}
            </div>
            <aside className="max-[980px]:order-first">
              <div className="rounded-xl border border-border bg-bg-soft p-6">
                <h2 className="mb-4 font-display text-[20px] font-medium">Datos del sector</h2>
                <dl className="flex flex-col gap-4 text-[14.5px]">
                  {item.chapelName && (
                    <div>
                      <dt className="text-[12px] font-bold uppercase tracking-[.1em] text-muted">Ermita</dt>
                      <dd className="mt-1">{item.chapelName}</dd>
                    </div>
                  )}
                  {item.location?.address && (
                    <div>
                      <dt className="text-[12px] font-bold uppercase tracking-[.1em] text-muted">
                        Ubicación
                      </dt>
                      <dd className="mt-1">{item.location.address}</dd>
                    </div>
                  )}
                  {item.responsibleName && (
                    <div>
                      <dt className="text-[12px] font-bold uppercase tracking-[.1em] text-muted">
                        Responsable
                      </dt>
                      <dd className="mt-1">{item.responsibleName}</dd>
                    </div>
                  )}
                  {assistants.length > 0 && (
                    <div>
                      <dt className="text-[12px] font-bold uppercase tracking-[.1em] text-muted">
                        Colaboradores
                      </dt>
                      <dd className="mt-1">{assistants.join(', ')}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </aside>
          </div>
          <div className="mt-12 border-t border-line-soft pt-6">
            <Link href="/sectores" className="text-[15.5px] font-bold text-blue">
              ← Volver a los sectores
            </Link>
          </div>
        </Container>
      </section>
    </article>
  )
}
