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
    <ul className="flex flex-col gap-2 text-[14.5px]">
      {contact?.phone && (
        <li>
          <a href={`tel:${contact.phone}`} className="text-blue hover:underline">
            {contact.phone}
          </a>
        </li>
      )}
      {contact?.whatsapp && (
        <li>
          <a
            href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`}
            className="text-blue hover:underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            WhatsApp {contact.whatsapp}
          </a>
        </li>
      )}
      {contact?.email && (
        <li>
          <a href={`mailto:${contact.email}`} className="text-blue hover:underline">
            {contact.email}
          </a>
        </li>
      )}
      {links.map((l, i) => (
        <li key={l.id ?? i}>
          <a
            href={l.url as string}
            className="text-blue hover:underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            {platformLabel[l.platform ?? 'otro'] ?? 'Enlace'}
          </a>
        </li>
      ))}
    </ul>
  )
}
