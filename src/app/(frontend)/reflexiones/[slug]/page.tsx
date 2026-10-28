import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from 'lexical'
import { Container } from '@/components/ui/Container'
import { ReflectionPlayer } from '@/components/reflections/ReflectionPlayer'
import { PreacherBadge } from '@/components/reflections/PreacherBadge'
import { ReflectionListItem } from '@/components/reflections/ReflectionListItem'
import { hasRichText } from '@/lib/rich-text'
import { getReflectionBySlug, getReflections, weekRangeLabel } from '@/lib/reflections'

export const revalidate = 300

export async function generateStaticParams() {
  const { docs } = await getReflections({ limit: 100 })
  return docs.map((r) => ({ slug: r.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const r = await getReflectionBySlug(slug)
  if (!r) return { title: 'Reflexión no encontrada' }
  return { title: r.title, description: r.quote ?? r.title }
}

export default async function ReflexionDetalle({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const r = await getReflectionBySlug(slug)
  if (!r) notFound()

  // Solo semanas anteriores a esta (weekOf menor); la query ya filtra y ordena.
  const { docs: previous } = await getReflections({ limit: 3, before: r.weekOf.slice(0, 10) })

  return (
    <article>
      <section className="bg-navy text-white">
        <Container>
          <div className="pb-[72px] pt-8 sm:pt-[54px]">
            <nav aria-label="Migas de pan" className="mb-[18px] flex flex-wrap items-center gap-[9px] text-[13.5px] text-white/70">
              <Link href="/" className="hover:text-white">
                Inicio
              </Link>
              <span className="opacity-50">/</span>
              <Link href="/reflexiones" className="hover:text-white">
                Reflexiones
              </Link>
              <span className="opacity-50">/</span>
              <span aria-current="page" className="text-white">
                {r.title}
              </span>
            </nav>
            <div className="text-[13px] font-bold uppercase tracking-[0.12em] text-sky-light">
              Reflexión de la semana · {weekRangeLabel(r.weekOf)}
            </div>
            <h1 className="mt-3 max-w-[24ch] text-balance font-display text-[clamp(34px,4.6vw,58px)] font-medium leading-[1.03]">
              {r.title}
            </h1>
            {r.quote && (
              <p className="mt-5 max-w-[60ch] font-display text-[clamp(19px,2.2vw,24px)] italic leading-snug text-amber">
                “{r.quote}”
                {r.quoteRef && (
                  <span className="mt-1 block text-[15px] not-italic text-white/70">
                    {r.quoteRef}
                  </span>
                )}
              </p>
            )}
            <div className="mt-6">
              <PreacherBadge name={r.preacherName} photo={r.preacherPhoto} tone="dark" />
            </div>
          </div>
        </Container>
      </section>

      <Container>
        <div className="-mt-8 mb-10">
          <ReflectionPlayer src={r.audioUrl} title={r.title} />
        </div>
      </Container>

      <section className="pb-[clamp(40px,6vw,72px)]">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div>
              {hasRichText(r.body) && (
                <>
                  <h2 className="mb-4 font-display text-[28px] font-medium">Sobre el tema</h2>
                  <div className="richtext max-w-[70ch]">
                    <RichText data={r.body as SerializedEditorState} />
                  </div>
                </>
              )}
            </div>
            {previous.length > 0 && (
              <aside aria-labelledby="anteriores" className="flex flex-col gap-4">
                <h2 id="anteriores" className="font-display text-[22px] font-medium">
                  Reflexiones anteriores
                </h2>
                <ul className="flex list-none flex-col gap-4 p-0">
                  {previous.map((p) => (
                    <li key={p.slug}>
                      <ReflectionListItem reflection={p} />
                    </li>
                  ))}
                </ul>
                <Link href="/reflexiones" className="text-[15.5px] font-bold text-blue">
                  Ver todas las reflexiones →
                </Link>
              </aside>
            )}
          </div>
        </Container>
      </section>
    </article>
  )
}
