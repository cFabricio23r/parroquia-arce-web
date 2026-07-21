import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { RichText } from '@payloadcms/richtext-lexical/react'
import config from '@/payload.config'
import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'
import { MediaImage } from '@/components/news/MediaImage'
import { PerseveranceStat } from '@/components/community/PerseveranceStat'
import { TeamList } from '@/components/community/TeamList'
import { PhotoGallery } from '@/components/community/PhotoGallery'
import { ContactLinks, hasContact } from '@/components/community/ContactLinks'
import { ChapelCard } from '@/components/community/ChapelCard'
import { SectorGroups } from '@/components/community/SectorGroups'

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

/**
 * Las ermitas publicadas de un sector. Consulta explicita y no un campo `join`:
 * la Local API usa `overrideAccess: true` por defecto, asi que el filtro de
 * `status` tiene que ser nuestro.
 */
async function getChapels(sectorId: number | string) {
  const payload = await getPayload({ config: await config })
  const res = await payload.find({
    collection: 'chapels',
    where: { sector: { equals: sectorId }, status: { equals: 'published' } },
    limit: 50,
    depth: 1,
  })
  return res.docs
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

  const chapels = await getChapels(item.id)

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
            <div className="mt-3 flex items-center gap-4">
              {item.logo && typeof item.logo === 'object' && item.logo.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.logo.url}
                  alt={item.logo.alt}
                  className="h-16 w-16 shrink-0 object-contain max-[600px]:h-12 max-[600px]:w-12"
                />
              )}
              <h1 className="max-w-[24ch] text-balance font-display text-[clamp(34px,4.6vw,58px)] font-medium leading-[1.03]">
                {item.name}
              </h1>
            </div>
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

              {chapels.length > 0 && (
                <div className="mt-10">
                  <h2 className="mb-3 font-display text-[26px] font-medium">
                    {chapels.length === 1 ? 'Ermita' : 'Ermitas'}
                  </h2>
                  {chapels.map((chapel) => (
                    <ChapelCard key={chapel.id} chapel={chapel} />
                  ))}
                </div>
              )}

              {item.groupPhoto && typeof item.groupPhoto === 'object' && item.groupPhoto.url && (
                <figure className="mt-10">
                  <div className="overflow-hidden rounded-xl [aspect-ratio:16/10]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.groupPhoto.url}
                      alt={item.groupPhoto.alt}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {item.groupPhoto.caption && (
                    <figcaption className="mt-2 text-[13.5px] text-muted">
                      {item.groupPhoto.caption}
                    </figcaption>
                  )}
                </figure>
              )}

              <PhotoGallery images={item.gallery} />
            </div>
            <aside className="max-[980px]:order-first">
              <div className="rounded-xl border border-border bg-bg-soft p-6">
                <h2 className="mb-4 font-display text-[20px] font-medium">Datos del sector</h2>
                <dl className="flex flex-col gap-4 text-[14.5px]">
                  {/* `chapelName` es el atajo para el sector de una sola ermita
                      que no quiso crear un documento. Si hay ermitas cargadas,
                      mandan ellas y el texto suelto no aparece. */}
                  {chapels.length === 0 && item.chapelName && (
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
                </dl>
              </div>
              <PerseveranceStat
                count={item.perseverance?.count}
                label={item.perseverance?.label}
              />
              <TeamList members={item.team} />
              <SectorGroups groups={item.groups} />
              {hasContact(item.contact) && (
                <div className="mt-6 rounded-xl border border-border bg-bg-soft p-6">
                  <h2 className="mb-4 font-display text-[20px] font-medium">Contacto</h2>
                  <ContactLinks contact={item.contact} />
                </div>
              )}
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
