import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'apple-touch-icon.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'data/*.json',
        'images/**/*.png'
      ],
      manifest: {
        name: 'MidtermAce | 期中證照模擬測驗與刷題系統',
        short_name: 'MidtermAce',
        description: '支援 ICTP Python、AIL 人工智慧、EEC 網路行銷、TOEIC 多益核心單字之全功能離線模擬測驗與刷題系統',
        theme_color: '#2563eb',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: './',
        scope: './',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024, // 15MB to cover all images and questions
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.endsWith('.json'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'midterm-ace-data-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 Days
              }
            }
          },
          {
            urlPattern: ({ url }) => url.pathname.includes('/images/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'midterm-ace-images-cache',
              expiration: {
                maxEntries: 300,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 Days
              }
            }
          }
        ]
      }
    })
  ],
  base: './',
  server: {
    port: 3000,
    open: true
  }
})
