import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer id="app-footer" className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-700">Ecommerce Monorepo</span>
          <span>•</span>
          <span>apps/web + apps/api + packages/shared-types</span>
        </div>
        <div className="flex items-center space-x-4 text-slate-500">
          <span>Turborepo</span>
          <span>•</span>
          <span>Express 4.21</span>
          <span>•</span>
          <span>Drizzle ORM</span>
          <span>•</span>
          <span>PostgreSQL 16</span>
          <span>•</span>
          <span>Vite 6</span>
        </div>
      </div>
    </footer>
  );
};
