import { ValidationError, type GlobalConfig } from 'payload'
import { anyone } from '../access/anyone'
import { canManageActivity, isActivityEditor } from '../access/activity'
import { activityHealthEndpoint } from '../endpoints/activity-health'
import { validateNotice } from '../lib/activity-notice'

export const Activity: GlobalConfig = {
  slug: 'activity',
  label: 'Actividad',
  admin: { group: 'Configuración' },
  access: { read: anyone, update: canManageActivity },
  endpoints: [
    { path: '/facebook-health', method: 'get', handler: activityHealthEndpoint },
    { path: '/facebook-health', method: 'post', handler: activityHealthEndpoint },
  ],
  hooks: {
    beforeChange: [
      ({ data, originalDoc, req }) => {
        const notice = { ...originalDoc?.notice, ...data?.notice }
        const result = validateNotice(notice, originalDoc?.notice)
        if (result !== true) {
          const field = !notice.title?.trim()
            ? 'title'
            : !notice.message?.trim()
              ? 'message'
              : result.startsWith('Usá')
                ? 'url'
                : 'endsAt'
          throw new ValidationError({
            global: 'activity',
            req,
            errors: [{ path: `notice.${field}`, message: result }],
          })
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'facebookHealth',
      type: 'ui',
      admin: { components: { Field: '/components/admin/FacebookHealth#FacebookHealth' } },
    },
    {
      name: 'connection',
      type: 'json',
      admin: { hidden: true },
      access: {
        read: ({ req }) => isActivityEditor(req.user),
        create: () => false,
        update: () => false,
      },
    },
    {
      name: 'notice',
      type: 'group',
      label: 'Aviso destacado',
      admin: {
        description:
          'Aparece arriba de las publicaciones de Actividad y se retira al vencer. Las fechas del selector usan la zona horaria de tu dispositivo.',
      },
      fields: [
        { name: 'enabled', type: 'checkbox', label: 'Mostrar aviso', defaultValue: false },
        { name: 'title', type: 'text', label: 'Título', maxLength: 120 },
        { name: 'message', type: 'textarea', label: 'Mensaje', maxLength: 1200 },
        {
          name: 'url',
          type: 'text',
          label: 'Enlace opcional',
          admin: { description: 'Enlace completo que comience con https://.' },
        },
        {
          name: 'endsAt',
          type: 'date',
          label: 'Mostrar hasta',
          admin: {
            date: { pickerAppearance: 'dayAndTime' },
            description: 'Obligatorio al activar el aviso. Elegí una fecha y hora futura.',
          },
        },
      ],
    },
  ],
}
