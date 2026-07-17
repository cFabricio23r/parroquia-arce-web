import type { Formation } from '@/payload-types'
import { Badge } from '@/components/ui/Badge'
import { MediaImage } from './MediaImage'
import { audienceVariant, audienceLabel, formationCategoryLabel } from '@/lib/news-format'

export function FormationCard({ item }: { item: Formation }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-border bg-white transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-line-soft hover:shadow-md">
      <div className="relative h-[160px]">
        <MediaImage cover={item.cover} />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <Badge variant={audienceVariant(item.audience)} className="self-start">
          {audienceLabel(item.audience)}
        </Badge>
        <div className="mb-[7px] mt-[12px] text-[12.5px] font-semibold text-muted">
          {formationCategoryLabel(item.category)}
        </div>
        <h3 className="font-display text-[21px] font-semibold leading-[1.1]">{item.title}</h3>
        {item.excerpt && (
          <p className="mt-2 text-[14px] leading-[1.5] text-muted">{item.excerpt}</p>
        )}
      </div>
    </article>
  )
}
