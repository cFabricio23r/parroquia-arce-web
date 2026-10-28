import React from 'react'
import Link from 'next/link'
import { weekRangeLabel, type ReflectionView } from '@/lib/reflections'
import { PreacherBadge } from './PreacherBadge'

export function ReflectionListItem({ reflection: r }: { reflection: ReflectionView }) {
  const meta = `${weekRangeLabel(r.weekOf)}${r.durationMinutes ? ` · ${r.durationMinutes} min` : ''}`
  return (
    <Link
      href={`/reflexiones/${r.slug}`}
      className="flex h-full flex-col gap-3 rounded-xl border border-border bg-white p-5 transition-shadow hover:shadow-md"
    >
      <span className="text-[13px] font-semibold text-muted">{meta}</span>
      <span className="font-display text-[22px] font-medium leading-tight text-text">
        {r.title}
      </span>
      <span className="mt-auto pt-2">
        <PreacherBadge name={r.preacherName} photo={r.preacherPhoto} tone="light" />
      </span>
    </Link>
  )
}
