import type { Field } from 'payload'

/**
 * Campo slug reutilizable. El DATA_MODEL exige slug unico en toda
 * entidad publica (web y app dependen de el para las rutas).
 */
export const slugField = (): Field => ({
  name: 'slug',
  type: 'text',
  label: 'Slug (dirección web)',
  required: true,
  unique: true,
  index: true,
  admin: {
    description: 'Identificador para la URL. Solo minusculas, numeros y guiones.',
  },
  validate: (value: string | null | undefined) => {
    if (!value) return 'El slug es obligatorio.'
    if (!/^[a-z0-9-]+$/.test(value)) {
      return 'Solo minusculas, numeros y guiones. Sin espacios ni acentos.'
    }
    return true
  },
})
