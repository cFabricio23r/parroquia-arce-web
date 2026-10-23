import { channelDescription } from '@/lib/contact-channels'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { Container } from '@/components/ui/Container'
import { PageHero } from '@/components/site/PageHero'
import { ContactForm } from '@/components/site/ContactForm'
import { SocialIcon } from '@/components/ui/SocialIcon'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = { title: 'Contacto' }
export const dynamic = 'force-dynamic'
const PLATFORM_META: Record<string, { label: string; description: string; color: string }> = {
  whatsapp: {
    label: 'WhatsApp oficial',
    description: 'Consultas pastorales y sacramentos',
    color: '#147A53',
  },
  facebook: { label: 'Facebook', description: 'Avisos y vida de la comunidad', color: '#1877F2' },
  youtube: {
    label: 'YouTube',
    description: 'Celebraciones y videos de la parroquia',
    color: '#D90000',
  },
  instagram: {
    label: 'Instagram',
    description: 'Fotografías y encuentros de nuestra comunidad',
    color: '#C62C55',
  },
}
export default async function ContactoPage() {
  const payload = await getPayload({ config: await config })
  const contact = await payload.findGlobal({ slug: 'contact' })
  const channels = (contact.channels ?? []).filter((c) => c.platform && c.url)
  const hours = (contact.officeHours ?? []).filter((h) => h.label && h.hours)
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Inicio', href: '/' }, { label: 'Contacto' }]}
        title="Estamos para"
        emphasis="servirte"
        lead="Encontrá cómo comunicarte con la parroquia, el horario de oficina y cómo llegar."
      />
      <section className="py-[clamp(36px,6vw,72px)]">
        <Container>
          <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.1fr]">
            <div className="min-w-0 lg:order-2">
              <ContactForm channels={channels} />
              {(contact.address || contact.mapUrl) && (
                <section
                  aria-labelledby="parish-location"
                  className="mt-6 rounded-lg border border-border bg-white p-6 sm:p-8"
                >
                  <div className="mb-3 flex items-center gap-3 text-blue">
                    <Icon name="pin" className="h-6 w-6" />
                    <h2 id="parish-location" className="font-display text-[26px] font-medium">
                      Cómo llegar
                    </h2>
                  </div>
                  {contact.address && (
                    <p className="mb-5 whitespace-pre-line leading-relaxed text-muted">
                      {contact.address}
                    </p>
                  )}
                  {contact.mapUrl && (
                    <Button href={contact.mapUrl} variant="soft">
                      Ver ubicación en el mapa
                    </Button>
                  )}
                </section>
              )}
            </div>
            <div className="min-w-0 space-y-6 lg:order-1">
              {hours.length > 0 && (
                <section
                  aria-labelledby="office-hours"
                  className="rounded-lg border border-border bg-white p-6 sm:p-8"
                >
                  <h2 id="office-hours" className="mb-4 font-display text-[26px] font-medium">
                    Horario de oficina
                  </h2>
                  <dl>
                    {hours.map((h, i) => (
                      <div
                        key={h.id ?? i}
                        className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-b border-line-soft py-3 last:border-b-0"
                      >
                        <dt className="font-semibold">{h.label}</dt>
                        <dd className="max-w-full font-semibold text-blue">{h.hours}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              )}
              {channels.length > 0 && (
                <section aria-labelledby="official-channels">
                  <h2 id="official-channels" className="mb-4 font-display text-[26px] font-medium">
                    Canales oficiales
                  </h2>
                  <div className="space-y-3">
                    {channels.map((c, i) => {
                      const meta = PLATFORM_META[c.platform!]
                      return (
                        <a
                          key={c.id ?? i}
                          href={c.url!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="card-hover flex items-center gap-4 rounded-lg border border-border bg-white p-5"
                        >
                          <span
                            className="grid h-12 w-12 shrink-0 place-items-center rounded-md text-white"
                            style={{ background: meta?.color ?? 'var(--color-blue)' }}
                          >
                            <SocialIcon platform={c.platform!} />
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-display text-[21px] font-semibold">
                              {meta?.label ?? c.platform}
                            </h3>
                            <p className="mt-1 text-sm leading-relaxed text-muted">
                              {channelDescription(c.label, meta?.description ?? '')}
                            </p>
                          </div>
                          <Icon name="arrow" className="ml-auto h-5 w-5 shrink-0 text-blue" />
                        </a>
                      )
                    })}
                  </div>
                </section>
              )}
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
