'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Reveal-on-scroll. Reemplaza el shim SiteBehaviors del demo (que rascaba el DOM).
 * Con prefers-reduced-motion no anima: aparece directo.
 */
export function Reveal({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setShown(true)
      return
    }
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true)
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-700 ease-[cubic-bezier(.2,.7,.3,1)] ${
        shown ? 'translate-y-0 opacity-100' : 'translate-y-[22px] opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  )
}
