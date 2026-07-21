import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { Container } from '@/components/ui/Container'
import { PageHero } from '@/components/site/PageHero'
import { Reveal } from '@/components/news/Reveal'
import { GroupCard } from '@/components/community/GroupCard'

export const metadata: Metadata = { title: 'Grupos y ministerios' }
export const revalidate = 300

export default async function GruposPage() {
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection: 'groups',
    where: { status: { equals: 'published' } },
    sort: 'name',
    limit: 50,
  })

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
          {docs.length === 0 ? (
            <p className="text-muted">
              Aún no hay grupos publicados. El equipo parroquial los carga desde el panel.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-[22px] max-[980px]:grid-cols-2 max-[600px]:grid-cols-1">
              {docs.map((g) => (
                <Reveal key={g.id}>
                  <GroupCard group={g} />
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  )
}
