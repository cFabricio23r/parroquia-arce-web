/**
 * El isotipo de la parroquia. `className` permite cambiar el fondo:
 * azul en el header, translucido en el footer (ds.css:91 y 208).
 */
export function Mark({ className = '' }: { className?: string }) {
  return (
    <span
      className={`grid h-[46px] w-[46px] flex-none place-items-center rounded-[13px] ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-[25px] w-[25px]">
        <path d="M12 2.5 8.5 6v3.2c-1.6.5-3 1.4-3 1.4V21h6.5V2.5Z" fill="#fff" opacity={0.95} />
        <path d="M12 2.5 15.5 6v3.2c1.6.5 3 1.4 3 1.4V21H12V2.5Z" fill="#fff" opacity={0.72} />
        <path d="M12 0v6M9.6 3h4.8" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </span>
  )
}
