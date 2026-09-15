import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import app from './apps/api/src/index.ts';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'api-server-middleware',
        configureServer(server) {
          server.middlewares.use(app);
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'apps/web/src'),
        '@repo/shared-types': path.resolve(__dirname, 'packages/shared-types/src'),
        '@apps/api': path.resolve(__dirname, 'apps/api/src'),
        '@apps/web': path.resolve(__dirname, 'apps/web/src'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
