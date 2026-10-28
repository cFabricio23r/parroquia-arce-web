import { describe, it, expect, vi } from 'vitest'

const find = vi.fn()
vi.mock('payload', () => ({ getPayload: async () => ({ find }) }))
vi.mock('@/payload.config', () => ({ default: Promise.resolve({}) }))

import { getReflectionBySlug } from '@/lib/reflections'

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
    expect(find.mock.calls[0][0].where).toEqual({
      slug: { equals: 'x' },
      status: { equals: 'published' },
    })
  })
  it('returns null when missing', async () => {
    find.mockResolvedValueOnce({ docs: [] })
    expect(await getReflectionBySlug('nope')).toBeNull()
  })
})
