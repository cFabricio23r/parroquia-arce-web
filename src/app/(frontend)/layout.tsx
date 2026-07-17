import type { Metadata } from 'next'
import { Newsreader, Hanken_Grotesk } from 'next/font/google'
import React from 'react'
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

export const metadata: Metadata = {
  title: {
    default: 'Parroquia Inmaculada Concepción de María — Ciudad Arce',
    template: '%s · Parroquia Inmaculada Concepción de María',
  },
  description:
    'Parroquia Inmaculada Concepción de María, Ciudad Arce: horarios, sectores, grupos, eventos, radio parroquial y noticias.',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="es" className={`${display.variable} ${sans.variable}`}>
      <body className="bg-white font-sans text-[1rem] leading-[1.55] text-text antialiased">
        {children}
      </body>
    </html>
  )
}
