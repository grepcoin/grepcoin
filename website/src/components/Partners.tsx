'use client'

// Placeholder partner logos using SVG shapes
const partners = [
  { name: 'Base', category: 'Blockchain' },
  { name: 'Arbitrum', category: 'Blockchain' },
  { name: 'Chainlink', category: 'Oracle' },
  { name: 'The Graph', category: 'Indexing' },
  { name: 'Alchemy', category: 'Infrastructure' },
  { name: 'OpenZeppelin', category: 'Security' },
]

const backers = [
  { name: 'Paradigm', type: 'VC' },
  { name: 'a16z Games', type: 'VC' },
  { name: 'Coinbase Ventures', type: 'VC' },
  { name: 'Animoca Brands', type: 'Strategic' },
  { name: 'Merit Circle', type: 'Guild' },
  { name: 'YGG', type: 'Guild' },
]

const ecosystemGames = [
  { name: 'Pixel Quest', genre: 'RPG', status: 'Live' },
  { name: 'Space Raiders', genre: 'Shooter', status: 'Beta' },
  { name: 'Crypto Karts', genre: 'Racing', status: 'Coming Soon' },
  { name: 'Farm & Fortune', genre: 'Simulation', status: 'Live' },
]

export default function Partners() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-dark-800/50" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Partners */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-display font-bold mb-4">
              Trusted <span className="text-gradient">Partners</span>
            </h2>
            <p className="text-xl text-gray-400">
              Building with the best in blockchain infrastructure
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-dark-700/30 border border-dark-600/30 hover:border-grep-purple/50 hover:bg-dark-700/50 transition-all text-center"
              >
                {/* Placeholder logo */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-600 to-gray-700 mx-auto mb-3 flex items-center justify-center font-display font-bold text-lg group-hover:scale-110 transition-transform">
                  {partner.name.charAt(0)}
                </div>
                <div className="font-medium">{partner.name}</div>
                <div className="text-xs text-gray-500">{partner.category}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Backers */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-display font-bold mb-4">
              Backed By <span className="text-gradient-blue">Industry Leaders</span>
            </h3>
            <p className="text-gray-400">
              Strategic investors and gaming guilds supporting our vision
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {backers.map((backer, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-dark-700/30 border border-dark-600/30 hover:border-grep-cyan/50 transition-all text-center"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-grep-cyan/20 to-grep-blue/20 mx-auto mb-3 flex items-center justify-center font-display font-bold">
                  {backer.name.charAt(0)}
                </div>
                <div className="font-medium text-sm">{backer.name}</div>
                <div className="text-xs text-grep-cyan">{backer.type}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Ecosystem Games */}
        <div>
          <div className="text-center mb-12">
            <h3 className="text-3xl font-display font-bold mb-4">
              <span className="text-gradient">Ecosystem</span> Games
            </h3>
            <p className="text-gray-400">
              Play and earn across our growing network of integrated games
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ecosystemGames.map((game, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl bg-dark-700/50 border border-dark-600/50 hover:border-dark-500 transition-all"
              >
                {/* Game thumbnail placeholder */}
                <div className="aspect-video bg-gradient-to-br from-dark-600 to-dark-700 flex items-center justify-center">
                  <span className="text-4xl">🎮</span>
                </div>

                {/* Status badge */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      game.status === 'Live'
                        ? 'bg-grep-green/20 text-grep-green'
                        : game.status === 'Beta'
                        ? 'bg-grep-orange/20 text-grep-orange'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {game.status}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h4 className="font-display font-bold">{game.name}</h4>
                  <p className="text-sm text-gray-400">{game.genre}</p>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-grep-purple/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <button className="w-full py-2 rounded-lg bg-white text-dark-900 font-semibold text-sm hover:bg-gray-100 transition-colors">
                    Play Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* More games CTA */}
          <div className="text-center mt-8">
            <a href="#" className="text-grep-purple hover:text-grep-pink transition-colors font-medium">
              View all ecosystem games →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
