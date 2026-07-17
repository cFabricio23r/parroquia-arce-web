import React from 'react'

type Variant = 'blue' | 'sky' | 'amber' | 'live'

/** ds.css:131 */
const base =
  'inline-flex items-center gap-[7px] rounded-pill px-[13px] py-[6px] text-[12.5px] font-bold'

/** ds.css:132-135 */
const variants: Record<Variant, string> = {
  blue: 'bg-blue-tint text-blue',
  sky: 'bg-sky-tint text-sky',
  amber: 'bg-amber-soft text-[#B96E12]',
  live: 'bg-amber text-white',
}

/**
 * ds.css:136-137 — el punto es currentColor salvo en `live`, que lo pone blanco.
 * Como `live` ya tiene text-white, currentColor alcanza para ambos casos.
 */
export function Badge({
  children,
  variant = 'blue',
  dot = false,
  className = '',
}: {
  children: React.ReactNode
  variant?: Variant
  dot?: boolean
  className?: string
}) {
  return (
    <span className={`${base} ${variants[variant]} ${className}`}>
      {dot && (
        <span className="h-[7px] w-[7px] flex-none rounded-full bg-current" aria-hidden="true" />
      )}
      {children}
    </span>
  )
}
