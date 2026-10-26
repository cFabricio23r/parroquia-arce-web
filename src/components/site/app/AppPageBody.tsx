import { AppHero } from '@/components/site/app/AppHero'
import { AppTour } from '@/components/site/app/AppTour'
import { AppInstall } from '@/components/site/app/AppInstall'
import type { AppDownload } from '@/lib/app-download'

// Cuerpo de /app: hero + recorrido + instalacion. Presentacional puro, asi la
// pagina entera se testea sin Payload.
export function AppPageBody({ download }: { download: AppDownload }) {
  return (
    <>
      <AppHero download={download} />
      <AppTour />
      <AppInstall download={download} />
    </>
  )
}
