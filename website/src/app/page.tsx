import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import LiveActivityTicker from '@/components/LiveActivityTicker'
import Partners from '@/components/Partners'
import HowItWorks from '@/components/HowItWorks'
import GamesShowcase from '@/components/GamesShowcase'
import DailyChallenge from '@/components/DailyChallenge'
import PlayerSpotlight from '@/components/PlayerSpotlight'
import AchievementShowcase from '@/components/AchievementShowcase'
import Features from '@/components/Features'
import Comparison from '@/components/Comparison'
import Tokenomics from '@/components/Tokenomics'
import StakingCalculator from '@/components/StakingCalculator'
import Roadmap from '@/components/Roadmap'
import Team from '@/components/Team'
import FAQ from '@/components/FAQ'
import Community from '@/components/Community'
import Footer from '@/components/Footer'
import CoinRain from '@/components/CoinRain'

export default function Home() {
  return (
    <main className="min-h-screen relative">
      {/* Subtle coin rain effect */}
      <CoinRain />

      <Navbar />
      <Hero />
      <LiveActivityTicker />
      <Partners />
      <div id="how-it-works">
        <HowItWorks />
      </div>
      <GamesShowcase />
      <DailyChallenge />
      <PlayerSpotlight />
      <AchievementShowcase />
      <Features />
      <Comparison />
      <Tokenomics />
      <StakingCalculator />
      <Roadmap />
      <Team />
      <FAQ />
      <Community />
      <Footer />
    </main>
  )
}
