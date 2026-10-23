export const FACEBOOK_PAGE = 'https://www.facebook.com/InmaculadaConcepcionDeMariaCiudadArce'
export const YOUTUBE_CHANNEL_ID = 'UCf6Q3zqeGMyj4pz5fusbyQg'
export const YOUTUBE_CHANNEL = `https://www.youtube.com/channel/${YOUTUBE_CHANNEL_ID}`

export type Platform = 'youtube' | 'facebook'
export type LiveControl = {
  mode?: 'auto' | 'manual' | 'off' | null
  url?: string | null
  endsAt?: string | null
}
export type LiveStream = {
  platform: Platform
  id: string
  title: string
  url: string
  embedUrl: string
}
export type ProviderResult = {
  state: 'live' | 'offline' | 'unconfigured' | 'unavailable' | 'disabled'
  stream: LiveStream | null
}

export function parseVideoUrl(platform: Platform, value: string): string | null {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return null
    if (platform === 'youtube') {
      const host = url.hostname.replace(/^www\./, '')
      const id =
        host === 'youtu.be'
          ? url.pathname.slice(1)
          : ['youtube.com', 'm.youtube.com'].includes(host)
            ? url.pathname === '/watch'
              ? url.searchParams.get('v')
              : url.pathname.match(/^\/(?:live|embed)\/([\w-]+)\/?$/)?.[1]
            : null
      return id && /^[\w-]{11}$/.test(id) ? id : null
    }
    if (!['facebook.com', 'www.facebook.com', 'm.facebook.com'].includes(url.hostname)) return null
    const id =
      url.pathname.match(/\/videos\/(\d+)\/?$/)?.[1] ??
      (['/watch', '/watch/', '/video.php'].includes(url.pathname)
        ? url.searchParams.get('v')
        : null)
    return id && /^\d+$/.test(id) ? id : null
  } catch {
    return null
  }
}

export function makeStream(
  platform: Platform,
  id: string,
  title = 'Transmisión parroquial',
): LiveStream {
  const url =
    platform === 'youtube'
      ? `https://www.youtube.com/watch?v=${id}`
      : `https://www.facebook.com/watch/?v=${id}`
  return {
    platform,
    id,
    title,
    url,
    embedUrl:
      platform === 'youtube'
        ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=0`
        : `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&autoplay=false`,
  }
}

export function manualStream(
  platform: Platform,
  control: LiveControl | null | undefined,
  now = Date.now(),
): LiveStream | null {
  if (
    control?.mode !== 'manual' ||
    !control.url ||
    !control.endsAt ||
    !(Date.parse(control.endsAt) > now)
  )
    return null
  const id = parseVideoUrl(platform, control.url)
  return id ? makeStream(platform, id) : null
}
