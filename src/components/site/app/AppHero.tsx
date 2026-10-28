import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { PhoneMockup } from '@/components/site/app/PhoneMockup'
import { formatAppMeta, type AppDownload } from '@/lib/app-download'

// Franja navy de apertura de /app. Presentacional puro: recibe la descarga ya
// derivada. En el DOM va primero el texto + boton y despues el celular, asi en
// el telefono de quien escanea el QR el boton queda arriba del celular.
// Sin descarga lista no da 404: ofrece la radio y los horarios.

export function AppHero({ download }: { download: AppDownload }) {
  const meta = download.ready ? formatAppMeta(download) : null

  return (
    <section
      className="text-white"
      style={{
        background: 'radial-gradient(120% 80% at 85% 10%, #134C92 0%, #0A2448 45%, #051733 100%)',
      }}
    >
      <Container>
        <div className="grid items-center gap-12 pb-14 pt-8 sm:pt-[54px] lg:grid-cols-[1.1fr_1fr] lg:pb-20">
          <div>
            {/* Migas: mismo markup que PageHero, en blanco sobre navy. */}
            <div className="mb-[18px] flex items-center gap-[9px] text-[13.5px] text-white/70">
              <Link href="/" className="-my-2 py-2 hover:text-white">
                Inicio
              </Link>
              <span className="opacity-50">/</span>
              <span>App de la parroquia</span>
            </div>

            {download.ready ? (
              <>
                <h1 className="font-display text-[clamp(40px,5.4vw,68px)] font-medium leading-[1.02] tracking-[-.01em]">
                  La parroquia, <em className="italic text-sky-light">en tu celular</em>
                </h1>
                <p className="mt-4 max-w-[52ch] text-[17px] leading-relaxed text-white/80 sm:text-[19px]">
                  El Evangelio del día, los horarios de misa y la radio parroquial, siempre a mano.
                </p>
                <a
                  href={download.url}
                  className="mt-8 inline-flex min-h-14 w-full items-center justify-center rounded-pill bg-white px-[30px] py-[17px] text-center text-[17px] font-bold text-blue [transition:background_.2s] hover:bg-bg-soft sm:w-auto"
                >
                  Descargar para Android
                </a>
                {meta && <p className="mt-3 text-[15px] font-semibold text-white">{meta}</p>}
                <p className="mt-2 text-[16px] text-white/85">
                  Te recomendamos usar Wi-Fi: el archivo es pesado para los datos móviles.
                </p>
                <p className="mt-5 text-[15px] text-white/80">
                  Próximamente en Google Play y App Store.
                </p>

                {/* Solo escritorio: en el celular ya estas en el aparato donde instalarla. */}
                <div className="mt-8 hidden max-w-[420px] rounded-xl border border-white/20 bg-white/10 p-4 lg:block">
                  <div className="flex items-center gap-5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/img/app/qr-app.png"
                      alt="Código QR que abre parroquiaciudadarce.org/app"
                      width={480}
                      height={480}
                      loading="lazy"
                      className="h-28 w-28 shrink-0 rounded-lg bg-white p-2"
                    />
                    <div>
                      <p className="font-semibold">¿Estás en la computadora?</p>
                      <p className="mt-1 text-[14.5px] text-white/80">
                        Escaneá el código con tu celular para descargarla.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h1 className="font-display text-[clamp(40px,5.4vw,68px)] font-medium leading-[1.02] tracking-[-.01em]">
                  La app de la parroquia estará disponible{' '}
                  <em className="italic text-sky-light">muy pronto</em>
                </h1>
                <p className="mt-4 max-w-[52ch] text-[17px] leading-relaxed text-white/80 sm:text-[19px]">
                  Mientras tanto, podés escuchar la radio y consultar los horarios aquí en la web.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button href="/radio" variant="white">
                    Escuchá la radio
                  </Button>
                  <Button href="/horarios" variant="outline-light">
                    Ver los horarios
                  </Button>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-center lg:justify-end">
            <PhoneMockup
              src="/img/app/inicio.jpg"
              alt="Pantalla de inicio de la app: Evangelio del día, próxima misa y la radio."
              loading="eager"
              className="w-[min(300px,72vw)]"
            />
          </div>
        </div>
      </Container>
    </section>
  )
}
