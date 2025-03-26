import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/mfs-project/', // Base URL pour GitHub Pages
  server: {
    hmr: {
      overlay: false
    }
  }
})
