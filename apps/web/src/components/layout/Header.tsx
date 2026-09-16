import React, { useState, useRef, useEffect } from 'react';
import {
  ShoppingBag,
  User as UserIcon,
  LogOut,
  Package,
  ShoppingCart,
  ChevronDown,
  Search,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../features/auth/store/authStore.ts';
import { useCartStore } from '../../features/checkout/store/cartStore.ts';
import { Button } from '@repo/ui';

interface HeaderProps {
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  onOpenAuthModal?: (mode: 'login' | 'register') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab = 'products',
  onSelectTab,
  onOpenAuthModal,
}) => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const totalCartItems = useCartStore((state) => state.totalItems());

  const handleOpenCart = () => {
    if (onSelectTab) {
      onSelectTab('cart');
    }
  };

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync search input if cleared/changed from outside (e.g. products view clear filters)
  useEffect(() => {
    const handleSearchSync = (e: Event) => {
      const customEvent = e as CustomEvent<{ searchTerm: string }>;
      if (customEvent.detail) {
        setSearchVal(customEvent.detail.searchTerm || '');
      }
    };
    window.addEventListener('techstore:search-sync', handleSearchSync);
    return () => {
      window.removeEventListener('techstore:search-sync', handleSearchSync);
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchVal(value);
    window.dispatchEvent(
      new CustomEvent('techstore:search-changed', {
        detail: { searchTerm: value },
      })
    );
    // Automatically switch to products tab when searching
    if (onSelectTab && activeTab !== 'products') {
      onSelectTab('products');
    }
  };

  const handleClearSearch = () => {
    setSearchVal('');
    window.dispatchEvent(
      new CustomEvent('techstore:search-changed', {
        detail: { searchTerm: '' },
      })
    );
  };

  return (
    <header
      id="app-header"
      className="sticky top-0 z-40 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          id="brand-logo"
          className="flex items-center space-x-3 cursor-pointer group select-none shrink-0"
          onClick={() => onSelectTab && onSelectTab('products')}
        >
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white transition-colors duration-200">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 tracking-tight text-lg">TechStore</span>
              <span className="text-[10px] uppercase font-extrabold tracking-wider bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md hidden sm:inline-block">
                STORE
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Hệ thống bán lẻ thiết bị &amp; phụ kiện công nghệ
            </p>
          </div>
        </div>

        {/* Central Search Box */}
        <div className="flex-1 max-w-sm sm:max-w-md relative mx-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchVal}
            onChange={handleSearchChange}
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full pl-9 pr-8 py-2 bg-slate-100 hover:bg-slate-200/40 focus:bg-white border border-slate-200/50 focus:border-blue-500 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition duration-150"
          />
          {searchVal && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Side: Quick Navigation, Prominent Cart & Low-key Auth */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Quick link: Products */}
          <Button
            type="button"
            id="btn-header-products"
            variant="tab"
            size="sm"
            isActive={activeTab === 'products'}
            onClick={() => onSelectTab && onSelectTab('products')}
            className={activeTab === 'products' ? 'shadow-blue-200' : ''}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden lg:inline">Sản phẩm</span>
          </Button>

          {/* Quick link: Orders (if authenticated) */}
          {isAuthenticated && (
            <Button
              type="button"
              variant="tab"
              size="sm"
              isActive={activeTab === 'orders'}
              onClick={() => onSelectTab && onSelectTab('orders')}
              className={`hidden sm:inline-flex ${activeTab === 'orders' ? 'shadow-blue-200' : ''}`}
            >
              <Package className="w-4 h-4" />
              <span className="hidden lg:inline">Đơn hàng</span>
            </Button>
          )}

          {/* Cart Header Button */}
          <Button
            id="btn-header-cart"
            type="button"
            variant="tab"
            size="sm"
            isActive={activeTab === 'cart'}
            onClick={handleOpenCart}
            className={activeTab === 'cart' ? 'shadow-blue-200' : ''}
            title="Xem Giỏ hàng chi tiết"
            aria-label="Giỏ hàng"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden lg:inline">Giỏ hàng</span>
            {totalCartItems > 0 && (
              <span
                id="header-cart-badge"
                className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center justify-center leading-none shadow-2xs ${
                  activeTab === 'cart'
                    ? 'bg-white text-blue-700'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {totalCartItems > 99 ? '99+' : totalCartItems}
              </span>
            )}
          </Button>

          {/* User Account Menu OR Low-key De-emphasized Guest Auth Links */}
          <div className="relative" ref={profileMenuRef}>
            {isAuthenticated && user ? (
              <div>
                <button
                  type="button"
                  id="btn-header-profile-menu"
                  onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                  className={`flex items-center justify-center w-9 h-9 rounded-full border transition cursor-pointer shrink-0 focus:outline-none ${
                    isProfileMenuOpen
                      ? 'bg-blue-50 border-blue-500 text-blue-900'
                      : 'bg-slate-100 hover:bg-slate-200/80 border-slate-200/80 text-slate-850'
                  }`}
                  title="Menu tài khoản"
                >
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face"
                    alt="Avatar"
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full object-cover shrink-0"
                  />
                </button>

                {/* Profile Popup Menu */}
                {isProfileMenuOpen && (
                  <div
                    id="profile-dropdown-menu"
                    className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.fullName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                        ⭐ Khách hàng thân thiết
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <Button
                        type="button"
                        id="profile-menu-products"
                        variant="ghost"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          if (onSelectTab) onSelectTab('products');
                        }}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                          activeTab === 'products'
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-blue-600" />
                          <span>Tất cả Sản phẩm</span>
                        </div>
                      </Button>

                      <Button
                        type="button"
                        id="profile-menu-orders"
                        variant="ghost"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          if (onSelectTab) onSelectTab('orders');
                        }}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                          activeTab === 'orders'
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-indigo-600" />
                          <span>Đơn hàng của tôi</span>
                        </div>
                      </Button>

                      <Button
                        type="button"
                        id="profile-menu-cart"
                        variant="ghost"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          if (onSelectTab) onSelectTab('cart');
                        }}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                          activeTab === 'cart'
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4 text-amber-600" />
                          <span>Giỏ hàng chi tiết</span>
                        </div>
                        {totalCartItems > 0 && (
                          <span className="px-1.5 py-0.2 bg-blue-600 text-white rounded-full text-[10px] font-bold">
                            {totalCartItems}
                          </span>
                        )}
                      </Button>

                      <Button
                        type="button"
                        id="profile-menu-account"
                        variant="ghost"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          if (onSelectTab) onSelectTab('auth');
                        }}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                          activeTab === 'auth'
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-emerald-600" />
                          <span>Thông tin tài khoản</span>
                        </div>
                      </Button>
                    </div>

                    <div className="pt-2 mt-1 border-t border-slate-100">
                      <Button
                        type="button"
                        id="btn-header-logout-dropdown"
                        variant="ghost"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          logout();
                        }}
                        className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Đăng xuất tài khoản</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Guest State: De-emphasized simple lowercase text links */
              <div className="flex items-center space-x-1 text-xs text-slate-500 font-normal pl-1">
                <Button
                  type="button"
                  id="btn-header-login"
                  variant="ghost"
                  onClick={() => onOpenAuthModal && onOpenAuthModal('login')}
                  className="hover:text-slate-900 transition px-1.5 py-1 cursor-pointer hover:underline text-slate-600 text-xs font-normal"
                >
                  đăng nhập
                </Button>
                <span className="text-slate-300 select-none">/</span>
                <Button
                  type="button"
                  id="btn-header-register"
                  variant="ghost"
                  onClick={() => onOpenAuthModal && onOpenAuthModal('register')}
                  className="hover:text-slate-900 transition px-1.5 py-1 cursor-pointer hover:underline text-slate-600 text-xs font-normal"
                >
                  đăng ký
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
