import type { GlobalConfig } from 'payload'
import { anyone } from '../access/anyone'
import { canManageContent } from '../access/roles'

/**
 * Contenido destacado de la home. El ADMIN_PANEL_PLAN exige que el home se pueda
 * cambiar sin deploy. El hero es editable; el resto de la home destaca contenido
 * marcado con `isFeatured` en cada coleccion.
 */
export const Home: GlobalConfig = {
  slug: 'home',
  admin: { group: 'Configuración' },
  access: {
    read: anyone,
    update: canManageContent,
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      label: 'Portada',
      fields: [
        {
          name: 'location',
          type: 'text',
          label: 'Ubicación (línea sobre el título)',
          admin: {
            description:
              'Ej: "Parroquia Inmaculada Concepción · Ciudad Arce". Si se deja vacío se usa un texto por defecto.',
          },
        },
        { name: 'title', type: 'text', label: 'Título' },
        { name: 'subtitle', type: 'textarea', label: 'Bajada' },
        {
          name: 'images',
          type: 'array',
          label: 'Fotos de portada (slider)',
          labels: { singular: 'Foto', plural: 'Fotos' },
          admin: {
            description:
              'Una o varias fotos del templo o la comunidad. Rotan automáticamente. Si está vacío, se muestra un fondo sobrio.',
          },
          fields: [{ name: 'image', type: 'upload', relationTo: 'media', label: 'Foto' }],
        },
        // Legacy: reemplazados por `images`/el nuevo diseño. Ocultos para no
        // confundir al editor; la columna se conserva por la base compartida.
        { name: 'image', type: 'upload', relationTo: 'media', label: 'Imagen de portada', admin: { hidden: true } },
        {
          name: 'stats',
          type: 'array',
          label: 'Cifras destacadas',
          maxRows: 3,
          admin: { hidden: true },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'number', type: 'text', label: 'Cifra' },
                { name: 'label', type: 'text', label: 'Etiqueta' },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'featuredEvent',
      type: 'relationship',
      relationTo: 'events',
      label: 'Evento destacado',
      admin: { description: 'El evento que se muestra en la portada.' },
    },
  ],
}
