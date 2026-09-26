import { ValidationError, type Field, type GlobalBeforeChangeHook } from 'payload'
import { parseVideoUrl, type LiveControl, type Platform } from '../lib/social-live'

export function validateManualEnd(
  value: unknown,
  control: LiveControl,
  previous?: LiveControl | null,
): true | string {
  if (control?.mode !== 'manual') return true
  if (typeof value === 'string' && Number.isFinite(Date.parse(value))) {
    if (Date.parse(value) > Date.now()) return true
    if (
      previous?.mode === 'manual' &&
      previous.url === control.url &&
      previous.endsAt &&
      Date.parse(previous.endsAt) === Date.parse(value)
    )
      return true
  }
  return 'Elegí una fecha y hora futura para retirar el anuncio.'
}

export const validateSocialLive: GlobalBeforeChangeHook = async ({ data, originalDoc, req }) => {
  for (const platform of ['youtube', 'facebook'] as const) {
    const previous = originalDoc?.socialLive?.[platform] as LiveControl | undefined
    const control: LiveControl = { ...previous, ...data?.socialLive?.[platform] }
    const result = validateManualEnd(control.endsAt, control, previous)
    if (result !== true)
      throw new ValidationError({
        global: 'settings',
        req,
        errors: [{ path: `socialLive.${platform}.endsAt`, message: result }],
      })
  }
  return data
}

const platformFields = (platform: Platform): Field => ({
  name: platform,
  type: 'group',
  label: platform === 'youtube' ? 'YouTube' : 'Facebook',
  fields: [
    {
      name: 'mode',
      type: 'select',
      label: 'Mostrar transmisión',
      defaultValue: 'auto',
      options: [
        { label: 'Detectar automáticamente', value: 'auto' },
        { label: 'Anunciar manualmente', value: 'manual' },
        { label: 'Ocultar', value: 'off' },
      ],
      admin: {
        description:
          'Automático requiere la conexión del canal. Manual permite anunciarlo al comenzar; Ocultar retira el anuncio.',
      },
    },
    {
      name: 'url',
      type: 'text',
      label: 'Enlace del video en vivo',
      admin: {
        condition: (_, siblingData) => siblingData?.mode === 'manual',
        description:
          'Pegá el enlace del video específico, no el enlace del canal ni un enlace de compartir abreviado de Facebook.',
      },
      validate: (value: unknown, { siblingData }: { siblingData: LiveControl }) =>
        siblingData?.mode !== 'manual' ||
        (typeof value === 'string' && !!parseVideoUrl(platform, value)) ||
        'Ingresá un enlace válido del video de esta plataforma.',
    },
    {
      name: 'endsAt',
      type: 'date',
      label: 'Ocultar anuncio a las',
      admin: {
        condition: (_, siblingData) => siblingData?.mode === 'manual',
        date: { pickerAppearance: 'dayAndTime' },
        description:
          'Hora de finalización prevista. Al llegar esta hora se retira automáticamente el anuncio.',
      },
      validate: (value: unknown, { siblingData }: { siblingData: LiveControl }) =>
        siblingData?.mode !== 'manual' ||
        (typeof value === 'string' && Number.isFinite(Date.parse(value))) ||
        'Elegí una fecha y hora para retirar el anuncio.',
    },
  ],
})

export const socialLiveField: Field = {
  name: 'socialLive',
  type: 'group',
  label: 'Transmisiones de video',
  admin: {
    description:
      'Controla el anuncio flotante en la web. No modifica ni finaliza la transmisión en Facebook o YouTube.',
  },
  fields: [platformFields('youtube'), platformFields('facebook')],
}
