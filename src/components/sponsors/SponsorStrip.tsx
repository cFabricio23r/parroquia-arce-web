import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import type { SponsorView } from '@/lib/sponsors'

/** Franja de gratitud al final de la portada. Sin patrocinadores activos no se renderiza. */
export function SponsorStrip({ sponsors }: { sponsors: SponsorView[] }) {
  if (!sponsors.length) return null
  return (
    <section
      aria-labelledby="sponsor-strip"
      className="border-y border-line-soft bg-bg-soft py-[clamp(36px,6vw,48px)]"
    >
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-[6px] text-[12px] font-bold uppercase tracking-[.14em] text-blue">
              Con gratitud
            </p>
            <h2
              id="sponsor-strip"
              className="font-display text-[clamp(26px,3.4vw,32px)] font-medium text-navy-deep"
            >
              Gracias a quienes sostienen esta página
            </h2>
          </div>
          <Link
            href="/patrocinadores"
            className="inline-flex min-h-11 items-center text-[15px] font-semibold text-blue underline-offset-4 hover:underline"
          >
            Conocé a nuestros patrocinadores →
          </Link>
        </div>
        <ul className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {sponsors.map((s) => (
            <li key={s.id}>
              <Link
                href="/patrocinadores"
                className="flex h-full flex-col items-center gap-4 rounded-lg border border-line-soft bg-white p-5 text-text transition-colors hover:border-sky"
              >
                {/* Caja fija + object-contain: el logo apaisado se ve entero.
                    alt vacío: el nombre visible ya nombra el enlace; con el alt se leería dos veces. */}
                <span className="grid h-[120px] w-full place-items-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.logo.url}
                    alt=""
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                </span>
                <span className="max-w-full break-words text-center text-[16px] font-semibold leading-snug">
                  {s.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
