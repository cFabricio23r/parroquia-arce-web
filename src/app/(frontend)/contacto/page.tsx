import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { PageHero } from '@/components/site/PageHero'
import { ContactForm } from '@/components/site/ContactForm'
import { Reveal } from '@/components/news/Reveal'

export const metadata: Metadata = { title: 'Contacto' }

// Contenido estatico portado del demo (web/content/contacto.html).
// TODO: reemplazar los href="#" de los canales por las URLs oficiales reales.

const canales = [
  ['WhatsApp oficial', 'Consultas pastorales y sacramentos', 'var(--color-ok)'],
  ['Facebook', 'Avisos, transmisiones y comunidad', '#1877F2'],
  ['YouTube', 'Misas, homilías y formación', '#FF0000'],
]

const horario = [
  ['Martes a sábado', '9:00 a.m. – 12:00 m.'],
  ['Tarde (mar–sáb)', '2:00 – 5:00 p.m.'],
  ['Domingo y lunes', 'Cerrado'],
]

export default function ContactoPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Inicio', href: '/' }, { label: 'Contacto' }]}
        title="Estamos para"
        emphasis="servirte"
        lead="Encuentra nuestra ubicación, los canales oficiales y el horario de oficina. Escríbenos: con gusto te acompañamos."
      />

      <section className="py-[clamp(56px,7vw,96px)]">
        <Container>
          <div className="grid grid-cols-[1fr_1.1fr] items-start gap-10 max-[1040px]:grid-cols-1">
            <Reveal className="flex flex-col gap-[14px]">
              <div className="flex flex-col gap-[14px]">
                {canales.map(([title, text, color]) => (
                  <a
                    key={title}
                    href="#"
                    className="flex items-center gap-4 rounded-lg border border-border bg-white p-[20px_22px] [transition:transform_.16s,box-shadow_.2s,border-color_.2s] hover:-translate-y-1 hover:border-line-soft hover:shadow-md"
                  >
                    <span
                      className="grid h-[50px] w-[50px] flex-none place-items-center rounded-[13px] text-white"
                      style={{ background: color }}
                      aria-hidden="true"
                    />
                    <div>
                      <h4 className="font-display text-[19px] font-semibold">{title}</h4>
                      <p className="text-[14px] text-muted">{text}</p>
                    </div>
                    <span className="ml-auto text-blue" aria-hidden="true">
                      →
                    </span>
                  </a>
                ))}
              </div>

              <div className="mt-[18px] rounded-lg border border-border bg-white p-[26px]">
                <h4 className="mb-[14px] font-display text-[20px] font-semibold">
                  Horario de oficina
                </h4>
                {horario.map(([day, time], i) => (
                  <div
                    key={day}
                    className={`flex justify-between py-[10px] text-[14.5px] ${
                      i < horario.length - 1 ? 'border-b border-line-soft' : ''
                    }`}
                  >
                    <span>{day}</span>
                    <b className="text-blue">{time}</b>
                  </div>
                ))}
              </div>

              <div
                className="relative mt-6 grid h-[300px] place-items-center overflow-hidden rounded-xl border border-border font-display text-blue"
                style={{
                  background:
                    'radial-gradient(70% 60% at 30% 20%, rgba(97,194,230,.25), transparent 60%), var(--color-blue-soft)',
                }}
              >
                <span className="relative flex flex-col items-center gap-2 text-[20px]">
                  📍 Templo parroquial · Ciudad Arce
                </span>
              </div>
            </Reveal>

            <Reveal>
              <ContactForm />
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  )
}
