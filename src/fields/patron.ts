import type { Field } from 'payload'

/**
 * Patrono de un grupo. El formulario que llena la parroquia lo pide como un
 * renglon propio ("PATRONO DE LA COMISION") y varios grupos lo mandan con una
 * imagen del santo, asi que es un dato, no una linea dentro de la historia.
 *
 * `name` e `image` son independientes a proposito. La Escuela de Formacion Basica
 * en la Fe dice explicitamente que no tiene patrono asignado, pero manda la imagen
 * de la Inmaculada Concepcion porque "los caracteriza": eso es imagen sin nombre.
 * Y la IAM tiene DOS patronos, que no entran en un solo `name` — van como
 * `patronalFeasts`, que ya guarda nombre y fecha.
 *
 * No se reusa `patronOrDedication` de `chapels`, que resuelve lo mismo con otro
 * nombre y sin imagen. Unificarlos es una obra aparte, con migracion: `chapels`
 * ya tiene datos cargados.
 */
export const patronField = (): Field => ({
  name: 'patron',
  type: 'group',
  label: 'Patrono',
  admin: {
    description: 'Dejalo vacío si el grupo no tiene patrono asignado.',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Nombre',
      admin: { description: 'Ej.: San Jerónimo. Si son dos o más, cargalos como fiestas.' },
    },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Imagen del patrono' },
  ],
})
