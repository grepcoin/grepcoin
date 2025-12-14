import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Risk Disclaimer - GrepCoin',
  description: 'Important risk disclosures for GrepCoin users. Understand the risks of cryptocurrency, staking, and smart contracts.',
}

export default function RiskDisclaimer() {
  return (
    <main className="min-h-screen bg-dark-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-10 h-10 text-yellow-500" />
          <h1 className="text-4xl font-display font-bold">Risk Disclaimer</h1>
        </div>
        <p className="text-gray-400 mb-8">Last updated: December 2024</p>

        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-6 mb-8">
          <p className="text-yellow-200 text-lg leading-relaxed">
            <strong>IMPORTANT:</strong> Please read this entire disclaimer carefully before using GrepCoin,
            acquiring GREP tokens, or participating in staking. By using our Services, you acknowledge that
            you have read, understood, and agree to the risks described below.
          </p>
        </div>

        <div className="prose prose-invert prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">1. No Financial Advice</h2>
            <div className="bg-dark-800 border border-dark-600 rounded-lg p-6">
              <p className="text-gray-300 leading-relaxed">
                Nothing on the GrepCoin website, in our documentation, or communicated by GrepLabs LLC or its
                representatives constitutes financial, investment, legal, or tax advice. The information provided
                is for general informational and entertainment purposes only.
              </p>
              <p className="text-gray-300 leading-relaxed mt-4">
                You should consult with qualified professionals before making any financial decisions related
                to cryptocurrency, tokens, or staking activities.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">2. GREP Token Risks</h2>
            <ul className="space-y-4">
              <li className="bg-dark-800 border border-dark-600 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">Not an Investment</h3>
                <p className="text-gray-300">
                  GREP is a utility token designed for use within the GrepCoin gaming ecosystem. It is not
                  designed or intended to be an investment. Do not acquire GREP with any expectation of profit
                  or financial return.
                </p>
              </li>
              <li className="bg-dark-800 border border-dark-600 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">Price Volatility</h3>
                <p className="text-gray-300">
                  The value of GREP, like all cryptocurrencies, is highly volatile and may fluctuate significantly.
                  The value may decrease substantially or become worthless. You should only use funds that you
                  can afford to lose entirely.
                </p>
              </li>
              <li className="bg-dark-800 border border-dark-600 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">No Guarantees</h3>
                <p className="text-gray-300">
                  We make no guarantees about the future value, utility, or availability of GREP tokens.
                  The token may lose all value, the platform may cease operations, or the token may become
                  illiquid with no buyers.
                </p>
              </li>
              <li className="bg-dark-800 border border-dark-600 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">Not a Security</h3>
                <p className="text-gray-300">
                  GREP is not intended to be a security, share, or ownership interest in GrepLabs LLC.
                  It does not entitle holders to dividends, profits, voting rights in the company, or
                  any claim on company assets.
                </p>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">3. Smart Contract Risks</h2>
            <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-6">
              <p className="text-red-200 leading-relaxed">
                <strong>Critical Warning:</strong> Smart contracts are experimental technology. Despite security
                audits and testing, vulnerabilities may exist that could result in permanent loss of funds.
              </p>
            </div>
            <ul className="list-disc list-inside text-gray-300 mt-4 space-y-2">
              <li><strong className="text-white">Code Vulnerabilities:</strong> Bugs or exploits in smart contract
                code could allow attackers to drain staked funds</li>
              <li><strong className="text-white">Immutability:</strong> Once deployed, smart contracts generally
                cannot be modified to fix issues (though upgradeable patterns may be used)</li>
              <li><strong className="text-white">Oracle Risks:</strong> If the contracts rely on external data
                sources, manipulation of those sources could affect outcomes</li>
              <li><strong className="text-white">User Error:</strong> Incorrect transactions cannot be reversed
                on the blockchain</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">4. Staking Risks</h2>
            <ul className="space-y-4">
              <li className="bg-dark-800 border border-dark-600 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">Lock-Up Periods</h3>
                <p className="text-gray-300">
                  Certain staking tiers require locking your tokens for specified periods (7 to 90 days).
                  During this time, you cannot access or withdraw your tokens regardless of market conditions.
                </p>
              </li>
              <li className="bg-dark-800 border border-dark-600 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">Reward Rate Changes</h3>
                <p className="text-gray-300">
                  Staking reward rates are not guaranteed and may change based on protocol parameters,
                  total staked amounts, or governance decisions.
                </p>
              </li>
              <li className="bg-dark-800 border border-dark-600 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">Slashing Risk</h3>
                <p className="text-gray-300">
                  While our current contracts do not implement slashing, future updates or related protocols
                  may introduce penalties for certain behaviors.
                </p>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">5. Regulatory Risks</h2>
            <div className="bg-dark-800 border border-dark-600 rounded-lg p-6">
              <p className="text-gray-300 leading-relaxed">
                The regulatory landscape for cryptocurrencies and tokens is evolving and uncertain:
              </p>
              <ul className="list-disc list-inside text-gray-300 mt-4 space-y-2">
                <li>Laws and regulations may change, potentially affecting the legality or operation of our Services</li>
                <li>GREP tokens may be classified differently in different jurisdictions</li>
                <li>We may be required to restrict or terminate Services in certain regions</li>
                <li>Users are responsible for understanding and complying with their local laws</li>
                <li>Tax treatment of tokens and staking rewards varies by jurisdiction</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">6. Technology Risks</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li><strong className="text-white">Blockchain Network Issues:</strong> Congestion, forks, or network
                failures on Base or Ethereum could affect transactions</li>
              <li><strong className="text-white">Wallet Security:</strong> Loss of private keys means permanent
                loss of access to your tokens</li>
              <li><strong className="text-white">Phishing Attacks:</strong> Malicious actors may impersonate
                GrepCoin to steal funds</li>
              <li><strong className="text-white">Website Downtime:</strong> Our Services may experience outages
                or become unavailable</li>
              <li><strong className="text-white">Third-Party Dependencies:</strong> We rely on third-party
                services (RPC providers, hosting, etc.) that could fail</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">7. Game Reward Risks</h2>
            <div className="bg-dark-800 border border-dark-600 rounded-lg p-6">
              <p className="text-gray-300 leading-relaxed">
                Game rewards and GREP earnings are subject to:
              </p>
              <ul className="list-disc list-inside text-gray-300 mt-4 space-y-2">
                <li>Changes in reward rates and multipliers</li>
                <li>Daily limits and caps on earnings</li>
                <li>Anti-cheat measures that may affect legitimate players</li>
                <li>Platform modifications or discontinuation of games</li>
                <li>No guarantee of minimum earnings or consistent rewards</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">8. Project Risks</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>GrepCoin is a new project and may not achieve its goals or roadmap</li>
              <li>The development team may change or the project may be discontinued</li>
              <li>Competing projects may emerge with superior offerings</li>
              <li>The indie gaming market may not adopt blockchain-based rewards</li>
              <li>Token liquidity may be limited, making it difficult to convert GREP to other assets</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">9. Your Responsibilities</h2>
            <div className="bg-dark-800 border border-dark-600 rounded-lg p-6">
              <p className="text-gray-300 leading-relaxed">
                By using GrepCoin, you acknowledge that:
              </p>
              <ul className="list-disc list-inside text-gray-300 mt-4 space-y-2">
                <li>You have read and understood these risks</li>
                <li>You are solely responsible for your decisions regarding GREP tokens and staking</li>
                <li>You will conduct your own research before participating</li>
                <li>You understand this is experimental technology</li>
                <li>You will not use funds you cannot afford to lose</li>
                <li>You accept full responsibility for any losses incurred</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">10. No Warranties</h2>
            <div className="bg-dark-800 border border-dark-600 rounded-lg p-6">
              <p className="text-gray-300 leading-relaxed uppercase font-semibold">
                THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND,
                EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY,
                FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT
                THE SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">11. Contact</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have questions about these risk disclosures:
            </p>
            <div className="bg-dark-800 border border-dark-600 rounded-lg p-6 mt-4">
              <p className="text-white font-semibold">GrepLabs LLC</p>
              <p className="text-gray-300">Registered in Delaware, USA</p>
              <p className="text-gray-300 mt-2">
                Email: <a href="mailto:legal@greplabs.io" className="text-grep-purple hover:text-grep-pink transition-colors">legal@greplabs.io</a>
              </p>
            </div>
          </section>

          <section className="pt-8 border-t border-dark-700">
            <p className="text-gray-400 text-sm leading-relaxed">
              By using GrepCoin Services, you confirm that you have read, understood, and agree to all
              risks described in this disclaimer. If you do not accept these risks, you should not use
              our Services.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
