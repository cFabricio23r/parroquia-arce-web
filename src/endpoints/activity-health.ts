import type { PayloadRequest } from 'payload'
import { isActivityEditor } from '../access/activity'
import { checkFacebookHealth, type StoredFacebookHealth } from '../lib/facebook-health'

const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'private, no-store' } })

export async function activityHealthEndpoint(req: PayloadRequest): Promise<Response> {
  if (!req.user) return json({ error: 'Iniciá sesión.' }, 401)
  if (!isActivityEditor(req.user)) return json({ error: 'Sin permiso.' }, 403)
  if (req.method === 'POST' && (!req.url || req.headers.get('origin') !== new URL(req.url).origin))
    return json({ error: 'Origen no permitido.' }, 403)
  try {
    const activity = await req.payload.findGlobal({
      slug: 'activity',
      depth: 0,
      overrideAccess: true,
      req,
    })
    const previous = (activity.connection || {}) as StoredFacebookHealth
    if (req.method === 'GET') return json(previous)
    // Evita repetir consultas por doble clic o varias pestañas del admin.
    if (previous.checkedAt && Date.now() - Date.parse(previous.checkedAt) < 30000)
      return json(previous)
    const state = await checkFacebookHealth({
      pageId: process.env.FACEBOOK_PAGE_ID,
      token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
      version: process.env.FACEBOOK_GRAPH_VERSION,
    })
    const checkedAt = new Date().toISOString()
    const connection = {
      ...state,
      checkedAt,
      lastSuccessAt:
        state.posts === 'ok' && state.live === 'ok' ? checkedAt : previous.lastSuccessAt || null,
    }
    await req.payload.updateGlobal({
      slug: 'activity',
      data: { connection },
      overrideAccess: true,
      req,
    })
    return json(connection)
  } catch {
    return json({ error: 'No pudimos comprobar o guardar el estado. Intentá nuevamente.' }, 503)
  }
}
