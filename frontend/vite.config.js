import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // En desarrollo, /api se redirige al backend Express (puerto 3001)
      '/api': 'http://localhost:3001',
    },
  },
})
