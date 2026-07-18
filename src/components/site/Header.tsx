'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Mark } from './Mark'

const NAV = [
  { href: '/', label: 'Inicio' },
  { href: '/horarios', label: 'Horarios' },
  { href: '/sectores', label: 'Sectores' },
  { href: '/grupos', label: 'Grupos' },
  { href: '/eventos', label: 'Eventos' },
  { href: '/radio', label: 'Radio' },
  { href: '/noticias', label: 'Noticias' },
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
}

export function Header({ channels = [], radioLive = true, brand }: HeaderProps) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Cierra el drawer al cambiar de ruta.
  useEffect(() => setOpen(false), [pathname])

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))

  return (
    <>
      {/* Topbar — ds.css:75-82 */}
      <div className="bg-navy-deep text-[13.5px] text-[#C6D6EC]">
        <Container>
          <div className="flex h-[42px] items-center justify-between">
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
          <div className="flex h-20 items-center gap-6">
            <Link href="/" className="flex flex-none items-center gap-[13px]">
              <Mark
                className="bg-blue shadow-[0_8px_18px_-8px_rgba(19,76,146,.6)]"
                src={brand?.url ?? undefined}
                alt={brand?.alt}
              />
              <span className="inline-flex flex-col leading-[1.08]">
                <b className="whitespace-nowrap font-display text-[16.5px] font-semibold tracking-[.005em]">
                  Inmaculada Concepción
                </b>
                <span className="text-[12.5px] text-muted">Parroquia · Ciudad Arce</span>
              </span>
            </Link>

            <nav className="mx-auto hidden items-center gap-[2px] lg:flex" aria-label="Principal">
              {NAV.map((i) => (
                <Link
                  key={i.href}
                  href={i.href}
                  aria-current={isActive(i.href) ? 'page' : undefined}
                  className={`inline-flex items-center gap-[5px] whitespace-nowrap rounded-[9px] px-[13px] py-[9px] text-[15px] transition-colors hover:bg-blue-tint hover:text-blue ${
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
            <div className="hidden lg:block">
              <Button href="/horarios">Ver horarios</Button>
            </div>

            <button
              className="ml-auto grid h-[46px] w-[46px] place-items-center rounded-[11px] bg-blue-tint lg:hidden"
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
        inert={!open}
        className={`fixed bottom-0 right-0 top-0 z-[90] flex w-[min(86vw,360px)] flex-col bg-white p-[22px] shadow-lg transition-transform duration-[280ms] ease-[cubic-bezier(.3,.8,.3,1)] ${
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
        <nav className="mt-[14px] flex flex-col gap-1" aria-label="Móvil">
          {NAV.map((i) => (
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
        <Button href="/horarios" block className="mt-[18px]">
          Ver horarios de misa
        </Button>
      </aside>
    </>
  )
}
