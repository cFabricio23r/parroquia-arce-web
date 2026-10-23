import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getPublishedClergy } from './clergy'

// cache() solo deduplica dentro del request; no conserva perfiles entre visitas.
export const getClergyProfiles = cache(async () => {
  const payload = await getPayload({ config: await config })
  const source = await payload.findGlobal({ slug: 'clergy', depth: 1, overrideAccess: false })
  return getPublishedClergy(source)
})
