// Módulo exclusivo del servidor; no importar desde componentes cliente.
import { createHmac, timingSafeEqual } from 'node:crypto'
import {
  normalizeActivityPost,
  parseActivityFilters,
  type ActivityFilters,
  type ActivityPageData,
  type ActivityPost,
} from './activity'

type FacebookConfig = { pageId?: string; token?: string; version?: string }
const empty = (state: ActivityPageData['state']): ActivityPageData => ({
  state,
  posts: [],
  nextCursor: null,
})

function signature(value: string, config: FacebookConfig, filterKey: string) {
  return createHmac('sha256', config.token!)
    .update(`activity:${config.pageId}:${config.version}:${filterKey}:${value}`)
    .digest('base64url')
}
function signCursor(after: string, config: FacebookConfig, filterKey: string) {
  const encoded = Buffer.from(after).toString('base64url')
  return `${encoded}.${signature(encoded, config, filterKey)}`
}
function readCursor(cursor: string, config: FacebookConfig, filterKey: string): string | null {
  if (cursor.length > 2048) return null
  const parts = cursor.split('.')
  if (parts.length !== 2 || !/^[\w-]+$/.test(parts[0]) || !/^[\w-]{43}$/.test(parts[1])) return null
  const expected = signature(parts[0], config, filterKey)
  if (!timingSafeEqual(Buffer.from(parts[1]), Buffer.from(expected))) return null
  return Buffer.from(parts[0], 'base64url').toString('utf8')
}

export async function getActivityPage(
  cursor: string | null = null,
  config: FacebookConfig = {
    pageId: process.env.FACEBOOK_PAGE_ID,
    token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
    version: process.env.FACEBOOK_GRAPH_VERSION,
  },
  fetcher: typeof fetch = fetch,
  input: ActivityFilters = {},
): Promise<ActivityPageData> {
  const filters = parseActivityFilters(input)
  if (!filters) return empty('invalid-filters')
  const filterKey = JSON.stringify([filters.from, filters.to, filters.kind])
  if (
    !config.pageId ||
    !/^\d+$/.test(config.pageId) ||
    !config.token ||
    !config.version ||
    !/^v\d+\.\d+$/.test(config.version)
  )
    return empty('unconfigured')
  const after = cursor ? readCursor(cursor, config, filterKey) : null
  if (cursor && !after) return empty('invalid-cursor')
  try {
    const url = new URL(`https://graph.facebook.com/${config.version}/${config.pageId}/posts`)
    url.search = new URLSearchParams({
      fields:
        'id,message,created_time,permalink_url,full_picture,attachments{media_type,subattachments{media_type}}',
      limit: '9',
      ...(filters.since !== undefined ? { since: String(filters.since) } : {}),
      ...(filters.until !== undefined ? { until: String(filters.until) } : {}),
      ...(after ? { after } : {}),
    }).toString()
    const response = await fetcher(url, {
      headers: { Authorization: `Bearer ${config.token}` },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 900 },
    })
    if (!response.ok) return empty('unavailable')
    const data = (await response.json()) as {
      data?: unknown[]
      paging?: { next?: unknown; cursors?: { after?: unknown } }
    }
    if (!Array.isArray(data.data)) return empty('unavailable')
    const posts = data.data
      .map(normalizeActivityPost)
      .filter((post): post is ActivityPost => post !== null)
      .filter(
        (post) =>
          (filters.kind === 'all' || post.kind === filters.kind) &&
          (filters.since === undefined || Date.parse(post.date) / 1000 >= filters.since) &&
          (filters.until === undefined || Date.parse(post.date) / 1000 < filters.until),
      )
      .filter((post, index, items) => items.findIndex((other) => other.id === post.id) === index)
      .sort((a, b) => b.date.localeCompare(a.date))
    const next = data.paging?.cursors?.after
    const nextCursor =
      data.paging?.next &&
      typeof next === 'string' &&
      next.length > 0 &&
      next.length <= 1024 &&
      next !== after
        ? signCursor(next, config, filterKey)
        : null
    return { state: 'ready', posts, nextCursor }
  } catch {
    return empty('unavailable')
  }
}
