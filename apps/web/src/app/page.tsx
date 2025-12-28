import LaunchCountdown from '@/components/LaunchCountdown'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GrepCoin - Play Games. Earn Crypto. Have Fun.',
  description: 'The AI-Built Crypto Arcade. Play games, earn GREP, own your rewards. 10 developer-themed games built on Base L2. Launching January 31, 2026.',
  openGraph: {
    title: 'GrepCoin - Play Games. Earn Crypto. Have Fun.',
    description: 'The AI-Built Crypto Arcade. Play games, earn GREP, own your rewards.',
    type: 'website',
    url: 'https://grepcoin.io',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GrepCoin - Play Games. Earn Crypto. Have Fun.',
    description: 'The AI-Built Crypto Arcade. Play games, earn GREP, own your rewards.',
  },
}

export default function Home() {
  return <LaunchCountdown />
}
