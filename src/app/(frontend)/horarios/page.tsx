import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { PageHero } from '@/components/site/PageHero'
import { ScheduleSections } from '@/components/site/ScheduleSections'
import { deriveSchedule } from '@/lib/parish-schedule'

export const metadata: Metadata = { title: 'Horarios y sacramentos' }

/**
 * Todo sale del global `contact`, editable desde /admin. Este archivo solo lee y
 * delega: el render vive en `ScheduleSections`, que es puro y testeable.
 */
export default async function HorariosPage() {
  const payload = await getPayload({ config: await config })
  const contact = await payload.findGlobal({ slug: 'contact' })

  const officeHours = (contact.officeHours ?? [])
    .filter((h) => h.label || h.hours)
    .map((h) => [h.label ?? '', h.hours ?? ''] as const)

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Inicio', href: '/' }, { label: 'Horarios y sacramentos' }]}
        title="Horarios y"
        emphasis="sacramentos"
        lead="Misas, devociones y la preparación de cada sacramento, con la información que la parroquia mantiene al día."
      />
      <ScheduleSections
        schedule={deriveSchedule(contact)}
        officeHours={officeHours}
        mapUrl={contact.mapUrl}
      />
    </>
  )
}
