import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) return 'vendor-react';
            if (id.includes('react-router')) return 'vendor-router';
            if (id.includes('@headlessui') || id.includes('@heroicons') || id.includes('lucide-react')) return 'vendor-ui';
            if (id.includes('zustand') || id.includes('@tanstack')) return 'vendor-state';
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 700,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
