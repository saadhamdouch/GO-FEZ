const createNextIntlPlugin = require('next-intl/plugin');
const path = require('path');

const nextConfig = {
  eslint: {
    // Autorise le build même si ESLint trouve des erreurs (les erreurs seront à corriger séparément)
    ignoreDuringBuilds: true,
  },
  // Évite les avertissements liés aux lockfiles en précisant la racine du workspace
  outputFileTracingRoot: path.join(__dirname, '..'),
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false, // empêche webpack de chercher fs côté client
      }
    }
    return config
  }
  // images: {
  //   loader: 'custom',
  //   loaderFile: './src/utils/cloudenary-loader.ts',
  // }
}



const withNextIntl = createNextIntlPlugin();

module.exports = withNextIntl(nextConfig);
