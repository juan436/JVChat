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
    // Usamos import.meta.url en lugar de __dirname para módulos ES
    PROJECT_ROOT: '.',
  },
  publicRuntimeConfig: {
    staticFolder: '/static',
  },
};

export default nextConfig;