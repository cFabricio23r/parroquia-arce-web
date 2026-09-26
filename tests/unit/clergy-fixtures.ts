import type { ClergyProfile } from '@/lib/clergy'
import type { Media } from '@/payload-types'

export const biography: NonNullable<ClergyProfile['biography']> = {
  root: {
    type: 'root',
    version: 1,
    direction: 'ltr',
    format: '',
    indent: 0,
    children: [
      {
        type: 'paragraph',
        version: 1,
        children: [
          {
            type: 'text',
            version: 1,
            text: 'Una historia de vocación y servicio.',
            format: 0,
            detail: 0,
            mode: 'normal',
            style: '',
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
      },
    ],
  },
}

export const priest: ClergyProfile = {
  id: 'parroco',
  name: 'Sacerdote de prueba',
  role: 'Párroco',
  summary: 'Una presentación breve.',
  photo: {
    id: 10,
    url: '/portrait.jpg',
    alt: 'Retrato de prueba',
    mimeType: 'image/jpeg',
  } as Media,
  biography,
}

export const assistant: ClergyProfile = {
  ...priest,
  id: 'auxiliar',
  name: 'Auxiliar de prueba',
  role: 'Sacerdote auxiliar',
  photo: null,
}
