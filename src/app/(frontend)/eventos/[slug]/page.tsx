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

const eventTypeLabel = (t?: string | null) =>
  t ? t.charAt(0).toUpperCase() + t.slice(1).replace('-', ' ') : 'Evento'

async function getEvento(slug: string) {
  const payload = await getPayload({ config: await config })
  const res = await payload.find({
    collection: 'events',
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    limit: 1,
  })
  return res.docs[0] ?? null
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: await config })
  const res = await payload.find({
    collection: 'events',
    where: { status: { equals: 'published' } },
    limit: 500,
    depth: 0,
  })
  return res.docs.map((e) => ({ slug: e.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const item = await getEvento(slug)
  if (!item) return { title: 'Evento no encontrado' }
  return { title: item.title }
}

export default async function EventoDetalle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const item = await getEvento(slug)
  if (!item) notFound()

  const start = new Date(item.startsAt)
  const fecha = start.toLocaleDateString('es-SV', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const hora = start.toLocaleTimeString('es-SV', { hour: 'numeric', minute: '2-digit' })

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
              <Link href="/eventos" className="hover:text-blue">
                Eventos
              </Link>
              <span className="opacity-50">/</span>
              <span className="text-text">{item.title}</span>
            </div>
            <Badge variant="amber">{eventTypeLabel(item.eventType)}</Badge>
            <h1 className="mt-3 max-w-[24ch] text-balance font-display text-[clamp(34px,4.6vw,58px)] font-medium leading-[1.03]">
              {item.title}
            </h1>
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
            <div className="richtext max-w-[70ch]">
              {item.description ? (
                <RichText data={item.description} />
              ) : (
                <p className="text-muted">Pronto habrá más información sobre este evento.</p>
              )}
            </div>
            <aside className="max-[980px]:order-first">
              <div className="rounded-xl border border-border bg-bg-soft p-6">
                <h2 className="mb-4 font-display text-[20px] font-medium">Detalles</h2>
                <dl className="flex flex-col gap-4 text-[14.5px]">
                  <div>
                    <dt className="font-bold uppercase tracking-[.1em] text-[12px] text-muted">Cuándo</dt>
                    <dd className="mt-1 capitalize">{fecha}</dd>
                    <dd className="text-muted">{hora}</dd>
                  </div>
                  <div>
                    <dt className="font-bold uppercase tracking-[.1em] text-[12px] text-muted">Dónde</dt>
                    <dd className="mt-1">{item.locationName}</dd>
                  </div>
                </dl>
              </div>
            </aside>
          </div>
          <div className="mt-12 border-t border-line-soft pt-6">
            <Link href="/eventos" className="text-[15.5px] font-bold text-blue">
              ← Volver a la agenda
            </Link>
          </div>
        </Container>
      </section>
    </article>
  )
}
