/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/earningsTrigger',
  assetPrefix: '/earningsTrigger/',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig
