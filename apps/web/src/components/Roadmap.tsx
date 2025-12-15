'use client'

import { Check, Clock, Rocket, Sparkles } from 'lucide-react'

const phases = [
  {
    phase: 'Phase 1',
    title: 'Foundation',
    period: 'Q1-Q2 2025',
    status: 'upcoming',
    color: 'from-grep-purple to-grep-pink',
    items: [
      { text: 'Smart contract development', done: true },
      { text: 'Security audits', done: true },
      { text: 'Token Generation Event (TGE)', done: false },
      { text: 'DEX liquidity launch', done: false },
      { text: 'Staking platform live', done: false },
      { text: 'First game integrations', done: false },
    ],
  },
  {
    phase: 'Phase 2',
    title: 'Growth',
    period: 'Q3-Q4 2025',
    status: 'future',
    color: 'from-grep-pink to-grep-orange',
    items: [
      { text: 'Marketplace beta launch', done: false },
      { text: 'Launchpad platform', done: false },
      { text: 'Creator Studio v1', done: false },
      { text: '10+ ecosystem projects', done: false },
      { text: 'Mobile wallet release', done: false },
      { text: '10,000 active users', done: false },
    ],
  },
  {
    phase: 'Phase 3',
    title: 'Expansion',
    period: '2026',
    status: 'future',
    color: 'from-grep-orange to-grep-yellow',
    items: [
      { text: 'Cross-chain bridge', done: false },
      { text: 'Advanced governance (DAO)', done: false },
      { text: 'Major partnerships', done: false },
      { text: '50+ ecosystem projects', done: false },
      { text: '100,000 active users', done: false },
      { text: 'Self-sustaining treasury', done: false },
    ],
  },
  {
    phase: 'Phase 4',
    title: 'Maturity',
    period: '2027+',
    status: 'future',
    color: 'from-grep-cyan to-grep-blue',
    items: [
      { text: 'Full decentralization', done: false },
      { text: 'Industry-standard ecosystem', done: false },
      { text: 'Global creator network', done: false },
      { text: 'Cross-platform SDK', done: false },
      { text: 'Mainstream adoption', done: false },
    ],
  },
]

export default function Roadmap() {
  return (
    <section id="roadmap" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-dark-800/50" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-display font-bold mb-6">
            The Road to <span className="text-gradient">Revolution</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Our journey to build the definitive ecosystem for indie games and hobby projects.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line (Desktop) */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-grep-purple via-grep-pink via-grep-orange to-grep-cyan" />

          {/* Phases */}
          <div className="space-y-12 lg:space-y-24">
            {phases.map((phase, index) => (
              <div
                key={index}
                className={`relative lg:flex items-center ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Content Card */}
                <div className={`lg:w-1/2 ${index % 2 === 0 ? 'lg:pr-12' : 'lg:pl-12'}`}>
                  <div className="p-8 rounded-3xl bg-dark-700/50 border border-dark-600/50 hover:border-dark-500 transition-all">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${phase.color} flex items-center justify-center`}>
                        {phase.status === 'current' ? (
                          <Sparkles className="w-7 h-7 text-white" />
                        ) : phase.status === 'upcoming' ? (
                          <Rocket className="w-7 h-7 text-white" />
                        ) : (
                          <Clock className="w-7 h-7 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">{phase.phase}</div>
                        <div className="text-2xl font-display font-bold">{phase.title}</div>
                      </div>
                      <div className={`ml-auto px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r ${phase.color} bg-opacity-20`}>
                        {phase.period}
                      </div>
                    </div>

                    {/* Items */}
                    <ul className="space-y-3">
                      {phase.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            item.done
                              ? 'bg-grep-green'
                              : 'bg-dark-600 border border-dark-500'
                          }`}>
                            {item.done && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className={item.done ? 'text-gray-300' : 'text-gray-400'}>
                            {item.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Timeline Node (Desktop) */}
                <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-dark-900 border-4 border-grep-purple items-center justify-center">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${phase.color}`} />
                </div>

                {/* Spacer for alternating layout */}
                <div className="hidden lg:block lg:w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
