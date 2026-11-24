import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') && (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router') || id.includes('\\react\\') || id.includes('\\react-dom\\') || id.includes('\\react-router'))) {
              return 'vendor-react';
            }
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-vendor')) {
              return 'vendor-charts';
            }
            if (id.includes('leaflet')) {
              return 'vendor-map';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
          }
        }
      }
    }
  },
  server: {
    watch: {
      ignored: [
        '**/data/**',
        '**/backend/**',
        '**/.venv/**',
        '**/dist/**',
        '**/*.md',
        '**/.pytest_cache/**'
      ]
    }
  }
})
