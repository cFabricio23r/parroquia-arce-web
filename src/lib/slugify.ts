const MAX_LENGTH = 80
const MAX_ATTEMPTS = 50

const trimDashes = (s: string): string => s.replace(/^-+|-+$/g, '')

/** Cut to `max` characters at the last dash before the limit (or at the limit if none). */
const cut = (s: string, max: number): string => {
  if (s.length <= max) return s
  const head = s.slice(0, max + 1)
  const idx = head.lastIndexOf('-', max)
  const chunk = idx > 0 ? s.slice(0, idx) : s.slice(0, max)
  return trimDashes(chunk)
}

/** Normalizes free text into a slug matching ^[a-z0-9-]+$ (max 80). Returns '' if nothing is left. */
export const toSlug = (text: string | null | undefined): string => {
  if (!text) return ''
  const base = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
  return cut(trimDashes(base), MAX_LENGTH)
}

/** Tries base, base-2 ... base-50. Throws if all are taken. */
export const uniqueSlug = async (
  base: string,
  isTaken: (candidate: string) => Promise<boolean>,
): Promise<string> => {
  if (!(await isTaken(base))) return base
  for (let n = 2; n <= MAX_ATTEMPTS; n++) {
    const suffix = `-${n}`
    const candidate = `${base.slice(0, MAX_LENGTH - suffix.length).replace(/-+$/, '')}${suffix}`
    if (!(await isTaken(candidate))) return candidate
  }
  throw new Error(`No se pudo generar un slug único a partir de "${base}".`)
}
