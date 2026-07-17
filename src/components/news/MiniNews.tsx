import type { News } from '@/payload-types'
import { Badge } from '@/components/ui/Badge'
import { newsCategoryVariant, newsCategoryLabel, formatDate } from '@/lib/news-format'

export function MiniNews({ item }: { item: News }) {
  return (
    <div className="grid grid-cols-[auto_1fr] items-center gap-4 rounded-lg border border-border bg-white p-[18px_20px] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-line-soft hover:shadow-md max-[600px]:grid-cols-1">
      <Badge variant={newsCategoryVariant(item.category)} className="self-start">
        {newsCategoryLabel(item.category)}
      </Badge>
      <div>
        <div className="mb-[5px] text-[12.5px] font-semibold text-muted">
          {formatDate(item.publishedAt)}
        </div>
        <h3 className="font-display text-[18px] font-semibold leading-[1.1]">{item.title}</h3>
      </div>
    </div>
  )
}
