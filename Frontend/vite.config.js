import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-icon.jpg'],
      manifest: {
        name: 'ResQFlow – Flood Rescue & Relief',
        short_name: 'ResQFlow',
        description: 'Emergency Flood Rescue & Relief Coordination System – Report floods, coordinate NGOs, and manage disaster relief.',
        theme_color: '#0284c7',
        background_color: '#f0f4f8',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        categories: ['emergency', 'utilities', 'social'],
        shortcuts: [
          {
            name: 'Report a Flood',
            short_name: 'Report',
            description: 'Quickly submit a new flood report',
            url: '/victim/create-report',
            icons: [{ src: 'pwa-192.png', sizes: '192x192' }],
          },
        ],
      },
      workbox: {
        // Cache the app shell (HTML, JS, CSS)
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,ico,woff2}'],
        runtimeCaching: [
          {
            // API calls – network first, fallback to cache
            urlPattern: /^http:\/\/.*:\d+\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
              networkTimeoutSeconds: 10,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Google Fonts – cache first
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Leaflet map tiles – stale-while-revalidate
            urlPattern: /^https:\/\/.*tile\.openstreetmap\.org\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'map-tiles-cache',
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    cors: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
  },
});
