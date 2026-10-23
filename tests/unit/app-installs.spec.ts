import { describe, expect, it } from 'vitest'
import { parsePing, sameSvDay } from '@/lib/app-installs'

const valid = { deviceHash: 'a'.repeat(64), platform: 'android', appVersion: '1.0.0' }

describe('parsePing', () => {
  it('normalizes optional names without discarding accents or punctuation', () => {
    expect(parsePing({ ...valid, profile: { firstName: '  María   José ', lastName: " O’Neill-García " } }))
      .toEqual({ ...valid, profile: { firstName: 'María José', lastName: 'O’Neill-García' } })
  })

  it('accepts explicit empty names for deletion and rejects malformed profiles', () => {
    expect(parsePing({ ...valid, profile: { firstName: '', lastName: '' } })?.profile)
      .toEqual({ firstName: '', lastName: '' })
    for (const profile of [null, [], {}, { firstName: 2, lastName: '' },
      { firstName: 'a'.repeat(81), lastName: '' }, { firstName: 'a\nInjected', lastName: '' }]) {
      expect(parsePing({ ...valid, profile })).toBeNull()
    }
  })
  it('rejects invalid profile revisions and accepts safe integers', () => {
    const profile = { firstName: 'Ana', lastName: '' }
    for (const profileRevision of [-1, 1.5, NaN, Infinity, '3', null, Number.MAX_SAFE_INTEGER + 1]) {
      expect(parsePing({ ...valid, profile, profileRevision })).toBeNull()
    }
    expect(parsePing({ ...valid, profile, profileRevision: 3 })?.profileRevision).toBe(3)
  })
  it('accepts a valid body and drops extra fields', () => {
    const out = parsePing({ ...valid, status: 'approved', firstSeenAt: '2026-01-01' })
    expect(out).toEqual(valid)
    expect(Object.keys(out as object).sort()).toEqual(['appVersion', 'deviceHash', 'platform'])
  })

  it('accepts ios', () => {
    expect(parsePing({ ...valid, platform: 'ios' })?.platform).toBe('ios')
  })

  it.each([
    ['null', null],
    ['string', 'x'],
    ['empty object', {}],
    ['array', [valid]],
    ['hash 63 chars', { ...valid, deviceHash: 'a'.repeat(63) }],
    ['hash 65 chars', { ...valid, deviceHash: 'a'.repeat(65) }],
    ['uppercase hash', { ...valid, deviceHash: 'A'.repeat(64) }],
    ['numeric hash', { ...valid, deviceHash: 123 }],
    ['platform web', { ...valid, platform: 'web' }],
    ['empty appVersion', { ...valid, appVersion: '' }],
    ['appVersion 21 chars', { ...valid, appVersion: '1'.repeat(21) }],
    ['appVersion with space', { ...valid, appVersion: '1.0 beta' }],
    ['numeric appVersion', { ...valid, appVersion: 1 }],
  ])('rejects %s', (_name, body) => {
    expect(parsePing(body)).toBeNull()
  })

  it('accepts appVersion of exactly 20 chars with allowed symbols', () => {
    expect(parsePing({ ...valid, appVersion: '1.2.3-beta+build.45xy' .slice(0, 20) })).not.toBeNull()
  })
})

describe('sameSvDay', () => {
  it('treats 05:59Z and previous-day 18:00Z as the same SV day', () => {
    expect(sameSvDay('2026-10-23T05:59:00Z', '2026-10-22T18:00:00Z')).toBe(true)
  })

  it('splits at SV midnight (06:00Z)', () => {
    expect(sameSvDay('2026-10-23T06:00:00Z', '2026-10-23T05:59:00Z')).toBe(false)
  })

  it('accepts Date instances', () => {
    expect(sameSvDay(new Date('2026-10-23T12:00:00Z'), new Date('2026-10-23T20:00:00Z'))).toBe(true)
  })
})
