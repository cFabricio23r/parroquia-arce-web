import { describe, expect, it } from 'vitest'
import { isFacebookUrl, isInstagramUrl } from '@/lib/sponsor-links'
import { toSponsorView } from '@/lib/sponsors'

describe('sponsor link validators', () => {
  it.each([
    'https://www.facebook.com/negocio',
    'https://facebook.com/negocio',
  ])('accepts %s as Facebook', (v) => expect(isFacebookUrl(v)).toBe(true))

  it('accepts an Instagram link', () => {
    expect(isInstagramUrl('https://www.instagram.com/negocio/')).toBe(true)
    expect(isInstagramUrl('https://instagram.com/negocio')).toBe(true)
  })

  it.each([
    'http://facebook.com/x',
    'https://m.facebook.com/x',
    'https://fb.com/x',
    'https://facebook.com.evil.test/x',
    ' https://facebook.com/x',
    'https://facebook.com/x y',
    'https://facebook.com/x\n',
    'https://user@facebook.com/x',
    '',
  ])('rejects %j as Facebook', (v) => expect(isFacebookUrl(v)).toBe(false))

  it.each([
    'https://www.instagram.com.ar/x',
    'http://instagram.com/x',
    'https://www.facebook.com/x',
  ])('rejects %j as Instagram', (v) => expect(isInstagramUrl(v)).toBe(false))
})

describe('toSponsorView', () => {
  const logo = { url: 'https://cdn.test/logo.png', alt: 'Logo' }
  const base = { id: 1, name: 'Panadería', logo }

  it('maps a valid doc', () => {
    const v = toSponsorView({ ...base, facebookUrl: 'https://www.facebook.com/p', category: 'Rubro' })
    expect(v).toEqual({
      id: '1',
      name: 'Panadería',
      logo,
      category: 'Rubro',
      blurb: null,
      facebookUrl: 'https://www.facebook.com/p',
      instagramUrl: null,
    })
  })

  it('drops a doc without links', () => {
    expect(toSponsorView(base)).toBeNull()
  })

  it('drops invalid links, and the doc if none remain', () => {
    expect(toSponsorView({ ...base, facebookUrl: 'https://fb.com/x' })).toBeNull()
    const v = toSponsorView({ ...base, facebookUrl: 'https://fb.com/x', instagramUrl: 'https://www.instagram.com/p' })
    expect(v?.facebookUrl).toBeNull()
    expect(v?.instagramUrl).toBe('https://www.instagram.com/p')
  })

  it('drops a doc without name or without an https logo', () => {
    const fb = 'https://www.facebook.com/p'
    expect(toSponsorView({ ...base, name: ' ', facebookUrl: fb })).toBeNull()
    expect(toSponsorView({ ...base, logo: 5, facebookUrl: fb })).toBeNull()
    expect(toSponsorView({ ...base, logo: { url: 'http://x/y.png', alt: 'a' }, facebookUrl: fb })).toBeNull()
    expect(toSponsorView(null)).toBeNull()
  })
})
