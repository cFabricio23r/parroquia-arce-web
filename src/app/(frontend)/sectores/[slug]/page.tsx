import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { RichText } from '@payloadcms/richtext-lexical/react'
import config from '@/payload.config'
import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'
import { TeamList } from '@/components/community/TeamList'
import { PhotoGallery } from '@/components/community/PhotoGallery'
import { ContactLinks, hasContact } from '@/components/community/ContactLinks'
import { MapLink, hasLocation } from '@/components/community/MapLink'
import { SectorStats } from '@/components/community/SectorStats'
import { SidebarCard } from '@/components/community/SidebarCard'
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

  // La portada pasa a ser el fondo del hero. Cuando no hay, el hero cae al
  // degradado de siempre — que hoy es el caso de 2 de los 3 sectores, asi que el
  // fallback es el estado normal y no el excepcional.
  const cover = typeof item.cover === 'object' && item.cover?.url ? item.cover : null
  const onPhoto = Boolean(cover)
  const crumbClass = onPhoto ? 'text-white/75' : 'text-muted'
  const crumbHover = onPhoto ? 'hover:text-white' : 'hover:text-blue'
  const leadClass = onPhoto ? 'text-white/85' : 'text-muted'

  // El mismo filtro que aplica TeamList. Sin el, el numero diria 14 mientras la
  // grilla muestra 13.
  const team = (item.team ?? []).filter((m) => m?.name)

  return (
    <article>
      <section className="relative isolate overflow-hidden border-b border-line-soft">
        {cover ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover.url as string}
              alt={cover.alt}
              className="absolute inset-0 -z-10 h-full w-full object-cover"
            />
            {/* DOS capas, no una, y la de abajo es una BANDA anclada al pie —
                no un degradado que cubre todo el hero.

                La diferencia importa y se midio: un degradado repartido en toda
                la altura llega al breadcrumb (que cae a ~35% del hero) con alfa
                .43, o sea 2.2:1. Reprobaba AA por lejos. Una banda de altura fija
                termina de cerrar ANTES de donde arranca el texto, asi que el
                contraste ya no depende de cuanto mida el hero ni de cuantas
                lineas ocupe el titulo.

                Arriba de la banda queda solo el tinte base al 20%: ahi es donde
                la foto se aprecia, que es el punto de subir la altura.

                Peor caso medido (foto totalmente blanca): el alfa bajo el texto
                nunca baja de .79. Si alguien afloja la banda, el breadcrumb en
                white/75 es lo primero que se rompe. */}
            <div
              className="absolute inset-0 -z-10"
              style={{ background: 'rgba(11,26,45,.20)' }}
              aria-hidden="true"
            />
            <div
              className="absolute inset-x-0 bottom-0 -z-10 h-[min(340px,100%)]"
              style={{
                background:
                  'linear-gradient(180deg, rgba(11,26,45,0) 0%, rgba(11,26,45,.70) 14%, rgba(11,26,45,.86) 40%, rgba(11,26,45,.9) 100%)',
              }}
              aria-hidden="true"
            />
          </>
        ) : (
          <div
            className="absolute inset-0 -z-10"
            style={{ background: 'linear-gradient(180deg, var(--color-bg-soft), #fff)' }}
            aria-hidden="true"
          />
        )}
        <Container>
          {/* Con portada el hero reserva altura real para que se aprecie la foto,
              y el texto se ancla ABAJO: es donde el degradado esta mas cerrado, o
              sea que lo mismo que hace legible el titulo es lo que deja ver la
              imagen arriba. Sin portada no hay nada que apreciar, asi que
              conserva la altura compacta de siempre. */}
          <div
            className={
              onPhoto
                ? 'flex min-h-[clamp(460px,64vh,680px)] flex-col justify-end pb-14 pt-[54px] text-white'
                : 'pb-10 pt-[54px]'
            }
          >
            <div
              className={`mb-[18px] flex flex-wrap items-center gap-[9px] text-[13.5px] ${crumbClass}`}
            >
              <Link href="/" className={crumbHover}>
                Inicio
              </Link>
              <span className="opacity-50">/</span>
              <Link href="/sectores" className={crumbHover}>
                Sectores
              </Link>
              <span className="opacity-50">/</span>
              <span className={onPhoto ? 'text-white' : 'text-text'}>{item.name}</span>
            </div>
            {item.number != null &&
              (onPhoto ? (
                <span className="inline-block rounded-pill bg-white/[.92] px-[13px] py-[5px] font-display text-[15px] font-semibold text-blue">
                  Sector #{item.number}
                </span>
              ) : (
                <Badge variant="blue">Sector #{item.number}</Badge>
              ))}
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
              <p className={`mt-4 max-w-[60ch] text-[19px] ${leadClass}`}>{item.summary}</p>
            )}
          </div>
        </Container>
      </section>

      <Container>
        <div className="mt-10">
          <SectorStats
            perseverance={item.perseverance}
            teamCount={team.length}
            chapelCount={chapels.length}
            groupCount={(item.groups ?? []).length}
          />
        </div>
      </Container>

      <section className="py-[clamp(40px,6vw,72px)]">
        <Container>
          <div className="grid grid-cols-[1fr_300px] gap-12 max-[980px]:grid-cols-1">
            <div className="max-w-[70ch]">
              {/* `history` es el cuerpo. `description` estaba vacio en el 100% de
                  los sectores y ocupaba este lugar, asi que la pagina mostraba el
                  texto de relleno mientras la historia real quedaba de segundona. */}
              <div className="richtext">
                {item.history ? (
                  <RichText data={item.history} />
                ) : (
                  <p className="text-muted">Pronto habrá más información sobre este sector.</p>
                )}
              </div>

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
              {/* `sticky` con `static` en movil: ahi el aside es `order-first`, y
                  un sticky pegaria el bloque entero arriba del contenido. */}
              <div className="sticky top-6 max-[980px]:static">
                {(hasLocation(item.location) || (chapels.length === 0 && item.chapelName)) && (
                  <SidebarCard icon="pin" title="Datos del sector">
                    <dl className="flex flex-col gap-4 text-[14.5px]">
                      {/* `chapelName` es el atajo para el sector de una sola ermita
                          que no quiso crear un documento. Si hay ermitas cargadas,
                          mandan ellas y el texto suelto no aparece. */}
                      {chapels.length === 0 && item.chapelName && (
                        <div>
                          <dt className="text-[12px] font-bold uppercase tracking-[.1em] text-muted">
                            Ermita
                          </dt>
                          <dd className="mt-1">{item.chapelName}</dd>
                        </div>
                      )}
                      {hasLocation(item.location) && (
                        <div>
                          <dt className="text-[12px] font-bold uppercase tracking-[.1em] text-muted">
                            Ubicación
                          </dt>
                          <dd className="mt-2">
                            <MapLink location={item.location} />
                          </dd>
                        </div>
                      )}
                    </dl>
                  </SidebarCard>
                )}
                {/* La perseverancia ya vive en SectorStats, arriba y mas grande.
                    Repetirla aca seria decir el mismo numero dos veces. */}
                <SectorGroups groups={item.groups} />
                {hasContact(item.contact) && (
                  <SidebarCard icon="phone" title="Contacto" className="mt-6">
                    <ContactLinks contact={item.contact} />
                  </SidebarCard>
                )}
              </div>
            </aside>
          </div>

          {team.length > 0 && (
            <section className="mt-12 border-t border-line-soft pt-10">
              <h2 className="mb-4 font-display text-[26px] font-medium">Equipo del sector</h2>
              <TeamList members={item.team} variant="grid" />
            </section>
          )}

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
