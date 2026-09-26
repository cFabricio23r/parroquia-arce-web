'use client'

import { useState } from 'react'
import { activityDate, type ActivityPost } from '@/lib/activity'

export function ActivityCard({
  post,
  featured = false,
  secondary = false,
}: {
  post: ActivityPost
  featured?: boolean
  secondary?: boolean
}) {
  const [failedImage, setFailedImage] = useState(false)
  return (
    <article className={featured ? 'lg:row-span-2' : ''}>
      <a
        href={post.url}
        target="_blank"
        rel="noopener noreferrer"
        data-activity-id={post.id}
        className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-white transition-[transform,border-color] duration-200 hover:border-blue/40 motion-safe:hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue"
      >
        <div
          className={`relative shrink-0 overflow-hidden bg-blue-tint ${featured ? 'aspect-[4/3]' : secondary ? 'aspect-[16/9] lg:aspect-[21/9]' : 'aspect-[16/10]'}`}
        >
          {post.image && !failedImage ? (
            // Meta sirve imágenes firmadas; no enviarlas al optimizador de Next.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.image}
              alt=""
              loading={featured ? 'eager' : 'lazy'}
              decoding="async"
              referrerPolicy="no-referrer"
              onError={() => setFailedImage(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div aria-hidden="true" className="grid h-full place-items-center text-blue/30">
              <svg width="56" height="64" viewBox="0 0 56 64" fill="none">
                <path
                  d="M28 3v18M19 12h18M8 61V35l20-17 20 17v26H8Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path d="M23 61V45a5 5 0 0 1 10 0v16" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          )}
        </div>
        <div className={`flex flex-1 flex-col ${featured ? 'p-6 md:p-7' : 'p-5'}`}>
          {featured && (
            <span className="mb-3 text-[11px] font-bold uppercase tracking-[.14em] text-blue">
              Lo más reciente
            </span>
          )}
          <h3
            className={`line-clamp-3 break-words font-display font-medium leading-tight text-navy-deep ${featured ? 'text-[28px] md:text-[32px]' : 'text-[22px]'}`}
          >
            {post.title}
          </h3>
          {post.excerpt && !secondary && (
            <p
              className={`mt-3 break-words text-sm leading-relaxed text-muted ${featured ? 'line-clamp-4' : 'line-clamp-2'}`}
            >
              {post.excerpt}
            </p>
          )}
          <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-5 text-xs">
            <time className="text-muted" dateTime={post.date}>
              {activityDate(post.date)}
            </time>
            <span className="whitespace-nowrap font-semibold text-blue underline decoration-blue/30 underline-offset-4">
              Facebook{' '}
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-150 motion-safe:group-hover:translate-x-0.5"
              >
                ↗
              </span>
              <span className="sr-only"> (abre en otra pestaña)</span>
            </span>
          </div>
        </div>
      </a>
    </article>
  )
}
