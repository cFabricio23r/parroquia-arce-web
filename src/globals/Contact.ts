import type { GlobalConfig } from 'payload'
import { anyone } from '../access/anyone'
import { canManageContent } from '../access/roles'

/**
 * Datos generales de contacto de la parroquia. Alimenta el footer y la pagina
 * de contacto — hoy hardcodeados. Editable sin deploy (ADMIN_PANEL_PLAN).
 */
export const Contact: GlobalConfig = {
  slug: 'contact',
  admin: { group: 'Configuración' },
  access: {
    read: anyone,
    update: canManageContent,
  },
  fields: [
    { name: 'parishName', type: 'text', label: 'Nombre de la parroquia' },
    { name: 'address', type: 'textarea', label: 'Dirección' },
    { name: 'coordinates', type: 'point', label: 'Coordenadas (mapa)' },
    {
      name: 'officeHours',
      type: 'array',
      label: 'Horario de oficina',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', label: 'Día(s)' },
            { name: 'hours', type: 'text', label: 'Horario' },
          ],
        },
      ],
    },
    {
      name: 'channels',
      type: 'array',
      label: 'Canales oficiales',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'platform',
              type: 'select',
              options: ['whatsapp', 'facebook', 'youtube', 'instagram'].map((v) => ({
                label: v,
                value: v,
              })),
            },
            { name: 'label', type: 'text', label: 'Descripción' },
            { name: 'url', type: 'text' },
          ],
        },
      ],
    },
  ],
}
