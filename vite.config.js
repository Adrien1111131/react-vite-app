import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Base URL pour Vercel
  server: {
    hmr: {
      overlay: false
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5190',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
