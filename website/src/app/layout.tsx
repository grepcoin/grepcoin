import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GrepCoin - Fund Games, Play Together, Own the Future',
  description: 'The decentralized ecosystem for indie games and hobby projects. Fund creators, earn rewards, and own a piece of the gaming revolution.',
  keywords: ['crypto', 'gaming', 'indie games', 'blockchain', 'defi', 'staking', 'dao'],
  authors: [{ name: 'GrepCoin Team' }],
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
    title: 'GrepCoin - The Indie Gaming Economy',
    description: 'Fund games, play together, own the future. Join the decentralized ecosystem for indie games.',
    type: 'website',
    locale: 'en_US',
    siteName: 'GrepCoin',
    images: [
      {
        url: '/og-image.png',
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
    images: ['/og-image.png'],
  },
  themeColor: '#8B5CF6',
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
        {children}
      </body>
    </html>
  )
}
