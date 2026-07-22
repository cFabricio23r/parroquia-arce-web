import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/news/Reveal'
import type { ParishSchedule } from '@/lib/parish-schedule'

/**
 * El cuerpo de `/horarios`. Presentacional puro: recibe el horario ya derivado y
 * no habla con Payload, asi es testeable sin base de datos.
 *
 * Cada seccion se omite si no tiene datos. Con la base vacia la pagina queda con
 * el hero y el cierre y nada mas: feo y honesto. La regla de
 * 2026-07-21-horarios-sin-datos-inventados-design no se afloja aca.
 *
 * Las secciones son `<section aria-labelledby>` para que el lector de pantalla
 * las anuncie y para que los tests puedan afirmar que una devocion NO cae bajo
 * el encabezado de misas.
 */
export function ScheduleSections({
  schedule,
  officeHours,
  mapUrl,
}: {
  schedule: ParishSchedule
  officeHours: ReadonlyArray<readonly [string, string]>
  mapUrl?: string | null
}) {
  const { misas, devociones, sacramentos, hasMisas, hasDevociones, hasSacramentos } = schedule

  return (
    <>
      {hasMisas && (
        <section aria-labelledby="misas-titulo" className="py-[clamp(48px,6vw,80px)]">
          <Container>
            <Reveal>
              <h2
                id="misas-titulo"
                className="font-display text-[clamp(28px,3.4vw,40px)] font-medium leading-[1.05]"
              >
                Misas de la <em className="italic text-blue">semana</em>
              </h2>
              <div className="mt-7 overflow-hidden rounded-xl border border-border bg-white">
                {misas.map((m, i) => (
                  <div
                    key={m.id}
                    className={`flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 p-[18px_24px] ${
                      i > 0 ? 'border-t border-line-soft' : ''
                    }`}
                  >
                    <span className="font-semibold">{m.label}</span>
                    <span className="font-extrabold text-blue">{m.time}</span>
                  </div>
                ))}
              </div>
              {/* Texto fijo: no afirma ningun horario, solo advierte que pueden
                  cambiar. Sale del spec pixel-perfect de _ds_extract. */}
              <p className="mt-4 max-w-[60ch] text-[14px] text-muted">
                Los horarios pueden variar en solemnidades y tiempos litúrgicos especiales.
                Consultá los avisos parroquiales.
              </p>
            </Reveal>
          </Container>
        </section>
      )}

      {hasDevociones && (
        <section aria-labelledby="semana-titulo" className="bg-bg-soft py-[clamp(48px,6vw,80px)]">
          <Container>
            <Reveal>
              <h2
                id="semana-titulo"
                className="font-display text-[clamp(28px,3.4vw,40px)] font-medium leading-[1.05]"
              >
                Durante la <em className="italic text-blue">semana</em>
              </h2>
              <p className="mt-3 max-w-[60ch] text-muted">
                Momentos de oración y confesión fuera de la misa.
              </p>
              <div className="mt-7 grid grid-cols-3 gap-5 max-[900px]:grid-cols-1">
                {devociones.map((d) => (
                  <div
                    key={d.id}
                    className="flex flex-col gap-2 rounded-lg border border-border bg-white p-6"
                  >
                    <span className="text-[12px] font-bold uppercase tracking-[.14em] text-blue">
                      {d.kind === 'confesion' ? 'Confesiones' : 'Devoción'}
                    </span>
                    {/* Sin `detail` no se dibuja titulo: el rotulo de arriba ya
                        dice que es, y repetir el dia como titulo no informa. */}
                    {d.detail && (
                      <h3 className="font-display text-[21px] font-semibold">{d.detail}</h3>
                    )}
                    <p className="text-[15px]">
                      <b>{d.label}</b> · <span className="font-extrabold text-blue">{d.time}</span>
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </Container>
        </section>
      )}

      {officeHours.length > 0 && (
        <section aria-labelledby="oficina-titulo" className="py-[clamp(48px,6vw,80px)]">
          <Container>
            <Reveal>
              {/* Una sola columna con ancho maximo, NO un grid de dos con la
                  derecha vacia: ese es justamente el hueco que esta obra arregla
                  en la home. */}
              <div className="max-w-[560px] rounded-lg border border-border bg-white p-[26px]">
                <h2 id="oficina-titulo" className="mb-[14px] font-display text-[22px] font-semibold">
                  Oficina parroquial
                </h2>
                {officeHours.map(([day, time], i) => (
                  <div
                    key={day}
                    className={`flex justify-between py-[10px] text-[14.5px] ${
                      i < officeHours.length - 1 ? 'border-b border-line-soft' : ''
                    }`}
                  >
                    <span>{day}</span>
                    <b className="text-blue">{time}</b>
                  </div>
                ))}
                {mapUrl && (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-block font-bold text-blue"
                  >
                    Cómo llegar →
                  </a>
                )}
              </div>
            </Reveal>
          </Container>
        </section>
      )}

      {hasSacramentos && (
        <section
          aria-labelledby="sacramentos-titulo"
          className="bg-bg-soft py-[clamp(48px,6vw,80px)]"
        >
          <Container>
            <Reveal>
              <h2
                id="sacramentos-titulo"
                className="font-display text-[clamp(28px,3.4vw,40px)] font-medium leading-[1.05]"
              >
                Preparación de <em className="italic text-blue">sacramentos</em>
              </h2>
              <div className="mt-7 grid grid-cols-3 gap-[18px] max-[900px]:grid-cols-2 max-[600px]:grid-cols-1">
                {sacramentos.map((s) => (
                  <div
                    key={s.title}
                    className="flex flex-col gap-3 rounded-lg border border-border bg-white p-6"
                  >
                    <span
                      className="grid h-12 w-12 place-items-center rounded-[13px] bg-blue font-display text-[20px] font-semibold text-white"
                      aria-hidden="true"
                    >
                      {s.title.charAt(0).toUpperCase()}
                    </span>
                    <h3 className="font-display text-[20px] font-semibold">{s.title}</h3>
                    {s.detail && <p className="text-[14px] leading-[1.45] text-muted">{s.detail}</p>}
                  </div>
                ))}
              </div>
            </Reveal>
          </Container>
        </section>
      )}

      <section className="py-[clamp(48px,6vw,80px)]">
        <Container>
          <Reveal className="flex flex-wrap items-center justify-between gap-6 rounded-xl border border-border bg-blue-soft p-[30px]">
            <div>
              <h2 className="font-display text-[24px] font-semibold">
                ¿Necesitás preparar un sacramento?
              </h2>
              <p className="mt-2 text-muted">
                Escribinos o pasá por la oficina parroquial. Con gusto te acompañamos.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button href="/contacto">Contactar</Button>
              <Button href="/eventos" variant="ghost">
                Ver la agenda
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  )
}
