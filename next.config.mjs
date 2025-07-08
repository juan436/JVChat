   /** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  skipTrailingSlashRedirect: true,
  experimental: {
    swcTraceProfiling: true,
    forceSwcTransforms: true,
  },
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;