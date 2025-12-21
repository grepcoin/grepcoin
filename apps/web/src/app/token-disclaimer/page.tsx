import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, ShieldAlert } from 'lucide-react'

export const metadata: Metadata = {
  title: 'GREP Token Disclaimer - GrepCoin',
  description: 'Important information about GREP utility token. Not an investment or security. Read before acquiring or using GREP tokens.',
}

export default function TokenDisclaimer() {
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
          <ShieldAlert className="w-10 h-10 text-grep-purple" />
          <h1 className="text-4xl font-display font-bold">GREP Token Disclaimer</h1>
        </div>
        <p className="text-gray-400 mb-8">Last updated: December 2024</p>

        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-6 mb-8">
          <div className="flex gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <p className="text-yellow-200 font-semibold mb-2">IMPORTANT: Read Before Acquiring GREP</p>
              <p className="text-yellow-100 text-sm leading-relaxed">
                GREP is a utility token for the GrepCoin gaming ecosystem. It is NOT an investment, security,
                or financial instrument. Do not acquire GREP with any expectation of profit. Read this entire
                disclaimer carefully.
              </p>
            </div>
          </div>
        </div>

        <div className="prose prose-invert prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">1. Token Overview</h2>

            <div className="bg-dark-800 border border-dark-600 rounded-lg p-6 mb-4">
              <h3 className="text-lg font-semibold text-white mb-3">What is GREP?</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                GREP is a <strong className="text-white">utility token</strong> designed exclusively for use
                within the GrepCoin gaming ecosystem. GREP enables users to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Participate in arcade gaming with token rewards</li>
                <li>Stake tokens to earn gameplay multipliers</li>
                <li>Access platform features and benefits</li>
                <li>Participate in governance (if/when implemented)</li>
                <li>Unlock achievements and progress through the ecosystem</li>
              </ul>
            </div>

            <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-200 mb-3">What GREP is NOT</h3>
              <p className="text-red-100 mb-4">GREP is explicitly NOT any of the following:</p>
              <ul className="space-y-2 text-red-100">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">❌</span>
                  <span>An investment or investment contract</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">❌</span>
                  <span>A security or financial instrument</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">❌</span>
                  <span>A share of stock or equity in GrepLabs LLC</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">❌</span>
                  <span>A claim to company profits, dividends, or revenue</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">❌</span>
                  <span>Legal tender or a replacement for fiat currency</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">❌</span>
                  <span>Guaranteed to have or maintain any specific value</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">2. Utility Token Status</h2>
            <div className="bg-dark-800 border border-dark-600 rounded-lg p-6">
              <p className="text-gray-300 leading-relaxed">
                GREP is designed and intended solely as a <strong className="text-white">functional utility token</strong> with
                specific use cases within the GrepCoin platform:
              </p>
              <ul className="list-disc list-inside text-gray-300 mt-4 space-y-2">
                <li><strong className="text-white">Gaming Rewards:</strong> Earned through gameplay performance</li>
                <li><strong className="text-white">Staking:</strong> Locked to increase reward multipliers</li>
                <li><strong className="text-white">Platform Access:</strong> Required for certain features and benefits</li>
                <li><strong className="text-white">Governance:</strong> Potential voting rights on platform decisions (future)</li>
                <li><strong className="text-white">Ecosystem Participation:</strong> Accessing games, tournaments, and events</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                <strong className="text-yellow-400">Important:</strong> GREP is not designed, marketed, or intended
                for investment purposes. Do not acquire GREP with any expectation of profit or financial return.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">3. Not a Security</h2>
            <p className="text-gray-300 leading-relaxed">
              GrepLabs LLC has designed GREP to function as a utility token, not a security. However:
            </p>
            <ul className="list-disc list-inside text-gray-300 mt-4 space-y-2">
              <li>It is <strong className="text-white">not registered</strong> with the SEC or any securities regulator</li>
              <li>It does <strong className="text-white">not</strong> provide securities law investor protections</li>
              <li>Regulatory authorities may have different interpretations of token classification</li>
              <li>The legal classification of tokens continues to evolve</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              We make no guarantees about how GREP will be classified by regulators. If GREP were deemed
              a security, distribution and trading may be restricted or prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">4. No Profit Expectations</h2>
            <div className="bg-dark-800 border border-dark-600 rounded-lg p-6">
              <p className="text-gray-300 leading-relaxed">
                GrepLabs LLC makes <strong className="text-white">NO</strong> promises, guarantees, or
                representations regarding:
              </p>
              <ul className="list-disc list-inside text-gray-300 mt-4 space-y-2">
                <li>Future token value or price appreciation</li>
                <li>Profits or financial returns of any kind</li>
                <li>Dividends, distributions, or revenue sharing</li>
                <li>Buybacks, redemptions, or market making</li>
                <li>Liquidity or ability to sell tokens</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                The market value of GREP (if any market exists) may fluctuate dramatically, decrease significantly,
                or become zero. <strong className="text-yellow-400">You may lose all value associated with GREP tokens.</strong>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">5. Token Rights and Limitations</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-dark-800 border border-green-600/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-400 mb-3">What You Receive</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Functional utility within the platform</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Ability to stake for multipliers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Access to platform features</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Potential governance participation</span>
                  </li>
                </ul>
              </div>

              <div className="bg-dark-800 border border-red-600/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-400 mb-3">What You Do NOT Receive</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">✗</span>
                    <span>Ownership or equity in GrepLabs LLC</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">✗</span>
                    <span>Dividends or profit distributions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">✗</span>
                    <span>Claims on company assets</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">✗</span>
                    <span>Any guarantees or warranties</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">6. Platform Dependency</h2>
            <div className="bg-dark-800 border border-dark-600 rounded-lg p-6">
              <p className="text-gray-300 leading-relaxed">
                GREP&apos;s utility is <strong className="text-white">entirely dependent</strong> on the continued
                operation of the GrepCoin platform:
              </p>
              <ul className="list-disc list-inside text-gray-300 mt-4 space-y-2">
                <li>If the platform shuts down, GREP may lose all utility</li>
                <li>If games are discontinued, earning opportunities may disappear</li>
                <li>If features change, token utility may be altered</li>
                <li>We reserve the right to modify, update, or discontinue platform features at any time</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                We make <strong className="text-white">NO</strong> guarantees that the platform will continue
                operating indefinitely or that features will remain unchanged.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">7. Regulatory Considerations</h2>
            <p className="text-gray-300 leading-relaxed">
              The regulatory status of utility tokens is uncertain and evolving. You are solely responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-300 mt-4 space-y-2">
              <li>Understanding laws in your jurisdiction</li>
              <li>Ensuring your GREP acquisition and use complies with local laws</li>
              <li>Determining tax treatment of GREP</li>
              <li>Reporting GREP holdings or transactions as required by law</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              <strong className="text-yellow-400">Do not acquire or use GREP if it is illegal in your jurisdiction.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">8. Technical and Security Risks</h2>
            <ul className="space-y-4">
              <li className="bg-dark-800 border border-dark-600 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">Smart Contract Risks</h3>
                <p className="text-gray-300">
                  Smart contracts may contain bugs or vulnerabilities. Exploits could result in loss of tokens.
                  GrepLabs LLC cannot recover lost or stolen tokens.
                </p>
              </li>
              <li className="bg-dark-800 border border-dark-600 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">Wallet Security</h3>
                <p className="text-gray-300">
                  Loss of private keys means permanent loss of GREP. You are responsible for securing your wallet.
                  Phishing attacks and malware could compromise your tokens.
                </p>
              </li>
              <li className="bg-dark-800 border border-dark-600 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">Blockchain Dependency</h3>
                <p className="text-gray-300">
                  GREP depends on the underlying blockchain. Network failures, high fees, or congestion could affect
                  GREP transactions and functionality.
                </p>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">9. No Guarantees or Warranties</h2>
            <div className="bg-dark-800 border border-dark-600 rounded-lg p-6">
              <p className="text-gray-300 leading-relaxed uppercase font-semibold">
                GREP IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND. WE PROVIDE NO GUARANTEES REGARDING
                TOKEN VALUE, LIQUIDITY, CONTINUED UTILITY, PLATFORM AVAILABILITY, OR FEATURE FUNCTIONALITY.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">10. Your Acknowledgment</h2>
            <div className="bg-grep-purple/10 border border-grep-purple/30 rounded-lg p-6">
              <p className="text-gray-300 leading-relaxed mb-4">
                By acquiring, holding, or using GREP tokens, you acknowledge that:
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-grep-purple mt-1">✓</span>
                  <span>You have read and understood this entire Token Disclaimer</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-grep-purple mt-1">✓</span>
                  <span>You understand that GREP is a utility token, not an investment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-grep-purple mt-1">✓</span>
                  <span>You are not acquiring GREP with any expectation of profit</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-grep-purple mt-1">✓</span>
                  <span>You understand that GREP may lose all value</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-grep-purple mt-1">✓</span>
                  <span>You are acquiring GREP solely for its utility within the platform</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-grep-purple mt-1">✓</span>
                  <span>You will not hold GrepLabs LLC liable for losses</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="border-t border-dark-700 pt-8">
            <h2 className="text-2xl font-display font-semibold text-white mb-4">Related Documents</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link
                href="/terms"
                className="bg-dark-800 border border-dark-600 hover:border-grep-purple rounded-lg p-4 transition-colors group"
              >
                <h3 className="font-semibold text-white group-hover:text-grep-purple mb-2">Terms of Service</h3>
                <p className="text-gray-400 text-sm">Complete terms and conditions for using GrepCoin</p>
              </Link>
              <Link
                href="/privacy"
                className="bg-dark-800 border border-dark-600 hover:border-grep-purple rounded-lg p-4 transition-colors group"
              >
                <h3 className="font-semibold text-white group-hover:text-grep-purple mb-2">Privacy Policy</h3>
                <p className="text-gray-400 text-sm">How we collect, use, and protect your data</p>
              </Link>
              <Link
                href="/disclaimer"
                className="bg-dark-800 border border-dark-600 hover:border-grep-purple rounded-lg p-4 transition-colors group"
              >
                <h3 className="font-semibold text-white group-hover:text-grep-purple mb-2">Risk Disclaimer</h3>
                <p className="text-gray-400 text-sm">Comprehensive risk disclosures for all users</p>
              </Link>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">Contact Information</h2>
            <div className="bg-dark-800 border border-dark-600 rounded-lg p-6">
              <p className="text-white font-semibold">GrepLabs LLC</p>
              <p className="text-gray-300">Registered in Delaware, USA</p>
              <p className="text-gray-300 mt-2">
                Email: <a href="mailto:legal@greplabs.io" className="text-grep-purple hover:text-grep-pink transition-colors">legal@greplabs.io</a>
              </p>
              <p className="text-gray-300">
                Website: <a href="https://grepcoin.io" className="text-grep-purple hover:text-grep-pink transition-colors">grepcoin.io</a>
              </p>
            </div>
          </section>

          <section className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-6">
            <div className="flex gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-yellow-200 font-semibold mb-2">Final Statement</p>
                <p className="text-yellow-100 leading-relaxed">
                  GREP is a utility token for use within the GrepCoin gaming ecosystem. It is not an investment.
                  Do not acquire GREP with any expectation of profit. The value may decrease to zero. Use only
                  funds you can afford to lose. If you do not understand or accept these terms, do not acquire
                  or use GREP tokens.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
