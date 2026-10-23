import type { PayloadRequest } from 'payload'

export async function getInstallSummary(req: Pick<PayloadRequest, 'payload' | 'user'>) {
  if (req.user?.role !== 'super-admin') throw new Error('Forbidden')
  const now = Date.now()
  const count = async (days?: number) => (await req.payload.count({
    collection: 'app-installs',
    overrideAccess: false,
    user: req.user,
    ...(days ? { where: { lastSeenAt: { greater_than_equal: new Date(now - days * 86400000).toISOString() } } } : {}),
  })).totalDocs
  const [total, active7, active30] = await Promise.all([count(), count(7), count(30)])
  return { total, active7, active30 }
}

export async function appInstallsSummaryEndpoint(req: PayloadRequest): Promise<Response> {
  const headers = { 'Cache-Control': 'private, no-store' }
  if (req.user?.role !== 'super-admin') return Response.json({ error: 'No autorizado' }, { status: 403, headers })
  try {
    return Response.json(await getInstallSummary(req), { headers })
  } catch {
    return Response.json({ error: 'No disponible' }, { status: 503, headers })
  }
}
