import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { PageHero } from '@/components/site/PageHero'
import { Reveal } from '@/components/news/Reveal'
import { SponsorCard } from '@/components/sponsors/SponsorCard'
import { SponsorInvite } from '@/components/sponsors/SponsorInvite'
import { getActiveSponsors } from '@/lib/sponsors'

export const revalidate = 300

export function generateMetadata(): Metadata {
  return { title: 'Patrocinadores' }
}

export default async function PatrocinadoresPage() {
  const sponsors = await getActiveSponsors().catch(() => [])

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Inicio', href: '/' }, { label: 'Patrocinadores' }]}
        title="Negocios que sostienen"
        emphasis="esta página"
        lead="Son negocios de hermanos católicos de nuestra comunidad que, con un aporte cada mes, ayudan a que esta página siga llevando la fe a más hogares. Conocelos y apoyalos."
      />

      <section className="py-[clamp(36px,6vw,72px)]">
        <Container>
          {sponsors.length === 0 ? (
            <p className="text-muted">
              Pronto vas a encontrar aquí a los negocios que sostienen esta página.
            </p>
          ) : (
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] gap-5">
              {sponsors.map((s) => (
                <li key={s.id}>
                  <Reveal className="h-full">
                    <SponsorCard sponsor={s} />
                  </Reveal>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-14">
            <SponsorInvite />
          </div>
        </Container>
      </section>
    </>
  )
}
