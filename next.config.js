/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output:"standalone",
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: false
      }
    ]
  }
}

module.exports = nextConfig
