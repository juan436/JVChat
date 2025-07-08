   /** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  skipTrailingSlashRedirect: true,
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  experimental: {
    swcTraceProfiling: true,
    forceSwcTransforms: true,
  },
};

export default nextConfig;