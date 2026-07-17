// Mapeos de categoria/audiencia a variantes de Badge, y formato de fecha.
// Centralizado para que las cards no lo dupliquen.

type BadgeVariant = 'blue' | 'sky' | 'amber' | 'live'

/** news.category -> variante de Badge. Ver el spec para el mapeo. */
export function newsCategoryVariant(category?: string | null): BadgeVariant {
  switch (category) {
    case 'aviso':
    case 'emergencia':
      return 'amber'
    case 'celebracion':
      return 'sky'
    case 'comunicado':
    case 'pastoral':
    default:
      return 'blue'
  }
}

/** Etiqueta legible de news.category. */
export function newsCategoryLabel(category?: string | null): string {
  const map: Record<string, string> = {
    aviso: 'Aviso',
    comunicado: 'Comunicado',
    celebracion: 'Celebración',
    pastoral: 'Pastoral',
    emergencia: 'Emergencia',
  }
  return category ? (map[category] ?? category) : ''
}

/** formation.audience -> variante de Badge. */
export function audienceVariant(audience?: string | null): BadgeVariant {
  switch (audience) {
    case 'familias':
      return 'sky'
    case 'servidores':
      return 'amber'
    case 'jovenes':
    case 'general':
    default:
      return 'blue'
  }
}

/** Etiqueta legible de formation.audience. */
export function audienceLabel(audience?: string | null): string {
  const map: Record<string, string> = {
    jovenes: 'Para jóvenes',
    familias: 'Familias',
    servidores: 'Servidores',
    general: 'General',
  }
  return audience ? (map[audience] ?? audience) : ''
}

/** Etiqueta legible de formation.category. */
export function formationCategoryLabel(category?: string | null): string {
  const map: Record<string, string> = {
    serie: 'Serie',
    recurso: 'Recurso descargable',
    articulo: 'Artículo',
    catequesis: 'Catequesis',
  }
  return category ? (map[category] ?? category) : ''
}

/** Fecha en formato es-SV: "8 de junio de 2026". */
export function formatDate(value?: string | null): string {
  if (!value) return ''
  return new Date(value).toLocaleDateString('es-SV', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
