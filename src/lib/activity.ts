export type ActivityPost = {
  id: string
  title: string
  excerpt: string
  date: string
  url: string
  image: string | null
}

export type ActivityPageData = {
  state: 'ready' | 'unconfigured' | 'unavailable' | 'invalid-cursor'
  posts: ActivityPost[]
  nextCursor: string | null
}

function safeUrl(value: unknown, image = false): string | null {
  if (typeof value !== 'string') return null
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return null
    const host = url.hostname
    const allowed = image
      ? ['fbcdn.net', 'fbsbx.com'].some((domain) => host === domain || host.endsWith(`.${domain}`))
      : ['facebook.com', 'www.facebook.com', 'm.facebook.com'].includes(host)
    if (!allowed) return null
    url.searchParams.delete('access_token')
    return url.toString()
  } catch {
    return null
  }
}

export function normalizeActivityPost(value: unknown): ActivityPost | null {
  if (!value || typeof value !== 'object') return null
  const post = value as Record<string, unknown>
  if (typeof post.id !== 'string' || !/^[\d_]+$/.test(post.id)) return null
  const url = safeUrl(post.permalink_url)
  if (!url || typeof post.created_time !== 'string') return null
  const date = new Date(post.created_time)
  if (!Number.isFinite(date.getTime())) return null
  const message = typeof post.message === 'string' ? post.message.trim().slice(0, 10000) : ''
  const firstLine = message.split(/\r?\n/)[0].trim()
  const title = firstLine
    ? firstLine.length > 120
      ? `${firstLine.slice(0, 117).trimEnd()}…`
      : firstLine
    : 'Publicación de la parroquia'
  const excerpt = message.slice(firstLine.length).trim() || (firstLine.length > 120 ? message : '')
  return {
    id: post.id,
    title,
    excerpt: excerpt.slice(0, 600),
    date: date.toISOString(),
    url,
    image: safeUrl(post.full_picture, true),
  }
}

export function activityDate(value: string) {
  return new Intl.DateTimeFormat('es-SV', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/El_Salvador',
  }).format(new Date(value))
}
