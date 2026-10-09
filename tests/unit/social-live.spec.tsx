import { describe, expect, it } from 'vitest'
import { manualStream, parseVideoUrl } from '@/lib/social-live'

describe('enlaces y anuncios de directos', () => {
  it('normaliza YouTube y Facebook y rechaza otros orígenes', () => {
    expect(parseVideoUrl('youtube', 'https://youtu.be/abcdefghijk')).toBe('abcdefghijk')
    expect(parseVideoUrl('youtube', 'https://www.youtube.com/live/abcdefghijk')).toBe('abcdefghijk')
    expect(parseVideoUrl('facebook', 'https://www.facebook.com/parroquia/videos/123456/')).toBe(
      '123456',
    )
    expect(parseVideoUrl('facebook', 'https://www.facebook.com/watch/?v=123456')).toBe('123456')
    expect(parseVideoUrl('youtube', 'https://youtube.com.evil.test/watch?v=abcdefghijk')).toBeNull()
    expect(parseVideoUrl('youtube', 'javascript:alert(1)')).toBeNull()
    expect(parseVideoUrl('facebook', 'https://www.facebook.com/parroquia')).toBeNull()
  })
  it('requiere modo manual, URL válida y fecha futura', () => {
    const now = Date.parse('2026-09-25T12:00:00Z')
    const config = {
      mode: 'manual' as const,
      url: 'https://youtu.be/abcdefghijk',
      endsAt: '2026-09-25T14:00:00Z',
    }
    expect(manualStream('youtube', config, now)?.id).toBe('abcdefghijk')
    expect(manualStream('youtube', { ...config, mode: 'off' }, now)).toBeNull()
    expect(manualStream('youtube', { ...config, endsAt: 'bad-date' }, now)).toBeNull()
    expect(manualStream('youtube', config, now + 7200000)).toBeNull()
    expect(manualStream('youtube', { ...config, endsAt: undefined }, now)).toBeNull()
  })
})
