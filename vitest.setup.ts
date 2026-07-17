// Any setup scripts you might need go here

// Load .env files
import 'dotenv/config'

import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Sin `globals: true`, testing-library NO registra su cleanup automatico y los
// renders se acumulan en el mismo jsdom entre tests ("Found multiple elements
// with the role button"). En los tests de integracion es un no-op.
afterEach(() => {
  cleanup()
})
