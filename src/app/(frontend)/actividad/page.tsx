import type { Metadata } from 'next'
import { getActivityPage } from '@/lib/activity-server'
import { ActivityView } from '@/components/site/activity/ActivityView'

export const metadata: Metadata = {
  title: 'Actividad parroquial',
  description: 'Celebraciones, encuentros y publicaciones de nuestra comunidad parroquial.',
}

export default async function ActivityPage() {
  return <ActivityView initial={await getActivityPage()} />
}
