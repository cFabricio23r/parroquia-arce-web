import type { CollectionConfig } from 'payload'
import { publishedOnly } from '../access/publishedOnly'
import { canManageContent } from '../access/roles'
import { slugField } from '../fields/slug'
import { publishingFields } from '../fields/publishing'
import { contactField } from '../fields/contact'
import { teamField } from '../fields/team'
import { perseveranceField } from '../fields/perseverance'

/**
 * Group / Ministry. Organizado en tabs: la info del grupo, los datos de reunion
 * (dia/hora/lugar) y el contacto del coordinador.
 */
export const Groups: CollectionConfig = {
  slug: 'groups',
  labels: { singular: 'Grupo o ministerio', plural: 'Grupos y ministerios' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'status', 'publishedAt'],
    group: 'Comunidad',
  },
  access: {
    read: publishedOnly,
    create: canManageContent,
    update: canManageContent,
    delete: canManageContent,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Información',
          fields: [
            { name: 'name', type: 'text', required: true, label: 'Nombre del grupo' },
            slugField(),
            {
              name: 'type',
              type: 'select',
              label: 'Tipo',
              options: [
                { label: 'Pastoral', value: 'pastoral' },
                { label: 'Ministerio', value: 'ministerio' },
                { label: 'Comunidad', value: 'comunidad' },
                { label: 'Servicio', value: 'servicio' },
                { label: 'Formación', value: 'formacion' },
              ],
            },
            {
              name: 'summary',
              type: 'textarea',
              label: 'Resumen',
              admin: { description: 'Texto corto para las tarjetas del listado.' },
            },
            { name: 'description', type: 'richText', label: 'Descripción' },
            { name: 'history', type: 'richText', label: 'Historia' },
            perseveranceField(),
          ],
        },
        {
          label: 'Reuniones',
          fields: [
            {
              name: 'meeting',
              type: 'group',
              label: 'Reunión',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'day', type: 'text', label: 'Día' },
                    { name: 'time', type: 'text', label: 'Hora' },
                  ],
                },
                { name: 'place', type: 'text', label: 'Lugar' },
              ],
            },
            {
              name: 'howToJoin',
              type: 'textarea',
              label: 'Cómo sumarse',
              admin: { description: 'Qué hacer para integrarse al grupo.' },
            },
          ],
        },
        {
          label: 'Equipo y contacto',
          fields: [
            teamField(),
            contactField(),
            {
              name: 'coordinatorName',
              type: 'text',
              label: 'Coordinador/a (campo viejo)',
              admin: {
                hidden: true,
                description: 'Reemplazado por Equipo. Se borra en una obra aparte.',
              },
            },
          ],
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
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      label: 'Destacado',
      admin: { position: 'sidebar', description: 'Destacar en la portada del sitio.' },
    },
    ...publishingFields(),
  ],
}
