import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { isFacebookUrl, isInstagramUrl } from './sponsor-links'

/** Patrocinador listo para pintar (web). */
export type SponsorView = {
  id: string
  name: string
  logo: { url: string; alt: string }
  category: string | null
  blurb: string | null
  facebookUrl: string | null
  instagramUrl: string | null
}

const str = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v : null)

/**
 * Convierte un doc de Payload (depth >= 1) en vista. Devuelve `null` si falta
 * el nombre, el logo (https) o si no queda ningun enlace valido: sin enlace no
 * hay nada que ofrecerle al negocio a cambio del aporte.
 */
export function toSponsorView(doc: unknown): SponsorView | null {
  if (!doc || typeof doc !== 'object') return null
  const d = doc as Record<string, unknown>
  const name = str(d.name)
  const logoDoc = d.logo && typeof d.logo === 'object' ? (d.logo as Record<string, unknown>) : null
  const logoUrl = logoDoc ? str(logoDoc.url) : null
  if (!name || !logoUrl?.startsWith('https://')) return null

  const fb = str(d.facebookUrl)
  const ig = str(d.instagramUrl)
  const facebookUrl = fb && isFacebookUrl(fb) ? fb : null
  const instagramUrl = ig && isInstagramUrl(ig) ? ig : null
  if (!facebookUrl && !instagramUrl) return null

  return {
    id: String(d.id),
    name,
    // `alt` es obligatorio en media; si faltara, el nombre del negocio.
    logo: { url: logoUrl, alt: (logoDoc && str(logoDoc.alt)) || name },
    category: str(d.category),
    blurb: str(d.blurb),
    facebookUrl,
    instagramUrl,
  }
}

/**
 * Patrocinadores activos, por nombre. Local API con `overrideAccess: false`: aplica `activeOnly`.
 * cache() deduplica dentro del request (la portada y el pie lo piden los dos).
 */
export const getActiveSponsors = cache(async (): Promise<SponsorView[]> => {
  const payload = await getPayload({ config: await config })
  const res = await payload.find({
    collection: 'sponsors',
    overrideAccess: false,
    sort: 'name',
    depth: 1,
    limit: 100,
  })
  return res.docs.map(toSponsorView).filter((v): v is SponsorView => v !== null)
})
