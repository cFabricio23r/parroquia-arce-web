import type { GlobalConfig } from 'payload'
import { anyone } from '../access/anyone'
import { canManageContent } from '../access/roles'

/**
 * Datos generales de contacto de la parroquia. Alimenta el footer y la pagina
 * de contacto — hoy hardcodeados. Editable sin deploy (ADMIN_PANEL_PLAN).
 */
export const Contact: GlobalConfig = {
  slug: 'contact',
  label: 'Contacto y horarios',
  admin: { group: 'Configuración' },
  access: {
    read: anyone,
    update: canManageContent,
  },
  fields: [
    { name: 'parishName', type: 'text', label: 'Nombre de la parroquia' },
    // NO se reusa locationField() aca: el global `contact` ya existe en la DB
    // con `address`/`coordinates` planos, y anidarlos en `location.*` dispara un
    // rename de columna ambiguo que cuelga el dev-push de Payload. El reuso no
    // vale romper el esquema de la base compartida.
    { name: 'address', type: 'textarea', label: 'Dirección' },
    {
      name: 'mapUrl',
      type: 'text',
      label: 'URL de Google Maps',
      admin: {
        description:
          'Pegá el enlace de "Compartir" de Google Maps. Alimenta el botón "Cómo llegar".',
      },
    },
    // `coordinates` queda oculto: se reemplazo por `mapUrl` (mas simple para un
    // voluntario). No se borra la columna para no tocar el esquema de la base
    // compartida; solo se saca del admin.
    { name: 'coordinates', type: 'point', label: 'Coordenadas (mapa)', admin: { hidden: true } },
    {
      name: 'massSchedule',
      type: 'array',
      label: 'Horario de misas',
      labels: { singular: 'Misa', plural: 'Misas' },
      admin: {
        description: 'Alimenta la barra de la portada y la sección de misas de la home.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', label: 'Día(s)' },
            { name: 'time', type: 'text', label: 'Horario' },
          ],
        },
      ],
    },
    {
      name: 'sacraments',
      type: 'array',
      label: 'Sacramentos y celebraciones',
      labels: { singular: 'Sacramento', plural: 'Sacramentos' },
      admin: {
        description: 'Confesiones, bautizos, matrimonios, etc. Aparecen en la sección de misas de la home.',
      },
      fields: [
        { name: 'title', type: 'text', label: 'Nombre' },
        { name: 'detail', type: 'textarea', label: 'Detalle' },
      ],
    },
    {
      name: 'officeHours',
      type: 'array',
      label: 'Horario de oficina',
      labels: { singular: 'Horario', plural: 'Horarios' },
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
      labels: { singular: 'Canal', plural: 'Canales' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'platform',
              type: 'select',
              label: 'Plataforma',
              // Los VALORES quedan en minuscula: ya estan guardados asi.
              options: [
                { label: 'WhatsApp', value: 'whatsapp' },
                { label: 'Facebook', value: 'facebook' },
                { label: 'YouTube', value: 'youtube' },
                { label: 'Instagram', value: 'instagram' },
              ],
            },
            { name: 'label', type: 'text', label: 'Descripción' },
            { name: 'url', type: 'text', label: 'Enlace' },
          ],
        },
      ],
    },
  ],
}
