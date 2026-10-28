import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { PreacherBadge } from '@/components/reflections/PreacherBadge'
import { ReflectionListItem } from '@/components/reflections/ReflectionListItem'
import { currentReflection, getReflections, weekRangeLabel } from '@/lib/reflections'

export const metadata: Metadata = { title: 'Reflexiones' }
export const revalidate = 300

const PAGE_SIZE = 12

export default async function ReflexionesPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string }>
}) {
  const { pagina } = await searchParams
  const n = Number.parseInt(pagina ?? '', 10)
  const page = Number.isFinite(n) && n > 0 ? n : 1

  const { docs, hasNextPage } = await getReflections({ limit: PAGE_SIZE, page })
  // Las cargadas por adelantado (weekOf futuro) no se muestran todavia.
  const current = currentReflection(docs, new Date())
  const visible = current
    ? docs.filter((d) => d.weekOf.slice(0, 10) <= current.weekOf.slice(0, 10))
    : []
  const featured = page === 1 ? current : null
  const rest = visible.filter((d) => d.slug !== featured?.slug)

  return (
    <>
      <section
        className="border-b border-line-soft"
        style={{ background: 'linear-gradient(180deg, var(--color-bg-soft), #fff)' }}
      >
        <Container>
          <div className="pb-8 pt-8 sm:pb-12 sm:pt-[54px]">
            <div className="mb-[18px] flex items-center gap-[9px] text-[13.5px] text-muted">
              <Link href="/" className="hover:text-blue">
                Inicio
              </Link>
              <span className="opacity-50">/</span>
              <span>Reflexiones</span>
            </div>
            <h1 className="font-display text-[clamp(40px,5.4vw,68px)] font-medium leading-[1.02]">
              Reflexión de la <em className="italic text-blue">semana</em>
            </h1>
            <p className="mt-4 max-w-[60ch] text-[19px] text-muted">
              Cada semana, un hermano de la escuela de predicadores comparte una reflexión sobre la
              Palabra. Escuchala cuando quieras, en casa o en camino.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-[clamp(36px,6vw,72px)]">
        <Container>
          {visible.length === 0 ? (
            <p className="text-muted">Todavía no hay reflexiones publicadas.</p>
          ) : (
            <>
              {featured && (
                <Link
                  href={`/reflexiones/${featured.slug}`}
                  className="mb-12 block rounded-2xl bg-navy p-[clamp(24px,4vw,44px)] text-white transition-shadow hover:shadow-lg"
                >
                  <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-sky-light">
                    Reflexión de la semana · {weekRangeLabel(featured.weekOf)}
                  </span>
                  <span className="mt-3 block max-w-[24ch] text-balance font-display text-[clamp(28px,3.6vw,44px)] font-medium leading-[1.05]">
                    {featured.title}
                  </span>
                  {featured.quote && (
                    <span className="mt-4 block max-w-[60ch] font-display text-[20px] italic text-amber">
                      “{featured.quote}”
                    </span>
                  )}
                  <span className="mt-6 block">
                    <PreacherBadge
                      name={featured.preacherName}
                      photo={featured.preacherPhoto}
                      tone="dark"
                    />
                  </span>
                  <span className="mt-6 inline-block font-bold text-sky-light">
                    Escuchar la reflexión →
                  </span>
                </Link>
              )}

              {rest.length > 0 && (
                <>
                  <h2 className="mb-6 font-display text-[28px] font-medium">
                    Reflexiones anteriores
                  </h2>
                  <ul className="grid list-none grid-cols-3 gap-5 p-0 max-[980px]:grid-cols-2 max-[600px]:grid-cols-1">
                    {rest.map((r) => (
                      <li key={r.slug}>
                        <ReflectionListItem reflection={r} />
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {hasNextPage && (
                <div className="mt-10 text-center">
                  <Link
                    href={`/reflexiones?pagina=${page + 1}`}
                    className="inline-flex h-12 items-center rounded-full border border-border px-6 font-bold text-blue hover:bg-blue-tint"
                  >
                    Ver más reflexiones
                  </Link>
                </div>
              )}
            </>
          )}
        </Container>
      </section>
    </>
  )
}
