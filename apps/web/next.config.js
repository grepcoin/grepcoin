/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Docker deployment
  output: 'standalone',

  // Optimize images
  images: {
    domains: ['grepcoin.io', 'avatars.githubusercontent.com'],
    unoptimized: process.env.NODE_ENV === 'development',
  },

  async redirects() {
    return [
      {
        source: '/arcade',
        destination: '/games',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
