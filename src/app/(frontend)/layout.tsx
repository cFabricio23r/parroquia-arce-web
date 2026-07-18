import type { Metadata } from 'next'
import { Newsreader, Hanken_Grotesk } from 'next/font/google'
import React, { cache } from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { Header } from '@/components/site/Header'
import { Footer } from '@/components/site/Footer'
import './globals.css'

const display = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
  display: 'swap',
})

const sans = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-hanken',
  display: 'swap',
})

// Lee el global Settings una sola vez por request (cache() dedupe entre
// generateMetadata y el layout).
const getSettings = cache(async () => {
  const payload = await getPayload({ config: await config })
  return payload.findGlobal({ slug: 'settings' })
})

// Deriva la marca del global: el isotipo va al Header/Footer; el favicon cae en
// cadena favicon subido -> isotipo subido -> icon.svg estatico (si no devolvemos
// icons en la metadata, Next usa la convencion de archivo).
function brandFromSettings(settings: Awaited<ReturnType<typeof getSettings>>) {
  const iso = settings.marca?.isotipo
  const fav = settings.marca?.favicon
  const isotipo =
    iso && typeof iso === 'object' ? { url: iso.url ?? null, alt: iso.alt ?? '' } : null
  const faviconUrl = (fav && typeof fav === 'object' ? fav.url : null) ?? isotipo?.url ?? null
  return { isotipo, faviconUrl }
}

export async function generateMetadata(): Promise<Metadata> {
  const { faviconUrl } = brandFromSettings(await getSettings())
  return {
    title: {
      default: 'Parroquia Inmaculada Concepción de María — Ciudad Arce',
      template: '%s · Parroquia Inmaculada Concepción de María',
    },
    description:
      'Parroquia Inmaculada Concepción de María, Ciudad Arce: horarios, sectores, grupos, eventos, radio parroquial y noticias.',
    ...(faviconUrl ? { icons: { icon: faviconUrl } } : {}),
  }
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  const payload = await getPayload({ config: await config })
  const [contact, settings] = await Promise.all([
    payload.findGlobal({ slug: 'contact' }),
    getSettings(),
  ])

  const channels = (contact.channels ?? [])
    .filter((c): c is typeof c & { platform: string; url: string } => !!c.platform && !!c.url)
    .map((c) => ({ platform: c.platform, url: c.url }))
  const radioLive = settings.radio?.available ?? true
  const { isotipo } = brandFromSettings(settings)

  return (
    <html lang="es" className={`${display.variable} ${sans.variable}`}>
      <body className="bg-white font-sans text-[1rem] leading-[1.55] text-text antialiased">
        <Header channels={channels} radioLive={radioLive} brand={isotipo} />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
