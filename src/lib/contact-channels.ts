/** Conservar descripciones editoriales; no repetir nombres de plataformas copiados. */
export function channelDescription(label: string | null | undefined, fallback: string) {
  const text = label?.trim()
  return !text || ['facebook', 'youtube', 'instagram', 'whatsapp'].includes(text.toLowerCase())
    ? fallback
    : text
}
