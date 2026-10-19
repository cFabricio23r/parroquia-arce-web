import type { ReactNode } from 'react'
/** Contenido visible desde el primer render, sin ocultarlo después de cargar. */
export function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`min-w-0 ${className}`}>{children}</div>
}
