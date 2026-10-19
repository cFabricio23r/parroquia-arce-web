import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Footer } from '@/components/site/Footer'

vi.mock('@/payload.config', () => ({ default: {} }))
vi.mock('@/lib/get-clergy', () => ({ getClergyProfiles: async () => [] }))
vi.mock('payload', () => ({
  getPayload: async () => ({
    findGlobal: async ({ slug }: { slug: string }) =>
      slug === 'contact'
        ? {
            parishName: 'Inmaculada Concepción',
            address: 'Ciudad Arce',
            mapUrl: 'https://maps.app.goo.gl/example',
            channels: [{ platform: 'facebook', url: 'https://www.facebook.com/parish' }],
          }
        : {},
  }),
}))

describe('Compact parish footer', () => {
  it('offers the radio and news destination only once', async () => {
    const { container } = render(await Footer())
    expect(container.querySelectorAll('a[href="/radio"]').length).toBe(1)
    expect(container.querySelectorAll('a[href="/noticias"]').length).toBe(1)
    expect(screen.queryByText('Radio parroquial en vivo')).toBeNull()
  })

  it('keeps the confirmed map destination and accessible social labels', async () => {
    render(await Footer())
    expect(screen.getByRole('link', { name: /Cómo llegar/ }).getAttribute('href')).toBe(
      'https://maps.app.goo.gl/example',
    )
    expect(screen.getByRole('link', { name: 'Facebook' }).getAttribute('href')).toBe(
      'https://www.facebook.com/parish',
    )
  })
})
