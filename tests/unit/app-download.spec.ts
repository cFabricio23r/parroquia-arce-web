import { describe, it, expect } from 'vitest'
import { deriveAppDownload, formatAppMeta, isDownloadUrl } from '@/lib/app-download'

const url =
  'https://github.com/x/parroquia-arce-releases/releases/latest/download/parroquia-ciudad-arce.apk'

describe('deriveAppDownload', () => {
  it('no esta listo si available esta apagado', () => {
    expect(deriveAppDownload({ app: { available: false, androidUrl: url } }).ready).toBe(false)
  })

  // Encendido pero sin enlace: ante la duda no se muestra un boton roto.
  it('no esta listo encendido y sin URL', () => {
    expect(deriveAppDownload({ app: { available: true, androidUrl: '' } }).ready).toBe(false)
    expect(deriveAppDownload({ app: { available: true, androidUrl: '   ' } }).ready).toBe(false)
  })

  it('no esta listo con https:// sin dominio', () => {
    expect(deriveAppDownload({ app: { available: true, androidUrl: 'https://' } }).ready).toBe(false)
    expect(deriveAppDownload({ app: { available: true, androidUrl: 'https:// x' } }).ready).toBe(false)
  })

  it('no esta listo con una URL http://', () => {
    expect(
      deriveAppDownload({ app: { available: true, androidUrl: 'http://x.org/a.apk' } }).ready,
    ).toBe(false)
  })

  // Documento de settings anterior a la migracion: el grupo no existe.
  it('no esta listo si falta el grupo app', () => {
    expect(deriveAppDownload({ app: undefined }).ready).toBe(false)
    expect(deriveAppDownload(null).ready).toBe(false)
  })

  it('esta listo con URL https y devuelve version y peso redondeado', () => {
    expect(
      deriveAppDownload({
        app: { available: true, androidUrl: ` ${url} `, version: '0.1.0', sizeMb: 134.7 },
      }),
    ).toEqual({ ready: true, url, version: '0.1.0', sizeMb: 135 })
  })

  it('version vacia y peso invalido quedan en null', () => {
    expect(
      deriveAppDownload({ app: { available: true, androidUrl: url, version: '  ', sizeMb: 0 } }),
    ).toEqual({ ready: true, url, version: null, sizeMb: null })
  })

  it('la lista devuelve exactamente ready, url, version y sizeMb', () => {
    expect(
      deriveAppDownload({ app: { available: true, androidUrl: url, version: '1.0.0', sizeMb: 10 } }),
    ).toEqual({ ready: true, url, version: '1.0.0', sizeMb: 10 })
  })
})

describe('formatAppMeta', () => {
  it('version y peso', () => {
    expect(formatAppMeta({ version: '0.1.0', sizeMb: 135 })).toBe('Versión 0.1.0 · 135 MB')
  })
  it('solo version', () => {
    expect(formatAppMeta({ version: '0.1.0', sizeMb: null })).toBe('Versión 0.1.0')
  })
  it('solo peso', () => {
    expect(formatAppMeta({ version: null, sizeMb: 135 })).toBe('135 MB')
  })
  it('nada', () => {
    expect(formatAppMeta({ version: null, sizeMb: null })).toBeNull()
  })
})

describe('isDownloadUrl', () => {
  it('acepta https con dominio', () => expect(isDownloadUrl(url)).toBe(true))
  it('rechaza https sin dominio, con espacios o http', () => {
    expect(isDownloadUrl('https://')).toBe(false)
    expect(isDownloadUrl('https:// x')).toBe(false)
    expect(isDownloadUrl('http://x.org/a.apk')).toBe(false)
  })
})
