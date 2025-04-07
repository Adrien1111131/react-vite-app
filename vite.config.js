import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  base: './', // Base URL pour Vercel
  
  // Configuration du serveur de développement
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
  },
  
  // Configuration de build optimisée
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'audio': ['src/services/audioService.js']
        }
      }
    },
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true,
    
    // Optimisations pour les modules ES
    modulePreload: {
      polyfill: true
    },
    
    // Gestion des assets
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1000
  }
})
