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
import { newsCategoryVariant, newsCategoryLabel, formatDate } from '@/lib/news-format'

export const metadata: Metadata = { title: 'Inicio' }
export const revalidate = 300

// Home. El hero, accesos rapidos, misas/sacramentos y shows son editoriales
// (estaticos). Las secciones de eventos, grupos, noticias y el sector destacado
// se leen de sus colecciones.

type Variant = 'blue' | 'sky' | 'amber'

const MES_CORTO = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const eventTypeVariant = (t?: string | null): Variant =>
  t === 'patronal' || t === 'vigilia' || t === 'novena' ? 'amber' : t === 'reunion' || t === 'jornada' ? 'sky' : 'blue'
const groupTypeMeta: Record<string, { label: string; variant: Variant }> = {
  pastoral: { label: 'Pastoral', variant: 'blue' },
  ministerio: { label: 'Ministerio', variant: 'sky' },
  comunidad: { label: 'Comunidad', variant: 'sky' },
  servicio: { label: 'Servicio', variant: 'amber' },
  formacion: { label: 'Formación', variant: 'blue' },
}

const quickActions: [string, string, string, string][] = [
  ['🕑', 'Horarios de misa', 'Misas, confesiones y sacramentos de la semana.', '/horarios'],
  ['📻', 'Radio parroquial', 'Escucha en vivo la voz de la comunidad.', '/radio'],
  ['📍', 'Sectores y ermitas', 'Encuentra tu comunidad y sus actividades.', '/sectores'],
  ['✉️', 'Contacto', 'Ubicación, redes y WhatsApp oficial.', '/contacto'],
]

const misas = [
  ['Lunes a viernes', '6:00 p.m.'],
  ['Sábado', '5:00 p.m.'],
  ['Domingo', '7:00 a.m. · 10:00 a.m. · 6:00 p.m.'],
]

const sacramentos = [
  ['M', 'Misa y sacramentos', 'Información clara para participar y preparar celebraciones importantes.'],
  ['C', 'Confesiones', 'Sábados de 4:00 a 5:00 p.m. y por cita en la oficina parroquial.'],
  ['B', 'Bautizos', 'Preparación mensual. Inscríbete con anticipación en secretaría.'],
  ['✝', 'Matrimonios', 'Acompañamiento y trámites con el equipo de pastoral familiar.'],
]

const shows = [
  ['Una voz desde mi sector', 'Historias y avisos comunitarios', '5:00 p.m.'],
  ['Jóvenes con fe', 'Reflexión y vida juvenil', '7:00 p.m.'],
  ['Hora de alabanza', 'Música católica y oración', '8:00 p.m.'],
]

export default async function HomePage() {
  const payload = await getPayload({ config: await config })

  const [eventsRes, groupsRes, newsRes, sectorsRes] = await Promise.all([
    payload.find({ collection: 'events', where: { status: { equals: 'published' } }, sort: 'startsAt', limit: 4 }),
    payload.find({ collection: 'groups', where: { status: { equals: 'published' } }, sort: 'name', limit: 3 }),
    payload.find({ collection: 'news', where: { status: { equals: 'published' } }, sort: '-publishedAt', limit: 3 }),
    payload.find({ collection: 'sectors', where: { status: { equals: 'published' }, isFeatured: { equals: true } }, limit: 1 }),
  ])

  const eventos: [string, string, string, string, string, Variant][] = eventsRes.docs.map((e) => {
    const d = new Date(e.startsAt)
    const hora = d.toLocaleTimeString('es-SV', { hour: 'numeric', minute: '2-digit' })
    return [
      String(d.getDate()).padStart(2, '0'),
      MES_CORTO[d.getMonth()],
      e.title,
      `${hora} · ${e.locationName}`,
      e.eventType ? e.eventType.replace('-', ' ') : '',
      eventTypeVariant(e.eventType),
    ]
  })

  const grupos: [Variant, string, string, string][] = groupsRes.docs.map((g) => {
    const meta = g.type ? groupTypeMeta[g.type] : undefined
    return [meta?.variant ?? 'blue', meta?.label ?? '', g.name, g.summary ?? '']
  })

  const noticias: [Variant, string, string, string, string][] = newsRes.docs.map((n) => [
    // news nunca cae en la variante 'live', asi que el cast a Variant es seguro.
    newsCategoryVariant(n.category) as Variant,
    newsCategoryLabel(n.category),
    formatDate(n.publishedAt),
    n.title,
    n.excerpt ?? '',
  ])

  // Sector destacado (isFeatured); si no hay, el primero.
  const featuredSector = sectorsRes.docs[0]

  return (
    <>
      {/* HERO */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            'radial-gradient(58% 50% at 82% -5%, rgba(97,194,230,.20), transparent 60%), radial-gradient(50% 55% at 0% 100%, rgba(31,149,199,.10), transparent 60%), linear-gradient(180deg, var(--color-bg-soft), #fff)',
        }}
      >
        <Container>
          <div className="grid grid-cols-[1.04fr_.96fr] items-center gap-[52px] pb-20 pt-16 max-[1040px]:grid-cols-1 max-[1040px]:gap-10">
            <Reveal>
              <span className="inline-flex items-center gap-[9px] rounded-pill border border-border bg-white px-4 py-2 text-[13px] font-bold text-blue shadow-[0_4px_14px_-8px_rgba(5,23,51,.25)]">
                <span className="h-2 w-2 rounded-full bg-amber" />
                Parroquia de Ciudad Arce
              </span>
              <h1 className="my-[22px] font-display text-[clamp(48px,6.2vw,86px)] font-medium leading-[.98] tracking-[-.015em]">
                Una casa abierta para <em className="italic text-blue">caminar</em> en comunidad
              </h1>
              <p className="max-w-[46ch] text-[19px] text-muted">
                Inmaculada Concepción de María conecta la vida de la parroquia con cada familia:
                misa, radio, sectores, grupos, avisos y momentos de encuentro en un solo lugar.
              </p>
              <div className="mt-[30px] flex flex-wrap gap-[13px]">
                <Button href="/horarios" variant="navy" size="lg">
                  Ver horarios de misa
                </Button>
                <Button href="/radio" variant="amber" size="lg">
                  Escuchar radio
                </Button>
              </div>
              <div className="mt-[38px] flex gap-[34px]">
                {[
                  ['8', 'Sectores y ermitas'],
                  ['12+', 'Grupos y ministerios'],
                  ['24/7', 'Radio en línea'],
                ].map(([n, l]) => (
                  <div key={l}>
                    <div className="font-display text-[40px] font-medium leading-none text-blue">
                      {n}
                    </div>
                    <div className="mt-1 max-w-[14ch] text-[13px] text-muted">{l}</div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal className="relative">
              <div className="overflow-hidden rounded-xl shadow-lg [aspect-ratio:1.28/1]">
                <MediaImage cover={null} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <Link
                  href="/eventos"
                  className="rounded-lg border border-white bg-white/[.72] p-5 shadow-md backdrop-blur-[10px]"
                >
                  <span className="text-[12.5px] font-bold uppercase tracking-[.15em] text-blue">
                    Próximo evento
                  </span>
                  <h4 className="my-[9px_0_5px] font-display text-[22px] font-semibold leading-[1.05]">
                    Vigilia de Pentecostés
                  </h4>
                  <p className="text-[13.5px] text-muted">Sáb 24 de mayo · 6:00 p.m. · Ermita Las Cruces.</p>
                </Link>
                <Link
                  href="/radio"
                  className="rounded-lg border border-white bg-white/[.72] p-5 shadow-md backdrop-blur-[10px]"
                >
                  <span className="inline-flex items-center gap-[7px] text-[12.5px] font-bold uppercase tracking-[.15em] text-blue">
                    <span className="h-[7px] w-[7px] rounded-full bg-amber" /> En vivo ahora
                  </span>
                  <h4 className="my-[9px_0_5px] font-display text-[22px] font-semibold leading-[1.05]">
                    Radio parroquial
                  </h4>
                  <span className="mt-[10px] grid h-[42px] w-[42px] place-items-center rounded-full bg-amber text-white">
                    ▶
                  </span>
                </Link>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* QUICK ACTIONS */}
      <section className="py-[clamp(56px,7vw,96px)]">
        <Container>
          <div className="grid grid-cols-4 gap-[18px] max-[1040px]:grid-cols-2 max-[600px]:grid-cols-1">
            {quickActions.map(([ic, title, text, href]) => (
              <Reveal key={title}>
                <Link
                  href={href}
                  className="flex h-full flex-col gap-[13px] rounded-lg border border-border bg-white p-6 [transition:transform_.16s,box-shadow_.2s,border-color_.2s] hover:-translate-y-1 hover:border-line-soft hover:shadow-md"
                >
                  <span className="grid h-[50px] w-[50px] place-items-center rounded-[14px] bg-blue-tint text-[22px]" aria-hidden="true">
                    {ic}
                  </span>
                  <h3 className="font-display text-[21px] font-semibold">{title}</h3>
                  <p className="text-[14px] leading-[1.45] text-muted">{text}</p>
                  <span className="mt-auto pt-1 text-[14.5px] font-bold text-blue">Ver →</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* MISA + SACRAMENTOS */}
      <section className="bg-bg-soft py-[clamp(56px,7vw,96px)]">
        <Container>
          <Reveal>
            <SectionHead
              title="Celebrar juntos"
              emphasis="durante la semana"
              lead="Horarios y accesos pastorales visibles desde el primer recorrido, para resolver lo que la comunidad busca más seguido."
            />
          </Reveal>
          <div className="grid grid-cols-[1.05fr_1.25fr] items-start gap-[30px] max-[1040px]:grid-cols-1">
            <Reveal>
              <div className="rounded-xl border border-border bg-blue-soft p-[30px]">
                <span className="text-[12.5px] font-bold uppercase tracking-[.15em] text-blue">
                  Horarios de misa
                </span>
                <h3 className="my-[12px_0_20px] font-display text-[30px] font-medium leading-[1.05]">
                  Misas de la semana
                </h3>
                <div className="flex flex-col gap-[11px]">
                  {misas.map(([day, time]) => (
                    <div
                      key={day}
                      className="flex items-center justify-between gap-4 rounded-md bg-white p-[16px_20px]"
                    >
                      <span className="font-semibold">{day}</span>
                      <span className="text-right font-extrabold text-blue">{time}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-[22px]">
                  <Button href="/horarios">Ver todos los horarios y sacramentos</Button>
                </div>
              </div>
            </Reveal>
            <Reveal>
              <div className="grid grid-cols-2 gap-[18px] max-[600px]:grid-cols-1">
                {sacramentos.map(([bl, title, text]) => (
                  <div
                    key={title}
                    className="flex flex-col gap-3 rounded-lg border border-border bg-white p-6"
                  >
                    <span className="grid h-12 w-12 place-items-center rounded-[13px] bg-blue font-display text-[20px] font-semibold text-white">
                      {bl}
                    </span>
                    <h4 className="font-display text-[20px] font-semibold">{title}</h4>
                    <p className="text-[14px] leading-[1.45] text-muted">{text}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* EVENTOS */}
      <section className="py-[clamp(56px,7vw,96px)]">
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
                {eventos.map(([d, m, title, loc, cat, variant], i) => (
                  <div
                    key={title}
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
              <div
                className="relative flex h-full flex-col justify-end overflow-hidden rounded-xl p-9 text-white"
                style={{ background: 'linear-gradient(160deg, var(--color-blue), var(--color-navy))' }}
              >
                <span className="text-[12.5px] font-bold uppercase tracking-[.15em] text-sky-light">
                  Evento destacado
                </span>
                <h3 className="my-3 font-display text-[26px] font-medium leading-[1.08]">
                  Una noche de oración para toda la comunidad
                </h3>
                <p className="mb-5 text-[15px] text-[#D2E2F4]">
                  Una vigilia que reúne familias, jóvenes y servidores para prepararnos como parroquia
                  en misión.
                </p>
                <Button href="/eventos" variant="white">
                  Ver la agenda
                </Button>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* SECTOR DESTACADO */}
      <section className="bg-bg-soft py-[clamp(56px,7vw,96px)]">
        <Container>
          <Reveal className="mb-10 flex items-end justify-between gap-4">
            <h2 className="font-display text-[clamp(32px,4.2vw,52px)] font-medium leading-[1.04] tracking-[-.01em]">
              La parroquia vive en <em className="italic text-blue">cada sector</em>
            </h2>
            <Link href="/sectores" className="whitespace-nowrap text-[15.5px] font-bold text-blue">
              Ver todos los sectores →
            </Link>
          </Reveal>
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
                    <Button href="/sectores">Ver los sectores</Button>
                  </div>
                </div>
              </div>
            </Reveal>
          )}
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
                  ● Transmitiendo ahora
                </span>
                <h3 className="my-3 font-display text-[28px] font-medium">Evangelio del día</h3>
                <p className="text-[15px] text-[#B6C6DD]">
                  Reflexión, música católica y mensajes para acompañar el día desde casa, el trabajo o
                  el camino.
                </p>
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

      {/* GRUPOS */}
      <section className="py-[clamp(56px,7vw,96px)]">
        <Container>
          <Reveal className="mb-10 flex items-end justify-between gap-4">
            <h2 className="font-display text-[clamp(32px,4.2vw,52px)] font-medium leading-[1.04] tracking-[-.01em]">
              Intégrate a la <em className="italic text-blue">vida parroquial</em>
            </h2>
            <Link href="/grupos" className="whitespace-nowrap text-[15.5px] font-bold text-blue">
              Ver todos los grupos →
            </Link>
          </Reveal>
          <div className="grid grid-cols-3 gap-[22px] max-[980px]:grid-cols-1">
            {grupos.map(([variant, cat, title, desc]) => (
              <Reveal key={title}>
                <article className="flex h-full flex-col rounded-lg border border-border bg-white p-7">
                  <Badge variant={variant} className="self-start">
                    {cat}
                  </Badge>
                  <h3 className="my-[14px_0_8px] font-display text-[23px] font-semibold leading-[1.06]">
                    {title}
                  </h3>
                  <p className="text-[14.5px] leading-[1.5] text-muted">{desc}</p>
                </article>
              </Reveal>
            ))}
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
                {noticias.map(([variant, cat, dt, title, desc]) => (
                  <Link
                    key={title}
                    href="/noticias"
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
              <div className="relative flex min-h-[280px] flex-col justify-end overflow-hidden rounded-xl p-8 text-white">
                <div className="absolute inset-0">
                  <MediaImage cover={null} />
                </div>
                <div
                  className="absolute inset-0"
                  aria-hidden="true"
                  style={{ background: 'linear-gradient(180deg, rgba(5,23,51,.1), rgba(5,23,51,.72))' }}
                />
                <span className="relative text-[12.5px] font-bold uppercase tracking-[.15em] text-sky-light">
                  YouTube · En vivo los domingos
                </span>
                <h3 className="relative mt-2 font-display text-[24px] font-medium leading-[1.1]">
                  Celebraciones, homilías y momentos especiales de la parroquia
                </h3>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* CONTACTO */}
      <section className="py-[clamp(56px,7vw,96px)]">
        <Container>
          <div className="grid grid-cols-2 gap-8 max-[1040px]:grid-cols-1">
            <Reveal>
              <div className="rounded-xl border border-border bg-white p-9">
                <span className="text-[12.5px] font-bold uppercase tracking-[.15em] text-blue">
                  Contacto
                </span>
                <h2 className="my-3 font-display text-[clamp(28px,3vw,40px)] font-medium">
                  Estamos para <em className="italic text-blue">servirte</em>
                </h2>
                <p className="text-[15px] text-muted">
                  Encuentra ubicación, redes oficiales y canales de comunicación de la parroquia.
                </p>
                <ul className="my-6 flex flex-col gap-3 text-[14.5px]">
                  <li>📍 Templo parroquial · Ciudad Arce, La Libertad</li>
                  <li>💬 WhatsApp oficial para consultas pastorales</li>
                  <li>📺 Facebook y YouTube para transmisiones y avisos</li>
                </ul>
                <Button href="/contacto" variant="amber" size="lg">
                  Contactar por WhatsApp
                </Button>
              </div>
            </Reveal>
            <Reveal>
              <Link
                href="/contacto"
                className="relative grid h-full min-h-[280px] place-items-center overflow-hidden rounded-xl border border-border font-display text-blue"
                style={{
                  background:
                    'radial-gradient(70% 60% at 30% 20%, rgba(97,194,230,.25), transparent 60%), var(--color-blue-soft)',
                }}
              >
                <span className="text-[20px]">📍 Ver ubicación</span>
              </Link>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  )
}
