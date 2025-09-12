import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: !isProd, // solo activo en producción
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  workboxOptions: isProd
    ? {
        disableDevLogs: true,
        runtimeCaching: [
          {
            // Ignorar Firestore
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: 'NetworkOnly',
          },
          {
            // Cachear todo lo demás
            urlPattern: /^https?:\/\//i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 días
              },
            },
          },
        ],
      }
    : undefined,
  fallbacks: isProd ? { document: '/offline' } : undefined,
});

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
      { protocol: 'https', hostname: 'i.imgur.com', pathname: '/**' },
      { protocol: 'https', hostname: 'imgur.com', pathname: '/**' },
    ],
  },
};

export default withPWA(nextConfig);
