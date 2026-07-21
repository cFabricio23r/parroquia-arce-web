import type { Field } from 'payload'

/**
 * Galeria de fotos. Es un upload `hasMany`, no un array de {imagen, caption}:
 * asi el voluntario selecciona varias fotos de una sola vez y las reordena
 * arrastrando, en vez de cargarlas de a una.
 *
 * No lleva campos propios de pie de foto ni credito: `media` ya tiene `alt`
 * (obligatorio), `caption` y `credit`. Duplicarlos serian dos fuentes de verdad
 * para lo mismo.
 */
export const galleryField = (): Field => ({
  name: 'gallery',
  type: 'upload',
  relationTo: 'media',
  hasMany: true,
  label: 'Galería',
  admin: {
    description:
      'Varias fotos. Se reordenan arrastrando. El pie de foto sale del campo "Pie de foto" de cada imagen.',
    isSortable: true,
  },
})
