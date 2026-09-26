import { FACEBOOK_PAGE, YOUTUBE_CHANNEL } from '@/lib/social-live'

export function SocialLinksCard() {
  return (
    <aside className="self-start rounded-2xl border border-border bg-bg-soft p-6 lg:sticky lg:top-28">
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[.14em] text-blue">
        Canales oficiales
      </p>
      <h2 className="font-display text-2xl font-medium text-navy-deep">Sigamos en contacto</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        También podés acompañarnos en nuestros canales oficiales.
      </p>
      <div className="mt-6 space-y-3">
        <a
          className="flex min-h-12 items-center justify-between gap-2 rounded-xl bg-blue px-4 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue"
          href={FACEBOOK_PAGE}
          target="_blank"
          rel="noopener noreferrer"
        >
          Visitar Facebook <span aria-hidden="true">↗</span>
          <span className="sr-only"> (abre en otra pestaña)</span>
        </a>
        <a
          className="flex min-h-12 items-center justify-between gap-2 rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-blue transition-colors duration-150 hover:border-blue/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue"
          href={YOUTUBE_CHANNEL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Ver canal de YouTube <span aria-hidden="true">↗</span>
          <span className="sr-only"> (abre en otra pestaña)</span>
        </a>
      </div>
    </aside>
  )
}
