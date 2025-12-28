import LaunchCountdown from '@/components/LaunchCountdown'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GrepCoin - Launching January 31, 2026',
  description: 'The AI-Built Crypto Arcade. Play games, earn GREP, own your rewards. 10 developer-themed games built on Base L2.',
  openGraph: {
    title: 'GrepCoin - Launching January 31, 2026',
    description: 'The AI-Built Crypto Arcade. Play games, earn GREP, own your rewards.',
    type: 'website',
    url: 'https://grepcoin.io/launch',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GrepCoin - Launching January 31, 2026',
    description: 'The AI-Built Crypto Arcade. Play games, earn GREP, own your rewards.',
  },
}

export default function LaunchPage() {
  return <LaunchCountdown />
}
