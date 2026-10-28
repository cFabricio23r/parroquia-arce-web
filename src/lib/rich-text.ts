/** `true` si un estado de Lexical tiene algun texto (un root vacio no cuenta). */
export function hasRichText(body: unknown): boolean {
  const visit = (node: unknown): boolean => {
    if (!node || typeof node !== 'object') return false
    const n = node as { text?: unknown; children?: unknown }
    if (typeof n.text === 'string' && n.text.trim() !== '') return true
    return Array.isArray(n.children) && n.children.some(visit)
  }
  if (!body || typeof body !== 'object') return false
  return visit((body as { root?: unknown }).root)
}
