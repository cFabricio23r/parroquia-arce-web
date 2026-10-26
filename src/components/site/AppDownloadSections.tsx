import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/news/Reveal'
import { formatAppMeta, type AppDownload } from '@/lib/app-download'

/**
 * El cuerpo de `/app`. Presentacional puro: recibe la descarga ya derivada y no
 * habla con Payload, asi es testeable sin base de datos.
 *
 * Sin descarga lista la pagina NO da 404: el QR del afiche circula reenviado por
 * WhatsApp, y quien lo escanee tiene que encontrar algo util.
 *
 * "Que trae" lista solo lo que tiene el APK publicado (verificado contra las
 * pantallas de parroquia-arce-app el 2026-10-25), nada de funciones futuras.
 */
const FEATURES = [
  { title: 'Radio parroquial en vivo', detail: 'Escuchá la emisora desde el celular.' },
  { title: 'Horarios y agenda', detail: 'Misas, confesiones y los eventos de la parroquia.' },
  {
    title: 'Rezar',
    detail: 'Lecturas del día, Liturgia de las Horas, Santo Rosario, oraciones y pedidos de oración.',
  },
  {
    title: 'Comunidad',
    detail: 'Sectores y ermitas, grupos y ministerios, noticias y contacto.',
  },
]

const STEPS = [
  'Tocá «Descargar para Android» y esperá a que termine la descarga.',
  'Abrí el archivo descargado desde la notificación o desde la carpeta «Descargas».',
  'Si Android te avisa que no puede instalarla, tocá «Configuración» y activá «Permitir de esta fuente» (instalar apps desconocidas) para tu navegador.',
  'Volvé atrás y tocá «Instalar». Cuando termine, abrila desde el ícono de la parroquia.',
]

export function AppDownloadSections({ download }: { download: AppDownload }) {
  if (!download.ready) {
    return (
      <section aria-labelledby="app-pronto-titulo" className="py-[clamp(48px,6vw,80px)]">
        <Container>
          <Reveal className="max-w-[60ch]">
            <h2
              id="app-pronto-titulo"
              className="font-display text-[clamp(28px,3.4vw,40px)] font-medium leading-[1.05]"
            >
              La app de la parroquia estará disponible{' '}
              <em className="italic text-blue">muy pronto</em>
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-muted">
              Mientras tanto, podés escuchar la radio y consultar los horarios aquí en la web.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button href="/radio">Escuchá la radio</Button>
              <Button href="/horarios" variant="ghost">
                Ver los horarios
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>
    )
  }

  const meta = formatAppMeta(download)

  return (
    <>
      <section aria-labelledby="app-descarga-titulo" className="py-[clamp(48px,6vw,80px)]">
        <Container>
          <Reveal>
            <h2
              id="app-descarga-titulo"
              className="font-display text-[clamp(28px,3.4vw,40px)] font-medium leading-[1.05]"
            >
              La vida parroquial, <em className="italic text-blue">en tu celular</em>
            </h2>
            {/* El boton va primero en el DOM: en el celular de quien escanea el QR
                aparece arriba, sin bajar cuatro tarjetas. En escritorio la lista
                vuelve a la izquierda con lg:order-first. */}
            <div className="mt-7 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
              <div className="rounded-xl bg-bg-soft p-[clamp(22px,3vw,32px)]">
                <a
                  href={download.url}
                  className="inline-flex min-h-14 w-full items-center justify-center rounded-pill bg-blue px-[30px] py-[17px] text-center text-[17px] font-bold text-white shadow-[0_10px_22px_-10px_rgba(19,76,146,.6)] [transition:background_.2s] hover:bg-blue-700"
                >
                  Descargar para Android
                </a>
                {meta && <p className="mt-3 text-center text-[15px] font-semibold">{meta}</p>}
                <p className="mt-2 text-center text-[14px] text-muted">
                  Te recomendamos usar Wi-Fi: el archivo es pesado para los datos móviles.
                </p>
                <p className="mt-6 border-t border-line-soft pt-5 text-center text-[15px] font-semibold text-text">
                  Próximamente en Google Play y App Store.
                </p>
              </div>
              <ul aria-label="Qué trae la app" className="grid gap-4 lg:order-first">
                {FEATURES.map((f) => (
                  <li key={f.title} className="rounded-xl border border-border bg-white p-[18px_22px]">
                    <span className="block font-semibold">{f.title}</span>
                    <span className="mt-1 block text-[15px] text-muted">{f.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </Container>
      </section>

      <section aria-labelledby="app-instalar-titulo" className="bg-bg-soft py-[clamp(48px,6vw,80px)]">
        <Container>
          <Reveal className="max-w-[68ch]">
            <h2
              id="app-instalar-titulo"
              className="font-display text-[clamp(26px,3vw,36px)] font-medium leading-[1.05]"
            >
              Cómo instalarla
            </h2>
            <ol className="mt-7 grid gap-4">
              {STEPS.map((step, i) => (
                <li key={step} className="flex gap-4 rounded-xl bg-white p-[18px_22px]">
                  <span
                    aria-hidden="true"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue text-[16px] font-bold text-white"
                  >
                    {i + 1}
                  </span>
                  <span className="pt-1.5 text-[16px] leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-5 text-[15px] text-muted">
              Ese aviso es normal en las apps que no vienen de Play Store. La app es de la parroquia y
              no pide pagos ni datos bancarios.
            </p>
          </Reveal>
        </Container>
      </section>

      {download.screenshots.length > 0 && (
        <section aria-labelledby="app-capturas-titulo" className="py-[clamp(48px,6vw,80px)]">
          <Container>
            <h2
              id="app-capturas-titulo"
              className="font-display text-[clamp(26px,3vw,36px)] font-medium leading-[1.05]"
            >
              Así se ve
            </h2>
            {/* Enfocable para poder desplazarla con el teclado (axe: scrollable-region-focusable). */}
            <div
              role="region"
              aria-label="Capturas de la app"
              tabIndex={0}
              className="mt-7 flex gap-4 overflow-x-auto pb-2"
            >
              {download.screenshots.map((s) => (
                // eslint-disable-next-line @next/next/no-img-element -- la media vive en Supabase, servida directo
                <img
                  key={s.url}
                  src={s.url}
                  alt={s.alt}
                  width={s.width ?? undefined}
                  height={s.height ?? undefined}
                  loading="lazy"
                  className="h-[min(520px,70vh)] w-auto shrink-0 rounded-xl border border-border"
                />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  )
}
