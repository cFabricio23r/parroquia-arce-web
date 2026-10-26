import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/news/Reveal'
import { PhoneMockup } from '@/components/site/app/PhoneMockup'

// Recorrido de cuatro bloques por lo que trae la app, con capturas reales.
// Fondo blanco; los bloques alternan lado del celular en escritorio (impares a
// la derecha). En el celular siempre va texto arriba y captura debajo.

type TourItem = {
  label: string
  phrase: string
  details: string[]
  src: string
  alt: string
  edgeTop?: string
}

const TOUR: TourItem[] = [
  {
    label: 'Radio en vivo',
    phrase: 'La emisora de la parroquia, en vivo, desde donde estés.',
    details: ['Transmisión en vivo', 'Qué está sonando ahora', 'Play y pausa con un toque'],
    src: '/img/app/radio.jpg',
    alt: 'Pantalla Radio de la app: Radio Católica en vivo con el botón de pausa.',
    edgeTop: '#23a9c4',
  },
  {
    label: 'Rezar',
    phrase: 'Las lecturas y oraciones de cada día, en un solo lugar.',
    details: [
      'Evangelio y lecturas del día',
      'Liturgia de las Horas',
      'Santo Rosario, oraciones y pedidos de oración',
    ],
    src: '/img/app/rezar.jpg',
    alt: 'Pantalla Rezar de la app: Evangelio y lecturas, Rosario y Liturgia de las Horas.',
  },
  {
    label: 'Agenda y horarios',
    phrase: 'Misas, jornadas y actividades de la parroquia, mes a mes.',
    details: [
      'Actividades por tipo: misa, jornada, retiro…',
      'Horarios de la parroquia',
      'El próximo evento, siempre a la vista',
    ],
    src: '/img/app/agenda.jpg',
    alt: 'Pantalla Agenda de la app: actividades de octubre y el próximo evento.',
  },
  {
    label: 'Comunidad',
    phrase: 'Conocé los sectores, ermitas y grupos de la parroquia.',
    details: ['Sectores y ermitas', 'Grupos y ministerios'],
    src: '/img/app/sectores.jpg',
    alt: 'Pantalla Sectores y ermitas de la app, con fotos de las comunidades.',
  },
]

export function AppTour() {
  return (
    <section aria-labelledby="app-tour-titulo" className="bg-white py-[clamp(48px,6vw,80px)]">
      <Container>
        <h2
          id="app-tour-titulo"
          className="font-display text-[clamp(28px,3.4vw,40px)] font-medium leading-[1.05]"
        >
          Qué trae la app
        </h2>

        <div className="mt-10 space-y-16 lg:mt-14 lg:space-y-24">
          {TOUR.map((item, index) => {
            const phoneRight = index % 2 === 0
            return (
              <Reveal key={item.label}>
                <article className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
                  <div className={phoneRight ? 'lg:order-1' : 'lg:order-2'}>
                    <h3 className="font-display text-[clamp(24px,2.8vw,32px)] font-medium leading-[1.1]">
                      {item.label}
                    </h3>
                    <p className="mt-3 max-w-[48ch] text-[17px] leading-relaxed text-muted">{item.phrase}</p>
                    <ul className="mt-5 space-y-2 text-[16px] leading-snug">
                      {item.details.map((detail) => (
                        <li key={detail} className="flex gap-3">
                          <span aria-hidden="true" className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-blue" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={`flex justify-center ${phoneRight ? 'lg:order-2' : 'lg:order-1'}`}>
                    <PhoneMockup
                      src={item.src}
                      alt={item.alt}
                      edgeTop={item.edgeTop}
                      className="w-[min(260px,70vw)] lg:w-[300px]"
                    />
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
