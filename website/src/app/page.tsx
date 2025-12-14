import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Partners from '@/components/Partners'
import Features from '@/components/Features'
import HowItWorks from '@/components/HowItWorks'
import GamesShowcase from '@/components/GamesShowcase'
import Tokenomics from '@/components/Tokenomics'
import StakingCalculator from '@/components/StakingCalculator'
import Comparison from '@/components/Comparison'
import Roadmap from '@/components/Roadmap'
import Team from '@/components/Team'
import FAQ from '@/components/FAQ'
import Community from '@/components/Community'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Partners />
      <HowItWorks />
      <GamesShowcase />
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
