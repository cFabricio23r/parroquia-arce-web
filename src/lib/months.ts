/**
 * Los 12 meses, en un solo lugar: alimentan tanto las opciones del `select` del
 * admin como el render del sitio.
 *
 * El `value` es el numero del mes como string porque Payload guarda el value de
 * un select, y guardar el numero (y no el nombre) deja el dato independiente del
 * idioma y de la ortografia.
 */
export const MONTHS: { label: string; value: string }[] = [
  { label: 'enero', value: '1' },
  { label: 'febrero', value: '2' },
  { label: 'marzo', value: '3' },
  { label: 'abril', value: '4' },
  { label: 'mayo', value: '5' },
  { label: 'junio', value: '6' },
  { label: 'julio', value: '7' },
  { label: 'agosto', value: '8' },
  { label: 'septiembre', value: '9' },
  { label: 'octubre', value: '10' },
  { label: 'noviembre', value: '11' },
  { label: 'diciembre', value: '12' },
]

/** "8 de diciembre". Devuelve null si el dato esta incompleto o es invalido. */
export function formatFeastDate(
  day?: number | null,
  month?: string | null,
): string | null {
  if (day == null || !month) return null
  const found = MONTHS.find((m) => m.value === month)
  if (!found) return null
  return `${day} de ${found.label}`
}
