'use client'

import { motion } from 'framer-motion'
import { Sparkles, Code2, Cpu, Heart, Users, Rocket } from 'lucide-react'

const milestones = [
  {
    icon: Sparkles,
    title: 'The Spark',
    description: 'One developer with a vision: build a crypto arcade for indie game lovers.',
  },
  {
    icon: Cpu,
    title: 'AI Partnership',
    description: 'Teamed up with Claude to turn ideas into production-ready code.',
  },
  {
    icon: Code2,
    title: 'Rapid Build',
    description: '8 games, smart contracts, full web app - built in days, not months.',
  },
  {
    icon: Rocket,
    title: 'Open Source',
    description: 'Released to the community under MIT license for everyone to use and improve.',
  },
]

export default function Story() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-grep-purple/5 to-dark-900" />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-grep-purple/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-grep-orange/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-grep-purple/20 border border-grep-purple/30 mb-6">
            <Cpu className="w-4 h-4 text-grep-purple" />
            <span className="text-sm text-grep-purple font-medium">AI-Powered Development</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            The Story Behind{' '}
            <span className="bg-gradient-to-r from-grep-orange via-grep-yellow to-grep-green bg-clip-text text-transparent">
              GrepCoin
            </span>
          </h2>

          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            GrepCoin isn&apos;t just another crypto project. It&apos;s proof of what happens when
            human creativity meets AI capability.
          </p>
        </motion.div>

        {/* Main story content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mb-16"
        >
          <div className="bg-dark-800/50 backdrop-blur-sm rounded-2xl border border-dark-700 p-8 md:p-12">
            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                <strong className="text-white">Built entirely through human-AI collaboration</strong>,
                GrepCoin was developed through an intensive partnership between a solo founder and
                Claude (Anthropic&apos;s AI). Every line of code - from the Solidity smart contracts to
                the React components to the database schema - was crafted through this collaboration.
              </p>

              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                What would traditionally take a team of developers months to build was accomplished in days:
              </p>

              <ul className="grid md:grid-cols-2 gap-4 mb-6 list-none pl-0">
                <li className="flex items-start gap-3 bg-dark-700/50 rounded-lg p-4">
                  <div className="w-2 h-2 rounded-full bg-grep-green mt-2 flex-shrink-0" />
                  <span className="text-gray-300"><strong className="text-white">8 arcade games</strong> with unique mechanics</span>
                </li>
                <li className="flex items-start gap-3 bg-dark-700/50 rounded-lg p-4">
                  <div className="w-2 h-2 rounded-full bg-grep-green mt-2 flex-shrink-0" />
                  <span className="text-gray-300"><strong className="text-white">47 passing tests</strong> for smart contracts</span>
                </li>
                <li className="flex items-start gap-3 bg-dark-700/50 rounded-lg p-4">
                  <div className="w-2 h-2 rounded-full bg-grep-green mt-2 flex-shrink-0" />
                  <span className="text-gray-300"><strong className="text-white">Complete web app</strong> with auth & leaderboards</span>
                </li>
                <li className="flex items-start gap-3 bg-dark-700/50 rounded-lg p-4">
                  <div className="w-2 h-2 rounded-full bg-grep-green mt-2 flex-shrink-0" />
                  <span className="text-gray-300"><strong className="text-white">Legal framework</strong> production-ready</span>
                </li>
              </ul>

              <p className="text-lg text-gray-300 leading-relaxed">
                This project proves that the future of software development isn&apos;t about replacing
                developers - it&apos;s about <strong className="text-white">amplifying what a single person
                with a vision can accomplish</strong>.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Milestones */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {milestones.map((milestone, index) => (
            <motion.div
              key={milestone.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-grep-purple/20 to-grep-orange/20 border border-dark-700 flex items-center justify-center mx-auto mb-4">
                <milestone.icon className="w-8 h-8 text-grep-orange" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">{milestone.title}</h3>
              <p className="text-gray-400 text-sm">{milestone.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-grep-purple/10 to-grep-orange/10 border border-dark-700">
            <Heart className="w-5 h-5 text-grep-pink" />
            <p className="text-gray-300">
              <strong className="text-white">For the indie devs, the hobbyists, the dreamers who code after hours.</strong>
            </p>
            <Users className="w-5 h-5 text-grep-purple" />
          </div>

          <p className="mt-6 text-gray-500">
            Built by the community, for the community - and it started as a conversation with an AI.
          </p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <a
              href="https://github.com/grepcoin/grepcoin"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl bg-dark-800 border border-dark-700 text-white font-medium hover:border-grep-purple/50 transition-colors"
            >
              View on GitHub
            </a>
            <a
              href="https://anthropic.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-grep-purple to-grep-orange text-white font-medium hover:opacity-90 transition-opacity"
            >
              Powered by Claude
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
