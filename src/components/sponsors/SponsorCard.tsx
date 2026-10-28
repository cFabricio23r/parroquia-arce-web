import type { SponsorView } from '@/lib/sponsors'

const linkBase =
  'inline-flex min-h-11 items-center gap-2 rounded-pill px-4 text-[14px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue [transition:background_.2s,color_.2s]'
const filled = 'bg-blue text-white hover:bg-blue-700'
const outlined = 'border border-blue text-blue hover:bg-blue-soft'

/** Tarjeta de patrocinador de /patrocinadores. Solo pinta los botones de red que existen. */
export function SponsorCard({ sponsor }: { sponsor: SponsorView }) {
  const { name, logo, category, blurb, facebookUrl, instagramUrl } = sponsor
  return (
    <article className="flex h-full min-w-0 flex-col gap-[14px] rounded-lg border border-border bg-white p-6 shadow-sm">
      <div className="flex items-center gap-[14px]">
        {/* Cuadrado (los logos suelen serlo) en la imagen misma + object-contain: se ve entero, sin
            recorte ni deformar. Una caja grid con h-full dejaba que la imagen la desbordara. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logo.url}
          alt={logo.alt}
          className="h-24 w-24 flex-none rounded-md border border-line-soft bg-white object-contain p-1"
          loading="lazy"
        />
        <div className="min-w-0">
          <h2 className="break-words font-display text-[22px] font-semibold leading-tight text-navy-deep">
            {name}
          </h2>
          {category && <p className="mt-0.5 text-[14px] text-muted">{category}</p>}
        </div>
      </div>
      {blurb && <p className="text-[16px] leading-[1.55]">{blurb}</p>}
      {(facebookUrl || instagramUrl) && (
        <div className="mt-auto flex flex-wrap gap-[10px]">
          {facebookUrl && (
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name} en Facebook (se abre en otra pestaña)`}
              className={`${linkBase} ${filled}`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
              Facebook
            </a>
          )}
          {instagramUrl && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name} en Instagram (se abre en otra pestaña)`}
              // Solo, va lleno: un único botón con borde parece deshabilitado (igual que en la app).
              className={`${linkBase} ${facebookUrl ? outlined : filled}`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r=".6" fill="currentColor" />
              </svg>
              Instagram
            </a>
          )}
        </div>
      )}
    </article>
  )
}
