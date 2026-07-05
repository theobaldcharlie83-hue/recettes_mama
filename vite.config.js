import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg', 'pwa-192x192.png', 'pwa-512x512.png', 'logo_transparent.png', 'data/recipes.json'],
      manifest: {
        name: 'Les recettes de Mama MATTIO',
        short_name: 'Recettes Mama',
        description: 'Le livre de recettes de la famille Mattio, transcrit des cahiers manuscrits de Mama.',
        theme_color: '#EA580C',
        background_color: '#fdfbf7',
        display: 'standalone',
        lang: 'fr',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
