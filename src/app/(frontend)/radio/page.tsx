import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { Container } from '@/components/ui/Container'
import { SectionHead } from '@/components/site/SectionHead'
import { RadioPlayer } from '@/components/site/RadioPlayer'
import { Reveal } from '@/components/news/Reveal'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = { title: 'Radio parroquial' }
export const revalidate = 300

// El hero, el player y los programas destacados son editoriales (estaticos). La
// PROGRAMACION se lee de la coleccion radio-programs.

const destacados = [
  ['Evangelio del día', 'La Palabra de cada jornada con una breve reflexión pastoral.'],
  ['Matrimonios con propósito', 'Acompañamiento para fortalecer la vida en familia.'],
  ['Testimonios que edifican', 'Voces reales de la comunidad que inspiran la fe.'],
]

export default async function RadioPage() {
  const payload = await getPayload({ config: await config })
  const { docs: programas } = await payload.find({
    collection: 'radio-programs',
    where: { status: { equals: 'published' } },
    sort: 'createdAt',
    limit: 50,
  })

  return (
    <>
      {/* Hero especial navy con el player */}
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
          <div className="relative grid grid-cols-[1.2fr_.8fr] items-center gap-10 py-[56px] max-[1040px]:grid-cols-1">
            <div>
              <div className="mb-[10px] flex items-center gap-[9px] text-[13.5px] text-[#9DB0CC]">
                <Link href="/" className="hover:text-white">
                  Inicio
                </Link>
                <span className="opacity-50">/</span>
                <span>Radio parroquial</span>
              </div>
              <h1 className="my-[10px_0_14px] font-display text-[clamp(40px,5vw,64px)] font-medium leading-[1.02]">
                Radio <em className="italic text-sky-light">parroquial</em>
              </h1>
              <p className="max-w-[46ch] text-[18px] text-[#B6C6DD]">
                Un canal de evangelización para escuchar en vivo, compartir avisos y acompañar la
                vida de la comunidad — desde casa, el trabajo o el camino.
              </p>
            </div>
            <RadioPlayer />
          </div>
        </Container>
      </section>

      <section className="py-[clamp(56px,7vw,96px)]">
        <Container>
          <Reveal>
            <SectionHead
              title="Programación"
              emphasis="de la semana"
              lead="Lo que suena cada día en la radio de la parroquia."
            />
          </Reveal>
          {programas.length === 0 ? (
            <p className="text-muted">
              Aún no hay programación publicada. El equipo de comunicaciones la carga desde el panel.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 max-[1040px]:grid-cols-1">
              {programas.map((prog) => (
                <Reveal key={prog.id}>
                  <div className="grid grid-cols-[auto_1fr] items-center gap-[18px] rounded-lg border border-border bg-white p-[20px_24px]">
                    <div className="w-[80px] text-center font-display text-[18px] font-semibold leading-tight text-blue">
                      {prog.startTime || '—'}
                    </div>
                    <div>
                      <h4 className="font-display text-[19px] font-semibold">{prog.title}</h4>
                      {prog.description && (
                        <p className="mt-[3px] text-[14px] text-muted">{prog.description}</p>
                      )}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </section>

      <section className="bg-bg-soft py-[clamp(56px,7vw,96px)]">
        <Container>
          <Reveal>
            <SectionHead
              title="Programas"
              emphasis="destacados"
              lead="Espacios pensados para cada miembro de la familia parroquial."
            />
          </Reveal>
          <div className="grid grid-cols-3 gap-5 max-[1040px]:grid-cols-1">
            {destacados.map(([title, desc]) => (
              <Reveal key={title}>
                <div className="rounded-lg border border-border bg-white p-[26px] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-line-soft hover:shadow-md">
                  <span className="mb-[14px] grid h-12 w-12 place-items-center rounded-[13px] bg-blue-tint text-blue" aria-hidden="true">
                    ♪
                  </span>
                  <h4 className="font-display text-[21px] font-semibold">{title}</h4>
                  <p className="mt-[6px] text-[14px] leading-[1.5] text-muted">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

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
