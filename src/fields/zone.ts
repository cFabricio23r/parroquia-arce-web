import type { Field } from 'payload'

/**
 * Zona parroquial. Las 5 zonas agrupan a los 22 sectores segun el
 * "Organigrama de distribucion de zonas parroquiales" del PLAN PASTORAL
 * 2023-2025 (pag. 32). El reparto exacto lo fija PARISH_SECTORS.
 */
export const zoneField = (): Field => ({
  name: 'zone',
  type: 'select',
  label: 'Zona parroquial',
  admin: {
    description: 'Agrupación de sectores según el organigrama del plan pastoral.',
  },
  options: [
    { label: 'Zona 1', value: 'zona-1' },
    { label: 'Zona 2', value: 'zona-2' },
    { label: 'Zona 3', value: 'zona-3' },
    { label: 'Zona 4', value: 'zona-4' },
    { label: 'Zona 5', value: 'zona-5' },
  ],
})
