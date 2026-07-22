import type { CollectionConfig } from 'payload'
import { publishedOnly } from '../access/publishedOnly'
import { canManageComms } from '../access/roles'
import { slugField } from '../fields/slug'
import { publishingFields } from '../fields/publishing'
import { isValidTime } from '../lib/radio-schedule'

/**
 * Radio Program. Un programa tiene muchos episodios (ver RadioEpisodes).
 * Lo administra Comunicaciones.
 */
export const RadioPrograms: CollectionConfig = {
  slug: 'radio-programs',
  labels: { singular: 'Programa de radio', plural: 'Programas de radio' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'dayOfWeek', 'status'],
    group: 'Radio',
  },
  access: {
    read: publishedOnly,
    create: canManageComms,
    update: canManageComms,
    delete: canManageComms,
  },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Título' },
    slugField(),
    { name: 'description', type: 'textarea', label: 'Descripción' },
    { name: 'hostName', type: 'text', label: 'Conduce' },
    {
      type: 'row',
      fields: [
        {
          name: 'dayOfWeek',
          type: 'select',
          label: 'Día',
          // Los VALORES quedan sin tilde: ya estan guardados asi en la base.
          options: [
            { label: 'Lunes', value: 'lunes' },
            { label: 'Martes', value: 'martes' },
            { label: 'Miércoles', value: 'miercoles' },
            { label: 'Jueves', value: 'jueves' },
            { label: 'Viernes', value: 'viernes' },
            { label: 'Sábado', value: 'sabado' },
            { label: 'Domingo', value: 'domingo' },
            { label: 'Diario', value: 'diario' },
          ],
        },
        {
          name: 'startTime',
          type: 'text',
          label: 'Hora de inicio (24 h, ej. 06:00)',
          admin: {
            placeholder: '06:00',
            description: 'En formato de 24 horas. Las 6 de la tarde son 18:00.',
          },
          validate: (value: string | null | undefined) =>
            !value || isValidTime(value)
              ? true
              : 'Usá el formato de 24 horas, por ejemplo 06:00 o 19:30.',
        },
        {
          name: 'endTime',
          type: 'text',
          label: 'Hora de fin (24 h, ej. 07:00)',
          admin: {
            placeholder: '07:00',
            description: 'Opcional: si se deja vacío, el programa dura una hora.',
          },
          validate: (value: string | null | undefined) =>
            !value || isValidTime(value)
              ? true
              : 'Usá el formato de 24 horas, por ejemplo 07:00 o 21:00.',
        },
      ],
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      label: 'Imagen de portada',
      admin: { position: 'sidebar' },
    },
    ...publishingFields(),
  ],
}
