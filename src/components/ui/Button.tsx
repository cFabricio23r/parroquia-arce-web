import Link from 'next/link'
import React from 'react'

type Variant = 'primary' | 'navy' | 'sky' | 'amber' | 'soft' | 'ghost' | 'white' | 'outline-light'

/** Base comun: ds.css:106-108 */
const base =
  'inline-flex items-center justify-center gap-2 rounded-pill font-bold leading-none whitespace-nowrap transition-[transform,box-shadow,background,color,border-color] duration-200 active:translate-y-px [&_svg]:h-[18px] [&_svg]:w-[18px]'

/** Una entrada por variante de ds.css:109-124. Incluye padding y font-size propios. */
const variants: Record<Variant, string> = {
  primary:
    'bg-blue text-white px-[22px] py-[13px] text-[15px] shadow-[0_10px_22px_-10px_rgba(19,76,146,.6)] hover:bg-blue-700',
  navy: 'bg-navy text-white px-[26px] py-[15px] text-[15.5px] hover:bg-navy-deep',
  sky: 'bg-sky text-white px-[26px] py-[15px] text-[15.5px] shadow-[0_10px_22px_-10px_rgba(31,149,199,.55)] hover:bg-[#1A82AE]',
  amber:
    'bg-amber text-white px-[26px] py-[15px] text-[15.5px] shadow-[0_10px_22px_-10px_rgba(232,143,33,.5)] hover:bg-[#D27E16]',
  soft: 'bg-blue-soft text-blue px-[24px] py-[14px] text-[15px] hover:bg-[#CFEAF7]',
  ghost:
    'bg-white text-text border-[1.5px] border-border px-[24px] py-[13.5px] text-[15px] hover:border-sky hover:text-blue',
  white: 'bg-white text-blue px-[24px] py-[14px] text-[15px] hover:bg-bg-soft',
  'outline-light':
    'bg-transparent text-white border-[1.5px] border-white/40 px-[24px] py-[14px] text-[15px] hover:border-white hover:bg-white/10',
}

/** ds.css:126 — pisa el padding/size de la variante, por eso va despues. */
const sizeLg = 'px-[30px] py-[17px] text-[16.5px]'

type Props = {
  children: React.ReactNode
  variant?: Variant
  size?: 'default' | 'lg'
  block?: boolean
  className?: string
  href?: string
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
  'aria-label'?: string
}

export function Button({
  children,
  variant = 'primary',
  size = 'default',
  block = false,
  className = '',
  href,
  type = 'button',
  onClick,
  ...rest
}: Props) {
  const cls = [base, variants[variant], size === 'lg' ? sizeLg : '', block ? 'w-full' : '', className]
    .filter(Boolean)
    .join(' ')

  if (href) {
    return (
      <Link href={href} className={cls} onClick={onClick} {...rest}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} className={cls} onClick={onClick} {...rest}>
      {children}
    </button>
  )
}
