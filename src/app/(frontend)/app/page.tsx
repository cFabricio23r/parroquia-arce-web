import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { AppPageBody } from '@/components/site/app/AppPageBody'
import { deriveAppDownload } from '@/lib/app-download'

const description =
  'Descargá la app de la Parroquia Inmaculada Concepción de María: radio en vivo, horarios, agenda, oración y la vida de nuestra comunidad.'

export const metadata: Metadata = {
  title: 'App de la parroquia',
  description,
  openGraph: { title: 'App de la parroquia', description },
}

// Consultar el CMS en cada visita: encender o apagar la descarga desde /admin se
// ve al instante, sin un nuevo deploy.
export const dynamic = 'force-dynamic'

/**
 * Destino del QR del afiche. Todo sale de `settings.app`, editable desde /admin.
 * Este archivo solo lee y delega: el render vive en `AppPageBody`.
 */
export default async function AppPage() {
  const payload = await getPayload({ config: await config })
  const settings = await payload.findGlobal({ slug: 'settings', depth: 1 })

  return <AppPageBody download={deriveAppDownload(settings)} />
}
