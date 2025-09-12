
import type {NextConfig} from 'next';
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: /.*/,
        handler: async (options: any) => {
          const { request } = options;
          const url = new URL(request.url);

          if (url.hostname === 'firestore.googleapis.com') {
            // Para las peticiones a Firestore, usar siempre la red.
            const { NetworkOnly } = require('workbox-strategies');
            const networkOnly = new NetworkOnly();
            return await networkOnly.handle(options);
          }

          // Para todas las demás peticiones, usar NetworkFirst.
          const { NetworkFirst } = require('workbox-strategies');
          const networkFirst = new NetworkFirst({
            cacheName: 'pages-cache',
            plugins: [
              {
                cacheWillUpdate: async ({ response: e }) => e.ok || e.type === "opaque" ? e : null,
              },
            ],
          });
          return await networkFirst.handle(options);
        },
      },
    ],
  },
  fallbacks: {
    document: '/offline',
  }
});

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'imgur.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default withPWA(nextConfig);
