import React, { useState, useRef, useEffect } from 'react';
import {
  ShoppingBag,
  User as UserIcon,
  LogOut,
  Package,
  ShoppingCart,
  ChevronDown,
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

  return (
    <header
      id="app-header"
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          id="brand-logo"
          className="flex items-center space-x-3 cursor-pointer group select-none"
          onClick={() => onSelectTab && onSelectTab('products')}
        >
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-200">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
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

        {/* Right Side: Quick Navigation, Prominent Cart & Low-key Auth */}
        <div className="flex items-center space-x-2 sm:space-x-3">
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
            <span>Sản phẩm</span>
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
              <span>Đơn hàng</span>
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
            <span>Giỏ hàng</span>
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
          <div className="relative pl-1 border-l border-slate-200/80" ref={profileMenuRef}>
            {isAuthenticated && user ? (
              <div>
                <Button
                  type="button"
                  id="btn-header-profile-menu"
                  variant="ghost"
                  onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                    isProfileMenuOpen
                      ? 'bg-blue-50 border-blue-300 text-blue-900'
                      : 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                      {user.fullName}
                    </p>
                    <span className="text-[10px] font-medium text-slate-500">Thành viên</span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                      isProfileMenuOpen ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </Button>

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
