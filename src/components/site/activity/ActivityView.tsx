import { Container } from '@/components/ui/Container'
import type { ActivityPageData } from '@/lib/activity'
import { ActivityFeed } from './ActivityFeed'
import { SocialLinksCard } from './SocialLinksCard'
import { ActivityNotice } from './ActivityNotice'
import type { ActiveNotice } from '@/lib/activity-notice'

export function ActivityView({
  initial,
  notice = null,
  showFilters = true,
}: {
  initial: ActivityPageData
  notice?: ActiveNotice | null
  showFilters?: boolean
}) {
  return (
    <>
      <section className="border-b border-line-soft bg-bg-soft py-12 md:py-16">
        <Container>
          <p className="mb-3 text-xs font-bold uppercase tracking-[.16em] text-blue">
            Nuestra comunidad
          </p>
          <h1 className="font-display text-4xl font-medium text-navy-deep md:text-5xl">
            La vida de la parroquia
          </h1>
          <p className="mt-4 max-w-xl leading-relaxed text-muted">
            Celebraciones, encuentros y pequeños momentos que nos unen. Conocé lo más reciente y
            volvé a recorrer la historia de nuestra comunidad.
          </p>
        </Container>
      </section>
      <Container>
        <div className="grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_250px] lg:gap-8 md:py-14">
          <div className="min-w-0">
            <ActivityNotice notice={notice} />
            <ActivityFeed
              key={showFilters ? 'filters' : 'no-filters'}
              initial={initial}
              showFilters={showFilters}
            />
          </div>
          <SocialLinksCard />
        </div>
      </Container>
    </>
  )
}
