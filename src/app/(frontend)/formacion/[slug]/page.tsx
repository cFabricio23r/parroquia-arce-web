import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { RichText } from '@payloadcms/richtext-lexical/react'
import config from '@/payload.config'
import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { MediaImage } from '@/components/news/MediaImage'
import { audienceVariant, audienceLabel, formationCategoryLabel } from '@/lib/news-format'

export const revalidate = 300

async function getFormacion(slug: string) {
  const payload = await getPayload({ config: await config })
  const res = await payload.find({
    collection: 'formation',
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    limit: 1,
  })
  return res.docs[0] ?? null
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: await config })
  const res = await payload.find({
    collection: 'formation',
    where: { status: { equals: 'published' } },
    limit: 500,
    depth: 0,
  })
  return res.docs.map((f) => ({ slug: f.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const item = await getFormacion(slug)
  if (!item) return { title: 'Recurso no encontrado' }
  return { title: item.title, description: item.excerpt ?? undefined }
}

export default async function FormacionDetalle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const item = await getFormacion(slug)
  if (!item) notFound()

  const resource =
    item.resourceFile && typeof item.resourceFile === 'object' ? item.resourceFile : null

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
              <Link href="/noticias" className="hover:text-blue">
                Formación
              </Link>
              <span className="opacity-50">/</span>
              <span className="text-text">{item.title}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {item.audience && (
                <Badge variant={audienceVariant(item.audience)}>{audienceLabel(item.audience)}</Badge>
              )}
              {item.category && (
                <Badge variant="sky">{formationCategoryLabel(item.category)}</Badge>
              )}
            </div>
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
          <div className="mx-auto max-w-[70ch]">
            {item.excerpt && (
              <p className="mb-8 border-l-2 border-amber pl-4 text-[19px] leading-[1.55] text-muted">
                {item.excerpt}
              </p>
            )}
            {item.body ? (
              <div className="richtext">
                <RichText data={item.body} />
              </div>
            ) : (
              <p className="text-muted">Este recurso todavía no tiene contenido.</p>
            )}
            {resource?.url && (
              <div className="mt-8 rounded-xl border border-border bg-blue-soft p-6">
                <h2 className="mb-2 font-display text-[20px] font-medium">Material descargable</h2>
                <p className="mb-4 text-[14.5px] text-muted">
                  {resource.filename ?? 'Descargá el recurso completo.'}
                </p>
                <Button href={resource.url} variant="amber">
                  Descargar
                </Button>
              </div>
            )}
            <div className="mt-12 border-t border-line-soft pt-6">
              <Link href="/noticias" className="text-[15.5px] font-bold text-blue">
                ← Volver a formación
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </article>
  )
}
