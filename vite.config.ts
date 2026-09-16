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
          
          // Redirect /admin (without trailing slash) to /admin/ so that relative resolution works perfectly
          server.middlewares.use((req, res, next) => {
            if (req.url && req.url.split('?')[0] === '/admin') {
              const query = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
              res.writeHead(302, { Location: '/admin/' + query });
              res.end();
              return;
            }
            next();
          });

          // Rewrite rules for /admin/ in development
          server.middlewares.use((req, res, next) => {
            if (req.url) {
              const pathPart = req.url.split('?')[0];
              if (pathPart === '/admin/' || pathPart === '/admin/index.html') {
                req.url = '/apps/admin/index.html' + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '');
              } else if (req.url.startsWith('/admin/')) {
                // Map /admin/src/main.tsx to /apps/admin/src/main.tsx, etc.
                req.url = req.url.replace(/^\/admin\//, '/apps/admin/');
              }
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
