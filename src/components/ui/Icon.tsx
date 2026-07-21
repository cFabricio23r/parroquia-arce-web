import type { ReactNode } from 'react'

type IconName = 'pin' | 'clock' | 'calendar' | 'arrow' | 'users'

const PATHS: Record<IconName, ReactNode> = {
  pin: (
    <>
      <path d="M12 21s-6-5.686-6-10a6 6 0 1 1 12 0c0 4.314-6 10-6 10Z" />
      <circle cx="12" cy="11" r="2.2" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 9.5h16M8 3v4M16 3v4" />
    </>
  ),
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19.4c0-3 2.5-4.7 5.5-4.7s5.5 1.7 5.5 4.7" />
      <path d="M16 5.7a3.2 3.2 0 0 1 0 6.2" />
      <path d="M17.6 14.9c2.1.5 3.4 2 3.4 4.5" />
    </>
  ),
}

/**
 * Íconos de línea, en `currentColor`. Reemplazan a los emoji (inconsistentes
 * entre plataformas). El tamaño se controla con `width/height` via className.
 */
export function Icon({ name, className = 'h-[15px] w-[15px]' }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  )
}
