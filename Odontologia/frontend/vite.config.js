import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Proxy /api al backend en desarrollo para evitar problemas de CORS.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
