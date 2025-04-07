import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import commonjs from '@rollup/plugin-commonjs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    commonjs({
      transformMixedEsModules: true,
      include: [
        'src/services/audioService.js',
        'src/services/soundEffectsService.js'
      ],
      ignore: ['web-audio-api']
    })
  ],
  
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
      
      // Configuration pour les modules audio
      output: {
        format: 'cjs',
        exports: 'named',
        manualChunks: {
          'audio-utils': [
            'src/services/audioService.js',
            'src/services/soundEffectsService.js'
          ]
        },
        // Préserver les noms des exports
        preserveModules: true,
        preserveModulesRoot: 'src'
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
    chunkSizeWarningLimit: 1000,
    
    // Options CommonJS
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/, /src\/services/]
    }
  }
})
