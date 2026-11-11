import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'node:fs'
import path from 'node:path'

const APP_VERSION = '2.1.0'
const BUILD_TIME = Date.now()

function versionPlugin() {
  return {
    name: 'generate-version-json',
    buildStart() {
      const versionData = {
        version: APP_VERSION,
        buildTime: BUILD_TIME,
        buildDate: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
        features: [
          '新增物聯網與網路服務管理設備操作題庫',
          '先看題目題號浮動目錄視窗',
          '向下滾動自動收合頂部導覽列',
          '開機與回到網頁自動檢查最新版本'
        ]
      }
      const versionFile = path.resolve(__dirname, 'public/version.json')
      fs.writeFileSync(versionFile, JSON.stringify(versionData, null, 2), 'utf-8')
      console.log(`[VersionPlugin] Generated version.json: v${APP_VERSION} (${new Date(BUILD_TIME).toISOString()})`)
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __APP_BUILD_TIME__: JSON.stringify(BUILD_TIME),
    __APP_VERSION__: JSON.stringify(APP_VERSION)
  },
  plugins: [
    react(),
    versionPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'apple-touch-icon.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'pwa-512x512-maskable.png',
        'data/*.json',
        'images/**/*.{png,jpg,jpeg}'
      ],
      manifest: {
        name: 'MidtermAce | 期中證照模擬測驗與刷題系統',
        short_name: 'MidtermAce',
        description: '支援 資料庫管理、資訊安全概論、網路服務管理、ICTP Python、AIL 人工智慧、EEC 網路行銷、TOEIC 多益核心單字之全功能離線模擬測驗與刷題系統',
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
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,json}'],
        globIgnores: ['**/version.json'],
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024, // 15MB to cover all images and questions
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.endsWith('version.json'),
            handler: 'NetworkOnly'
          },
          {
            urlPattern: ({ url }) => url.pathname.endsWith('.json'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'midterm-ace-data-cache',
              networkTimeoutSeconds: 3,
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
