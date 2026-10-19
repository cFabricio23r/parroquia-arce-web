'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Mark } from './Mark'

const NAV_BASE = [
  { href: '/', label: 'Inicio' },
  { href: '/sectores', label: 'Sectores' },
  { href: '/grupos', label: 'Grupos' },
  { href: '/eventos', label: 'Eventos' },
  { href: '/radio', label: 'Radio' },
  { href: '/actividad', label: 'Actividad' },
  { href: '/contacto', label: 'Contacto' },
]

const PLATFORM_LABEL: Record<string, string> = {
  whatsapp: 'WhatsApp',
  facebook: 'Facebook',
  youtube: 'YouTube',
  instagram: 'Instagram',
}

type TopbarChannel = { platform: string; url: string }

type HeaderProps = {
  channels?: TopbarChannel[]
  radioLive?: boolean
  brand?: { url: string | null; alt: string } | null
  /** Requerida a proposito: sin default silencioso que decida por nosotros. */
  hasSchedule: boolean
}

export function Header({ channels = [], radioLive = true, brand, hasSchedule }: HeaderProps) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menu, setMenu] = useState({ pathname, open: false })
  const open = menu.pathname === pathname && menu.open
  if (menu.pathname !== pathname) setMenu({ pathname, open: false })
  const setOpen = useCallback((value: boolean) => setMenu({ pathname, open: value }), [pathname])
  const triggerRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!open || !drawerRef.current) return
    const drawer = drawerRef.current
    const trigger = triggerRef.current
    const previousOverflow = document.body.style.overflow
    const background: HTMLElement[] = []
    let branch: HTMLElement = drawer
    while (branch.parentElement) {
      for (const sibling of Array.from(branch.parentElement.children)) {
        if (
          sibling instanceof HTMLElement &&
          sibling !== branch &&
          !sibling.hasAttribute('data-menu-backdrop') &&
          !sibling.hasAttribute('inert') &&
          !['SCRIPT', 'STYLE', 'LINK'].includes(sibling.tagName)
        ) {
          sibling.setAttribute('inert', '')
          background.push(sibling)
        }
      }
      if (branch.parentElement === document.body) break
      branch = branch.parentElement
    }
    document.body.style.overflow = 'hidden'
    drawer.querySelector<HTMLButtonElement>('button')?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
      }
      if (event.key !== 'Tab') return
      const items = Array.from(
        drawer.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),[tabindex="0"]'),
      )
      const first = items[0],
        last = items[items.length - 1]
      if (
        event.shiftKey &&
        (document.activeElement === first || !drawer.contains(document.activeElement))
      ) {
        event.preventDefault()
        last?.focus()
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || !drawer.contains(document.activeElement))
      ) {
        event.preventDefault()
        first?.focus()
      }
    }
    const desktop = window.matchMedia('(min-width: 65rem)')
    const onDesktop = () => {
      if (desktop.matches) setOpen(false)
    }
    desktop.addEventListener('change', onDesktop)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      desktop.removeEventListener('change', onDesktop)
      document.body.style.overflow = previousOverflow
      background.forEach((element) => element.removeAttribute('inert'))
      trigger?.focus()
    }
  }, [open, setOpen])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))
  const nav = NAV_BASE

  return (
    <>
      {/* Topbar — ds.css:75-82 */}
      <div className="bg-navy-deep text-[13.5px] text-[#C6D6EC]">
        <Container>
          <div className="flex min-h-[42px] items-center justify-between gap-3 py-2 text-[12px] sm:text-[13.5px]">
            <span>Ciudad Arce, La Libertad · El Salvador</span>
            <div className="flex items-center gap-[22px]">
              {/*
                Canales editables desde el global `contact`. Si un canal no esta
                cargado (p. ej. WhatsApp), simplemente no se renderiza.
              */}
              {channels.map((c, i) => (
                <a
                  key={c.url ?? i}
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden text-[#CBDAEE] transition-colors hover:text-white sm:inline"
                >
                  {PLATFORM_LABEL[c.platform] ?? c.platform}
                </a>
              ))}
              {/*
                ds.css:80 declara `.live-pill{ color:#fff }`, pero NO es lo que el
                demo renderiza: `.topbar a` (ds.css:78) tiene especificidad (0,1,1)
                contra (0,1,0) y gana, dejandolo en #CBDAEE. Replicamos el render,
                que es el spec pixel-perfect. Si la intencion era blanco, es una
                decision de diseno: cambiar aca y en ds.css:78-80.

                El estado "en vivo" lo controla `settings.radio.available` desde
                /admin, igual que el footer.
              */}
              <Link
                href="/radio"
                className="inline-flex items-center gap-2 font-semibold text-[#CBDAEE] transition-colors hover:text-white"
              >
                <span
                  className={`h-2 w-2 rounded-full ${radioLive ? 'bg-amber [animation:pulse-live_2s_infinite]' : 'bg-[#7F95B5]'}`}
                />
                {radioLive ? 'Radio en vivo' : 'Radio · fuera del aire'}
              </Link>
            </div>
          </div>
        </Container>
      </div>

      {/* Nav — ds.css:87-101 */}
      <header
        className={`sticky top-0 z-[60] border-b bg-white/[.86] backdrop-blur-[14px] transition-[box-shadow,border-color] duration-200 ${
          scrolled ? 'border-line-soft shadow-sm' : 'border-transparent'
        }`}
      >
        <Container>
          <div className="flex h-[72px] items-center gap-3 sm:h-20 lg:gap-4">
            <Link href="/" className="flex flex-none items-center gap-[13px]">
              <Mark
                className="bg-blue shadow-[0_8px_18px_-8px_rgba(19,76,146,.6)]"
                src={brand?.url ?? undefined}
                alt={brand?.alt}
              />
              <span className="inline-flex flex-col leading-[1.08]">
                <b className="font-display text-[15px] sm:text-[16.5px] font-semibold tracking-[.005em]">
                  Inmaculada Concepción
                </b>
                <span className="text-[12.5px] text-muted">Parroquia · Ciudad Arce</span>
              </span>
            </Link>

            <nav className="mx-auto hidden items-center gap-[2px] lg:flex" aria-label="Principal">
              {nav.map((i) => (
                <Link
                  key={i.href}
                  href={i.href}
                  aria-current={isActive(i.href) ? 'page' : undefined}
                  className={`inline-flex items-center gap-[5px] whitespace-nowrap rounded-[9px] px-[9px] py-[9px] text-[15px] transition-colors hover:bg-blue-tint hover:text-blue ${
                    isActive(i.href) ? 'font-bold text-blue' : 'font-medium text-[#33455F]'
                  }`}
                >
                  {i.label}
                </Link>
              ))}
            </nav>

            {/*
              El display va en un wrapper, no en className del Button: `base` ya
              trae `inline-flex` y Tailwind resuelve el conflicto por orden en la
              hoja, no en el atributo — `hidden` perdia y el CTA seguia visible
              bajo 1040px. ds.css:251 lo oculta ahi.
            */}
            {hasSchedule && (
              <div className="hidden lg:block">
                <Button href="/horarios">Ver horarios</Button>
              </div>
            )}

            <button
              ref={triggerRef}
              aria-controls="mobile-menu"
              className="ml-auto grid h-[46px] w-[46px] shrink-0 place-items-center rounded-[11px] bg-blue-tint lg:hidden"
              aria-label="Abrir menú"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="var(--color-blue)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </Container>
      </header>

      {/* Drawer — ds.css:227-235 */}
      <div
        data-menu-backdrop
        className={`fixed inset-0 z-[80] bg-navy-deep/50 transition-opacity duration-[250ms] ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setOpen(false)}
      />
      {/*
        `inert` cuando esta cerrado: `translate-x-full` lo saca de pantalla pero lo
        deja en el arbol de foco y de accesibilidad, asi que sus 10 links quedaban
        tabulables en TODA carga de pagina y en TODO breakpoint (el drawer no tiene
        control responsive; solo el boton hamburguesa lo tiene). `inert` no toca
        transform ni opacity, asi que la animacion de ds.css:229 queda intacta.
        El demo original tiene el mismo bug.
      */}
      <aside
        ref={drawerRef}
        id="mobile-menu"
        role="dialog"
        aria-modal={open ? true : undefined}
        inert={!open}
        className={`fixed bottom-0 right-0 top-0 z-[90] flex w-[min(86vw,360px)] flex-col overflow-y-auto overscroll-contain bg-white p-[22px] shadow-lg transition-transform duration-[280ms] ease-[cubic-bezier(.32,.72,0,1)] ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Menú móvil"
      >
        <button
          className="grid h-[42px] w-[42px] place-items-center self-end rounded-[10px] bg-bg-soft"
          aria-label="Cerrar menú"
          onClick={() => setOpen(false)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="m6 6 12 12M18 6 6 18"
              stroke="var(--color-text)"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <nav
          onClick={() => setOpen(false)}
          className="mt-[14px] flex flex-col gap-1"
          aria-label="Móvil"
        >
          {nav.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              aria-current={isActive(i.href) ? 'page' : undefined}
              className={`rounded-[12px] px-4 py-[14px] text-[17px] font-semibold hover:bg-blue-tint hover:text-blue ${
                isActive(i.href) ? 'bg-blue-tint text-blue' : 'text-text'
              }`}
            >
              {i.label}
            </Link>
          ))}
        </nav>
        {hasSchedule && (
          <Button href="/horarios" block className="mt-[18px]" onClick={() => setOpen(false)}>
            Ver horarios de misa
          </Button>
        )}
      </aside>
    </>
  )
}
