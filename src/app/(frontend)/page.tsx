import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SectionHead } from '@/components/site/SectionHead'
import { MediaImage } from '@/components/news/MediaImage'
import { Reveal } from '@/components/news/Reveal'
import { HeroSlider } from '@/components/site/HeroSlider'
import { newsCategoryVariant, newsCategoryLabel, formatDate } from '@/lib/news-format'
import { svDate, svParts, svStartOfToday, svTime } from '@/lib/sv-date'
import { eventTypeLabel } from '@/lib/event-types'
import { deriveSchedule } from '@/lib/parish-schedule'
import { GroupCard } from '@/components/community/GroupCard'

export const metadata: Metadata = { title: 'Inicio' }
export const revalidate = 300

// Home. Misas y sacramentos salen del global `contact` y NO tienen respaldo
// editorial: sin datos cargados la seccion no se renderiza. Un horario
// inventado manda gente al templo a una hora que no existe. Eventos, grupos,
// noticias, sector destacado y radio se leen de sus colecciones; `shows`
// (abajo) sigue teniendo fallback editorial — la radio esta fuera del alcance
// de esa regla por ahora. Ver 2026-07-21-horarios-sin-datos-inventados-design.

type Variant = 'blue' | 'sky' | 'amber'

const MES_CORTO = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const eventTypeVariant = (t?: string | null): Variant =>
  t === 'patronal' || t === 'vigilia' || t === 'novena' ? 'amber' : t === 'reunion' || t === 'jornada' ? 'sky' : 'blue'
const showsFallback: [string, string, string][] = [
  ['Una voz desde mi sector', 'Historias y avisos comunitarios', '5:00 p.m.'],
  ['Jóvenes con fe', 'Reflexión y vida juvenil', '7:00 p.m.'],
  ['Hora de alabanza', 'Música católica y oración', '8:00 p.m.'],
]

export default async function HomePage() {
  const payload = await getPayload({ config: await config })

  const [eventsRes, groupsRes, newsRes, sectorsRes, radioRes, homeGlobal, settings, contactGlobal] =
    await Promise.all([
    // "Proximas actividades": solo de hoy en adelante. El corte es la
    // medianoche de El Salvador, asi lo de esta manana sigue en la portada
    // durante el resto del dia.
    payload.find({
      collection: 'events',
      where: {
        status: { equals: 'published' },
        startsAt: { greater_than_equal: svStartOfToday().toISOString() },
      },
      sort: 'startsAt',
      limit: 4,
    }),
    payload.find({ collection: 'groups', where: { status: { equals: 'published' } }, sort: 'name', limit: 3 }),
    payload.find({ collection: 'news', where: { status: { equals: 'published' } }, sort: '-publishedAt', limit: 3 }),
    payload.find({ collection: 'sectors', where: { status: { equals: 'published' }, isFeatured: { equals: true } }, limit: 1 }),
    payload.find({ collection: 'radio-programs', where: { status: { equals: 'published' } }, sort: 'createdAt', limit: 3 }),
    payload.findGlobal({ slug: 'home' }),
    payload.findGlobal({ slug: 'settings' }),
    payload.findGlobal({ slug: 'contact' }),
  ])

  // Hero editable desde el global `home`. Cada campo cae a su valor editorial
  // si esta vacio, para que la home nunca quede en blanco.
  const hero = homeGlobal.hero
  const heroImages: { url: string; alt: string }[] = (hero?.images ?? [])
    .map((row) =>
      row.image && typeof row.image === 'object' && row.image.url
        ? { url: row.image.url, alt: row.image.alt ?? '' }
        : null,
    )
    .filter((x): x is { url: string; alt: string } => x !== null)
  // Fallback a la imagen unica legacy si todavia no hay galeria cargada.
  if (heroImages.length === 0 && hero?.image && typeof hero.image === 'object' && hero.image.url) {
    heroImages.push({ url: hero.image.url, alt: hero.image.alt ?? '' })
  }
  const heroLocation = hero?.location || 'Parroquia Inmaculada Concepción de María · Ciudad Arce'
  const radioLive = settings.radio?.available ?? true

  // Evento destacado: el marcado en el CMS, o el proximo evento como respaldo.
  // Asi la portada nunca muestra un evento inventado. Si el elegido en el CMS ya
  // paso, tambien se cae al proximo: un destacado viejo se olvida de despublicar
  // y la portada quedaria anunciando algo que ya ocurrio.
  const destacadoDelCms =
    homeGlobal.featuredEvent && typeof homeGlobal.featuredEvent === 'object'
      ? homeGlobal.featuredEvent
      : null
  const destacadoVigente =
    destacadoDelCms && new Date(destacadoDelCms.startsAt) >= svStartOfToday()
      ? destacadoDelCms
      : null
  const featuredEvent = destacadoVigente ?? eventsRes.docs[0] ?? null
  const featuredEventCover =
    featuredEvent?.cover && typeof featuredEvent.cover === 'object' ? featuredEvent.cover : null

  // Horarios y sacramentos: solo lo cargado en el CMS. Sin respaldo editorial.
  const { misas, sacramentos, hasMisas, hasSacramentos } = deriveSchedule(contactGlobal)

  // Accesos rapidos. La tarjeta de misas solo entra si hay horarios cargados;
  // las columnas se derivan del conteo para no dejar un hueco cuando son 3.
  type Acceso = { href: string; title: string; desc: string; bg: string }
  const accesos: Acceso[] = [
    ...(hasMisas
      ? [{
          href: '/#misas',
          title: 'Misas y sacramentos',
          desc: 'Horarios, confesiones y celebraciones',
          bg: 'linear-gradient(150deg,#1a4670,var(--color-navy))',
        }]
      : []),
    {
      href: '/sectores',
      title: 'Sectores y ermitas',
      desc: 'Encontrá tu comunidad más cercana',
      bg: 'linear-gradient(150deg,#155e7a,var(--color-blue))',
    },
    {
      href: '/noticias',
      title: 'Noticias',
      desc: 'Lo último de la vida parroquial',
      bg: 'linear-gradient(150deg,#1f6a8c,var(--color-blue))',
    },
    {
      href: '/radio',
      title: 'Radio parroquial',
      desc: radioLive ? 'En vivo ahora · escuchá la comunidad' : 'Escuchá la voz de la comunidad',
      bg: 'linear-gradient(150deg,#b9741f,#7a3f10)',
    },
  ]

  // Radio "al aire ahora": primer programa publicado, con respaldo editorial.
  const radioNow = radioRes.docs[0]
  const radioNowTitle = radioNow?.title ?? 'Evangelio del día'
  const radioNowDesc =
    radioNow?.description ??
    'Reflexión, música católica y mensajes para acompañar el día desde casa, el trabajo o el camino.'

  // Enlace a YouTube desde los canales oficiales (Contact), si está cargado.
  const youtubeUrl =
    (contactGlobal.channels ?? []).find((c) => c.platform === 'youtube' && c.url)?.url ?? null

  // El `slug` va primero solo para usarlo de key de React: la agenda real
  // repite titulos (la novena va varios dias seguidos) y keyear por titulo
  // colisiona. El slug es unique en la coleccion.
  const eventos: [string, string, string, string, string, string, Variant][] = eventsRes.docs.map((e) => {
    const { month, day } = svParts(e.startsAt)
    return [
      e.slug,
      String(day).padStart(2, '0'),
      MES_CORTO[month],
      e.title,
      `${svTime(e.startsAt)} · ${e.locationName}`,
      eventTypeLabel(e.eventType),
      eventTypeVariant(e.eventType),
    ]
  })

  const noticias: [Variant, string, string, string, string, string][] = newsRes.docs.map((n) => [
    // news nunca cae en la variante 'live', asi que el cast a Variant es seguro.
    newsCategoryVariant(n.category) as Variant,
    newsCategoryLabel(n.category),
    formatDate(n.publishedAt),
    n.title,
    n.excerpt ?? '',
    n.slug,
  ])

  // Shows de radio desde la coleccion `radio-programs`; si no hay programacion
  // publicada, cae al listado editorial para no dejar la seccion vacia.
  const shows: [string, string, string][] =
    radioRes.docs.length > 0
      ? radioRes.docs.map((p) => [p.title, p.description ?? '', p.startTime ?? ''])
      : showsFallback

  // Sector destacado (isFeatured); si no hay, el primero.
  const featuredSector = sectorsRes.docs[0]

  return (
    <>
      {/* HERO — full-bleed (edge to edge); el contenido se alinea al container */}
      <HeroSlider images={heroImages}>
        <Container>
          <div className="max-w-[680px] pb-8 pt-[210px] max-[600px]:pt-[130px]">
            <span className="mb-4 inline-flex items-center gap-[10px] text-[14.5px] font-semibold text-white [text-shadow:0_1px_10px_rgba(5,23,51,.7)]">
              <span className="h-[2px] w-7 flex-none bg-amber" />
              {heroLocation}
            </span>
            <h1 className="text-balance font-display text-[clamp(38px,5vw,64px)] font-medium leading-[1.03] tracking-[-.02em] text-white [text-shadow:0_2px_20px_rgba(5,23,51,.45)]">
              {hero?.title || 'Una comunidad de fe, abierta a tu familia'}
            </h1>
            <p className="mt-[18px] max-w-[52ch] text-[clamp(16px,1.4vw,18.5px)] leading-[1.6] text-[#e9f1fb]/90">
              {hero?.subtitle ||
                'Misa, sacramentos, radio parroquial y la vida de nuestros sectores y grupos. Un lugar para encontrarnos, servir y caminar juntos.'}
            </p>
            {/* Sin horarios cargados el CTA de misas desaparece; para que el hero
                no quede con un solo boton debil, el secundario promueve a ambar. */}
            <div className="mt-[26px] flex flex-wrap gap-3">
              {hasMisas && (
                <Button href="/#misas" variant="amber" size="lg">
                  Horarios de misa
                </Button>
              )}
              <Button
                href="/contacto"
                variant={hasMisas ? 'outline-light' : 'amber'}
                size="lg"
              >
                Conocé la parroquia
              </Button>
            </div>
          </div>
        </Container>

        {/* Barra de horarios de misa: solo si hay horarios cargados en el CMS. */}
        {hasMisas && (
          <div className="border-t border-white/10 bg-[rgba(5,23,51,.75)]">
            <Container>
              <div className="flex flex-wrap items-center gap-x-[26px] gap-y-2 py-[15px]">
                <span className="inline-flex items-center gap-[9px] text-[14px] font-bold text-white">
                  <span className="grid h-[15px] w-[15px] place-items-center rounded-full border-[1.6px] border-amber">
                    <span className="h-[5px] w-px bg-amber" />
                  </span>
                  Misas
                </span>
                {misas.map((m) => (
                  <span key={m.label} className="text-[14px] text-[#c9d8ec]">
                    <b className="font-semibold text-white">{m.label}</b> {m.time}
                  </span>
                ))}
              </div>
            </Container>
          </div>
        )}
      </HeroSlider>

      {/* Accesos rápidos con imagen */}
      <section className="py-[clamp(28px,4vw,44px)]">
        <Container>
          <div
            className={`grid gap-4 max-[980px]:grid-cols-2 max-[560px]:grid-cols-1 ${
              accesos.length === 4 ? 'grid-cols-4' : 'grid-cols-3'
            }`}
          >
            {accesos.map(({ href, title, desc, bg }) => (
              <Link
                key={title}
                href={href}
                className="group overflow-hidden rounded-xl border border-border transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div className="h-[130px]" style={{ background: bg }} />
                <div className="px-4 pb-4 pt-[13px]">
                  <b className="block font-display text-[18.5px] font-medium text-navy">{title}</b>
                  <span className="mt-[3px] block text-[13px] text-muted">{desc}</span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* EVENTOS */}
      <section className="bg-bg-soft py-[clamp(56px,7vw,96px)]">
        <Container>
          <Reveal className="mb-10 flex items-end justify-between gap-4">
            <h2 className="font-display text-[clamp(32px,4.2vw,52px)] font-medium leading-[1.04] tracking-[-.01em]">
              Próximas <em className="italic text-blue">actividades</em>
            </h2>
            <Link href="/eventos" className="whitespace-nowrap text-[15.5px] font-bold text-blue">
              Ver toda la agenda →
            </Link>
          </Reveal>
          <div className="grid grid-cols-[1.5fr_1fr] items-stretch gap-6 max-[1040px]:grid-cols-1">
            <Reveal>
              <div className="rounded-lg border border-border bg-white p-3">
                {eventos.map(([eslug, d, m, title, loc, cat, variant], i) => (
                  <div
                    key={eslug}
                    className={`grid grid-cols-[auto_1fr_auto] items-center gap-5 rounded-md p-5 ${
                      i > 0 ? 'border-t border-line-soft' : ''
                    }`}
                  >
                    <span className="grid h-16 w-16 flex-none place-items-center rounded-md bg-blue-tint text-center text-blue">
                      <span className="block font-display text-[26px] font-semibold leading-none">{d}</span>
                      <span className="mt-[2px] text-[11px] font-bold uppercase tracking-[.08em]">{m}</span>
                    </span>
                    <div>
                      <h4 className="font-display text-[19px] font-semibold">{title}</h4>
                      <p className="text-[14px] text-muted">{loc}</p>
                    </div>
                    <Badge variant={variant} className="max-[600px]:hidden">
                      {cat}
                    </Badge>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal>
              <div className="relative flex h-full min-h-[300px] flex-col justify-end overflow-hidden rounded-xl text-white">
                {featuredEventCover ? (
                  <>
                    <div className="absolute inset-0">
                      <MediaImage cover={featuredEventCover} />
                    </div>
                    <div
                      className="absolute inset-0"
                      aria-hidden="true"
                      style={{ background: 'linear-gradient(180deg, rgba(5,23,51,.25), rgba(5,23,51,.85))' }}
                    />
                  </>
                ) : (
                  <div
                    className="absolute inset-0"
                    aria-hidden="true"
                    style={{ background: 'linear-gradient(160deg, var(--color-blue), var(--color-navy))' }}
                  />
                )}
                <div className="relative p-9">
                  <span className="text-[12.5px] font-bold uppercase tracking-[.15em] text-sky-light">
                    Evento destacado
                  </span>
                  <h3 className="my-3 font-display text-[26px] font-medium leading-[1.08]">
                    {featuredEvent ? featuredEvent.title : 'Próximos encuentros de la comunidad'}
                  </h3>
                  <p className="mb-5 text-[15px] text-[#D2E2F4]">
                    {featuredEvent
                      ? `${svDate(featuredEvent.startsAt, { weekday: 'long', day: 'numeric', month: 'long' })} · ${svTime(featuredEvent.startsAt)} · ${featuredEvent.locationName}`
                      : 'Mirá la agenda de misas, vigilias y encuentros de la comunidad.'}
                  </p>
                  <Button href="/eventos" variant="white">
                    Ver la agenda
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* SUMATE — sectores + grupos */}
      <section className="py-[clamp(56px,7vw,96px)]">
        <Container>
          <Reveal className="mb-10 max-w-[640px]">
            <h2 className="font-display text-[clamp(32px,4.2vw,52px)] font-medium leading-[1.04] tracking-[-.01em]">
              Sumate a la <em className="italic text-blue">vida parroquial</em>
            </h2>
            <p className="mt-3 text-[18px] text-muted">
              Encontrá tu sector más cercano, sumate a un grupo y caminá con la comunidad.
            </p>
          </Reveal>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h3 className="font-display text-[24px] font-medium">Sectores y ermitas</h3>
            <Link href="/sectores" className="whitespace-nowrap text-[15.5px] font-bold text-blue">
              Ver todos los sectores →
            </Link>
          </div>
          {featuredSector && (
            <Reveal>
              <div className="grid grid-cols-2 items-stretch gap-8 overflow-hidden rounded-xl border border-border bg-white max-[1040px]:grid-cols-1">
                <div className="relative min-h-[280px]">
                  <MediaImage cover={featuredSector.cover} />
                </div>
                <div className="flex flex-col p-9">
                  <span className="text-[12.5px] font-bold uppercase tracking-[.15em] text-blue">
                    Sector destacado
                  </span>
                  <h3 className="my-3 font-display text-[28px] font-medium">
                    {featuredSector.number != null && `Sector #${featuredSector.number} — `}
                    {featuredSector.name}
                  </h3>
                  {featuredSector.summary && (
                    <p className="text-[15px] leading-[1.55] text-muted">{featuredSector.summary}</p>
                  )}
                  <div className="my-5 flex flex-wrap gap-2">
                    {featuredSector.chapelName && (
                      <Badge variant="blue">{featuredSector.chapelName}</Badge>
                    )}
                    {featuredSector.location?.address && (
                      <Badge variant="sky">{featuredSector.location.address}</Badge>
                    )}
                  </div>
                  <div className="mt-auto">
                    <Button href={`/sectores/${featuredSector.slug}`}>Conocé este sector</Button>
                  </div>
                </div>
              </div>
            </Reveal>
          )}

          <div className="mb-4 mt-12 flex items-center justify-between gap-4">
            <h3 className="font-display text-[24px] font-medium">Grupos y ministerios</h3>
            <Link href="/grupos" className="whitespace-nowrap text-[15.5px] font-bold text-blue">
              Ver todos los grupos →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-[22px] max-[980px]:grid-cols-1">
            {groupsRes.docs.map((g) => (
              <Reveal key={g.id}>
                <GroupCard group={g} as="h4" />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* RADIO */}
      <section
        className="py-[clamp(56px,7vw,96px)] text-white"
        style={{ background: 'var(--color-navy)' }}
      >
        <Container>
          <Reveal className="mb-10">
            <h2 className="font-display text-[clamp(32px,4.2vw,52px)] font-medium leading-[1.04] tracking-[-.01em]">
              Radio <em className="italic text-sky-light">parroquial</em>
            </h2>
            <p className="mt-3 max-w-[46ch] text-[18px] text-[#B6C6DD]">
              Un canal de evangelización para escuchar en vivo, compartir avisos y acompañar la vida
              de la comunidad.
            </p>
          </Reveal>
          <div className="grid grid-cols-[1.2fr_.8fr] gap-6 max-[1040px]:grid-cols-1">
            <Reveal>
              <div className="rounded-xl border border-white/[.14] bg-white/[.06] p-8">
                <span className="text-[12.5px] font-bold uppercase tracking-[.15em] text-sky-light">
                  {radioLive ? '● Transmitiendo ahora' : '○ Fuera del aire'}
                </span>
                <h3 className="my-3 font-display text-[28px] font-medium">{radioNowTitle}</h3>
                <p className="text-[15px] text-[#B6C6DD]">{radioNowDesc}</p>
                <div className="mt-6 flex flex-wrap gap-[13px]">
                  <Button href="/radio" variant="amber">
                    Escuchar en vivo
                  </Button>
                  <Button href="/radio" variant="white">
                    Ver programación
                  </Button>
                </div>
              </div>
            </Reveal>
            <Reveal className="flex flex-col gap-3">
              {shows.map(([title, desc, t]) => (
                <Link
                  key={title}
                  href="/radio"
                  className="flex items-center justify-between gap-4 rounded-lg border border-white/[.14] bg-white/[.04] p-[18px_20px] transition-colors hover:bg-white/[.08]"
                >
                  <div>
                    <h4 className="font-display text-[17px] font-semibold">{title}</h4>
                    <p className="text-[13.5px] text-[#9DB0CC]">{desc}</p>
                  </div>
                  <span className="flex-none text-[13px] font-bold text-sky-light">{t}</span>
                </Link>
              ))}
            </Reveal>
          </div>
        </Container>
      </section>

      {/* NOTICIAS + MULTIMEDIA */}
      <section className="bg-bg-soft py-[clamp(56px,7vw,96px)]">
        <Container>
          <div className="grid grid-cols-2 gap-8 max-[1040px]:grid-cols-1">
            <Reveal>
              <h2 className="mb-[26px] font-display text-[clamp(32px,4.2vw,52px)] font-medium leading-[1.04] tracking-[-.01em]">
                Noticias y <em className="italic text-blue">formación</em>
              </h2>
              <div className="flex flex-col gap-[14px]">
                {noticias.map(([variant, cat, dt, title, desc, slug]) => (
                  <Link
                    key={title}
                    href={`/noticias/${slug}`}
                    className="grid grid-cols-[auto_1fr] items-center gap-4 rounded-lg border border-border bg-white p-[18px_20px] [transition:transform_.16s,box-shadow_.2s,border-color_.2s] hover:-translate-y-1 hover:border-line-soft hover:shadow-md"
                  >
                    <Badge variant={variant} className="self-start">
                      {cat}
                    </Badge>
                    <div>
                      <div className="text-[12.5px] font-semibold text-muted">{dt}</div>
                      <h4 className="font-display text-[17px] font-semibold leading-[1.1]">{title}</h4>
                      <p className="mt-1 text-[13.5px] text-muted">{desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </Reveal>
            <Reveal>
              <h2 className="mb-[26px] font-display text-[clamp(32px,4.2vw,52px)] font-medium leading-[1.04] tracking-[-.01em]">
                Transmisiones y <em className="italic text-blue">multimedia</em>
              </h2>
              <Link
                href={youtubeUrl ?? '/radio'}
                target={youtubeUrl ? '_blank' : undefined}
                rel={youtubeUrl ? 'noopener noreferrer' : undefined}
                className="relative flex min-h-[280px] flex-col justify-end overflow-hidden rounded-xl p-8 text-white transition-transform duration-200 hover:-translate-y-0.5"
                style={{
                  background:
                    'linear-gradient(160deg, #16406c, var(--color-navy) 55%, var(--color-navy-deep))',
                }}
              >
                <div
                  className="absolute inset-0"
                  aria-hidden="true"
                  style={{
                    background: 'radial-gradient(90% 70% at 82% 0%, rgba(97,194,230,.22), transparent 55%)',
                  }}
                />
                <span className="relative text-[12.5px] font-bold uppercase tracking-[.15em] text-sky-light">
                  YouTube · En vivo los domingos
                </span>
                <h3 className="relative mt-2 font-display text-[24px] font-medium leading-[1.1]">
                  Celebraciones, homilías y momentos especiales de la parroquia
                </h3>
                <span className="relative mt-4 text-[14.5px] font-bold text-white">
                  Ver transmisiones →
                </span>
              </Link>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* MISA + SACRAMENTOS — solo si hay algo cargado en el CMS. Sin datos no
          se renderiza: nada de horarios editoriales. */}
      {(hasMisas || hasSacramentos) && (
        <section id="misas" className="scroll-mt-24 py-[clamp(56px,7vw,96px)]">
          <Container>
            <Reveal>
              <SectionHead
                title="Celebrar juntos"
                emphasis="durante la semana"
                lead="Los horarios y accesos pastorales que la comunidad busca más seguido, siempre a mano."
              />
            </Reveal>
            <div className="grid grid-cols-[1.05fr_1.25fr] items-start gap-[30px] max-[1040px]:grid-cols-1">
              {hasMisas && (
                <Reveal>
                  <div className="rounded-xl border border-border bg-blue-soft p-[30px]">
                    <span className="text-[12.5px] font-bold uppercase tracking-[.15em] text-blue">
                      Horarios de misa
                    </span>
                    <h3 className="my-[12px_0_20px] font-display text-[30px] font-medium leading-[1.05]">
                      Misas de la semana
                    </h3>
                    <div className="flex flex-col gap-[11px]">
                      {misas.map((m) => (
                        <div
                          key={m.label}
                          className="flex items-center justify-between gap-4 rounded-md bg-white p-[16px_20px]"
                        >
                          <span className="font-semibold">{m.label}</span>
                          <span className="text-right font-extrabold text-blue">{m.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              )}
              {hasSacramentos && (
                <Reveal>
                  <div className="grid grid-cols-2 gap-[18px] max-[600px]:grid-cols-1">
                    {sacramentos.map((s) => (
                      <div
                        key={s.title}
                        className="flex flex-col gap-3 rounded-lg border border-border bg-white p-6"
                      >
                        <span className="grid h-12 w-12 place-items-center rounded-[13px] bg-blue font-display text-[20px] font-semibold text-white">
                          {s.title.charAt(0).toUpperCase()}
                        </span>
                        <h4 className="font-display text-[20px] font-semibold">{s.title}</h4>
                        <p className="text-[14px] leading-[1.45] text-muted">{s.detail}</p>
                      </div>
                    ))}
                  </div>
                </Reveal>
              )}
            </div>
          </Container>
        </section>
      )}
    </>
  )
}
