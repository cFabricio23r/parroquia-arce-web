import type { Field } from 'payload'

/**
 * Group de ubicacion reutilizable. `coordinates` es un campo `point` de Payload
 * (GeoJSON, guarda [longitud, latitud]) para el mapa. Todo opcional: el
 * DATA_MODEL dice que las relaciones/datos crecen sin obligar a capturar todo.
 */
export const locationField = (): Field => ({
  name: 'location',
  type: 'group',
  admin: {
    description: 'Dónde queda. Las coordenadas alimentan el mapa.',
  },
  fields: [
    { name: 'address', type: 'text', label: 'Dirección' },
    {
      name: 'coordinates',
      type: 'point',
      label: 'Coordenadas (mapa)',
      admin: { description: 'Longitud, latitud.' },
    },
  ],
})
