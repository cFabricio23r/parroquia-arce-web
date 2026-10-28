/**
 * Validacion de la duracion de una reflexion. Un `validate` propio en un campo
 * number reemplaza al de Payload, asi que el rango (1 a 120) se chequea aca.
 */
export function validateDurationMinutes(value: number | null | undefined): true | string {
  if (value == null) return true
  if (!Number.isInteger(value)) return 'Poné los minutos enteros, por ejemplo 12.'
  if (value < 1 || value > 120) return 'Poné entre 1 y 120 minutos.'
  return true
}
