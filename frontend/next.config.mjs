// frontend/next.config.mjs
import path from 'path';
import { fileURLToPath } from 'url';
import nextPWA from 'next-pwa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';

// Config base
const baseConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  outputFileTracingRoot: path.join(__dirname, '..'),
};

// PWA
const withPWA = nextPWA({
  dest: 'public',
  disable: !isProd, // en dev no registra SW (pon false si quieres probar en dev)
  register: true,
  skipWaiting: true,
  fallbacks: {
    document: '/offline',
  },
  runtimeCaching: [
    // Imágenes locales
    {
      urlPattern: ({ request, sameOrigin }) => sameOrigin && request.destination === 'image',
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 3600 },
      },
    },
    // Google Fonts
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'google-fonts' },
    },
    // Supabase Storage público
    {
      urlPattern: /^https:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/public\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'supabase-storage',
        expiration: { maxEntries: 60, maxAgeSeconds: 7 * 24 * 3600 },
      },
    },
    // Supabase REST
    {
      urlPattern: /^https:\/\/[^/]+\.supabase\.co\/rest\/v1\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-rest',
        networkTimeoutSeconds: 4,
      },
    },
  ],
});

export default withPWA(baseConfig);
