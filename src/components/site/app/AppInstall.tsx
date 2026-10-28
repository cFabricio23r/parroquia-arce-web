import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/news/Reveal'
import type { AppDownload } from '@/lib/app-download'

// Instalacion del APK en pasos. Sin descarga lista no hay nada que instalar:
// devuelve null. Los pasos y el aviso salen tal cual de la pagina anterior.

const STEPS = [
  'Tocá «Descargar para Android» y esperá a que termine la descarga.',
  'Abrí el archivo descargado desde la notificación o desde la carpeta «Descargas».',
  'Si Android te avisa que no puede instalarla, tocá «Configuración» y activá «Permitir de esta fuente» (instalar apps desconocidas) para tu navegador.',
  'Volvé atrás y tocá «Instalar». Cuando termine, abrila desde el ícono de la parroquia.',
]

// Indice del paso donde Android muestra el aviso de "fuente desconocida".
const WARNING_STEP = 2

export function AppInstall({ download }: { download: AppDownload }) {
  if (!download.ready) return null

  return (
    <section aria-labelledby="app-instalar-titulo" className="bg-bg-soft py-[clamp(48px,6vw,80px)]">
      <Container>
        <Reveal>
          <h2
            id="app-instalar-titulo"
            className="font-display text-[clamp(26px,3vw,36px)] font-medium leading-[1.05]"
          >
            Cómo instalarla
          </h2>
          <ol className="mt-7 grid gap-4 md:grid-cols-2">
            {STEPS.map((step, i) => (
              <li key={step} className="flex gap-4 rounded-xl bg-white p-[18px_22px]">
                <span
                  aria-hidden="true"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue text-[16px] font-bold text-white"
                >
                  {i + 1}
                </span>
                <div className="pt-1.5 text-[16px] leading-relaxed">
                  <p>{step}</p>
                  {/* El aviso va pegado al paso del aviso de Android, no suelto. */}
                  {i === WARNING_STEP && (
                    <p className="mt-2 text-[15px] text-muted">
                      Ese aviso es normal en las apps que no vienen de Play Store. La app es de la
                      parroquia y no pide pagos ni datos bancarios.
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-8">
            <a
              href={download.url}
              className="inline-flex min-h-14 w-full items-center justify-center rounded-pill bg-blue px-[30px] py-[17px] text-center text-[17px] font-bold text-white shadow-[0_10px_22px_-10px_rgba(19,76,146,.6)] [transition:background_.2s] hover:bg-blue-700 sm:w-auto"
            >
              Descargar para Android
            </a>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
