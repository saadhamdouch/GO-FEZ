const createNextIntlPlugin = require('next-intl/plugin');
const path = require('path');

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  outputFileTracingRoot: path.join(__dirname, '..'),
  
  // --- ADD THIS BLOCK ---
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      // You might also need your real image host here later
      // {
      //   protocol: 'https',
      //   hostname: 'res.cloudinary.com', 
      // },
    ],
  },
  // --- END OF BLOCK ---

  webpack: (config, { isServer }) => {
    // ... (rest of your webpack config)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false, 
      }
    }
    return config
  }
}

const withNextIntl = createNextIntlPlugin();

module.exports = withNextIntl(nextConfig);