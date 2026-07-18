import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { PageHero } from '@/components/site/PageHero'
import { SectionHead } from '@/components/site/SectionHead'
import { CtaBand } from '@/components/site/CtaBand'
import { Reveal } from '@/components/news/Reveal'

export const metadata: Metadata = { title: 'Horarios y sacramentos' }

// Contenido estatico portado del demo (web/content/horarios.html). Cuando exista
// una coleccion de horarios/sacramentos (Fase 1B) se bindea a datos.

const misas = [
  ['Lunes a viernes', '6:00 p.m.'],
  ['Sábado', '5:00 p.m. (vespertina)'],
  ['Domingo', '7:00 a.m. · 10:00 a.m. · 6:00 p.m.'],
  ['Primer viernes de mes', '7:00 p.m. · Hora Santa'],
]

const sacramentos = [
  ['B', 'Bautizo', 'Charla de preparación mensual para padres y padrinos. Inscríbete con anticipación en secretaría.', 'Inscripción: primer sábado del mes'],
  ['✝', 'Primera Comunión', 'Catequesis para niños y niñas durante el año pastoral, con acompañamiento a las familias.', 'Catequesis: sábados 9:00 a.m.'],
  ['⊕', 'Confirmación', 'Itinerario de formación para jóvenes y adultos que completan su iniciación cristiana.', 'Inscripción abierta'],
  ['M', 'Matrimonio', 'Trámites y curso prematrimonial con el equipo de pastoral familiar de la parroquia.', 'Reserva con 3 meses de anticipación'],
  ['U', 'Unción de enfermos', 'Visita a enfermos y celebración comunitaria de la unción. Solicítala en la oficina.', 'Por solicitud'],
  ['R', 'Reconciliación', 'Acompañamiento espiritual y confesión personal en los horarios señalados.', 'Sábados 4:00 p.m.'],
]

const especiales = [
  ['08', 'Jun', 'Corpus Christi', 'Misa solemne 9:00 a.m. y procesión por el centro.'],
  ['29', 'Jun', 'San Pedro y San Pablo', 'Misa 6:00 p.m. en el templo parroquial.'],
  ['08', 'Dic', 'Inmaculada Concepción', 'Fiesta patronal. Programación especial toda la semana.'],
  ['24', 'Dic', 'Nochebuena', 'Misa de Gallo 8:00 p.m. Confirmar avisos parroquiales.'],
]

export default function HorariosPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Inicio', href: '/' }, { label: 'Horarios y sacramentos' }]}
        title="Horarios y"
        emphasis="sacramentos"
        lead="Misas, confesiones y la preparación de cada sacramento, con la información oficial siempre a la vista."
      />

      <section className="py-[clamp(56px,7vw,96px)]">
        <Container>
          <div className="grid grid-cols-[1.1fr_.9fr] items-start gap-[30px] max-[1040px]:grid-cols-1">
            <Reveal>
              <div className="rounded-xl border border-border bg-blue-soft p-8">
                <span className="text-[12.5px] font-bold uppercase tracking-[.15em] text-blue">
                  Misa dominical y entre semana
                </span>
                <h3 className="my-[10px_0_20px] font-display text-[28px] font-medium">
                  Horario regular de misas
                </h3>
                <div className="flex flex-col gap-[11px]">
                  {misas.map(([day, time]) => (
                    <div
                      key={day}
                      className="flex items-center justify-between gap-4 rounded-md bg-white p-[16px_20px]"
                    >
                      <span className="font-semibold">{day}</span>
                      <span className="text-right font-extrabold text-blue">{time}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-[18px] text-[14px] text-muted">
                  Los horarios pueden variar en solemnidades y tiempos litúrgicos especiales.
                  Consulta los avisos parroquiales.
                </p>
              </div>
            </Reveal>

            <Reveal className="flex flex-col gap-[18px]">
              {[
                ['Confesiones', 'Sábados de 4:00 a 5:00 p.m. en el templo, y por cita en la oficina parroquial.', 'Agendar por WhatsApp →'],
                ['Oficina parroquial', 'Martes a sábado, 9:00 a.m. – 12:00 m. y 2:00 – 5:00 p.m.', 'Cómo llegar →'],
              ].map(([title, text, hint]) => (
                <div key={title} className="rounded-lg border border-border bg-white p-7">
                  <h4 className="font-display text-[22px] font-semibold">{title}</h4>
                  <p className="mt-[6px] text-[14.5px] text-muted">{text}</p>
                  <a href="/contacto" className="mt-[14px] inline-flex gap-2 text-[14.5px] font-bold text-blue">
                    {hint}
                  </a>
                </div>
              ))}
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="bg-bg-soft py-[clamp(56px,7vw,96px)]">
        <Container>
          <Reveal>
            <SectionHead
              title="Preparación de"
              emphasis="sacramentos"
              lead="Acompañamos a cada familia en los momentos importantes de su vida de fe."
            />
          </Reveal>
          <div className="grid grid-cols-3 gap-5 max-[1040px]:grid-cols-1">
            {sacramentos.map(([bl, title, text, when]) => (
              <Reveal key={title}>
                <div className="flex h-full flex-col gap-[13px] rounded-lg border border-border bg-white p-[30px]">
                  <span className="grid h-[52px] w-[52px] place-items-center rounded-[14px] bg-blue font-display text-[22px] font-semibold text-white">
                    {bl}
                  </span>
                  <h4 className="font-display text-[23px] font-semibold">{title}</h4>
                  <p className="text-[14.5px] leading-[1.5] text-muted">{text}</p>
                  <span className="mt-auto pt-3 text-[14px] font-bold text-blue">{when}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-[clamp(56px,7vw,96px)]">
        <Container>
          <Reveal>
            <SectionHead
              title="Celebraciones"
              emphasis="especiales"
              lead="Cambios de horario y celebraciones según el calendario litúrgico."
            />
          </Reveal>
          <div className="grid grid-cols-2 gap-4 max-[1040px]:grid-cols-1">
            {especiales.map(([d, m, title, text]) => (
              <Reveal key={title}>
                <div className="flex items-center gap-[18px] rounded-lg border border-border bg-white p-[20px_24px]">
                  <span className="grid h-16 w-16 flex-none place-items-center rounded-md bg-blue-tint text-center text-blue">
                    <span className="block font-display text-[26px] font-semibold leading-none">{d}</span>
                    <span className="mt-[2px] text-[11px] font-bold uppercase tracking-[.08em]">{m}</span>
                  </span>
                  <div>
                    <h4 className="font-display text-[19px] font-semibold">{title}</h4>
                    <p className="text-[14px] text-muted">{text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-[clamp(56px,7vw,96px)]">
        <Container>
          <Reveal>
            <CtaBand
              title="¿Necesitas preparar un sacramento?"
              text="Escríbenos por WhatsApp o visita la oficina parroquial. Con gusto te acompañamos en cada paso."
              primary={{ label: 'Contactar por WhatsApp', href: '/contacto' }}
              secondary={{ label: 'Ver ubicación', href: '/contacto' }}
            />
          </Reveal>
        </Container>
      </section>
    </>
  )
}
