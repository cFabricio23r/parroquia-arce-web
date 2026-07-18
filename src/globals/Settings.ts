import type { GlobalConfig } from 'payload'
import { anyone } from '../access/anyone'
import { canManageContent } from '../access/roles'

/**
 * Ajustes generales del sitio, editables sin deploy. Hoy: la radio (URL del
 * stream + si esta al aire). El equipo de comunicaciones decide desde /admin si
 * la radio se muestra "en vivo" o "fuera del aire".
 */
export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Ajustes',
  admin: { group: 'Configuración' },
  access: {
    read: anyone,
    update: canManageContent,
  },
  fields: [
    {
      name: 'radio',
      type: 'group',
      label: 'Radio parroquial',
      fields: [
        {
          name: 'available',
          type: 'checkbox',
          label: 'Radio al aire',
          defaultValue: true,
          admin: {
            description: 'Si esta apagado, la web muestra la radio como "Fuera del aire" y deshabilita el play.',
          },
        },
        {
          name: 'streamUrl',
          type: 'text',
          label: 'URL del stream',
          defaultValue: 'https://streaming01.shockmedia.com.ar/9212/stream',
          admin: {
            description: 'Enlace directo al audio (Icecast/HLS). El reproductor lo usa para transmitir en vivo.',
          },
        },
      ],
    },
    {
      name: 'marca',
      type: 'group',
      label: 'Marca',
      admin: {
        description: 'Logo e icono del sitio. Editables sin un nuevo despliegue.',
      },
      fields: [
        {
          name: 'isotipo',
          type: 'upload',
          relationTo: 'media',
          label: 'Isotipo (logo del encabezado)',
          admin: {
            description:
              'Imagen cuadrada. Reemplaza el logo del encabezado y del pie. Si se deja vacio, se usa el logo por defecto del sitio.',
          },
        },
        {
          name: 'favicon',
          type: 'upload',
          relationTo: 'media',
          label: 'Favicon (icono de la pestana)',
          admin: {
            description:
              'Icono cuadrado y simple para la pestana del navegador. Si se deja vacio, se usa el isotipo o el icono por defecto. Ojo: el navegador guarda el favicon en cache, asi que el cambio puede tardar en verse.',
          },
        },
      ],
    },
  ],
}
