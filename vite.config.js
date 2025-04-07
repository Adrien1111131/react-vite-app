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
      // Options de parsing plus permissives
      acorn: {
        allowReserved: true,
        ecmaVersion: 2022
      },
      
      // Optimisations pour les modules audio
      output: {
        manualChunks: {
          'audio-utils': [
            'src/services/audioService.js',
            'src/services/soundEffectsService.js'
          ]
        }
      },
      
      // Gérer les modules problématiques
      external: [
        'web-audio-api',
        'audio-buffer',
        'audio-buffer-utils'
      ]
    },
    
    // Optimisations générales
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true,
    
    // Gestion des assets
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1000
  }
})
