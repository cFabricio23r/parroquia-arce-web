import { getActivityPage } from '@/lib/activity-server'

export async function GET(request: Request) {
  const cursor = new URL(request.url).searchParams.get('cursor')
  const result = await getActivityPage(cursor)
  return Response.json(result, {
    status: result.state === 'invalid-cursor' ? 400 : result.state === 'unavailable' ? 503 : 200,
    headers: { 'Cache-Control': 'no-store' },
  })
}
