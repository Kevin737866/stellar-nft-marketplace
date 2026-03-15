/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['ipfs.io', 'nftstorage.link', 'cloudflare-ipfs.com'],
  },
}

module.exports = nextConfig
