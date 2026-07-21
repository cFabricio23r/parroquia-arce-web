import type { Field } from 'payload'

/**
 * Cuantas personas perseveran en el grupo o sector. El numero queda como dato
 * limpio y la etiqueta la adapta cada comunidad: "familias", "jovenes",
 * "catequistas". Se renderiza como "45 · miembros que perseveran".
 */
export const perseveranceField = (): Field => ({
  name: 'perseverance',
  type: 'group',
  label: 'Perseverancia',
  admin: {
    description: 'Cuántas personas perseveran hoy. Dejalo vacío si no lo llevan.',
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'count', type: 'number', label: 'Cantidad', min: 0 },
        {
          name: 'label',
          type: 'text',
          label: 'Etiqueta',
          defaultValue: 'miembros que perseveran',
          admin: { description: 'Ej.: familias, jóvenes, catequistas.' },
        },
      ],
    },
  ],
})
