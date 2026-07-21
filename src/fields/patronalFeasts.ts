import type { Field } from 'payload'
import { MONTHS } from '../lib/months'

/**
 * Fiestas patronales de una ermita. Guarda dia y mes, SIN año: una fiesta
 * patronal se repite todos los años, y una fecha completa habria que corregirla
 * cada enero.
 *
 * Aca si se usa un `select` (a diferencia de `role` en teamField): los meses son
 * un conjunto cerrado y universal, nunca aparece un mes trece. Y un desplegable
 * con "diciembre" es mucho mejor para un voluntario que escribir un numero.
 *
 * No se valida que el dia exista en el mes: un 30 de febrero pasa. Nadie carga
 * una fiesta patronal en una fecha inexistente, y esa validacion cuesta.
 */
export const patronalFeastsField = (): Field => ({
  name: 'patronalFeasts',
  type: 'array',
  label: 'Fiestas patronales',
  labels: { singular: 'Fiesta', plural: 'Fiestas' },
  admin: {
    description: 'Sin año: se repiten todos los años. Se muestran en este orden.',
    initCollapsed: false,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          label: 'Nombre',
          admin: { description: 'Ej.: Fiesta principal, Novena, Procesión.' },
        },
        { name: 'day', type: 'number', required: true, min: 1, max: 31, label: 'Día' },
        {
          name: 'month',
          type: 'select',
          required: true,
          label: 'Mes',
          options: MONTHS,
        },
      ],
    },
  ],
})
