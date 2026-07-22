import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { Container } from '@/components/ui/Container'
import { SectionHead } from '@/components/site/SectionHead'
import { Reveal } from '@/components/news/Reveal'
import { Button } from '@/components/ui/Button'
import { RadioHero } from '@/components/site/radio/RadioHero'
import { RadioSchedule } from '@/components/site/radio/RadioSchedule'
import { toRadioProgramView } from '@/lib/radio-schedule'

export const metadata: Metadata = { title: 'Radio parroquial' }
export const revalidate = 300

// El "ahora" y el "a continuacion" NO se calculan aca: con revalidate=300 el HTML
// cacheado congelaria el estado hasta 5 minutos y se serviria igual a todos. El
// servidor manda la programacion completa y el cliente resuelve el momento.

export default async function RadioPage() {
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection: 'radio-programs',
    where: { status: { equals: 'published' } },
    sort: 'startTime',
    limit: 100,
  })
  const programs = docs.map(toRadioProgramView)

  return (
    <>
      <section
        className="relative overflow-hidden text-white"
        style={{ background: 'linear-gradient(160deg, var(--color-navy), var(--color-navy-deep))' }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[.16]"
          aria-hidden="true"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,.4) 1.2px, transparent 1.3px)',
            backgroundSize: '22px 22px',
          }}
        />
        <Container>
          <div className="relative py-[clamp(44px,6vw,72px)]">
            <div className="mb-6 flex items-center justify-center gap-[9px] text-[13px] text-[#9DB0CC]">
              <Link href="/" className="hover:text-white">
                Inicio
              </Link>
              <span className="opacity-50">/</span>
              <span>Radio parroquial</span>
            </div>
            <RadioHero programs={programs} />
          </div>
        </Container>
      </section>

      {programs.length > 0 && (
        <section className="py-[clamp(56px,7vw,96px)]">
          <Container>
            <Reveal>
              <SectionHead
                title="Programación"
                emphasis="de la semana"
                lead="Lo que suena cada día en la radio de la parroquia."
              />
            </Reveal>
            <Reveal>
              <RadioSchedule programs={programs} />
            </Reveal>
          </Container>
        </section>
      )}

      <section className="py-[clamp(56px,7vw,96px)]">
        <Container>
          <Reveal>
            <div
              className="rounded-xl p-12 text-center text-white"
              style={{ background: 'linear-gradient(160deg, var(--color-sky), var(--color-blue))' }}
            >
              <h2 className="font-display text-[clamp(28px,3.4vw,42px)] font-medium">
                Envía tu saludo o intención de oración
              </h2>
              <p className="mx-auto mb-[26px] mt-[14px] max-w-[50ch] text-[17px] text-[#E3F3FB]">
                Comparte un saludo, una petición o un agradecimiento. Lo leemos al aire y oramos
                juntos como comunidad.
              </p>
              <div className="flex flex-wrap justify-center gap-[13px]">
                <Button href="/contacto" variant="white" size="lg">
                  Enviar por WhatsApp
                </Button>
                <Button href="/contacto" variant="outline-light" size="lg">
                  Pedir oración
                </Button>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  )
}
