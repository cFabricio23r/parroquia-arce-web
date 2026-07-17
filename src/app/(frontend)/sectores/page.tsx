import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { PageHero } from '@/components/site/PageHero'
import { MediaImage } from '@/components/news/MediaImage'
import { Reveal } from '@/components/news/Reveal'

export const metadata: Metadata = { title: 'Sectores y ermitas' }

// Contenido estatico portado del demo (web/content/sectores.html). Se bindea a la
// coleccion `sectors` cuando exista (Fase 1B); ahi vuelven el buscador, los
// filtros por chip y el link al detalle de cada sector.

const sectores = [
  ['Sector #8', 'Ermita Las Cruces', 'Cantón Las Cruces', 'Comunidad activa con vigilias y actividades para las familias del sector.', 'Misa: sáb 5:00 p.m.'],
  ['Sector #1', 'Ermita San José', 'Casco urbano', 'Comunidad del centro, con catequesis y grupos de oración entre semana.', 'Misa: dom 8:00 a.m.'],
  ['Sector #3', 'Ermita La Esperanza', 'Colonia La Esperanza', 'Sector joven con fuerte presencia de pastoral juvenil y misa familiar.', 'Misa: dom 4:00 p.m.'],
  ['Sector #5', 'Ermita El Calvario', 'Barrio El Calvario', 'Comunidad tradicional, con devociones y celebraciones patronales propias.', 'Misa: vie 6:00 p.m.'],
  ['Sector #6', 'Ermita Santa Lucía', 'Cantón San Antonio', 'Sector rural con gran tradición de procesiones y servicio comunitario.', 'Misa: dom 9:00 a.m.'],
  ['Sector #7', 'Ermita Cristo Rey', 'Colonia Las Flores', 'Comunidad en crecimiento, con catequesis familiar y nuevos servidores.', 'Misa: sáb 4:00 p.m.'],
]

export default function SectoresPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Inicio', href: '/' }, { label: 'Sectores y ermitas' }]}
        title="Sectores y"
        emphasis="ermitas"
        lead="La parroquia vive en sus comunidades. Encuentra tu sector, su ermita, horarios de misa, responsables y actividades cercanas."
      />

      <section className="py-[clamp(56px,7vw,96px)]">
        <Container>
          <div className="grid grid-cols-3 gap-[22px] max-[980px]:grid-cols-2 max-[600px]:grid-cols-1">
            {sectores.map(([num, title, loc, desc, misa]) => (
              <Reveal key={num}>
                <article className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-white">
                  <div className="relative h-[170px]">
                    <MediaImage cover={null} />
                    <span className="absolute left-[14px] top-[14px] rounded-pill bg-white/[.92] px-[13px] py-[5px] font-display text-[15px] font-semibold text-blue">
                      {num}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-display text-[23px] font-semibold leading-[1.05]">{title}</h3>
                    <div className="mt-[7px] flex items-center gap-[7px] text-[13.5px] text-muted">
                      <span className="text-sky" aria-hidden="true">
                        📍
                      </span>
                      {loc}
                    </div>
                    <p className="mt-3 text-[14px] leading-[1.5] text-muted">{desc}</p>
                    <div className="mt-auto pt-[18px] text-[13px] font-bold text-blue">{misa}</div>
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
