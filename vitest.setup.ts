// Any setup scripts you might need go here

// Load .env files
import 'dotenv/config'

import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// jsdom no implementa `matchMedia`, y `Reveal` — que envuelve casi todas las
// secciones del sitio — lo consulta para respetar prefers-reduced-motion. Sin
// este stub, cualquier test que renderice una seccion revienta en el useEffect.
//
// Se reporta reduced-motion A PROPOSITO: asi `Reveal` sale temprano y deja el
// contenido visible, sin construir el IntersectionObserver que jsdom tampoco
// tiene. Es ademas el camino que ve un usuario con animaciones reducidas, que
// es el que tiene que funcionar si o si.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}

// Sin `globals: true`, testing-library NO registra su cleanup automatico y los
// renders se acumulan en el mismo jsdom entre tests ("Found multiple elements
// with the role button"). En los tests de integracion es un no-op.
afterEach(() => {
  cleanup()
})
