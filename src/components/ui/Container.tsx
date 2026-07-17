import React from 'react'

/**
 * El `.wrap` del design system: ancho maximo + gutter fluido.
 * El gutter es clamp(20px, 5vw, 56px) — valor literal de ds.css:45.
 */
export function Container({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`mx-auto max-w-parish px-[clamp(20px,5vw,56px)] ${className}`}>{children}</div>
  )
}
