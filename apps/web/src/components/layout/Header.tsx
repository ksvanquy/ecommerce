import React, { useState, useRef, useEffect } from 'react';
import {
  ShoppingBag,
  User as UserIcon,
  LogOut,
  Package,
  ShoppingCart,
  ChevronDown,
  Laptop,
  Headphones,
  Watch,
  Keyboard,
  Monitor,
  Smartphone,
  Radio,
  Mouse,
  Folder,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '../../features/auth/store/authStore.ts';
import { useCartStore } from '../../features/checkout/store/cartStore.ts';
import { useCategoryTree } from '../../features/products/api/useCategories.ts';
import { Button } from '../ui/Button.tsx';

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
  const setCartOpen = useCartStore((state) => state.setOpen);

  const { data: categoryTree = [] } = useCategoryTree();
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const megaMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Set default active parent category when data loads
  useEffect(() => {
    if (categoryTree.length > 0 && !selectedParentId) {
      setSelectedParentId(categoryTree[0].id);
    }
  }, [categoryTree, selectedParentId]);

  // Handle click outside to close popovers
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) {
        setIsMegaMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderCategoryIcon = (iconName?: string, className = 'w-4 h-4') => {
    switch (iconName) {
      case 'laptop':
        return <Laptop className={className} />;
      case 'headphones':
        return <Headphones className={className} />;
      case 'watch':
        return <Watch className={className} />;
      case 'keyboard':
        return <Keyboard className={className} />;
      case 'mouse':
        return <Mouse className={className} />;
      case 'monitor':
        return <Monitor className={className} />;
      case 'smartphone':
        return <Smartphone className={className} />;
      case 'radio':
        return <Radio className={className} />;
      default:
        return <Folder className={className} />;
    }
  };

  const handleSelectCategory = (slugOrId: string) => {
    setIsMegaMenuOpen(false);
    if (onSelectTab) {
      onSelectTab('products');
    }
    // Dispatch custom event so ProductFiltersBar updates seamlessly
    window.dispatchEvent(
      new CustomEvent('techstore:select-category', { detail: { categorySlug: slugOrId } })
    );
  };

  const activeParentCategory =
    categoryTree.find((c) => c.id === selectedParentId) || categoryTree[0];

  return (
    <header
      id="app-header"
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left Side: Brand Logo & Mega Menu Trigger */}
        <div className="flex items-center space-x-3 sm:space-x-6">
          {/* Logo */}
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
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Hệ sinh thái công nghệ &amp; linh kiện
              </p>
            </div>
          </div>

          {/* Mega Menu Trigger Button */}
          <div className="relative" ref={megaMenuRef}>
            <button
              type="button"
              id="btn-header-mega-menu"
              onClick={() => setIsMegaMenuOpen((prev) => !prev)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                isMegaMenuOpen
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20'
                  : 'bg-slate-100/90 text-slate-800 hover:bg-slate-200/80 border-slate-200/80 hover:text-blue-600'
              }`}
            >
              <Layers className={`w-4 h-4 ${isMegaMenuOpen ? 'text-white' : 'text-blue-600'}`} />
              <span className="tracking-tight">Danh mục Sản phẩm</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isMegaMenuOpen ? 'rotate-180 text-white' : 'text-slate-400'
                }`}
              />
            </button>

            {/* FULL MAX-WIDTH EXTENDED MEGA MENU POPOVER */}
            {isMegaMenuOpen && (
              <div
                id="mega-menu-dropdown-extended"
                className="fixed sm:absolute top-16 sm:top-full left-0 sm:-left-6 w-screen sm:w-[860px] lg:w-[980px] bg-white border-y sm:border border-slate-200 sm:rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
              >
                {/* Mega Menu Top Header Bar */}
                <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white px-6 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1 rounded-lg bg-blue-500/20 border border-blue-400/30">
                      <Sparkles className="w-4 h-4 text-blue-300" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold tracking-tight text-white">
                        Trung tâm Khám phá Danh mục Sản phẩm Toàn diện
                      </h3>
                      <p className="text-[11px] text-slate-300 hidden sm:block">
                        Khám phá tất cả các danh mục gốc và phân cấp danh mục con chính hãng
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMegaMenuOpen(false);
                      if (onSelectTab) onSelectTab('products');
                    }}
                    className="text-xs font-semibold text-blue-300 hover:text-white flex items-center gap-1 transition"
                  >
                    <span>Xem tất cả sản phẩm</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Mega Menu Body: 2-Column Split View (Parent Categories Left, Child Grid Right) */}
                <div className="grid grid-cols-1 sm:grid-cols-12 max-h-[75vh] sm:max-h-[480px] overflow-y-auto">
                  {/* Left Column: Root Categories List (4 Cols) */}
                  <div className="sm:col-span-4 bg-slate-50/90 border-r border-slate-200/80 p-3 space-y-1">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Ngành hàng Chính ({categoryTree.length})
                    </div>
                    {categoryTree.map((root) => {
                      const isHoveredOrActive = activeParentCategory?.id === root.id;
                      return (
                        <div
                          key={root.id}
                          onMouseEnter={() => setSelectedParentId(root.id)}
                          onClick={() => {
                            setSelectedParentId(root.id);
                            if (window.innerWidth < 640) {
                              handleSelectCategory(root.slug);
                            }
                          }}
                          className={`w-full p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between group ${
                            isHoveredOrActive
                              ? 'bg-blue-600 text-white shadow-xs font-semibold'
                              : 'text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                                isHoveredOrActive
                                  ? 'bg-white/15 border-white/20 text-white'
                                  : 'bg-white border-slate-200 text-slate-600 group-hover:text-blue-600'
                              }`}
                            >
                              {renderCategoryIcon(root.icon, 'w-4 h-4')}
                            </div>
                            <span className="text-xs truncate">{root.name}</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {root.children && root.children.length > 0 && (
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                                  isHoveredOrActive
                                    ? 'bg-white/20 text-white'
                                    : 'bg-slate-200/80 text-slate-500'
                                }`}
                              >
                                {root.children.length}
                              </span>
                            )}
                            <ChevronDown
                              className={`w-3.5 h-3.5 -rotate-90 transition-transform ${
                                isHoveredOrActive ? 'text-white translate-x-0.5' : 'text-slate-400'
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right Column: Subcategories & Showcase Grid (8 Cols) */}
                  <div className="sm:col-span-8 p-5 bg-white space-y-5 overflow-y-auto">
                    {activeParentCategory ? (
                      <>
                        {/* Active Parent Header & Quick Action */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                              {renderCategoryIcon(activeParentCategory.icon, 'w-4 h-4')}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">
                                {activeParentCategory.name}
                              </h4>
                              {activeParentCategory.description && (
                                <p className="text-xs text-slate-500">
                                  {activeParentCategory.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSelectCategory(activeParentCategory.slug)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition shrink-0"
                          >
                            <span>Xem tất cả {activeParentCategory.name}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Subcategories Bento Cards Grid */}
                        <div>
                          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                            Danh mục con chuyên sâu
                          </div>
                          {activeParentCategory.children &&
                          activeParentCategory.children.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {activeParentCategory.children.map((sub) => (
                                <div
                                  key={sub.id}
                                  onClick={() => handleSelectCategory(sub.slug)}
                                  className="p-3 rounded-xl border border-slate-200/80 hover:border-blue-300 bg-slate-50/50 hover:bg-blue-50/40 cursor-pointer transition-all flex items-start gap-3 group"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 group-hover:border-blue-300 group-hover:scale-105 transition">
                                    {renderCategoryIcon(sub.icon, 'w-4 h-4 text-blue-600')}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h5 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 truncate">
                                      {sub.name}
                                    </h5>
                                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                      {sub.description || `Khám phá các sản phẩm ${sub.name}`}
                                    </p>
                                  </div>
                                  <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-slate-300 group-hover:text-blue-600 transition shrink-0 mt-1" />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl text-center">
                              <p className="text-xs text-slate-500">
                                Chưa có danh mục con nào. Toàn bộ sản phẩm được phân loại trực tiếp dưới{' '}
                                <strong>{activeParentCategory.name}</strong>.
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSelectCategory(activeParentCategory.slug)}
                                className="mt-3 text-xs"
                              >
                                Xem danh sách sản phẩm &rarr;
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Mega Menu Footer Promo Banner inside */}
                        <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-200/60 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                            <span className="text-xs text-slate-700 font-medium">
                              Cam kết 100% hàng chính hãng, bảo hành 1 đổi 1 trong 30 ngày.
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded-md border border-blue-200 shrink-0">
                            Freeship 0đ
                          </span>
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Quick Mini-Cart & Clean Profile Dropdown Menu */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Mini-Cart Icon Trigger Button */}
          <button
            id="btn-header-cart"
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative p-2.5 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition border border-transparent hover:border-blue-100"
            title="Mở Giỏ hàng nhanh"
            aria-label="Giỏ hàng"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalCartItems > 0 && (
              <span
                id="header-cart-badge"
                className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs animate-in zoom-in"
              >
                {totalCartItems > 99 ? '99+' : totalCartItems}
              </span>
            )}
          </button>

          {/* Clean User Profile Dropdown Menu */}
          <div className="relative" ref={profileMenuRef}>
            {isAuthenticated && user ? (
              <div>
                <button
                  type="button"
                  id="btn-header-profile-menu"
                  onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border transition ${
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
                    <span className="text-[10px] font-medium text-slate-500 capitalize">
                      {user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                      isProfileMenuOpen ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>

                {/* Profile Popup Menu containing Sản phẩm, Đơn hàng, Giỏ hàng, Tài khoản */}
                {isProfileMenuOpen && (
                  <div
                    id="profile-dropdown-menu"
                    className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    {/* User Header Summary */}
                    <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.fullName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                        {user.role === 'admin' ? '🛡️ Quản trị viên (Admin)' : '⭐ Thành viên TechStore'}
                      </span>
                    </div>

                    {/* Consolidated Menu Items */}
                    <div className="space-y-0.5">
                      {/* Products Browse Link */}
                      <button
                        type="button"
                        id="profile-menu-products"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          if (onSelectTab) onSelectTab('products');
                        }}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                          activeTab === 'products'
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-blue-600" />
                          <span>Tất cả Sản phẩm</span>
                        </div>
                        <span className="text-[10px] text-slate-400">Khám phá</span>
                      </button>

                      {/* Orders History Link */}
                      <button
                        type="button"
                        id="profile-menu-orders"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          if (onSelectTab) onSelectTab('orders');
                        }}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                          activeTab === 'orders'
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-indigo-600" />
                          <span>Đơn hàng của tôi</span>
                        </div>
                        <span className="text-[10px] text-slate-400">Theo dõi</span>
                      </button>

                      {/* Cart Full Page Link */}
                      <button
                        type="button"
                        id="profile-menu-cart"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          if (onSelectTab) onSelectTab('cart');
                        }}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                          activeTab === 'cart'
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4 text-amber-600" />
                          <span>Giỏ hàng chi tiết</span>
                        </div>
                        {totalCartItems > 0 ? (
                          <span className="px-1.5 py-0.2 bg-blue-600 text-white rounded-full text-[10px] font-bold">
                            {totalCartItems}
                          </span>
                        ) : null}
                      </button>

                      {/* Profile & Account Settings Link */}
                      <button
                        type="button"
                        id="profile-menu-account"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          if (onSelectTab) onSelectTab('auth');
                        }}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                          activeTab === 'auth'
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-emerald-600" />
                          <span>Tài khoản &amp; Bảo mật</span>
                        </div>
                        {user.role === 'admin' && (
                          <span className="text-[10px] text-blue-600 font-bold">Admin</span>
                        )}
                      </button>
                    </div>

                    {/* Logout Button */}
                    <div className="pt-2 mt-1 border-t border-slate-100">
                      <button
                        type="button"
                        id="btn-header-logout-dropdown"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          logout();
                        }}
                        className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Đăng xuất tài khoản</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Guest State Buttons / Menu */
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  id="btn-header-guest-menu"
                  onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                  className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <UserIcon className="w-4 h-4 text-slate-600" />
                  <span className="hidden sm:inline">Tài khoản</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Guest Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-3 bg-slate-50 rounded-xl mb-2 text-center border border-slate-100">
                      <p className="text-xs font-bold text-slate-900">Chào mừng bạn đến TechStore</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Đăng nhập để xem giỏ hàng và theo dõi đơn hàng
                      </p>
                      <div className="mt-2.5 flex items-center gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            if (onOpenAuthModal) onOpenAuthModal('login');
                          }}
                        >
                          Đăng nhập
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            if (onOpenAuthModal) onOpenAuthModal('register');
                          }}
                        >
                          Đăng ký
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          if (onSelectTab) onSelectTab('products');
                        }}
                        className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition"
                      >
                        <ShoppingBag className="w-4 h-4 text-blue-600" />
                        <span>Khám phá Sản phẩm</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          if (onSelectTab) onSelectTab('cart');
                        }}
                        className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center justify-between transition"
                      >
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4 text-amber-600" />
                          <span>Giỏ hàng</span>
                        </div>
                        {totalCartItems > 0 && (
                          <span className="px-1.5 py-0.2 bg-blue-600 text-white rounded-full text-[10px] font-bold">
                            {totalCartItems}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
