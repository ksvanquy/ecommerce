import React, { useState, useRef, useEffect } from 'react';
import { Plus, Search, Store, LogOut, Package, ShoppingBag, CreditCard, Tag, X, UserCheck, Sparkles, FolderPlus } from 'lucide-react';
import { User, Product, Order, PaymentTransaction } from '@repo/shared-types';
import { AdminTab } from '../types.ts';

interface GlobalTopbarProps {
  adminUser: User;
  onLogout: () => void;
  onNavigate: (tab: AdminTab) => void;
  products: Product[];
  orders: Order[];
  transactions: PaymentTransaction[];
  onOpenCreateProduct?: () => void;
}

export default function GlobalTopbar({
  adminUser,
  onLogout,
  onNavigate,
  products,
  orders,
  transactions,
  onOpenCreateProduct,
}: GlobalTopbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const quickMenuRef = useRef<HTMLDivElement>(null);

  // Close quick menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (quickMenuRef.current && !quickMenuRef.current.contains(e.target as Node)) {
        setIsQuickMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter search results
  const q = searchQuery.toLowerCase().trim();
  const matchedProducts = q
    ? products.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)).slice(0, 4)
    : [];
  const matchedOrders = q
    ? orders.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q)
      ).slice(0, 4)
    : [];
  const matchedTransactions = q
    ? transactions.filter((t) => t.transactionCode.toLowerCase().includes(q)).slice(0, 3)
    : [];

  const hasResults = matchedProducts.length > 0 || matchedOrders.length > 0 || matchedTransactions.length > 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <header className="bg-white border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between gap-4 sticky top-0 z-30 font-sans shadow-2xs">
      {/* Search Bar */}
      <div className="relative flex-1 max-w-md">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Tìm kiếm mã đơn hàng, sản phẩm, SĐT khách..."
            className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 font-medium transition shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Global Search Results Dropdown */}
        {isSearchOpen && searchQuery.trim() !== '' && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden z-50 max-h-[420px] overflow-y-auto">
            {!hasResults ? (
              <div className="p-6 text-center text-xs text-slate-500 font-medium">
                Không tìm thấy dữ liệu nào khớp với "{searchQuery}"
              </div>
            ) : (
              <div className="p-2 space-y-3">
                {/* Orders */}
                {matchedOrders.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                      <span>Đơn hàng ({matchedOrders.length})</span>
                    </div>
                    <div className="space-y-1 mt-1">
                      {matchedOrders.map((o) => (
                        <div
                          key={o.id}
                          onClick={() => {
                            onNavigate('orders');
                            setIsSearchOpen(false);
                          }}
                          className="p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer flex justify-between items-center text-xs transition border border-transparent hover:border-slate-200"
                        >
                          <div>
                            <p className="font-bold text-slate-900">{o.customerName}</p>
                            <p className="text-[10px] text-slate-500 font-medium">Mã: {o.id.substring(0, 10).toUpperCase()} • {o.customerPhone}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-extrabold text-blue-600">{formatCurrency(o.totalAmount)}</p>
                            <span className="text-[9px] uppercase font-bold text-slate-500">{o.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Products */}
                {matchedProducts.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-blue-600" />
                      <span>Sản phẩm ({matchedProducts.length})</span>
                    </div>
                    <div className="space-y-1 mt-1">
                      {matchedProducts.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            onNavigate('products');
                            setIsSearchOpen(false);
                          }}
                          className="p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer flex justify-between items-center text-xs transition border border-transparent hover:border-slate-200"
                        >
                          <div>
                            <p className="font-bold text-slate-900">{p.name}</p>
                            <p className="text-[10px] text-slate-500 font-medium">{p.category} • Tồn kho: {p.inventory}</p>
                          </div>
                          <span className="font-extrabold text-slate-900">{formatCurrency(p.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transactions */}
                {matchedTransactions.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                      <span>Giao dịch VietQR ({matchedTransactions.length})</span>
                    </div>
                    <div className="space-y-1 mt-1">
                      {matchedTransactions.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => {
                            onNavigate('orders');
                            setIsSearchOpen(false);
                          }}
                          className="p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer flex justify-between items-center text-xs transition border border-transparent hover:border-slate-200"
                        >
                          <div>
                            <p className="font-mono font-bold text-blue-600">{t.transactionCode}</p>
                            <p className="text-[10px] text-slate-500 font-medium">Cổng: {t.provider}</p>
                          </div>
                          <span className="font-extrabold text-slate-900">{formatCurrency(t.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Actions Block */}
      <div className="flex items-center gap-3">
        {/* Quick Create Dropdown Button */}
        <div className="relative" ref={quickMenuRef}>
          <button
            onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer border-none"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Thêm mới</span>
          </button>

          {isQuickMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 shadow-xl rounded-2xl py-1.5 z-50 text-xs font-medium space-y-0.5">
              <button
                onClick={() => {
                  setIsQuickMenuOpen(false);
                  onNavigate('products');
                  if (onOpenCreateProduct) onOpenCreateProduct();
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-2.5 cursor-pointer"
              >
                <Package className="w-4 h-4 text-blue-600" />
                <span>+ Thêm Sản phẩm</span>
              </button>
              <button
                onClick={() => {
                  setIsQuickMenuOpen(false);
                  onNavigate('products');
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-2.5 cursor-pointer"
              >
                <FolderPlus className="w-4 h-4 text-indigo-600" />
                <span>+ Thêm Danh mục</span>
              </button>
              <button
                onClick={() => {
                  setIsQuickMenuOpen(false);
                  alert('Chức năng Tạo mã giảm giá nhanh đang phát triển.');
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-2.5 cursor-pointer"
              >
                <Tag className="w-4 h-4 text-amber-600" />
                <span>+ Tạo Mã giảm giá</span>
              </button>
            </div>
          )}
        </div>

        {/* Storefront Quick Link */}
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition border border-slate-200/80"
          title="Mở giao diện mua sắm của khách hàng"
        >
          <Store className="w-3.5 h-3.5 text-slate-600" />
          <span>Trang bán hàng</span>
        </a>

        {/* User Info & Admin Badge */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="h-8 w-8 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-extrabold text-xs shrink-0">
            {adminUser.fullName ? adminUser.fullName.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="hidden lg:block">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 leading-none">{adminUser.fullName}</span>
              <span className="text-[9px] uppercase font-extrabold bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded border border-blue-200">
                Admin
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">{adminUser.email}</p>
          </div>
          <button
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
            title="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
