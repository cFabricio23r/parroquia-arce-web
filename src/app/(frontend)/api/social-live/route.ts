import { getPayload } from 'payload'
import config from '@/payload.config'
import { detectFacebook, detectYouTube, resolveProvider } from '@/lib/social-live-server'

export async function GET() {
  try {
    const payload = await getPayload({ config })
    const settings = await payload.findGlobal({ slug: 'settings', depth: 0 })
    const [youtube, facebook] = await Promise.all([
      resolveProvider('youtube', settings.socialLive?.youtube, () =>
        detectYouTube(process.env.YOUTUBE_API_KEY),
      ),
      resolveProvider('facebook', settings.socialLive?.facebook, () =>
        detectFacebook({
          pageId: process.env.FACEBOOK_PAGE_ID,
          token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
          version: process.env.FACEBOOK_GRAPH_VERSION,
        }),
      ),
    ])
    return Response.json(
      {
        streams: [youtube.stream, facebook.stream].filter(Boolean),
        providers: { youtube: youtube.state, facebook: facebook.state },
      },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch {
    return Response.json(
      { streams: [], providers: { youtube: 'unavailable', facebook: 'unavailable' } },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
