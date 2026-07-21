import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { Container } from '@/components/ui/Container'
import { PageHero } from '@/components/site/PageHero'
import { ContactForm } from '@/components/site/ContactForm'
import { Reveal } from '@/components/news/Reveal'

export const metadata: Metadata = { title: 'Contacto' }

// Los canales oficiales y el horario de oficina se leen del global `contact`,
// editable desde /admin (Configuración → Contacto). Sin datos cargados, cada
// bloque cae a un placeholder para que la pagina nunca quede rota.

const PLATFORM_META: Record<string, { label: string; description: string; color: string }> = {
  whatsapp: {
    label: 'WhatsApp oficial',
    description: 'Consultas pastorales y sacramentos',
    color: 'var(--color-ok)',
  },
  facebook: { label: 'Facebook', description: 'Avisos, transmisiones y comunidad', color: '#1877F2' },
  youtube: { label: 'YouTube', description: 'Misas, homilías y formación', color: '#FF0000' },
  instagram: { label: 'Instagram', description: 'Comunidad y momentos de la parroquia', color: '#E4405F' },
}

export default async function ContactoPage() {
  const payload = await getPayload({ config: await config })
  const contact = await payload.findGlobal({ slug: 'contact' })

  const canales = (contact.channels ?? [])
    .filter((c): c is typeof c & { platform: string; url: string } => !!c.platform && !!c.url)
    .map((c) => {
      const meta = PLATFORM_META[c.platform]
      return {
        title: meta?.label ?? c.platform,
        text: c.label || meta?.description || '',
        color: meta?.color ?? 'var(--color-blue)',
        url: c.url,
      }
    })

  const horario = (contact.officeHours ?? [])
    .filter((h) => h.label || h.hours)
    .map((h) => [h.label ?? '', h.hours ?? ''] as const)

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
              {canales.length > 0 && (
                <div className="flex flex-col gap-[14px]">
                  {canales.map((c) => (
                    <a
                      key={c.title}
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 rounded-lg border border-border bg-white p-[20px_22px] [transition:transform_.16s,box-shadow_.2s,border-color_.2s] hover:-translate-y-1 hover:border-line-soft hover:shadow-md"
                    >
                      <span
                        className="grid h-[50px] w-[50px] flex-none place-items-center rounded-[13px] text-white"
                        style={{ background: c.color }}
                        aria-hidden="true"
                      />
                      <div>
                        <h4 className="font-display text-[19px] font-semibold">{c.title}</h4>
                        {c.text && <p className="text-[14px] text-muted">{c.text}</p>}
                      </div>
                      <span className="ml-auto text-blue" aria-hidden="true">
                        →
                      </span>
                    </a>
                  ))}
                </div>
              )}

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
