import { Button } from '@/components/ui/Button'
type Channel = { platform?: string | null; url?: string | null }
/** Canales reales: nunca confirmar un envío que no se realizó. */
export function ContactForm({ channels = [] }: { channels?: Channel[] }) {
  const whatsapp = channels.find((c) => c.platform === 'whatsapp' && c.url)
  const facebook = channels.find((c) => c.platform === 'facebook' && c.url)
  const channel = whatsapp ?? facebook
  return (
    <section
      aria-labelledby="contact-action"
      className="rounded-lg border border-border bg-blue-soft p-6 sm:p-9"
    >
      <h2 id="contact-action" className="font-display text-[32px] font-medium">
        Hablemos
      </h2>
      <p className="mb-6 mt-3 leading-relaxed text-muted">
        Para consultas sobre sacramentos o la vida parroquial, usá nuestros canales oficiales o
        acercate a la oficina parroquial en su horario de atención.
      </p>
      {channel?.url && (
        <Button href={channel.url} block>
          {whatsapp ? 'Escribinos por WhatsApp' : 'Contactanos en Facebook'}
        </Button>
      )}
      <p className="mt-4 text-sm leading-relaxed text-muted">
        {channel
          ? 'El enlace abre el canal oficial. Tu consulta se envía desde esa plataforma.'
          : 'Consultá el horario de atención antes de visitarnos.'}
      </p>
    </section>
  )
}
