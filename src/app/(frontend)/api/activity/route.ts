import { getActivityPage } from '@/lib/activity-server'

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const result = await getActivityPage(params.get('cursor'), undefined, undefined, {
    from: params.get('from') || undefined,
    to: params.get('to') || undefined,
    kind: params.get('kind') || undefined,
  })
  return Response.json(result, {
    status: ['invalid-cursor', 'invalid-filters'].includes(result.state)
      ? 400
      : result.state === 'unavailable'
        ? 503
        : 200,
    headers: { 'Cache-Control': 'no-store' },
  })
}
