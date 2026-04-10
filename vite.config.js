import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.png'],
      manifest: {
        name: 'Tea Tracker',
        short_name: 'TeaTracker',
        description: 'Offline Tea and Snack Expense Tracker',
        theme_color: '#f8fafc',
        icons: [
          {
            src: 'favicon.png',
            sizes: '192x192 512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  base: '/TeaCoffee/',
  server: {
    port: 5173,
    open: true,
  },
})
