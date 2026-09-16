import React from 'react';
import { Layers, Database, ShieldCheck, ShoppingCart, Package, HardDrive } from 'lucide-react';
import { Button } from '@repo/ui';

interface SidebarProps {
  activeSection: string;
  onSelectSection: (section: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSelectSection }) => {
  const items = [
    { id: 'overview', label: 'Health & Status', icon: ShieldCheck, badge: 'Phase 0' },
    { id: 'structure', label: 'Monorepo Structure', icon: Layers, badge: '3 pkgs' },
    { id: 'db', label: 'Drizzle & Postgres', icon: Database, badge: 'Docker' },
    { id: 'auth', label: 'Auth Module', icon: ShieldCheck, badge: 'Phase 1' },
    { id: 'products', label: 'Products Module', icon: Package, badge: 'Phase 2' },
    { id: 'cart', label: 'Cart & Orders', icon: ShoppingCart, badge: 'Phase 3-4' },
  ];

  return (
    <aside id="app-sidebar" className="w-64 border-r border-slate-200 bg-white p-4 hidden lg:block shrink-0">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">
        Workspace Navigator
      </div>
      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onSelectSection(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-sm font-mono ${
                  isActive ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {item.badge}
              </span>
            </Button>
          );
        })}
      </nav>

      <div className="mt-8 pt-6 border-t border-slate-200 px-3">
        <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
          <HardDrive className="w-3.5 h-3.5 text-slate-400" />
          <span>Local Stack</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Docker Compose ready for PostgreSQL on port 5432. Apps communicate via standard REST API endpoints.
        </p>
      </div>
    </aside>
  );
};
