import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [ react() ],
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  },
  server: {
    host: 'localhost',
    port: 5173,
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Resource-Policy": "cross-origin"
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/cdn': {
        target: 'https://unpkg.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cdn/, '')
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      external: (id) => {
        // Exclude RemixIcon from bundling as it's CSS-only
        if (id.includes('remixicon')) {
          return false
        }
        return false
      },
      output: {
        manualChunks: (id) => {
          // Handle RemixIcon separately
          if (id.includes('remixicon')) {
            return 'remixicon'
          }
          
          // Core React libraries
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
            return 'react-vendor'
          }
          
          // UI libraries
          if (id.includes('highlight.js') || id.includes('markdown-to-jsx')) {
            return 'ui-vendor'
          }
          
          // WebContainer
          if (id.includes('@webcontainer')) {
            return 'webcontainer'
          }
          
          // HTTP libraries
          if (id.includes('axios') || id.includes('socket.io')) {
            return 'http-vendor'
          }
          
          // Default to vendor chunk
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    },
    // Optimize for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
