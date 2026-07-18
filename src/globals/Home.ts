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
        { name: 'title', type: 'text', label: 'Título' },
        { name: 'subtitle', type: 'textarea', label: 'Bajada' },
        { name: 'image', type: 'upload', relationTo: 'media', label: 'Imagen de portada' },
        {
          name: 'stats',
          type: 'array',
          label: 'Cifras destacadas',
          maxRows: 3,
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
