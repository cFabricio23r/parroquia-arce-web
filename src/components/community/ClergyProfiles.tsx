import { RichText } from '@payloadcms/richtext-lexical/react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { MediaImage } from '@/components/news/MediaImage'
import { getClergyPhoto, hasBiographyContent, type ClergyProfile } from '@/lib/clergy'

export function ClergyProfiles({ profiles }: { profiles: ClergyProfile[] }) {
  return (
    <Container>
      {profiles.length ? (
        profiles.map((profile) => {
          const photo = getClergyPhoto(profile.photo)
          return (
            <article
              key={profile.id}
              id={profile.id}
              className="scroll-mt-24 border-b border-line-soft py-[clamp(48px,6vw,80px)] last:border-b-0"
            >
              <div
                className={`grid items-start gap-8 md:gap-14 ${photo ? 'md:grid-cols-[minmax(0,280px)_minmax(0,1fr)]' : ''}`}
              >
                {photo && (
                  <div className="aspect-[3/4] w-full max-w-[320px] overflow-hidden rounded-lg">
                    <MediaImage cover={photo} className="object-top" />
                  </div>
                )}
                <div className="min-w-0 max-w-[720px]">
                  <p className="mb-3 break-words text-[12px] font-bold uppercase tracking-[.12em] text-blue">
                    {profile.role}
                  </p>
                  <h2 className="break-words font-display text-[clamp(32px,4vw,46px)] font-medium leading-[1.08]">
                    {profile.name}
                  </h2>
                  <div className="mt-7 break-words text-[17px] leading-[1.75]">
                    {profile.biography && hasBiographyContent(profile.biography) ? (
                      <RichText data={profile.biography} className="richtext" />
                    ) : (
                      <p className="whitespace-pre-line text-muted">{profile.summary}</p>
                    )}
                  </div>
                </div>
              </div>
            </article>
          )
        })
      ) : (
        <div className="py-[clamp(48px,6vw,80px)]">
          <p className="mb-6 text-[18px] text-muted">
            Pronto compartiremos información sobre nuestros sacerdotes.
          </p>
          <Button href="/contacto">Contactar con la parroquia</Button>
        </div>
      )}
    </Container>
  )
}
