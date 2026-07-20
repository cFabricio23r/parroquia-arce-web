import Link from 'next/link'
import type { News } from '@/payload-types'
import { Badge } from '@/components/ui/Badge'
import { MediaImage } from './MediaImage'
import { newsCategoryVariant, newsCategoryLabel } from '@/lib/news-format'

export function LeadCard({ item }: { item: News }) {
  return (
    <Link
      href={`/noticias/${item.slug}`}
      className="group relative flex min-h-[380px] flex-col justify-end overflow-hidden rounded-xl p-9 text-white shadow-md"
    >
      {/* Imagen de fondo (o gradiente) */}
      <div className="absolute inset-0">
        <MediaImage cover={item.cover} />
      </div>
      {/* Overlay oscuro — ds.css:3 */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          background: 'linear-gradient(180deg, rgba(5,23,51,.1), rgba(5,23,51,.72))',
        }}
      />
      {item.category && (
        <Badge
          variant={newsCategoryVariant(item.category)}
          className="relative mb-[14px] self-start"
        >
          {newsCategoryLabel(item.category)}
        </Badge>
      )}
      <h2 className="relative font-display text-[clamp(26px,2.8vw,36px)] font-medium leading-[1.08]">
        {item.title}
      </h2>
      {item.excerpt && (
        <p className="relative mt-[10px] max-w-[48ch] text-[15.5px] text-[#D2E2F4]">
          {item.excerpt}
        </p>
      )}
      <span className="relative mt-4 text-[14.5px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
        Leer más →
      </span>
    </Link>
  )
}
