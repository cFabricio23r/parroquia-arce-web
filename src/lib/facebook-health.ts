export type FacebookConfig = { pageId?: string; token?: string; version?: string }
export type FacebookHealthState =
  'ok' | 'unconfigured' | 'token-invalid' | 'permissions' | 'unavailable'
export type FacebookHealth = { posts: FacebookHealthState; live: FacebookHealthState }
export type StoredFacebookHealth = Partial<FacebookHealth> & {
  checkedAt?: string | null
  lastSuccessAt?: string | null
}

export async function checkFacebookHealth(
  config: FacebookConfig,
  fetcher: typeof fetch = fetch,
): Promise<FacebookHealth> {
  if (
    !config.pageId ||
    !/^\d+$/.test(config.pageId) ||
    !config.token ||
    !config.version ||
    !/^v\d+\.\d+$/.test(config.version)
  )
    return { posts: 'unconfigured', live: 'unconfigured' }
  async function check(edge: string): Promise<FacebookHealthState> {
    try {
      const url = new URL(`https://graph.facebook.com/${config.version}/${config.pageId}/${edge}`)
      url.search = new URLSearchParams({
        fields: 'id',
        limit: '1',
        ...(edge === 'live_videos' ? { broadcast_status: '["LIVE"]' } : {}),
      }).toString()
      const response = await fetcher(url, {
        headers: { Authorization: `Bearer ${config.token}` },
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      })
      const data = await response.json()
      if (response.ok && Array.isArray(data.data)) return 'ok'
      if (data.error?.code === 190) return 'token-invalid'
      if (
        [10, 200].includes(data.error?.code) ||
        (data.error?.code === 100 &&
          /permission|reviewable feature/i.test(data.error?.message || ''))
      )
        return 'permissions'
      return 'unavailable'
    } catch {
      return 'unavailable'
    }
  }
  const [posts, live] = await Promise.all([check('posts'), check('live_videos')])
  return { posts, live }
}
