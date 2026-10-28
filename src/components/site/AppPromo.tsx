import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/news/Reveal'
import type { AppDownload } from '@/lib/app-download'

/**
 * Bloque de la portada que invita a bajar la app. Solo existe con la descarga
 * lista, y lleva a /app (no al APK) para que la persona lea antes como
 * instalarla.
 */
export function AppPromo({ download }: { download: AppDownload }) {
  if (!download.ready) return null

  return (
    <section aria-labelledby="app-promo-titulo" className="py-[clamp(28px,4vw,44px)]">
      <Container>
        <Reveal className="flex flex-col gap-5 rounded-xl bg-blue-soft p-[clamp(22px,3vw,36px)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="app-promo-titulo"
              className="font-display text-[clamp(24px,2.8vw,32px)] font-medium leading-[1.1]"
            >
              La parroquia, <em className="italic text-blue">en tu celular</em>
            </h2>
            <p className="mt-2 max-w-[52ch] text-[16px] text-muted">
              Radio en vivo, horarios, oración y la vida de la comunidad. Ya podés descargarla para
              Android.
            </p>
            <p className="mt-1 text-[14px] font-semibold text-muted">
              Próximamente en Google Play y App Store.
            </p>
          </div>
          <Button href="/app" className="shrink-0">
            Descargá la app
          </Button>
        </Reveal>
      </Container>
    </section>
  )
}
