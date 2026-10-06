import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          mui: ['@mui/material', '@emotion/react', '@emotion/styled'],
          query: ['@tanstack/react-query'],
          router: ['react-router-dom'],
        },
      },
    },
  },
  server: {
    proxy: {
      '/api/f1': {
        target: 'https://api.jolpi.ca/ergast/f1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/f1/, ''),
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
