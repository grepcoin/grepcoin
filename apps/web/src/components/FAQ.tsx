'use client'

import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'

const faqs = [
  {
    category: 'General',
    questions: [
      {
        q: 'What is GrepCoin?',
        a: 'GrepCoin is a decentralized ecosystem for indie games and hobby projects. It provides a unified token economy, funding platform, marketplace, and governance system that connects creators, players, and supporters.',
      },
      {
        q: 'How is GrepCoin different from other gaming tokens?',
        a: 'Unlike single-game tokens, GREP works across an entire ecosystem of games. We focus on indie creators with 97.5% revenue share (vs 70% industry standard), milestone-based funding protection, and community governance.',
      },
      {
        q: 'When is the token launch?',
        a: 'We\'re planning our Token Generation Event (TGE) for Q1 2025. Join our waitlist to get early access and exclusive benefits.',
      },
    ],
  },
  {
    category: 'Tokenomics',
    questions: [
      {
        q: 'What is the total supply of GREP?',
        a: 'The total supply is fixed at 500 million GREP tokens. 40% is allocated to community and ecosystem rewards, ensuring long-term sustainability.',
      },
      {
        q: 'How can I earn GREP tokens?',
        a: 'You can earn GREP through: staking (5-20% APY), playing ecosystem games, backing successful projects, providing liquidity, and participating in community activities.',
      },
      {
        q: 'Is GREP deflationary?',
        a: 'Yes! 1% of marketplace fees are burned, and 10% of platform revenue goes to buyback and burn. Staking also removes tokens from circulation.',
      },
    ],
  },
  {
    category: 'Staking',
    questions: [
      {
        q: 'What are the staking tiers?',
        a: 'We offer 5 tiers: Flexible (0 days, 5% APY), Bronze (30 days, 8%), Silver (90 days, 12%), Gold (180 days, 15%), and Diamond (365 days, 20% APY).',
      },
      {
        q: 'Can I withdraw early from staking?',
        a: 'Yes, but early withdrawal incurs a 50% penalty on your staked amount. This protects long-term stakers and ecosystem stability.',
      },
      {
        q: 'How are staking rewards calculated?',
        a: 'Rewards accrue per second based on your tier\'s APY. You can claim anytime or compound automatically for maximum returns.',
      },
    ],
  },
  {
    category: 'Technical',
    questions: [
      {
        q: 'Which blockchain is GrepCoin on?',
        a: 'GrepCoin launches on Ethereum L2s (Base and Arbitrum) for low fees and fast transactions while maintaining Ethereum security.',
      },
      {
        q: 'Is the code audited?',
        a: 'Yes, all smart contracts undergo multiple independent security audits before deployment. Audit reports will be publicly available.',
      },
      {
        q: 'How do I connect my wallet?',
        a: 'We support MetaMask, WalletConnect, Coinbase Wallet, and all major Web3 wallets. Simply click "Connect Wallet" on our platform.',
      },
    ],
  },
]

function AccordionItem({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string
  answer: string
  isOpen: boolean
  onClick: () => void
}) {
  return (
    <div className="border-b border-dark-600/50">
      <button
        onClick={onClick}
        className="w-full py-5 flex items-center justify-between text-left hover:text-grep-purple transition-colors"
      >
        <span className="font-medium pr-4">{question}</span>
        <ChevronDown
          className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-grep-purple' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 pb-5' : 'max-h-0'
        }`}
      >
        <p className="text-gray-400 leading-relaxed">{answer}</p>
      </div>
    </div>
  )
}

export default function FAQ() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-grep-purple/20 border border-grep-purple/30 mb-6">
            <HelpCircle className="w-4 h-4 text-grep-purple" />
            <span className="text-sm text-grep-purple font-medium">Got Questions?</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-display font-bold mb-4">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Everything you need to know about GrepCoin
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {faqs.map((category, categoryIndex) => (
            <div
              key={categoryIndex}
              className="p-8 rounded-3xl bg-dark-700/30 border border-dark-600/30"
            >
              {/* Category header */}
              <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    categoryIndex === 0
                      ? 'bg-grep-purple'
                      : categoryIndex === 1
                      ? 'bg-grep-pink'
                      : categoryIndex === 2
                      ? 'bg-grep-orange'
                      : 'bg-grep-cyan'
                  }`}
                />
                {category.category}
              </h3>

              {/* Questions */}
              <div>
                {category.questions.map((faq, faqIndex) => {
                  const key = `${categoryIndex}-${faqIndex}`
                  return (
                    <AccordionItem
                      key={key}
                      question={faq.q}
                      answer={faq.a}
                      isOpen={openItems[key] || false}
                      onClick={() => toggleItem(key)}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-4">Still have questions?</p>
          <a
            href="#"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-dark-700 border border-dark-600 hover:border-grep-purple transition-colors font-medium"
          >
            Join our Discord
          </a>
        </div>
      </div>
    </section>
  )
}
