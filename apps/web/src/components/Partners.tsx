'use client'

import { Handshake, Rocket } from 'lucide-react'

export default function Partners() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-dark-800/50" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-grep-purple/20 to-grep-pink/20 mb-6">
            <Handshake className="w-10 h-10 text-grep-purple" />
          </div>

          <h2 className="text-4xl sm:text-5xl font-display font-bold mb-4">
            Partners & <span className="text-gradient">Backers</span>
          </h2>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            We&apos;re building relationships with leading blockchain infrastructure providers,
            gaming guilds, and investors who share our vision for indie gaming.
          </p>

          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-dark-700/50 border border-dark-600/50 text-gray-400">
            <Rocket className="w-5 h-5 text-grep-purple" />
            <span>Partnership announcements coming soon</span>
          </div>

          <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-grep-purple/10 via-grep-pink/10 to-grep-orange/10 border border-grep-purple/20 max-w-2xl mx-auto">
            <h3 className="text-xl font-display font-bold mb-2">Interested in Partnering?</h3>
            <p className="text-gray-400 mb-4">
              We&apos;re looking for blockchain infrastructure providers, gaming studios,
              and strategic partners to join the GrepCoin ecosystem.
            </p>
            <a
              href="mailto:partnerships@greplabs.io"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-playful font-semibold hover:opacity-90 transition-opacity"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
