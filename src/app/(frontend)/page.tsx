import type { Metadata } from 'next'
import React from 'react'
import { Container } from '@/components/ui/Container'

export const metadata: Metadata = {
  title: 'Inicio',
}

/**
 * Placeholder. La home real (`web/content/inicio.html`, 285 lineas) se porta en
 * Fase 1C, cuando existan las colecciones que alimenta: eventos, sectores, radio.
 * Hasta entonces esta pagina solo prueba que el chrome y los tokens estan puestos.
 */
export default function HomePage() {
  return (
    <Container>
      <div className="py-[clamp(56px,7vw,96px)]">
        <h1 className="font-display text-[clamp(40px,5.4vw,68px)] font-medium leading-[1.02]">
          Parroquia <em className="italic text-blue">Inmaculada Concepción</em>
        </h1>
        <p className="mt-4 max-w-[60ch] text-[19px] text-muted">
          Ciudad Arce, La Libertad. La portada se construye en la Fase 1C.
        </p>
      </div>
    </Container>
  )
}
