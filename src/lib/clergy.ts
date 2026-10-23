import type { Clergy, Media } from '@/payload-types'

export type ClergyPosition = 'pastor' | 'assistant'
export type ClergySource = { [Position in ClergyPosition]?: Clergy[Position] | null }
export type ClergyProfile = {
  id: 'parroco' | 'auxiliar'
  name: string
  role: string
  summary: string
  photo: number | Media | null
  biography: NonNullable<Clergy['pastor']>['biography']
}

/** La biblioteca también contiene archivos de audio y documentos. */
export function getClergyPhoto(photo: ClergyProfile['photo']): Media | null {
  return photo && typeof photo === 'object' && photo.url && photo.mimeType?.startsWith('image/')
    ? photo
    : null
}

/** También filtra las lecturas Local API que omitan el control de acceso. */
export function getPublishedClergy(source: ClergySource): ClergyProfile[] {
  const profiles: ClergyProfile[] = []
  for (const position of ['pastor', 'assistant'] as const) {
    const profile = source[position]
    if (profile?.published !== true || !profile.name?.trim() || !profile.summary?.trim()) continue
    profiles.push({
      id: position === 'pastor' ? 'parroco' : 'auxiliar',
      name: profile.name.trim(),
      role: profile.role?.trim() || (position === 'pastor' ? 'Párroco' : 'Sacerdote auxiliar'),
      summary: profile.summary.trim(),
      photo: getClergyPhoto(profile.photo ?? null),
      biography: profile.biography,
    })
  }
  return profiles
}

/** Lexical guarda un árbol incluso cuando el editor se deja vacío. */
export function hasBiographyContent(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  const node = value as Record<string, unknown>
  if (typeof node.text === 'string' && node.text.trim()) return true
  if (node.type === 'upload' && node.value && typeof node.value === 'object') {
    const media = node.value as Record<string, unknown>
    if (typeof media.url === 'string' && media.url) return true
  }
  if (node.root) return hasBiographyContent(node.root)
  return Array.isArray(node.children) && node.children.some(hasBiographyContent)
}
