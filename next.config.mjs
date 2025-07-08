   /** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  experimental: {
    skipTrailingSlashRedirect: true,
    swcTraceProfiling: true,
    forceSwcTransforms: true,
  },
};

export default nextConfig;