/**
 * Que texto es el cuerpo del detalle de un grupo, y si ademas va la seccion
 * "Historia" abajo.
 *
 * El problema real: la parroquia llena el formulario con "BREVE HISTORIA DE SU
 * FUNDACION EN LA PARROQUIA", asi que carga `history`. Pero el detalle usaba
 * `description` como cuerpo, y los grupos con historia y sin descripcion
 * publicaban "Pronto habra mas informacion sobre este grupo" con la historia
 * completa debajo. Verificado en produccion el 2026-08-11 en
 * /grupos/comision-de-formacion.
 *
 * No se jubila `description` como se hizo en sectores: aca la mitad de los grupos
 * la usa, y la usa bien — "Somos un grupo de servicio misionero, con el objetivo
 * de..." (JUMI) es una descripcion, no una historia. Los dos campos son reales y
 * dicen cosas distintas. El error estaba en asumir que siempre hay descripcion.
 *
 * `showHistorySection` es false cuando la historia YA es el cuerpo: si no, el
 * mismo texto saldria dos veces en la misma pagina.
 */
export function pickGroupBody<T>(
  description: T | null | undefined,
  history: T | null | undefined,
): { body: T | null; showHistorySection: boolean } {
  const body = description ?? history ?? null
  return { body, showHistorySection: Boolean(description && history) }
}
