// Solo importar desde rutas del servidor. Nunca enviar credenciales al cliente.
import {
  makeStream,
  manualStream,
  YOUTUBE_CHANNEL_ID,
  type LiveControl,
  type Platform,
  type ProviderResult,
} from './social-live'

type Fetcher = typeof fetch
const empty = (state: ProviderResult['state']): ProviderResult => ({ state, stream: null })

async function json(url: URL, fetcher: Fetcher, seconds: number, token?: string) {
  const res = await fetcher(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    signal: AbortSignal.timeout(8000),
    ...(seconds > 0 ? { next: { revalidate: seconds } } : { cache: 'no-store' as const }),
  })
  if (!res.ok) throw new Error('Proveedor no disponible')
  return res.json()
}

export async function detectYouTube(
  key?: string,
  fetcher: Fetcher = fetch,
): Promise<ProviderResult> {
  if (!key) return empty('unconfigured')
  try {
    const search = new URL('https://www.googleapis.com/youtube/v3/search')
    search.search = new URLSearchParams({
      key,
      part: 'snippet',
      channelId: YOUTUBE_CHANNEL_ID,
      eventType: 'live',
      type: 'video',
      maxResults: '5',
    }).toString()
    const data = (await json(search, fetcher, 1200)) as { items: { id?: { videoId?: string } }[] }
    const ids = data.items
      .map((item) => item.id?.videoId)
      .filter((id): id is string => !!id && /^[\w-]{11}$/.test(id))
    if (!ids.length) return empty('offline')
    const videos = new URL('https://www.googleapis.com/youtube/v3/videos')
    videos.search = new URLSearchParams({
      key,
      part: 'snippet,status,liveStreamingDetails',
      id: ids.join(','),
    }).toString()
    const details = (await json(videos, fetcher, 0)) as {
      items: {
        id: string
        snippet?: { title?: string; liveBroadcastContent?: string }
        status?: { embeddable?: boolean }
        liveStreamingDetails?: { actualStartTime?: string; actualEndTime?: string }
      }[]
    }
    const live = details.items.find(
      (item) =>
        ids.includes(item.id) &&
        item.status?.embeddable === true &&
        item.snippet?.liveBroadcastContent === 'live' &&
        item.liveStreamingDetails?.actualStartTime &&
        !item.liveStreamingDetails.actualEndTime,
    )
    return live
      ? { state: 'live', stream: makeStream('youtube', live.id, live.snippet?.title) }
      : empty('offline')
  } catch {
    return empty('unavailable')
  }
}

export async function detectFacebook(
  config: { pageId?: string; token?: string; version?: string },
  fetcher: Fetcher = fetch,
): Promise<ProviderResult> {
  const { pageId, token, version } = config
  if (!pageId || !/^\d+$/.test(pageId) || !token || !version || !/^v\d+\.\d+$/.test(version))
    return empty('unconfigured')
  try {
    const url = new URL(`https://graph.facebook.com/${version}/${pageId}/live_videos`)
    url.search = new URLSearchParams({
      fields: 'id,title,status',
      broadcast_status: '["LIVE"]',
      limit: '10',
    }).toString()
    const data = (await json(url, fetcher, 0, token)) as {
      data: { id: string; title?: string; status?: string }[]
    }
    const live = data.data.find((item) => item.status === 'LIVE' && /^\d+$/.test(item.id))
    return live
      ? { state: 'live', stream: makeStream('facebook', live.id, live.title) }
      : empty('offline')
  } catch {
    return empty('unavailable')
  }
}

export async function resolveProvider(
  platform: Platform,
  control: LiveControl | null | undefined,
  detector: () => Promise<ProviderResult>,
): Promise<ProviderResult> {
  if (control?.mode === 'off') return empty('disabled')
  if (control?.mode === 'manual') {
    const stream = manualStream(platform, control)
    return stream ? { state: 'live', stream } : empty('offline')
  }
  return detector()
}
