'use client'

import { ArrowRight, MessageCircle, Twitter, Github, BookOpen } from 'lucide-react'

const socials = [
  { name: 'Discord', icon: MessageCircle, href: '#', color: 'hover:bg-indigo-500/20 hover:border-indigo-500/50' },
  { name: 'Twitter', icon: Twitter, href: '#', color: 'hover:bg-sky-500/20 hover:border-sky-500/50' },
  { name: 'GitHub', icon: Github, href: '#', color: 'hover:bg-gray-500/20 hover:border-gray-500/50' },
  { name: 'Docs', icon: BookOpen, href: '#', color: 'hover:bg-green-500/20 hover:border-green-500/50' },
]

export default function Community() {
  return (
    <section id="community" className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-grep-purple/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-grep-pink/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-grep-orange/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main CTA */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-6">
            Ready to <span className="text-gradient">Join the Revolution?</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Be part of the community shaping the future of indie gaming. Early supporters get exclusive benefits and rewards.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <a
              href="#"
              className="group w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-playful font-semibold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg glow-purple"
            >
              Join Waitlist
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-dark-700/80 border border-dark-600 font-semibold text-lg hover:bg-dark-600 transition-colors flex items-center justify-center gap-2"
            >
              Read Whitepaper
            </a>
          </div>

          {/* Early Bird Benefits */}
          <div className="inline-flex flex-wrap justify-center gap-4 p-4 rounded-2xl bg-dark-700/30 border border-dark-600/30">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-grep-green">✓</span>
              <span className="text-gray-300">Early access to platform</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-grep-green">✓</span>
              <span className="text-gray-300">Bonus GREP airdrop</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-grep-green">✓</span>
              <span className="text-gray-300">Exclusive Discord role</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-grep-green">✓</span>
              <span className="text-gray-300">Founding member NFT</span>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {socials.map((social, index) => (
            <a
              key={index}
              href={social.href}
              className={`flex items-center justify-center gap-3 p-4 rounded-2xl bg-dark-700/50 border border-dark-600/50 transition-all ${social.color}`}
            >
              <social.icon className="w-5 h-5" />
              <span className="font-medium">{social.name}</span>
            </a>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-16 max-w-xl mx-auto">
          <div className="p-8 rounded-3xl bg-dark-700/50 border border-dark-600/50">
            <h3 className="text-xl font-display font-bold mb-2 text-center">Stay Updated</h3>
            <p className="text-gray-400 text-center mb-6">Get the latest news, updates, and alpha directly to your inbox.</p>

            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl bg-dark-800 border border-dark-600 focus:border-grep-purple focus:outline-none focus:ring-2 focus:ring-grep-purple/20 transition-all"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-playful font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
