import type { SponsorView } from '@/lib/sponsors'

export const makeSponsor = (over: Partial<SponsorView> = {}): SponsorView => ({
  id: '1',
  name: 'Panadería San José',
  logo: { url: 'https://example.supabase.co/logo.png', alt: 'Logo de Panadería San José' },
  category: 'Panadería',
  blurb: 'Pan de cada día.',
  facebookUrl: 'https://www.facebook.com/panaderia',
  instagramUrl: 'https://www.instagram.com/panaderia',
  ...over,
})
