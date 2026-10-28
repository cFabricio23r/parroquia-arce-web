import { describe, it, expect, vi } from 'vitest'

const find = vi.fn()
vi.mock('payload', () => ({ getPayload: async () => ({ find }) }))
vi.mock('@/payload.config', () => ({ default: Promise.resolve({}) }))

import { getReflectionBySlug, getReflections, visibleUntil } from '@/lib/reflections'

const doc = {
  slug: 'x',
  title: 'T',
  preacherName: 'Hno. A B',
  weekOf: '2026-10-25',
  audio: { url: 'https://x.test/a.mp3' },
}

describe('getReflectionBySlug', () => {
  it('queries published by slug and returns a view', async () => {
    find.mockResolvedValueOnce({ docs: [doc] })
    const v = await getReflectionBySlug('x')
    expect(v?.slug).toBe('x')
    const where = find.mock.calls[0][0].where
    expect(where.slug).toEqual({ equals: 'x' })
    expect(where.status).toEqual({ equals: 'published' })
    expect(typeof where.weekOf.less_than).toBe('string')
  })
  it('returns null when missing', async () => {
    find.mockResolvedValueOnce({ docs: [] })
    expect(await getReflectionBySlug('nope')).toBeNull()
  })
})

describe('visibleUntil', () => {
  it('is the start of tomorrow in El Salvador', () => {
    expect(visibleUntil(new Date('2026-11-01T05:30:00Z'))).toBe('2026-11-01T06:00:00.000Z')
    expect(visibleUntil(new Date('2026-11-01T06:00:00Z'))).toBe('2026-11-02T06:00:00.000Z')
  })
})

describe('getReflections', () => {
  it('filters published and not-yet-started weeks', async () => {
    find.mockResolvedValueOnce({ docs: [doc], hasNextPage: false })
    await getReflections()
    const where = find.mock.calls.at(-1)![0].where
    expect(where.status).toEqual({ equals: 'published' })
    expect(typeof where.weekOf.less_than).toBe('string')
  })
})
