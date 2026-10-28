import React from 'react'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { weekRangeLabel, type ReflectionView } from '@/lib/reflections'
import { PreacherBadge } from './PreacherBadge'

/** Tarjeta de la reflexion de la semana para la portada. Sin reflexion: nada. */
export function ReflectionFeature({ reflection: r }: { reflection: ReflectionView | null }) {
  if (!r) return null
  return (
    <section className="py-[clamp(36px,6vw,72px)]">
      <Container>
        <div className="mb-[26px] flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.14em] text-blue">
              Reflexión de la semana
            </p>
            <h2 className="font-display text-[clamp(30px,4vw,44px)] font-medium leading-[1.05] text-navy">
              Una palabra para tu semana
            </h2>
          </div>
          <Link href="/reflexiones" className="text-[15px] font-semibold text-blue hover:underline">
            Ver reflexiones anteriores →
          </Link>
        </div>

        <Link
          href={`/reflexiones/${r.slug}`}
          className="flex flex-wrap overflow-hidden rounded-[26px] border border-line-soft bg-white shadow-[0_12px_28px_-14px_rgba(5,23,51,.18),0_3px_8px_rgba(5,23,51,.05)] transition-shadow hover:shadow-lg"
        >
          <div className="flex min-h-[260px] flex-[1_1_340px] flex-col justify-between gap-8 bg-navy p-[clamp(24px,4vw,40px)]">
            <PreacherBadge
              name={r.preacherName}
              photo={r.preacherPhoto}
              tone="dark"
              size="lg"
              subtitle="Escuela de predicadores"
            />
            <div className="flex items-center gap-[14px]">
              <span
                aria-hidden="true"
                className="flex h-14 w-14 items-center justify-center rounded-full bg-amber"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8 5v14l11-7z" fill="#051733" />
                </svg>
              </span>
              <div>
                <p className="text-[16px] font-semibold text-white">Escuchar la reflexión</p>
                <p className="mt-0.5 text-[14px] text-[#B6C6DD]">
                  {r.durationMinutes ? `Audio · ${r.durationMinutes} min` : 'Audio'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-[999_1_480px] flex-col justify-center gap-[18px] p-[clamp(24px,4vw,44px)] lg:px-12">
            <p className="text-[13px] text-muted">Semana del {weekRangeLabel(r.weekOf)}</p>
            {r.quote ? (
              <>
                <p className="font-display text-[clamp(24px,3vw,34px)] italic leading-[1.2] text-navy">
                  «{r.quote}»{r.quoteRef ? ` ${r.quoteRef}` : ''}
                </p>
                <div aria-hidden="true" className="h-[3px] w-11 rounded-sm bg-amber" />
                <p className="text-[16px] text-muted">
                  Tema: <strong className="font-semibold text-text">{r.title}</strong>
                </p>
              </>
            ) : (
              <>
                <p className="font-display text-[clamp(24px,3vw,34px)] leading-[1.2] text-navy">
                  {r.title}
                </p>
                <div aria-hidden="true" className="h-[3px] w-11 rounded-sm bg-amber" />
              </>
            )}
          </div>
        </Link>
      </Container>
    </section>
  )
}
