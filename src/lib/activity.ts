export type ActivityPost = {
  id: string
  title: string
  excerpt: string
  date: string
  url: string
  image: string | null
  kind?: 'photo' | 'video' | 'text' | 'other'
}

export type ActivityFilters = { from?: string; to?: string; kind?: string }

export function parseActivityFilters(input: ActivityFilters) {
  const from = input.from || ''
  const to = input.to || ''
  const kind = input.kind || 'all'
  const validDate = (value: string) =>
    !value ||
    (/^\d{4}-\d{2}-\d{2}$/.test(value) &&
      Number.isFinite(Date.parse(value)) &&
      new Date(value).toISOString().slice(0, 10) === value)
  if (
    !validDate(from) ||
    !validDate(to) ||
    (from && to && from > to) ||
    !['all', 'photo', 'video', 'text'].includes(kind)
  )
    return null
  // El Salvador usa UTC-6 todo el año. Hasta incluye el día completo.
  return {
    from,
    to,
    kind,
    since: from ? Date.parse(`${from}T00:00:00-06:00`) / 1000 : undefined,
    until: to ? Date.parse(`${to}T00:00:00-06:00`) / 1000 + 86400 : undefined,
  }
}

export type ActivityPageData = {
  state: 'ready' | 'unconfigured' | 'unavailable' | 'invalid-cursor' | 'invalid-filters'
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
  const attachments = post.attachments as
    | { data?: { media_type?: string; subattachments?: { data?: { media_type?: string }[] } }[] }
    | undefined
  const items = Array.isArray(attachments?.data) ? attachments.data : []
  const mediaTypes = items.flatMap((item) => [
    item.media_type,
    ...(Array.isArray(item.subattachments?.data)
      ? item.subattachments.data.map((child) => child.media_type)
      : []),
  ])
  const kind = mediaTypes.includes('video')
    ? 'video'
    : mediaTypes.includes('photo')
      ? 'photo'
      : items.length || post.full_picture
        ? 'other'
        : 'text'
  return {
    id: post.id,
    title,
    excerpt: excerpt.slice(0, 600),
    date: date.toISOString(),
    url,
    image: safeUrl(post.full_picture, true),
    kind,
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
