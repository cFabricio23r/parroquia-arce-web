import { describe, it, expect } from 'vitest'
import {
  currentReflection,
  toReflectionView,
  weekRangeLabel,
  type ReflectionView,
} from '@/lib/reflections'

const view = (over: Partial<ReflectionView> = {}): ReflectionView => ({
  slug: 's',
  title: 'T',
  quote: null,
  quoteRef: null,
  preacherName: 'Hno. Prueba',
  preacherPhoto: null,
  weekOf: '2026-10-25',
  publishedAt: null,
  createdAt: null,
  audioUrl: 'https://example.com/a.mp3',
  durationMinutes: null,
  body: null,
  ...over,
})

describe('currentReflection', () => {
  it('breaks a weekOf tie by createdAt when publishedAt is null', () => {
    const items = [
      view({ slug: 'old', weekOf: '2026-10-25', createdAt: '2026-10-20T10:00:00.000Z' }),
      view({ slug: 'new', weekOf: '2026-10-25', createdAt: '2026-10-22T10:00:00.000Z' }),
    ]
    expect(currentReflection(items, new Date('2026-10-30T15:00:00Z'))?.slug).toBe('new')
    expect(currentReflection([...items].reverse(), new Date('2026-10-30T15:00:00Z'))?.slug).toBe('new')
  })

  it('prefers publishedAt over createdAt for the tie', () => {
    const items = [
      view({ slug: 'a', publishedAt: '2026-10-26T00:00:00.000Z', createdAt: '2026-10-01T00:00:00.000Z' }),
      view({ slug: 'b', publishedAt: '2026-10-24T00:00:00.000Z', createdAt: '2026-10-28T00:00:00.000Z' }),
    ]
    expect(currentReflection(items, new Date('2026-10-30T15:00:00Z'))?.slug).toBe('a')
  })

  it('picks the latest published week that already started', () => {
    const items = [
      view({ slug: 'a', weekOf: '2026-10-18' }),
      view({ slug: 'b', weekOf: '2026-10-25' }),
      view({ slug: 'c', weekOf: '2026-11-01' }),
    ]
    expect(currentReflection(items, new Date('2026-10-30T15:00:00Z'))?.slug).toBe('b')
  })

  it('does not show a reflection before its week starts in El Salvador', () => {
    const items = [
      view({ slug: 'b', weekOf: '2026-10-25' }),
      view({ slug: 'c', weekOf: '2026-11-01' }),
    ]
    expect(currentReflection(items, new Date('2026-11-01T05:30:00Z'))?.slug).toBe('b')
    expect(currentReflection(items, new Date('2026-11-01T06:00:00Z'))?.slug).toBe('c')
  })

  it('accepts weekOf stored as a full ISO timestamp', () => {
    const items = [view({ slug: 'c', weekOf: '2026-11-01T12:00:00.000Z' })]
    expect(currentReflection(items, new Date('2026-11-01T06:00:00Z'))?.slug).toBe('c')
    expect(currentReflection(items, new Date('2026-11-01T05:30:00Z'))).toBeNull()
  })

  it('breaks ties by newest publishedAt', () => {
    const items = [
      view({ slug: 'old', weekOf: '2026-10-25', publishedAt: '2026-10-20T10:00:00Z' }),
      view({ slug: 'new', weekOf: '2026-10-25', publishedAt: '2026-10-22T10:00:00Z' }),
    ]
    expect(currentReflection(items, new Date('2026-10-30T15:00:00Z'))?.slug).toBe('new')
  })

  it('returns null with no items', () => {
    expect(currentReflection([], new Date('2026-10-30T15:00:00Z'))).toBeNull()
  })
})

describe('toReflectionView', () => {
  const doc = {
    title: 'Tema',
    slug: 'tema',
    preacherName: 'Hno. Prueba',
    weekOf: '2026-10-25T12:00:00.000Z',
    publishedAt: '2026-10-20T10:00:00.000Z',
    audio: { url: 'https://example.com/a.mp3' },
  }

  it('maps a complete doc', () => {
    const v = toReflectionView({ ...doc, durationMinutes: 14, quote: 'Frase' })
    expect(v).toMatchObject({
      slug: 'tema',
      audioUrl: 'https://example.com/a.mp3',
      durationMinutes: 14,
      quote: 'Frase',
      publishedAt: '2026-10-20T10:00:00.000Z',
      preacherPhoto: null,
      body: null,
    })
  })

  it('drops docs without an https audio url', () => {
    expect(toReflectionView({ ...doc, audio: { url: 'http://example.com/a.mp3' } })).toBeNull()
    expect(toReflectionView({ ...doc, audio: 3 })).toBeNull()
  })

  it('drops docs missing title, slug, preacher or weekOf', () => {
    expect(toReflectionView({ ...doc, title: '' })).toBeNull()
    expect(toReflectionView({ ...doc, slug: undefined })).toBeNull()
    expect(toReflectionView({ ...doc, preacherName: null })).toBeNull()
    expect(toReflectionView({ ...doc, weekOf: undefined })).toBeNull()
    expect(toReflectionView(null)).toBeNull()
  })

  it('keeps the preacher photo only with url and alt', () => {
    const photo = { url: 'https://example.com/p.jpg', alt: 'Foto' }
    expect(toReflectionView({ ...doc, preacherPhoto: photo })?.preacherPhoto).toEqual(photo)
    expect(toReflectionView({ ...doc, preacherPhoto: { url: photo.url } })?.preacherPhoto).toBeNull()
  })
})

describe('weekRangeLabel', () => {
  it('formats a week inside one month', () => {
    expect(weekRangeLabel('2026-11-01')).toBe('1 al 7 de noviembre')
  })
  it('crosses months', () => {
    expect(weekRangeLabel('2026-10-28')).toBe('28 de octubre al 3 de noviembre')
  })
  it('accepts a full ISO timestamp', () => {
    expect(weekRangeLabel('2026-11-01T12:00:00.000Z')).toBe('1 al 7 de noviembre')
  })
})
