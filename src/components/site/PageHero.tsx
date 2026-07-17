import Link from 'next/link'
import { Container } from '@/components/ui/Container'

type Crumb = { label: string; href?: string }

/**
 * Hero de las paginas internas — ds.css:146-153.
 * `title` + `emphasis` (la palabra en azul italica del demo).
 */
export function PageHero({
  crumbs,
  title,
  emphasis,
  lead,
}: {
  crumbs: Crumb[]
  title: string
  emphasis: string
  lead: string
}) {
  return (
    <section
      className="border-b border-line-soft"
      style={{ background: 'linear-gradient(180deg, var(--color-bg-soft), #fff)' }}
    >
      <Container>
        <div className="pb-12 pt-[54px]">
          <div className="mb-[18px] flex items-center gap-[9px] text-[13.5px] text-muted">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-[9px]">
                {i > 0 && <span className="opacity-50">/</span>}
                {c.href ? (
                  <Link href={c.href} className="hover:text-blue">
                    {c.label}
                  </Link>
                ) : (
                  <span>{c.label}</span>
                )}
              </span>
            ))}
          </div>
          <h1 className="font-display text-[clamp(40px,5.4vw,68px)] font-medium leading-[1.02] tracking-[-.01em]">
            {title} <em className="italic text-blue">{emphasis}</em>
          </h1>
          <p className="mt-4 max-w-[60ch] text-[19px] text-muted">{lead}</p>
        </div>
      </Container>
    </section>
  )
}
