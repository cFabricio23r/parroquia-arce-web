import { Reveal } from '@/components/news/Reveal'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { Container } from '@/components/ui/Container'
import { deriveSchedule } from '@/lib/parish-schedule'
import { deriveAppDownload } from '@/lib/app-download'
import { getClergyProfiles } from '@/lib/get-clergy'
import { getActiveSponsors } from '@/lib/sponsors'
import { SocialIcon } from '@/components/ui/SocialIcon'
import { Mark } from './Mark'

const PLATFORM_LABEL: Record<string, string> = {
  whatsapp: 'WhatsApp',
  facebook: 'Facebook',
  youtube: 'YouTube',
  instagram: 'Instagram',
}
export async function Footer() {
  const payload = await getPayload({ config: await config })
  const [contact, settings, clergy, sponsors] = await Promise.all([
    payload.findGlobal({ slug: 'contact' }),
    payload.findGlobal({ slug: 'settings' }),
    getClergyProfiles(),
    // El pie no se cae si los patrocinadores fallan: simplemente no hay enlace.
    getActiveSponsors().catch(() => []),
  ])
  const address = contact.address || 'Ciudad Arce, La Libertad · El Salvador'
  const channels = (contact.channels ?? []).filter((c) => c.url && c.platform)
  const { hasMisas } = deriveSchedule(contact)
  const logo = settings.marca?.isotipo
  const links = [
    ...(hasMisas ? [{ href: '/horarios', label: 'Horarios y sacramentos' }] : []),
    { href: '/sectores', label: 'Sectores y ermitas' },
    { href: '/grupos', label: 'Grupos y ministerios' },
    { href: '/eventos', label: 'Agenda de eventos' },
    ...(clergy.length ? [{ href: '/sacerdotes', label: 'Nuestros sacerdotes' }] : []),
    { href: '/noticias', label: 'Noticias y formación' },
    { href: '/reflexiones', label: 'Reflexiones de la semana' },
    { href: '/radio', label: 'Radio parroquial' },
    ...(sponsors.length ? [{ href: '/patrocinadores', label: 'Patrocinadores' }] : []),
    ...(deriveAppDownload(settings).ready ? [{ href: '/app', label: 'Descargá la app' }] : []),
  ]
  return (
    <footer className="border-t border-white/10 bg-navy-deep text-[#B6C6DD]">
      <Container>
        <Reveal className="grid gap-9 py-10 sm:grid-cols-2 sm:py-12 lg:grid-cols-[1.15fr_1fr_1.2fr] lg:gap-14">
          <div className="min-w-0">
            <Link href="/" className="inline-flex items-center gap-3">
              <Mark
                className="bg-white/10"
                src={logo && typeof logo === 'object' ? logo.url : undefined}
                alt={logo && typeof logo === 'object' ? logo.alt : undefined}
              />
              <span className="min-w-0">
                <b className="block font-display text-[20px] font-semibold leading-tight text-white">
                  {contact.parishName || 'Inmaculada Concepción'}
                </b>
                <span className="mt-1 block text-sm">Parroquia · Ciudad Arce</span>
              </span>
            </Link>
            <p className="mt-5 max-w-[30ch] text-[15px] leading-relaxed">
              Una comunidad de fe para encontrarnos, servir y caminar juntos.
            </p>
            {channels.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Redes y canales oficiales">
                {channels.map((c, i) => (
                  <li key={c.id ?? i}>
                    <a
                      href={c.url!}
                      aria-label={PLATFORM_LABEL[c.platform!] ?? c.platform!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
                    >
                      <SocialIcon platform={c.platform!} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <nav aria-label="Enlaces del pie de página">
            <h2 className="mb-4 font-display text-[22px] font-medium text-white">
              Vida parroquial
            </h2>
            <ul className="grid gap-1">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-10 items-center py-1 text-[15px] underline-offset-4 hover:text-white hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <section aria-labelledby="footer-location" className="min-w-0">
            <h2
              id="footer-location"
              className="mb-4 font-display text-[22px] font-medium text-white"
            >
              Encontranos
            </h2>
            <p className="whitespace-pre-line text-[15px] leading-relaxed">{address}</p>
            {contact.mapUrl && (
              <a
                href={contact.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold text-white underline-offset-4 hover:underline"
              >
                Cómo llegar <span aria-hidden="true">↗</span>
              </a>
            )}
            <Link
              href="/contacto"
              className="mt-4 flex min-h-11 w-fit items-center rounded-pill border border-white/30 px-5 py-2 font-semibold text-white transition-colors hover:bg-white/10"
            >
              Contactar con la parroquia
            </Link>
          </section>
        </Reveal>
        <div className="border-t border-white/15 py-5 text-[13px] leading-relaxed text-[#A9BCD8]">
          © {new Date().getUTCFullYear()} Parroquia Inmaculada Concepción de María · Ciudad Arce.
        </div>
      </Container>
    </footer>
  )
}
