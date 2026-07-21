import type { Field } from 'payload'

/**
 * Equipo reutilizable: coordinacion, responsables y colaboradores de un grupo o
 * sector. Reemplaza a `coordinatorName` (groups) y `responsibleName` +
 * `assistants` (sectors), que quedan ocultos hasta que se borren en una obra
 * aparte.
 *
 * `role` es texto libre a proposito: los roles de un grupo juvenil y los de un
 * sector territorial no son el mismo conjunto, y un enum cerrado obliga a volver
 * al codigo cada vez que aparece uno nuevo.
 *
 * El orden del array ES la jerarquia. Por eso no hay un campo `isLead`: seria
 * una segunda fuente de verdad para lo mismo.
 */
export const teamField = (): Field => ({
  name: 'team',
  type: 'array',
  label: 'Equipo',
  labels: { singular: 'Integrante', plural: 'Integrantes' },
  admin: {
    description: 'El orden manda: poné primero a quien coordina. Se reordena arrastrando.',
    initCollapsed: false,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, label: 'Nombre' },
        {
          name: 'role',
          type: 'text',
          label: 'Rol',
          admin: { description: 'Ej.: Coordinadora, Asistente, Tesorero.' },
        },
      ],
    },
    { name: 'photo', type: 'upload', relationTo: 'media', label: 'Foto (opcional)' },
  ],
})
