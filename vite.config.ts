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
          server.middlewares.use((req, res, next) => {
            if (req.url && (req.url === '/admin' || req.url.startsWith('/admin/'))) {
              req.url = '/apps/admin/index.html';
            }
            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'apps/web/src'),
        '@repo/shared-types': path.resolve(__dirname, 'packages/shared-types/src'),
        '@ecommerce/shared-types': path.resolve(__dirname, 'packages/shared-types/src'),
        '@repo/ui': path.resolve(__dirname, 'packages/ui/src'),
        '@ecommerce/ui': path.resolve(__dirname, 'packages/ui/src'),
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
