import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { RichText } from '@payloadcms/richtext-lexical/react'
import config from '@/payload.config'
import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'
import { MediaImage } from '@/components/news/MediaImage'
import { newsCategoryVariant, newsCategoryLabel, formatDate } from '@/lib/news-format'

export const revalidate = 300

async function getNoticia(slug: string) {
  const payload = await getPayload({ config: await config })
  const res = await payload.find({
    collection: 'news',
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    limit: 1,
  })
  return res.docs[0] ?? null
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: await config })
  const res = await payload.find({
    collection: 'news',
    where: { status: { equals: 'published' } },
    limit: 500,
    depth: 0,
  })
  return res.docs.map((n) => ({ slug: n.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const item = await getNoticia(slug)
  if (!item) return { title: 'Noticia no encontrada' }
  return { title: item.title, description: item.excerpt ?? undefined }
}

export default async function NoticiaDetalle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const item = await getNoticia(slug)
  if (!item) notFound()

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
                Noticias
              </Link>
              <span className="opacity-50">/</span>
              <span className="text-text">{item.title}</span>
            </div>
            {item.category && (
              <Badge variant={newsCategoryVariant(item.category)}>
                {newsCategoryLabel(item.category)}
              </Badge>
            )}
            <h1 className="mt-3 max-w-[24ch] text-balance font-display text-[clamp(34px,4.6vw,58px)] font-medium leading-[1.03]">
              {item.title}
            </h1>
            {item.publishedAt && (
              <div className="mt-4 text-[14.5px] font-semibold text-muted">
                {formatDate(item.publishedAt)}
              </div>
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
              <p className="text-muted">Esta noticia todavía no tiene contenido.</p>
            )}
            <div className="mt-12 border-t border-line-soft pt-6">
              <Link href="/noticias" className="text-[15.5px] font-bold text-blue">
                ← Volver a noticias
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </article>
  )
}
