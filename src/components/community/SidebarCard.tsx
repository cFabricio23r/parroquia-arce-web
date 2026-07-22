import type { ReactNode } from 'react'
import { Icon } from '@/components/ui/Icon'

type IconName = 'pin' | 'clock' | 'calendar' | 'arrow' | 'users' | 'phone' | 'chat' | 'mail' | 'link'

/**
 * La tarjeta del aside del detalle de un sector.
 *
 * Antes las tres tarjetas eran un `<div>` con borde y un `<h2>` suelto: se leian
 * como tres bloques identicos y planos. Lo que las diferencia ahora es un icono
 * en una pastilla tintada, que le da a cada una una identidad reconocible de un
 * vistazo sin agregar ruido.
 *
 * El icono es `aria-hidden` (lo pone el propio `Icon`) porque el titulo que va al
 * lado ya dice lo mismo. Un lector de pantalla no tiene que oir "pin, Ubicacion".
 *
 * La barra superior de acento usa el gradiente azul→celeste del design system y
 * es puramente decorativa.
 */
export function SidebarCard({
  icon,
  title,
  children,
  className = '',
}: {
  icon: IconName
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-border bg-white shadow-sm ${className}`}
    >
      <div
        className="h-[3px] w-full"
        style={{ background: 'linear-gradient(90deg, var(--color-blue), var(--color-sky-light))' }}
        aria-hidden="true"
      />
      <div className="p-6">
        <div className="mb-4 flex items-center gap-[10px]">
          <span className="flex h-8 w-8 flex-none items-center justify-center rounded-md bg-blue-tint text-blue">
            <Icon name={icon} className="h-[17px] w-[17px]" />
          </span>
          <h2 className="font-display text-[19px] font-medium leading-tight">{title}</h2>
        </div>
        {children}
      </div>
    </div>
  )
}
