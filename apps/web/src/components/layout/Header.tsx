import React from 'react';
import { ShoppingBag, Server, User as UserIcon, LogOut, Shield, LogIn } from 'lucide-react';
import { useAuthStore } from '../../features/auth/store/authStore.ts';
import { useCartStore } from '../../features/checkout/store/cartStore.ts';
import { Button } from '../ui/Button.tsx';

interface HeaderProps {
  apiStatus?: 'ok' | 'degraded' | 'error' | 'loading';
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  onOpenAuthModal?: (mode: 'login' | 'register') => void;
}

export const Header: React.FC<HeaderProps> = ({
  apiStatus = 'loading',
  activeTab = 'products',
  onSelectTab,
  onOpenAuthModal,
}) => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const totalCartItems = useCartStore((state) => state.totalItems());
  const setCartOpen = useCartStore((state) => state.setOpen);

  return (
    <header id="app-header" className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-900 tracking-tight text-base">Ecommerce</span>
                <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-blue-200">
                  Phase 3: Cart
                </span>
              </div>
              <p className="text-xs text-slate-500">Zustand Client State • LocalStorage • Orders Ready</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        {onSelectTab && (
          <nav className="hidden md:flex items-center space-x-1">
            <button
              id="tab-nav-products"
              onClick={() => onSelectTab('products')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'products'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Sản phẩm (G2)
            </button>
            <button
              id="tab-nav-cart"
              onClick={() => onSelectTab('cart')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'cart'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>Giỏ hàng (G3)</span>
              {totalCartItems > 0 && (
                <span className="px-1.5 py-0.2 bg-blue-600 text-white rounded-full text-[10px] font-bold">
                  {totalCartItems}
                </span>
              )}
            </button>
            <button
              id="tab-nav-auth"
              onClick={() => onSelectTab('auth')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'auth'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Auth &amp; Users (G1)
            </button>
            <button
              id="tab-nav-overview"
              onClick={() => onSelectTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Hạ tầng (G0)
            </button>
            <button
              id="tab-nav-architecture"
              onClick={() => onSelectTab('architecture')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'architecture'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Cấu trúc Monorepo
            </button>
            <button
              id="tab-nav-roadmap"
              onClick={() => onSelectTab('roadmap')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'roadmap'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Lộ trình 5 Giai đoạn
            </button>
          </nav>
        )}

        {/* Backend status, Mini-Cart trigger & Auth Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs">
            <Server className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500 text-[11px]">API:</span>
            {apiStatus === 'ok' && (
              <span className="flex items-center space-x-1 text-emerald-700 font-semibold text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Online</span>
              </span>
            )}
            {apiStatus === 'degraded' && (
              <span className="flex items-center space-x-1 text-amber-700 font-semibold text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>Active (Memory)</span>
              </span>
            )}
            {apiStatus === 'error' && (
              <span className="flex items-center space-x-1 text-rose-700 font-semibold text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span>Offline</span>
              </span>
            )}
          </div>

          {/* Mini-Cart Icon Trigger */}
          <button
            id="btn-header-cart"
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
            title="Xem Giỏ hàng (Mini-Cart)"
            aria-label="Giỏ hàng"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalCartItems > 0 && (
              <span
                id="header-cart-badge"
                className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs animate-in zoom-in"
              >
                {totalCartItems > 99 ? '99+' : totalCartItems}
              </span>
            )}
          </button>


          {isAuthenticated && user ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[120px]">
                    {user.fullName}
                  </p>
                  <span className="text-[10px] font-mono text-slate-500 capitalize">
                    {user.role}
                  </span>
                </div>
              </div>
              <button
                id="btn-header-logout"
                onClick={logout}
                title="Đăng xuất"
                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              {onOpenAuthModal && (
                <>
                  <Button
                    id="btn-header-login"
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenAuthModal('login')}
                  >
                    <LogIn className="w-3.5 h-3.5 mr-1" />
                    Đăng nhập
                  </Button>
                  <Button
                    id="btn-header-register"
                    variant="primary"
                    size="sm"
                    onClick={() => onOpenAuthModal('register')}
                  >
                    Đăng ký
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
