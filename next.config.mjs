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
  basePath: '',
  assetPrefix: '',
  trailingSlash: false,
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname,
  },
  publicRuntimeConfig: {
    staticFolder: '/static',
  },
};

export default nextConfig;