import { ValidationError, type FieldAccess, type GlobalBeforeValidateHook, type GlobalConfig, type GroupField } from 'payload'
import { anyone } from '../access/anyone'
import { canManageContent } from '../access/roles'
import { revalidateClergy } from '../hooks/revalidate-clergy'

const positions = ['pastor', 'assistant'] as const

const canReadProfile = (position: typeof positions[number]): FieldAccess => ({ req, doc }) =>
  ['super-admin', 'contenido'].includes(req.user?.role ?? '') || doc?.[position]?.published === true

const validatePublication: GlobalBeforeValidateHook = ({ data, originalDoc }) => {
  const errors: { path: string; message: string }[] = []
  for (const position of positions) {
    const profile = { ...originalDoc?.[position], ...data?.[position] }
    if (profile.published !== true) continue
    for (const [field, label] of [['name', 'el nombre'], ['summary', 'la presentación breve']] as const) {
      if (typeof profile[field] !== 'string' || !profile[field].trim()) {
        errors.push({ path: `${position}.${field}`, message: `Completá ${label} antes de publicar este perfil.` })
      }
    }
  }
  if (errors.length) throw new ValidationError({ global: 'clergy', errors })
  return data
}

const profileField = (name: typeof positions[number], label: string): GroupField => ({
  name,
  type: 'group',
  label,
  access: { read: canReadProfile(name) },
  fields: [
    { name: 'published', type: 'checkbox', label: 'Publicar perfil', defaultValue: false,
      admin: { description: 'Activá esta opción cuando el nombre y la presentación estén listos para mostrarse en la web.' } },
    { name: 'name', type: 'text', label: 'Nombre' },
    { name: 'role', type: 'text', label: 'Cargo', defaultValue: label },
    { name: 'photo', type: 'upload', relationTo: 'media', label: 'Foto' },
    { name: 'summary', type: 'textarea', label: 'Presentación breve',
      admin: { description: 'Dos o tres frases para presentarlo en Inicio.' } },
    { name: 'biography', type: 'richText', label: 'Historia',
      admin: { description: 'Su vocación, trayectoria y llegada a la parroquia. Aparece en la página Nuestros sacerdotes.' } },
  ],
})

export const Clergy: GlobalConfig = {
  slug: 'clergy',
  label: 'Nuestros sacerdotes',
  admin: { group: 'Configuración' },
  access: { read: anyone, update: canManageContent },
  hooks: { beforeValidate: [validatePublication], afterChange: [revalidateClergy] },
  fields: [profileField('pastor', 'Párroco'), profileField('assistant', 'Sacerdote auxiliar')],
}
