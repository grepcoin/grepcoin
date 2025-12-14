import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service - GrepCoin',
  description: 'Terms of Service for GrepCoin, the decentralized arcade gaming platform by GrepLabs LLC.',
}

export default function TermsOfService() {
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

        <h1 className="text-4xl font-display font-bold mb-2">Terms of Service</h1>
        <p className="text-gray-400 mb-8">Last updated: December 2024</p>

        <div className="prose prose-invert prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              Welcome to GrepCoin, operated by GrepLabs LLC, a Delaware limited liability company (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).
              By accessing or using our website at grepcoin.io, our arcade games, the GREP token, staking services,
              or any related services (collectively, the &quot;Services&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;).
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              If you do not agree to these Terms, you must not access or use our Services. We reserve the right to
              modify these Terms at any time. Your continued use of the Services following any changes constitutes
              acceptance of those changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">2. Description of Services</h2>
            <p className="text-gray-300 leading-relaxed">
              GrepCoin is a decentralized arcade gaming platform that allows users to:
            </p>
            <ul className="list-disc list-inside text-gray-300 mt-4 space-y-2">
              <li>Play browser-based arcade games themed around programming and technology</li>
              <li>Earn GREP tokens as rewards for gameplay performance</li>
              <li>Stake GREP tokens to earn multiplied rewards and additional benefits</li>
              <li>Participate in daily challenges and leaderboard competitions</li>
              <li>Connect cryptocurrency wallets for authentication and transactions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">3. Eligibility</h2>
            <p className="text-gray-300 leading-relaxed">
              To use our Services, you must:
            </p>
            <ul className="list-disc list-inside text-gray-300 mt-4 space-y-2">
              <li>Be at least 18 years of age or the age of majority in your jurisdiction</li>
              <li>Have the legal capacity to enter into a binding agreement</li>
              <li>Not be a resident of, or accessing the Services from, any jurisdiction where such access is prohibited</li>
              <li>Not be subject to economic sanctions or listed on any prohibited parties list</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              <strong className="text-white">Restricted Jurisdictions:</strong> Our Services are not available to residents
              of jurisdictions where cryptocurrency transactions, token staking, or related activities are prohibited or
              restricted by law. You are solely responsible for ensuring compliance with your local laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">4. Account and Wallet Authentication</h2>
            <p className="text-gray-300 leading-relaxed">
              Access to certain features requires connecting a compatible cryptocurrency wallet (e.g., MetaMask,
              WalletConnect-compatible wallets). By connecting your wallet:
            </p>
            <ul className="list-disc list-inside text-gray-300 mt-4 space-y-2">
              <li>You represent that you are the lawful owner of the wallet</li>
              <li>You are responsible for maintaining the security of your wallet and private keys</li>
              <li>You understand that we cannot recover lost private keys or reverse blockchain transactions</li>
              <li>You agree to Sign-In with Ethereum (SIWE) for authentication purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">5. User Conduct</h2>
            <p className="text-gray-300 leading-relaxed">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-gray-300 mt-4 space-y-2">
              <li>Use bots, scripts, or automated tools to play games or manipulate scores</li>
              <li>Exploit bugs, glitches, or vulnerabilities in the games or smart contracts</li>
              <li>Engage in any form of cheating or score manipulation</li>
              <li>Create multiple accounts to circumvent rules or gain unfair advantages</li>
              <li>Attempt to interfere with or disrupt the Services or servers</li>
              <li>Use the Services for money laundering or other illegal purposes</li>
              <li>Harass, abuse, or harm other users</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              Violation of these rules may result in immediate termination of access, forfeiture of rewards,
              and potential legal action.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">6. GREP Token Disclaimer</h2>
            <div className="bg-dark-800 border border-dark-600 rounded-lg p-6">
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-yellow-400">IMPORTANT:</strong> GREP is a utility token intended solely for use
                within the GrepCoin ecosystem. GREP is NOT:
              </p>
              <ul className="list-disc list-inside text-gray-300 mt-4 space-y-2">
                <li>An investment, security, or financial instrument</li>
                <li>A share, equity, or ownership interest in GrepLabs LLC</li>
                <li>A claim to future profits, dividends, or returns</li>
                <li>Legal tender or a substitute for fiat currency</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                The value of GREP may fluctuate and could decline to zero. You should not acquire GREP with any
                expectation of profit. Do not spend more than you can afford to lose.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">7. Staking Risks</h2>
            <p className="text-gray-300 leading-relaxed">
              By staking GREP tokens, you acknowledge and accept the following risks:
            </p>
            <ul className="list-disc list-inside text-gray-300 mt-4 space-y-2">
              <li><strong className="text-white">Smart Contract Risk:</strong> Staking involves interacting with smart contracts
                that may contain bugs or vulnerabilities despite audits</li>
              <li><strong className="text-white">Lock Period:</strong> Certain staking tiers require locking tokens for specified
                periods during which you cannot access your tokens</li>
              <li><strong className="text-white">Market Risk:</strong> The value of staked tokens may decrease during the staking period</li>
              <li><strong className="text-white">Technical Risk:</strong> Network congestion, failed transactions, or blockchain
                issues may affect staking operations</li>
              <li><strong className="text-white">Regulatory Risk:</strong> Changes in laws or regulations may affect the legality
                or availability of staking services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">8. Intellectual Property</h2>
            <p className="text-gray-300 leading-relaxed">
              The GrepCoin platform source code is released under the MIT License and is available at
              github.com/grepcoin. You are free to use, modify, and distribute the code in accordance
              with the MIT License terms.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              The GrepCoin and GrepLabs names, logos, and branding are trademarks of GrepLabs LLC.
              You may not use our trademarks without prior written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">9. Limitation of Liability</h2>
            <div className="bg-dark-800 border border-dark-600 rounded-lg p-6">
              <p className="text-gray-300 leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, GREPLABS LLC AND ITS OFFICERS, DIRECTORS, EMPLOYEES,
                AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
                DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, OR OTHER INTANGIBLE LOSSES,
                RESULTING FROM:
              </p>
              <ul className="list-disc list-inside text-gray-300 mt-4 space-y-2">
                <li>Your use or inability to use the Services</li>
                <li>Any unauthorized access to or alteration of your data</li>
                <li>Loss of tokens due to smart contract vulnerabilities, hacks, or user error</li>
                <li>Market value fluctuations of GREP tokens</li>
                <li>Any third-party conduct on the Services</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                IN NO EVENT SHALL OUR TOTAL LIABILITY EXCEED THE AMOUNT YOU PAID TO US, IF ANY, IN THE
                TWELVE (12) MONTHS PRECEDING THE CLAIM.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">10. Indemnification</h2>
            <p className="text-gray-300 leading-relaxed">
              You agree to indemnify, defend, and hold harmless GrepLabs LLC and its officers, directors,
              employees, and agents from and against any claims, liabilities, damages, losses, and expenses,
              including reasonable attorneys&apos; fees, arising out of or in any way connected with your access
              to or use of the Services, your violation of these Terms, or your violation of any rights of
              another party.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">11. Governing Law and Dispute Resolution</h2>
            <p className="text-gray-300 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the State of Delaware,
              United States, without regard to its conflict of law provisions.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              Any dispute arising out of or relating to these Terms or the Services shall be resolved through
              binding arbitration in accordance with the rules of the American Arbitration Association.
              The arbitration shall be conducted in Delaware, USA, and judgment on the award may be entered
              in any court having jurisdiction.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              <strong className="text-white">Class Action Waiver:</strong> You agree that any arbitration or
              proceeding shall be limited to the dispute between us individually. You waive any right to
              participate in a class action lawsuit or class-wide arbitration.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">12. Termination</h2>
            <p className="text-gray-300 leading-relaxed">
              We may terminate or suspend your access to the Services immediately, without prior notice or
              liability, for any reason, including breach of these Terms. Upon termination, your right to use
              the Services will immediately cease. Provisions that by their nature should survive termination
              shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations
              of liability.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">13. Severability</h2>
            <p className="text-gray-300 leading-relaxed">
              If any provision of these Terms is held to be invalid or unenforceable, such provision shall be
              struck and the remaining provisions shall be enforced to the fullest extent under law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">14. Contact Information</h2>
            <p className="text-gray-300 leading-relaxed">
              For questions about these Terms, please contact us at:
            </p>
            <div className="bg-dark-800 border border-dark-600 rounded-lg p-6 mt-4">
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
        </div>
      </div>
    </main>
  )
}
