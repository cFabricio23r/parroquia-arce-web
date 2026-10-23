'use client'

import { useEffect, useState } from 'react'
import type { ActiveNotice } from '@/lib/activity-notice'

export function ActivityNotice({ notice }: { notice: ActiveNotice | null }) {
  const [now, setNow] = useState(() => Date.now())
  const endsAt = notice ? Date.parse(notice.endsAt) : NaN
  useEffect(() => {
    if (!Number.isFinite(endsAt)) return
    let timer: ReturnType<typeof setTimeout>
    const refresh = () => {
      setNow(Date.now())
      clearTimeout(timer)
      const remaining = endsAt - Date.now()
      if (remaining > 0) timer = setTimeout(refresh, Math.min(remaining, 2147483647))
    }
    refresh()
    document.addEventListener('visibilitychange', refresh)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [endsAt])
  if (!notice || !Number.isFinite(endsAt) || endsAt <= now) return null
  return (
    <aside
      aria-labelledby="activity-notice-title"
      className="mb-8 rounded-2xl border border-blue/20 bg-blue-tint p-6 md:p-8"
    >
      <p className="mb-3 text-xs font-bold uppercase tracking-[.14em] text-blue">
        Aviso parroquial
      </p>
      <h2
        id="activity-notice-title"
        className="break-words font-display text-2xl font-medium text-navy-deep md:text-3xl"
      >
        {notice.title}
      </h2>
      <p className="mt-3 whitespace-pre-line break-words leading-relaxed text-text">
        {notice.message}
      </p>
      {notice.url && (
        <a
          href={notice.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block min-h-11 py-3 font-semibold text-blue underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-blue"
        >
          Más información <span aria-hidden="true">↗</span>
          <span className="sr-only"> (abre en otra pestaña)</span>
        </a>
      )}
    </aside>
  )
}
