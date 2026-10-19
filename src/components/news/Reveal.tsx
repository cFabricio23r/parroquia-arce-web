'use client'
import { useEffect, useRef, type ReactNode } from 'react'

/** Entradas editoriales al scrollear: nunca ocultar el primer viewport ni depender de JS para leer. */
export function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = ref.current
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (
      !element ||
      media.matches ||
      typeof IntersectionObserver === 'undefined' ||
      typeof element.animate !== 'function'
    )
      return
    if (element.getBoundingClientRect().top < window.innerHeight) return
    let shown = false
    let animation: Animation | undefined
    const show = () => {
      shown = true
      delete element.dataset.reveal
      animation?.cancel()
      observer.disconnect()
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (shown || !entries.some((entry) => entry.isIntersecting)) return
        shown = true
        delete element.dataset.reveal
        observer.disconnect()
        const siblings = element.parentElement ? Array.from(element.parentElement.children) : []
        const delay = Math.min(Math.max(siblings.indexOf(element), 0), 3) * 50
        try {
          // 420 ms para entrada editorial ocasional; los controles conservan su respuesta rápida.
          animation = element.animate(
            [
              { opacity: 0, transform: 'translateY(18px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
            { duration: 420, delay, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'backwards' },
          )
        } catch {
          show()
        }
      },
      { threshold: 0, rootMargin: '0px 0px 40px 0px' },
    )
    const onPreference = () => {
      if (media.matches) show()
    }
    element.dataset.reveal = 'pending'
    observer.observe(element)
    element.addEventListener('focusin', show)
    media.addEventListener('change', onPreference)
    return () => {
      show()
      element.removeEventListener('focusin', show)
      media.removeEventListener('change', onPreference)
    }
  }, [])
  return (
    <div ref={ref} className={`min-w-0 ${className}`}>
      {children}
    </div>
  )
}
