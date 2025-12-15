'use client'

import { Users, Github, Heart } from 'lucide-react'

export default function Team() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-grep-cyan/20 to-grep-blue/20 mb-6">
            <Users className="w-10 h-10 text-grep-cyan" />
          </div>

          <h2 className="text-4xl sm:text-5xl font-display font-bold mb-6">
            Built by <span className="text-gradient">Indie Lovers</span>
          </h2>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            GrepCoin is built by a small team of developers who are passionate about
            indie games, open source, and empowering creators.
          </p>
        </div>

        {/* Open Source Focus */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          <div className="p-8 rounded-3xl bg-dark-700/50 border border-dark-600/50">
            <div className="w-14 h-14 rounded-xl bg-dark-600 flex items-center justify-center mb-4">
              <Github className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-display font-bold mb-2">Open Source First</h3>
            <p className="text-gray-400 mb-4">
              GrepCoin is fully open source under the MIT License. We believe in
              transparency and community-driven development.
            </p>
            <a
              href="https://github.com/grepcoin"
              target="_blank"
              rel="noopener noreferrer"
              className="text-grep-purple hover:text-grep-pink transition-colors font-medium"
            >
              View on GitHub →
            </a>
          </div>

          <div className="p-8 rounded-3xl bg-dark-700/50 border border-dark-600/50">
            <div className="w-14 h-14 rounded-xl bg-dark-600 flex items-center justify-center mb-4">
              <Heart className="w-7 h-7 text-grep-pink" />
            </div>
            <h3 className="text-xl font-display font-bold mb-2">For Indie Creators</h3>
            <p className="text-gray-400 mb-4">
              Our mission is to create a fun, rewarding ecosystem where indie game
              enthusiasts and hobbyist developers can thrive.
            </p>
            <a
              href="/games"
              className="text-grep-purple hover:text-grep-pink transition-colors font-medium"
            >
              Play Games →
            </a>
          </div>
        </div>

        {/* Company Info */}
        <div className="text-center p-8 rounded-3xl bg-gradient-to-r from-grep-purple/10 via-grep-pink/10 to-grep-orange/10 border border-grep-purple/20 max-w-2xl mx-auto">
          <h3 className="text-xl font-display font-bold mb-2">GrepLabs LLC</h3>
          <p className="text-gray-400 mb-4">
            A Delaware company building the future of indie gaming rewards.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            <span>Registered: Delaware, USA</span>
            <span className="hidden sm:inline">•</span>
            <span>Built in: California, USA</span>
          </div>

          <div className="mt-6 pt-6 border-t border-dark-600">
            <p className="text-gray-500 text-sm mb-4">Want to contribute or join us?</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://github.com/grepcoin"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors text-sm"
              >
                <Github className="w-4 h-4" />
                Contribute
              </a>
              <a
                href="mailto:hello@greplabs.io"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-playful font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
