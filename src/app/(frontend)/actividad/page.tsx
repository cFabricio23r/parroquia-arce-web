import type { Metadata } from 'next'
import { getActivityPage } from '@/lib/activity-server'
import { ActivityView } from '@/components/site/activity/ActivityView'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { activeNotice } from '@/lib/activity-notice'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Actividad parroquial',
  description: 'Celebraciones, encuentros y publicaciones de nuestra comunidad parroquial.',
}

export default async function ActivityPage() {
  const [initial, activity] = await Promise.all([
    getActivityPage(),
    getPayload({ config })
      .then((payload) => payload.findGlobal({ slug: 'activity', depth: 0, overrideAccess: false }))
      .catch(() => null),
  ])
  return (
    <ActivityView
      initial={initial}
      notice={activeNotice(activity?.notice)}
      showFilters={activity?.showFilters === true}
    />
  )
}
