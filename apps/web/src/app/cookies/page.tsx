import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Cookie Policy - GrepCoin',
  description: 'Cookie Policy for GrepCoin. Learn about how we use cookies and similar technologies.',
}

export default function CookiePolicy() {
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

        <h1 className="text-4xl font-display font-bold mb-2">Cookie Policy</h1>
        <p className="text-gray-400 mb-8">Last updated: December 2024</p>

        <div className="prose prose-invert prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">1. What Are Cookies?</h2>
            <p className="text-gray-300 leading-relaxed">
              Cookies are small text files that are stored on your device when you visit a website.
              They help websites remember your preferences and improve your browsing experience.
              GrepCoin uses cookies and similar technologies to provide, secure, and improve our Services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">2. Types of Cookies We Use</h2>

            <div className="space-y-6">
              <div className="bg-dark-800 border border-dark-600 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-3">Essential Cookies</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  These cookies are necessary for the website to function and cannot be disabled.
                </p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-dark-600">
                      <th className="text-left py-2 text-gray-400">Cookie</th>
                      <th className="text-left py-2 text-gray-400">Purpose</th>
                      <th className="text-left py-2 text-gray-400">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <tr className="border-b border-dark-700">
                      <td className="py-2 font-mono text-grep-purple">grepcoin_session</td>
                      <td className="py-2">User authentication session</td>
                      <td className="py-2">Session</td>
                    </tr>
                    <tr className="border-b border-dark-700">
                      <td className="py-2 font-mono text-grep-purple">grepcoin_nonce</td>
                      <td className="py-2">SIWE authentication nonce</td>
                      <td className="py-2">5 minutes</td>
                    </tr>
                    <tr className="border-b border-dark-700">
                      <td className="py-2 font-mono text-grep-purple">grepcoin_staking</td>
                      <td className="py-2">Staking state persistence</td>
                      <td className="py-2">7 days</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-mono text-grep-purple">grepcoin_last_played</td>
                      <td className="py-2">Daily play counter reset</td>
                      <td className="py-2">24 hours</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-dark-800 border border-dark-600 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-3">Preference Cookies</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  These cookies remember your preferences and settings.
                </p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-dark-600">
                      <th className="text-left py-2 text-gray-400">Cookie</th>
                      <th className="text-left py-2 text-gray-400">Purpose</th>
                      <th className="text-left py-2 text-gray-400">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <tr className="border-b border-dark-700">
                      <td className="py-2 font-mono text-grep-purple">grepcoin_theme</td>
                      <td className="py-2">Theme preference (dark/light)</td>
                      <td className="py-2">1 year</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-mono text-grep-purple">grepcoin_sounds</td>
                      <td className="py-2">Sound/audio preferences</td>
                      <td className="py-2">1 year</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-dark-800 border border-dark-600 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-3">Analytics Cookies (Optional)</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  These cookies help us understand how users interact with our website.
                  You can opt out of these cookies.
                </p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-dark-600">
                      <th className="text-left py-2 text-gray-400">Cookie</th>
                      <th className="text-left py-2 text-gray-400">Purpose</th>
                      <th className="text-left py-2 text-gray-400">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <tr className="border-b border-dark-700">
                      <td className="py-2 font-mono text-grep-purple">_ga</td>
                      <td className="py-2">Google Analytics - visitor distinction</td>
                      <td className="py-2">2 years</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-mono text-grep-purple">_gid</td>
                      <td className="py-2">Google Analytics - session distinction</td>
                      <td className="py-2">24 hours</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">3. Local Storage</h2>
            <p className="text-gray-300 leading-relaxed">
              In addition to cookies, we use browser local storage for:
            </p>
            <ul className="list-disc list-inside text-gray-300 mt-4 space-y-2">
              <li><strong className="text-white">Wallet Connection State:</strong> Remember which wallet was connected</li>
              <li><strong className="text-white">Game Progress:</strong> Save in-progress game state</li>
              <li><strong className="text-white">UI Preferences:</strong> Store interface customizations</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              Local storage data persists until you clear your browser data or the data is programmatically removed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">4. Third-Party Cookies</h2>
            <p className="text-gray-300 leading-relaxed">
              Some third-party services may set their own cookies when you use our Services:
            </p>
            <ul className="list-disc list-inside text-gray-300 mt-4 space-y-2">
              <li><strong className="text-white">WalletConnect:</strong> May store session data for wallet connections</li>
              <li><strong className="text-white">Analytics Providers:</strong> May use cookies for usage analytics</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              We do not control third-party cookies. Please refer to their respective privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">5. Managing Cookies</h2>
            <p className="text-gray-300 leading-relaxed">
              You can manage cookies through your browser settings:
            </p>

            <div className="mt-4 space-y-4">
              <div className="bg-dark-800 border border-dark-600 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Chrome</h4>
                <p className="text-gray-300 text-sm">Settings &gt; Privacy and Security &gt; Cookies and other site data</p>
              </div>
              <div className="bg-dark-800 border border-dark-600 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Firefox</h4>
                <p className="text-gray-300 text-sm">Settings &gt; Privacy &amp; Security &gt; Cookies and Site Data</p>
              </div>
              <div className="bg-dark-800 border border-dark-600 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Safari</h4>
                <p className="text-gray-300 text-sm">Preferences &gt; Privacy &gt; Manage Website Data</p>
              </div>
              <div className="bg-dark-800 border border-dark-600 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Edge</h4>
                <p className="text-gray-300 text-sm">Settings &gt; Cookies and site permissions &gt; Cookies and site data</p>
              </div>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-6 mt-6">
              <p className="text-yellow-200">
                <strong>Note:</strong> Disabling essential cookies may prevent you from using certain features
                of our Services, including wallet authentication and game progress saving.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">6. Do Not Track</h2>
            <p className="text-gray-300 leading-relaxed">
              Some browsers have a &quot;Do Not Track&quot; (DNT) feature that signals to websites that you do not
              want to be tracked. Currently, there is no universal standard for how websites should respond
              to DNT signals. We do not currently respond to DNT signals, but you can manage cookies as
              described above.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">7. Updates to This Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Cookie Policy from time to time. Any changes will be posted on this page
              with an updated &quot;Last updated&quot; date. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-white mb-4">8. Contact Us</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have questions about our use of cookies, please contact us:
            </p>
            <div className="bg-dark-800 border border-dark-600 rounded-lg p-6 mt-4">
              <p className="text-white font-semibold">GrepLabs LLC</p>
              <p className="text-gray-300 mt-2">
                Email: <a href="mailto:privacy@greplabs.io" className="text-grep-purple hover:text-grep-pink transition-colors">privacy@greplabs.io</a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
