import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Footer } from '@/components/site/Footer'
import { makeSponsor } from './sponsor-fixtures'

// Plain function (not vi.fn): a vi.fn that returns a rejected promise reports it as unhandled.
let loadSponsors: () => Promise<unknown[]> = async () => []

vi.mock('@/payload.config', () => ({ default: {} }))
vi.mock('@/lib/get-clergy', () => ({ getClergyProfiles: async () => [] }))
vi.mock('@/lib/sponsors', () => ({ getActiveSponsors: () => loadSponsors() }))
vi.mock('payload', () => ({ getPayload: async () => ({ findGlobal: async () => ({}) }) }))

describe('Footer sponsors link', () => {
  beforeEach(() => {
    loadSponsors = async () => []
  })

  it('shows "Patrocinadores" only when there are active sponsors', async () => {
    loadSponsors = async () => [makeSponsor()]
    const { unmount } = render(await Footer())
    expect(screen.getByRole('link', { name: 'Patrocinadores' }).getAttribute('href')).toBe(
      '/patrocinadores',
    )
    unmount()

    loadSponsors = async () => []
    render(await Footer())
    expect(screen.queryByRole('link', { name: 'Patrocinadores' })).toBeNull()
  })

  it('hides the link (does not crash) when loading sponsors fails', async () => {
    loadSponsors = async () => {
      throw new Error('db down')
    }
    render(await Footer())
    expect(screen.queryByRole('link', { name: 'Patrocinadores' })).toBeNull()
  })
})
