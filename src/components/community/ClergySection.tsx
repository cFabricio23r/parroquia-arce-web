import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { SectionHead } from '@/components/site/SectionHead'
import { MediaImage } from '@/components/news/MediaImage'
import type { ClergyProfile } from '@/lib/clergy'

export function ClergySection({ profiles }: { profiles: ClergyProfile[] }) {
  if (!profiles.length) return null
  return (
    <section className="bg-bg-soft py-[clamp(56px,7vw,96px)]">
      <Container>
        <SectionHead title="Nuestros" emphasis="sacerdotes" lead="Conocé a quienes acompañan la vida y la fe de nuestra comunidad." />
        <div className={`grid gap-7 ${profiles.length > 1 ? 'md:grid-cols-2' : 'max-w-[640px]'}`}>
          {profiles.map((profile) => (
            <article key={profile.id} className="min-w-0 overflow-hidden rounded-lg border border-border bg-white">
              {profile.photo && typeof profile.photo === 'object' && profile.photo.url && (
                <div className="aspect-[4/3] overflow-hidden">
                  <MediaImage cover={profile.photo} className="object-[50%_25%]" />
                </div>
              )}
              <div className="flex flex-col items-start p-6 sm:p-8">
                <p className="mb-3 max-w-full break-words text-[12px] font-bold uppercase tracking-[.12em] text-blue">{profile.role}</p>
                <h3 className="max-w-full break-words font-display text-[clamp(26px,3vw,34px)] font-medium leading-[1.12]">{profile.name}</h3>
                <p className="mb-6 mt-4 max-w-full whitespace-pre-line break-words leading-[1.65] text-muted">{profile.summary}</p>
                <Link
                  href={`/sacerdotes#${profile.id}`}
                  aria-label={`Conocer la historia de ${profile.name}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-sm font-bold text-blue underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue"
                >
                  Conocer su historia <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}
