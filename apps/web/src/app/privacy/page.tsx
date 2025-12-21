import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy - GrepCoin',
  description: 'Privacy Policy for GrepCoin, operated by GrepLabs LLC. Learn how we collect, use, and protect your data.',
}

export default function PrivacyPolicy() {
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

        <h1 className="text-4xl font-display font-bold mb-2">Privacy Policy</h1>
        <p className="text-gray-400 mb-8">Last updated: December 2024</p>

        <div className="prose prose-invert prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">1. Introduction</h2>
            <p className="text-gray-300 leading-relaxed">
              GrepLabs LLC (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), a Delaware limited liability company with operations
              in California, respects your privacy and is committed to protecting your personal information.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when
              you use our website at grepcoin.io and related services (collectively, the &quot;Services&quot;).
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              Please read this Privacy Policy carefully. By using our Services, you consent to the practices
              described in this policy. If you do not agree with this policy, please do not use our Services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.1 Wallet Information</h3>
            <p className="text-gray-300 leading-relaxed">
              When you connect your cryptocurrency wallet, we collect:
            </p>
            <ul className="list-disc list-inside text-gray-300 mt-4 space-y-2">
              <li>Your public wallet address</li>
              <li>Blockchain transaction data related to staking and rewards</li>
              <li>Sign-In with Ethereum (SIWE) signatures for authentication</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.2 Gameplay Data</h3>
            <p className="text-gray-300 leading-relaxed">
              When you play games on our platform, we collect:
            </p>
            <ul className="list-disc list-inside text-gray-300 mt-4 space-y-2">
              <li>Game scores and performance metrics</li>
              <li>GREP tokens earned and multipliers applied</li>
              <li>Achievement unlocks and challenge completions</li>
              <li>Daily play counts and streaks</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.3 Technical Data</h3>
            <p className="text-gray-300 leading-relaxed">
              We automatically collect certain technical information:
            </p>
            <ul className="list-disc list-inside text-gray-300 mt-4 space-y-2">
              <li>IP address (anonymized for analytics)</li>
              <li>Browser type and version</li>
              <li>Device type and operating system</li>
              <li>Pages visited and time spent on pages</li>
              <li>Referring website addresses</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-300 leading-relaxed">
              We use the collected information to:
            </p>
            <ul className="list-disc list-inside text-gray-300 mt-4 space-y-2">
              <li>Authenticate your identity and provide access to the Services</li>
              <li>Process staking operations and distribute rewards</li>
              <li>Maintain leaderboards and display scores</li>
              <li>Track achievements and challenge progress</li>
              <li>Calculate and apply staking multipliers</li>
              <li>Detect and prevent cheating, fraud, and abuse</li>
              <li>Improve our games and user experience</li>
              <li>Communicate important updates about the Services</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">4. Blockchain Data</h2>
            <div className="bg-dark-800 border border-dark-600 rounded-lg p-6">
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-yellow-400">Important:</strong> Blockchain transactions are inherently public
                and transparent. When you stake GREP tokens or claim rewards, the following data becomes permanently
                visible on the public blockchain:
              </p>
              <ul className="list-disc list-inside text-gray-300 mt-4 space-y-2">
                <li>Your wallet address</li>
                <li>Transaction amounts and timestamps</li>
                <li>Staking tier and lock periods</li>
                <li>Reward claim history</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                We cannot delete, modify, or hide this on-chain data. This is a fundamental characteristic of
                blockchain technology, not a limitation of our Services.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">5. Cookies and Tracking Technologies</h2>
            <p className="text-gray-300 leading-relaxed">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc list-inside text-gray-300 mt-4 space-y-2">
              <li><strong className="text-white">Essential Cookies:</strong> Required for authentication, session management,
                and basic functionality</li>
              <li><strong className="text-white">Preference Cookies:</strong> Remember your settings and preferences</li>
              <li><strong className="text-white">Analytics Cookies:</strong> Help us understand how users interact with
                our Services (you can opt out)</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              For more details, please see our <Link href="/cookies" className="text-grep-purple hover:text-grep-pink transition-colors">Cookie Policy</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">6. Third-Party Services</h2>
            <p className="text-gray-300 leading-relaxed">
              Our Services integrate with third-party providers:
            </p>
            <ul className="list-disc list-inside text-gray-300 mt-4 space-y-2">
              <li><strong className="text-white">Wallet Providers:</strong> MetaMask, WalletConnect, and other wallet
                applications have their own privacy policies</li>
              <li><strong className="text-white">Blockchain Networks:</strong> Base (Coinbase L2) and other networks
                process transactions according to their protocols</li>
              <li><strong className="text-white">RPC Providers:</strong> We use third-party RPC nodes to interact with
                the blockchain</li>
              <li><strong className="text-white">Hosting Services:</strong> Our website is hosted on infrastructure
                providers with their own data practices</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              We encourage you to review the privacy policies of these third-party services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">7. Data Retention</h2>
            <p className="text-gray-300 leading-relaxed">
              We retain your data as follows:
            </p>
            <ul className="list-disc list-inside text-gray-300 mt-4 space-y-2">
              <li><strong className="text-white">Account Data:</strong> Retained while your wallet is active on our platform</li>
              <li><strong className="text-white">Gameplay Data:</strong> Retained indefinitely for leaderboards and historical records</li>
              <li><strong className="text-white">Technical Logs:</strong> Retained for up to 90 days for security and debugging</li>
              <li><strong className="text-white">Blockchain Data:</strong> Permanent and immutable (we cannot delete this)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">8. Data Security</h2>
            <p className="text-gray-300 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your information:
            </p>
            <ul className="list-disc list-inside text-gray-300 mt-4 space-y-2">
              <li>Encryption of data in transit (HTTPS/TLS)</li>
              <li>Secure database access controls</li>
              <li>Regular security audits and monitoring</li>
              <li>Smart contract audits for on-chain components</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              However, no method of transmission over the Internet or electronic storage is 100% secure.
              We cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">9. Your Rights</h2>
            <p className="text-gray-300 leading-relaxed">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc list-inside text-gray-300 mt-4 space-y-2">
              <li><strong className="text-white">Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong className="text-white">Correction:</strong> Request correction of inaccurate data</li>
              <li><strong className="text-white">Deletion:</strong> Request deletion of your data (subject to legal requirements
                and excluding blockchain data)</li>
              <li><strong className="text-white">Portability:</strong> Request your data in a machine-readable format</li>
              <li><strong className="text-white">Opt-Out:</strong> Opt out of analytics cookies and non-essential data collection</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              To exercise these rights, contact us at <a href="mailto:privacy@greplabs.io" className="text-grep-purple hover:text-grep-pink transition-colors">privacy@greplabs.io</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">10. California Privacy Rights (CCPA)</h2>
            <div className="bg-dark-800 border border-dark-600 rounded-lg p-6">
              <p className="text-gray-300 leading-relaxed">
                If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
              </p>
              <ul className="list-disc list-inside text-gray-300 mt-4 space-y-2">
                <li><strong className="text-white">Right to Know:</strong> Request disclosure of categories and specific pieces
                  of personal information collected</li>
                <li><strong className="text-white">Right to Delete:</strong> Request deletion of personal information
                  (with certain exceptions)</li>
                <li><strong className="text-white">Right to Non-Discrimination:</strong> We will not discriminate against you
                  for exercising your rights</li>
                <li><strong className="text-white">Right to Opt-Out:</strong> We do not sell personal information, but you can
                  opt out of data sharing for advertising purposes</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                To submit a CCPA request, email <a href="mailto:privacy@greplabs.io" className="text-grep-purple hover:text-grep-pink transition-colors">privacy@greplabs.io</a> with
                the subject line &quot;CCPA Request.&quot;
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">11. Children&apos;s Privacy</h2>
            <p className="text-gray-300 leading-relaxed">
              Our Services are not intended for users under 18 years of age. We do not knowingly collect personal
              information from children. If we discover that we have collected information from a child under 18,
              we will delete it promptly. If you believe we have collected information from a child, please contact
              us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">12. International Data Transfers</h2>
            <p className="text-gray-300 leading-relaxed">
              Our Services are operated from the United States. If you are accessing our Services from outside
              the United States, please be aware that your information may be transferred to, stored, and processed
              in the United States where our servers are located. By using our Services, you consent to such transfer.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">13. Changes to This Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes
              by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. We encourage
              you to review this Privacy Policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">14. Related Legal Documents</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Please also review our other legal documents:
            </p>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <Link
                href="/terms"
                className="bg-dark-800 border border-dark-600 hover:border-grep-purple rounded-lg p-4 transition-colors group"
              >
                <h3 className="font-semibold text-white group-hover:text-grep-purple mb-2">Terms of Service</h3>
                <p className="text-gray-400 text-sm">Complete terms and conditions for using GrepCoin</p>
              </Link>
              <Link
                href="/disclaimer"
                className="bg-dark-800 border border-dark-600 hover:border-grep-purple rounded-lg p-4 transition-colors group"
              >
                <h3 className="font-semibold text-white group-hover:text-grep-purple mb-2">Risk Disclaimer</h3>
                <p className="text-gray-400 text-sm">Important risk disclosures for all users</p>
              </Link>
              <Link
                href="/token-disclaimer"
                className="bg-dark-800 border border-dark-600 hover:border-grep-purple rounded-lg p-4 transition-colors group"
              >
                <h3 className="font-semibold text-white group-hover:text-grep-purple mb-2">Token Disclaimer</h3>
                <p className="text-gray-400 text-sm">GREP token-specific information</p>
              </Link>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">15. Contact Us</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-dark-800 border border-dark-600 rounded-lg p-6 mt-4">
              <p className="text-white font-semibold">GrepLabs LLC</p>
              <p className="text-gray-300">Registered in Delaware, USA</p>
              <p className="text-gray-300">Operations: California, USA</p>
              <p className="text-gray-300 mt-2">
                Privacy Inquiries: <a href="mailto:privacy@greplabs.io" className="text-grep-purple hover:text-grep-pink transition-colors">privacy@greplabs.io</a>
              </p>
              <p className="text-gray-300">
                General Inquiries: <a href="mailto:legal@greplabs.io" className="text-grep-purple hover:text-grep-pink transition-colors">legal@greplabs.io</a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
