import type { Metadata } from 'next'
import { PageHero } from '@/components/site/PageHero'
import { ClergyProfiles } from '@/components/community/ClergyProfiles'
import { getClergyProfiles } from '@/lib/get-clergy'

export const metadata: Metadata = { title: 'Nuestros sacerdotes' }
export const dynamic = 'force-dynamic'

export default async function SacerdotesPage() {
  const profiles = await getClergyProfiles()
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Inicio', href: '/' }, { label: 'Nuestros sacerdotes' }]}
        title="Nuestros"
        emphasis="sacerdotes"
        lead="Conocé su vocación, su historia y el camino que los une a nuestra comunidad parroquial."
      />
      <ClergyProfiles profiles={profiles} />
    </>
  )
}
