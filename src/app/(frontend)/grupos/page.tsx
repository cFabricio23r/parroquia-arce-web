import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { PageHero } from '@/components/site/PageHero'
import { Badge } from '@/components/ui/Badge'
import { Reveal } from '@/components/news/Reveal'

export const metadata: Metadata = { title: 'Grupos y ministerios' }

// Contenido estatico portado del demo (web/content/grupos.html). Se bindea a la
// coleccion `groups` cuando exista (Fase 1B); ahi vuelven los filtros por chip y
// el link al detalle de cada grupo.

type Variant = 'blue' | 'sky' | 'amber'
const grupos: [string, Variant, string, string, string, string][] = [
  ['Matrimonios', 'blue', 'Encuentros Conyugales', 'Fortalece la vida matrimonial desde la fe, el diálogo y la comunidad.', 'Viernes · 7:00 p.m.', 'Salón parroquial'],
  ['Oración', 'sky', 'Renovación Carismática', 'Encuentros de alabanza, predicación y comunidad para crecer en el Espíritu.', 'Martes · 7:00 p.m.', 'Templo parroquial'],
  ['Jóvenes', 'amber', 'Pastoral Juvenil', 'Formación, servicio y misión para jóvenes de toda la parroquia.', 'Sábado · 4:00 p.m.', 'Salón juvenil'],
  ['Formación', 'blue', 'Catequesis', 'Acompañamiento en la iniciación cristiana de niños, jóvenes y adultos.', 'Sábado · 9:00 a.m.', 'Aulas parroquiales'],
  ['Liturgia', 'sky', 'Ministerios litúrgicos', 'Lectores, monaguillos, coro y ministros que sirven en las celebraciones.', 'Según calendario', 'Templo parroquial'],
  ['Servicio', 'amber', 'Cáritas parroquial', 'Obras de caridad y acompañamiento a las familias más necesitadas.', 'Jueves · 3:00 p.m.', 'Oficina parroquial'],
]

export default function GruposPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Inicio', href: '/' }, { label: 'Grupos y ministerios' }]}
        title="Grupos y"
        emphasis="ministerios"
        lead="Espacios para servir, formarse y crecer en fe junto a otros. Encuentra la comunidad donde poner tus dones al servicio de la parroquia."
      />

      <section className="py-[clamp(56px,7vw,96px)]">
        <Container>
          <div className="grid grid-cols-3 gap-[22px] max-[980px]:grid-cols-2 max-[600px]:grid-cols-1">
            {grupos.map(([cat, variant, title, desc, horario, lugar]) => (
              <Reveal key={title}>
                <article className="flex h-full flex-col rounded-lg border border-border bg-white p-7">
                  <Badge variant={variant} className="self-start">
                    {cat}
                  </Badge>
                  <h3 className="my-[14px_0_8px] font-display text-[23px] font-semibold leading-[1.06]">
                    {title}
                  </h3>
                  <p className="text-[14.5px] leading-[1.5] text-muted">{desc}</p>
                  <div className="my-[18px] flex flex-col gap-2">
                    <div className="flex items-center gap-[9px] text-[14px] font-semibold text-[#3A4A60]">
                      <span className="text-sky" aria-hidden="true">
                        🕑
                      </span>
                      {horario}
                    </div>
                    <div className="flex items-center gap-[9px] text-[14px] font-semibold text-[#3A4A60]">
                      <span className="text-sky" aria-hidden="true">
                        📍
                      </span>
                      {lugar}
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  )
}
