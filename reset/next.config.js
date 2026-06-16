/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
  typescript:  { ignoreBuildErrors: false },
  eslint:      { ignoreDuringBuilds: true },
  swcMinify:   true,
  compress:    true,
  poweredByHeader: false,
}
module.exports = nextConfig
