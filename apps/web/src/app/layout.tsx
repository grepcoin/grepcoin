import type { Metadata, Viewport } from 'next'
import './globals.css'
import Providers from '@/components/Providers'

export const viewport: Viewport = {
  themeColor: '#8B5CF6',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://grepcoin.io'),
  title: 'GrepCoin - Crypto Arcade for Indie Game Lovers',
  description: 'The decentralized arcade gaming platform by GrepLabs LLC. Play developer-themed games, earn GREP tokens, and stake for multiplied rewards.',
  keywords: ['crypto', 'gaming', 'indie games', 'blockchain', 'arcade', 'staking', 'GREP token', 'Base'],
  authors: [{ name: 'GrepLabs LLC' }],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.svg', type: 'image/svg+xml' },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'GrepCoin - Crypto Arcade for Indie Game Lovers',
    description: 'Play developer-themed arcade games, earn GREP tokens, and stake for multiplied rewards. Built by GrepLabs LLC.',
    type: 'website',
    locale: 'en_US',
    siteName: 'GrepCoin by GrepLabs',
    images: [
      {
        url: '/api/og?title=GrepCoin&description=Play games, earn crypto',
        width: 1200,
        height: 630,
        alt: 'GrepCoin - The Indie Gaming Economy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GrepCoin - Fund Games, Play Together',
    description: 'The decentralized ecosystem for indie games and hobby projects.',
    images: ['/api/og?title=GrepCoin&description=Play games, earn crypto'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
      </head>
      <body className="bg-dark-900 text-white antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
