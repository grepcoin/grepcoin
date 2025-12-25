/** @type {import('next').NextConfig} */
const nextConfig = {
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
