import { Icon } from '@/components/ui/Icon'

/**
 * Cada dato de contacto es una FILA tocable, no un link suelto de texto: el area
 * de click cubre el renglon entero, que en movil es la diferencia entre acertar y
 * no acertar. El icono va `aria-hidden` porque el texto que sigue ya lo dice.
 */
const row =
  'flex items-center gap-[10px] rounded-md px-2 py-[7px] -mx-2 text-blue transition-colors hover:bg-blue-tint'
const dot = 'flex h-7 w-7 flex-none items-center justify-center rounded-md bg-blue-tint text-blue'

export type ContactData = {
  phone?: string | null
  whatsapp?: string | null
  email?: string | null
  socialLinks?: { platform?: string | null; url?: string | null; id?: string | null }[] | null
}

const platformLabel: Record<string, string> = {
  facebook: 'Facebook',
  youtube: 'YouTube',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  otro: 'Enlace',
}

const usableLinks = (contact?: ContactData | null) =>
  (contact?.socialLinks ?? []).filter((l) => l?.url)

/**
 * True si hay algo que mostrar. Lo usa quien envuelve al componente en una
 * tarjeta, para no dibujar una tarjeta vacia.
 */
export function hasContact(contact?: ContactData | null): boolean {
  if (!contact) return false
  return Boolean(
    contact.phone || contact.whatsapp || contact.email || usableLinks(contact).length > 0,
  )
}

/**
 * Telefono, WhatsApp, correo y redes. Renderiza SOLO la lista, sin tarjeta ni
 * encabezado, para servir igual en el aside (envuelto) que dentro de una tarjeta
 * de ermita (en linea).
 *
 * Cierra un agujero viejo: estos datos se cargaban desde /admin y no se
 * mostraban en ninguna parte del sitio.
 */
export function ContactLinks({ contact }: { contact?: ContactData | null }) {
  if (!hasContact(contact)) return null
  const links = usableLinks(contact)

  return (
    <ul className="flex flex-col gap-1 text-[14.5px]">
      {contact?.phone && (
        <li>
          <a href={`tel:${contact.phone}`} className={row}>
            <span className={dot} aria-hidden="true">
              <Icon name="phone" className="h-[15px] w-[15px]" />
            </span>
            <span className="min-w-0 break-words">{contact.phone}</span>
          </a>
        </li>
      )}
      {contact?.whatsapp && (
        <li>
          <a
            href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`}
            className={row}
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className={dot} aria-hidden="true">
              <Icon name="chat" className="h-[15px] w-[15px]" />
            </span>
            <span className="min-w-0 break-words">WhatsApp {contact.whatsapp}</span>
          </a>
        </li>
      )}
      {contact?.email && (
        <li>
          <a href={`mailto:${contact.email}`} className={row}>
            <span className={dot} aria-hidden="true">
              <Icon name="mail" className="h-[15px] w-[15px]" />
            </span>
            <span className="min-w-0 break-all">{contact.email}</span>
          </a>
        </li>
      )}
      {links.map((l, i) => (
        <li key={l.id ?? i}>
          <a href={l.url as string} className={row} rel="noopener noreferrer" target="_blank">
            <span className={dot} aria-hidden="true">
              <Icon name="link" className="h-[15px] w-[15px]" />
            </span>
            <span className="min-w-0 break-words">
              {platformLabel[l.platform ?? 'otro'] ?? 'Enlace'}
            </span>
          </a>
        </li>
      ))}
    </ul>
  )
}
