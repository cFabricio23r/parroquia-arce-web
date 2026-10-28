/**
 * Validadores de enlaces de patrocinadores. Tienen que rechazar lo mismo que
 * `safeExternalUrl` de la app: https y host exacto (con o sin `www.`).
 */

// Sin espacios ni caracteres de control (incluye \n, \t y DEL).
// eslint-disable-next-line no-control-regex
const FORBIDDEN = /[\s\u0000-\u001f\u007f]/

function hasHost(value: string, hosts: string[]): boolean {
  if (typeof value !== 'string' || FORBIDDEN.test(value)) return false
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return false
  }
  if (url.protocol !== 'https:') return false
  if (url.username || url.password || url.port) return false
  return hosts.includes(url.hostname)
}

export const isFacebookUrl = (value: string): boolean =>
  hasHost(value, ['facebook.com', 'www.facebook.com'])

export const isInstagramUrl = (value: string): boolean =>
  hasHost(value, ['instagram.com', 'www.instagram.com'])
