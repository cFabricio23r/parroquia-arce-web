import type { GlobalConfig } from 'payload'
import { anyone } from '../access/anyone'
import { canManageContent } from '../access/roles'
import { socialLiveField, validateSocialLive } from '../fields/social-live'
import { isDownloadUrl } from '../lib/app-download'

/**
 * Ajustes generales del sitio, editables sin deploy: la radio (URL del stream +
 * si esta al aire), la descarga de la app movil y la marca. El equipo de
 * comunicaciones decide desde /admin si la radio se muestra "en vivo" o "fuera
 * del aire", y si /app ofrece el APK.
 */
export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Ajustes',
  admin: { group: 'Configuración' },
  access: {
    read: anyone,
    update: canManageContent,
  },
  hooks: { beforeChange: [validateSocialLive] },
  fields: [
    socialLiveField,
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
      name: 'app',
      type: 'group',
      label: 'App móvil',
      admin: {
        description:
          'Descarga de la app para Android en /app. El APK vive en un repo público de GitHub: aquí solo se carga el enlace.',
      },
      fields: [
        {
          name: 'available',
          type: 'checkbox',
          label: 'Mostrar la descarga de la app',
          defaultValue: false,
          admin: {
            description:
              'Si esta apagado, /app dice "muy pronto" y ni el pie ni la portada ofrecen la descarga.',
          },
        },
        {
          name: 'androidUrl',
          type: 'text',
          label: 'Enlace del APK',
          validate: (value: string | null | undefined) =>
            !value?.trim() ||
            isDownloadUrl(value.trim()) ||
            'Tiene que ser un enlace completo que empiece con https://',
          admin: {
            description:
              'Formato: https://github.com/<cuenta>/parroquia-arce-releases/releases/latest/download/parroquia-ciudad-arce.apk — subí el APK siempre con ese mismo nombre y este enlace no cambia.',
          },
        },
        {
          name: 'version',
          type: 'text',
          label: 'Versión',
          maxLength: 20,
          admin: { description: 'Ej. 0.1.0. Se muestra debajo del botón de descarga.' },
        },
        {
          name: 'sizeMb',
          type: 'number',
          label: 'Peso del APK (MB)',
          min: 1,
          admin: { description: 'Ej. 135. Se muestra redondeado, junto al aviso de usar Wi-Fi.' },
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
