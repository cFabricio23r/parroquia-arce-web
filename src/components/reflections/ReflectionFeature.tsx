import React from 'react'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { weekRangeLabel, type ReflectionView } from '@/lib/reflections'
import { PreacherBadge } from './PreacherBadge'

/** Tarjeta de la reflexion de la semana para la portada. Sin reflexion: nada. */
export function ReflectionFeature({ reflection: r }: { reflection: ReflectionView | null }) {
  if (!r) return null
  const meta = `${weekRangeLabel(r.weekOf)}${r.durationMinutes ? ` · ${r.durationMinutes} min` : ''}`
  return (
    <section className="py-[clamp(36px,6vw,72px)]">
      <Container>
        <Link
          href={`/reflexiones/${r.slug}`}
          className="block rounded-2xl bg-navy p-[clamp(24px,4vw,44px)] text-white transition-shadow hover:shadow-lg"
        >
          <span className="block text-[13px] font-bold uppercase tracking-[0.12em] text-sky-light">
            Reflexión de la semana · {meta}
          </span>
          {r.quote ? (
            <>
              <span className="mt-3 block text-[15px] font-semibold text-[#B6C6DD]">
                Sobre el tema: {r.title}
              </span>
              <h2 className="mt-3 max-w-[30ch] text-balance font-display text-[clamp(26px,3.4vw,40px)] font-medium italic leading-[1.1] text-amber">
                “{r.quote}”
                {r.quoteRef && (
                  <span className="mt-2 block text-[16px] not-italic text-[#B6C6DD]">
                    {r.quoteRef}
                  </span>
                )}
              </h2>
            </>
          ) : (
            <h2 className="mt-3 max-w-[24ch] text-balance font-display text-[clamp(28px,3.6vw,44px)] font-medium leading-[1.05]">
              {r.title}
            </h2>
          )}
          <span className="mt-6 block">
            <PreacherBadge name={r.preacherName} photo={r.preacherPhoto} tone="dark" />
          </span>
          <span className="mt-6 inline-block font-bold text-sky-light">
            Escuchar la reflexión →
          </span>
        </Link>
        <p className="mt-4">
          <Link href="/reflexiones" className="font-semibold text-blue hover:underline">
            Ver reflexiones anteriores →
          </Link>
        </p>
      </Container>
    </section>
  )
}
