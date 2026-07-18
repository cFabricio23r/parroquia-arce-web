import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Mark } from './Mark'

const VIDA = [
  { href: '/horarios', label: 'Horarios y sacramentos' },
  { href: '/sectores', label: 'Sectores y ermitas' },
  { href: '/grupos', label: 'Grupos y ministerios' },
  { href: '/eventos', label: 'Agenda de eventos' },
]

const COMUNICACION = [
  { href: '/radio', label: 'Radio parroquial' },
  { href: '/noticias', label: 'Noticias y avisos' },
  { href: '/noticias', label: 'Formación católica' },
]

const PLATFORM_LABEL: Record<string, string> = {
  whatsapp: 'WhatsApp',
  facebook: 'Facebook',
  youtube: 'YouTube',
  instagram: 'Instagram',
}

export async function Footer() {
  const payload = await getPayload({ config: await config })
  const [contact, settings] = await Promise.all([
    payload.findGlobal({ slug: 'contact' }),
    payload.findGlobal({ slug: 'settings' }),
  ])

  const parishName = contact.parishName || 'Inmaculada Concepción'
  const address = contact.address || 'Ciudad Arce, La Libertad'
  const mapUrl = contact.mapUrl
  const channels = (contact.channels ?? []).filter((c) => c.url && c.platform)
  const radioLive = settings.radio?.available ?? true

  return (
    <footer className="border-t-4 border-amber bg-navy-deep text-[#9FB4D2]">
      <Container>
        <div className="pb-[30px] pt-[60px]">
          {/* Radio bar — ds.css:219-222 */}
          <div className="mb-2 grid grid-cols-1 items-center gap-[22px] rounded-md border border-white/10 bg-white/5 px-[22px] py-4 sm:grid-cols-[auto_1fr_auto]">
            <span className="inline-flex items-center gap-[10px] font-bold text-white">
              <span
                className={`h-2 w-2 rounded-full ${radioLive ? 'bg-amber [animation:pulse-live_2s_infinite]' : 'bg-[#7F95B5]'}`}
              />
              {radioLive ? 'Radio parroquial en vivo' : 'Radio parroquial · fuera del aire'}
            </span>
            <span className="text-[14.5px] text-[#A9BCD8]">
              Reflexiones, música católica, avisos y voces de la comunidad.
            </span>
            <Link href="/radio" className="text-[14.5px] font-semibold text-white">
              {radioLive ? 'Escuchar en vivo →' : 'Ver la programación →'}
            </Link>
          </div>

          {/* ds.css:205, 253, 257 — 4 cols / 2 cols / 1 col */}
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.1fr]">
            <div>
              <Link href="/" className="flex flex-none items-center gap-[13px]">
                <Mark className="bg-white/10" />
                <span className="inline-flex flex-col leading-[1.08]">
                  <b className="whitespace-nowrap font-display text-[16.5px] font-semibold tracking-[.005em] text-white">
                    {parishName}
                  </b>
                  <span className="text-[12.5px] text-[#7F95B5]">{address.split('\n')[0]}</span>
                </span>
              </Link>
              <p className="mb-[22px] mt-[18px] max-w-[32ch] text-[14.5px] leading-[1.6] text-[#A9BCD8]">
                Una parroquia viva, una comunidad en misión. Un espacio digital para encontrarnos,
                servir y caminar juntos como familia parroquial.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button href="/radio" variant="amber">
                  Escuchar radio
                </Button>
                <Button href="/contacto" variant="outline-light">
                  Contactar
                </Button>
              </div>
            </div>

            <div>
              <h2 className="mb-4 font-display text-[18px] font-semibold text-white">
                Vida parroquial
              </h2>
              <ul className="flex list-none flex-col gap-[11px] p-0">
                {VIDA.map((i) => (
                  <li key={i.label}>
                    <Link
                      href={i.href}
                      className="text-[14.5px] text-[#A9BCD8] transition-colors hover:text-white"
                    >
                      {i.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="mb-4 font-display text-[18px] font-semibold text-white">Comunicación</h2>
              <ul className="flex list-none flex-col gap-[11px] p-0">
                {COMUNICACION.map((i) => (
                  <li key={i.label}>
                    <Link
                      href={i.href}
                      className="text-[14.5px] text-[#A9BCD8] transition-colors hover:text-white"
                    >
                      {i.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="mb-4 font-display text-[18px] font-semibold text-white">Contacto</h2>
              <p className="text-[14.5px] leading-[1.6] text-[#A9BCD8]">
                {address.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < address.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </p>
              {mapUrl && (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-[10px] inline-flex items-center gap-[6px] text-[14.5px] font-semibold text-white transition-colors hover:text-amber"
                >
                  Cómo llegar →
                </a>
              )}
              {channels.length > 0 ? (
                <ul className="mt-[14px] flex list-none flex-col gap-[9px] p-0">
                  {channels.map((c, i) => (
                    <li key={c.id ?? i}>
                      <a
                        href={c.url!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[14.5px] text-[#A9BCD8] transition-colors hover:text-white"
                      >
                        {PLATFORM_LABEL[c.platform!] ?? c.platform}
                        {c.label ? ` · ${c.label}` : ''}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-[14px] text-[14.5px] leading-[1.6] text-[#A9BCD8]">
                  Canales oficiales de la parroquia
                </p>
              )}
            </div>
          </div>

          {/* ds.css:216, 259 */}
          <div className="mt-[44px] flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-[13px] text-[#7F95B5] sm:flex-row sm:items-center">
            <span>© 2026 Parroquia Inmaculada Concepción de María, Ciudad Arce.</span>
            <span>Una parroquia viva, una comunidad en misión.</span>
          </div>
        </div>
      </Container>
    </footer>
  )
}
