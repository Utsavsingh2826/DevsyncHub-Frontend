import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Simplified Vite config that should work with RemixIcon
export default defineConfig({
  plugins: [react()],
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
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['highlight.js', 'markdown-to-jsx'],
          'webcontainer': ['@webcontainer/api'],
          'http-vendor': ['axios', 'socket.io-client']
        }
      }
    }
  }
})

