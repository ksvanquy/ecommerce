import React, { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header.tsx';
import { Footer } from '../components/layout/Footer.tsx';
import { PageWrapper } from '../components/layout/PageWrapper.tsx';
import { Card, Button, Badge, Modal } from '@repo/ui';
import {
  AuthView,
  LoginForm,
  RegisterForm,
  useAuthStore,
  useCurrentUser,
} from '../features/auth/index.ts';
import {
  ProductsView,
  ProductDetailView,
} from '../features/products/index.ts';
import { useCategoryTree } from '../features/products/api/useCategories.ts';
import {
  CartView,
  OrderHistoryView,
  CheckoutView,
} from '../features/checkout/index.ts';
import { ProtectedRoute } from './ProtectedRoute.tsx';
import { LogOut, Package, User as UserIcon, Laptop, Smartphone, Cpu, Layers, Grid } from 'lucide-react';

/**
 * Helper to match category slugs with beautiful Lucide icons
 */
function getCategoryIcon(slug: string) {
  const norm = slug.toLowerCase();
  if (norm.includes('laptop') || norm.includes('macbook') || norm.includes('may-tinh')) {
    return <Laptop className="w-4 h-4 shrink-0" />;
  }
  if (norm.includes('phone') || norm.includes('dien-thoai') || norm.includes('iphone') || norm.includes('samsung')) {
    return <Smartphone className="w-4 h-4 shrink-0" />;
  }
  if (norm.includes('linh-kien') || norm.includes('cpu') || norm.includes('vga') || norm.includes('ram')) {
    return <Cpu className="w-4 h-4 shrink-0" />;
  }
  if (norm.includes('phu-kien') || norm.includes('accessories') || norm.includes('chuot') || norm.includes('ban-phim')) {
    return <Layers className="w-4 h-4 shrink-0" />;
  }
  return <Grid className="w-4 h-4 shrink-0" />;
}

/**
 * Main Layout wrapper with Header and Auth Modal (no Sidebar, full width layout)
 */
function MainLayout({
  children,
  activeTab,
  onSelectTab,
}: {
  children: React.ReactNode;
  activeTab: string;
  onSelectTab?: (tab: string) => void;
}) {
  const [authModalState, setAuthModalState] = useState<{ isOpen: boolean; mode: 'login' | 'register' }>({
    isOpen: false,
    mode: 'login',
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { data: categoryTree = [] } = useCategoryTree();

  // Call useCurrentUser so state persists and rehydrates across reloads
  useCurrentUser();

  // Listen to category changes inside ProductsView to highlight subheader categories correctly
  useEffect(() => {
    const handleCategoryChanged = (e: Event) => {
      const customEvent = e as CustomEvent<{ categorySlug: string }>;
      if (customEvent.detail) {
        setSelectedCategory(customEvent.detail.categorySlug || 'all');
      }
    };
    window.addEventListener('techstore:category-changed', handleCategoryChanged);
    return () => {
      window.removeEventListener('techstore:category-changed', handleCategoryChanged);
    };
  }, []);

  const handleSelectCategory = (slug: string) => {
    setSelectedCategory(slug);
    window.dispatchEvent(
      new CustomEvent('techstore:select-category', {
        detail: { categorySlug: slug },
      })
    );
    if (onSelectTab && activeTab !== 'products') {
      onSelectTab('products');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Header
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        onOpenAuthModal={(mode) => setAuthModalState({ isOpen: true, mode })}
      />

      {/* Sub-header horizontal navigation bar for categories */}
      <div className="bg-white sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center gap-1.5 overflow-x-auto py-3 scrollbar-none text-xs">
            {/* All products button */}
            <button
              type="button"
              onClick={() => handleSelectCategory('all')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200/70 text-slate-700 hover:text-slate-900'
              }`}
            >
              <Grid className="w-4 h-4 shrink-0" />
              <span>Tất cả sản phẩm</span>
            </button>

            {categoryTree.map((cat) => {
              const isSelected = selectedCategory === cat.slug || selectedCategory === cat.id || selectedCategory === cat.name;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCategory(cat.slug)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200/70 text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {getCategoryIcon(cat.slug)}
                  <span>{cat.name}</span>
                  {cat.children && cat.children.length > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {cat.children.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 w-full max-w-7xl mx-auto">
        <PageWrapper>
          {children}
        </PageWrapper>
      </div>

      <Footer />

      {/* Auth Modal */}
      <Modal
        isOpen={authModalState.isOpen}
        onClose={() => setAuthModalState((prev) => ({ ...prev, isOpen: false }))}
        title={authModalState.mode === 'login' ? 'Đăng nhập vào Hệ thống' : 'Tạo tài khoản mới'}
      >
        {authModalState.mode === 'login' ? (
          <LoginForm
            onSuccess={() => setAuthModalState((prev) => ({ ...prev, isOpen: false }))}
            onSwitchToRegister={() => setAuthModalState({ isOpen: true, mode: 'register' })}
          />
        ) : (
          <RegisterForm
            onSuccess={() => setAuthModalState({ isOpen: true, mode: 'login' })}
            onSwitchToLogin={() => setAuthModalState({ isOpen: true, mode: 'login' })}
          />
        )}
      </Modal>
    </div>
  );
}

/**
 * Root Home Page with Tab Switcher
 */
function HomePage() {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'cart' | 'auth' | 'checkout'>('products');

  return (
    <MainLayout activeTab={activeTab} onSelectTab={(tab) => setActiveTab(tab as any)}>
      {activeTab === 'products' && <ProductsView />}
      {activeTab === 'orders' && <OrderHistoryView />}
      {activeTab === 'cart' && <CartView />}
      {activeTab === 'auth' && <AuthView />}
      {activeTab === 'checkout' && <CheckoutView onBackToCart={() => setActiveTab('cart')} />}
    </MainLayout>
  );
}

/**
 * Dedicated /login page
 */
function LoginPage() {
  const navigate = useNavigate();
  return (
    <MainLayout activeTab="auth" onSelectTab={(tab) => navigate(`/${tab === 'products' ? '' : tab}`)}>
      <div className="max-w-md mx-auto py-12">
        <Card>
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">Đăng nhập tài khoản</h2>
            <p className="text-xs text-slate-500 mt-1">Truy cập để quản lý tài khoản và đơn hàng của bạn</p>
          </div>
          <LoginForm
            onSuccess={() => navigate('/profile')}
            onSwitchToRegister={() => navigate('/register')}
          />
        </Card>
      </div>
    </MainLayout>
  );
}

/**
 * Dedicated /register page
 */
function RegisterPage() {
  const navigate = useNavigate();
  return (
    <MainLayout activeTab="auth" onSelectTab={(tab) => navigate(`/${tab === 'products' ? '' : tab}`)}>
      <div className="max-w-md mx-auto py-12">
        <Card>
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">Đăng ký tài khoản</h2>
            <p className="text-xs text-slate-500 mt-1">Đăng ký tài khoản để bắt đầu trải nghiệm mua sắm</p>
          </div>
          <RegisterForm
            onSuccess={() => navigate('/login')}
            onSwitchToLogin={() => navigate('/login')}
          />
        </Card>
      </div>
    </MainLayout>
  );
}

/**
 * Dedicated /profile page (Protected by ProtectedRoute)
 */
function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  return (
    <MainLayout activeTab="auth" onSelectTab={(tab) => navigate(`/${tab === 'products' ? '' : tab}`)}>
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="success">Tài khoản Khách hàng</Badge>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Hồ sơ Cá nhân</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            <LogOut className="w-3.5 h-3.5 mr-1" />
            Đăng xuất
          </Button>
        </div>

        <Card>
          <div className="flex items-start gap-4 pb-6 border-b border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-xs">
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{user?.fullName}</h3>
                <Badge variant={user?.role === 'admin' ? 'info' : 'success'}>
                  {user?.role === 'admin' ? 'Quản trị viên (Admin)' : 'Khách hàng (Customer)'}
                </Badge>
              </div>
              <p className="text-sm text-slate-600">{user?.email}</p>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/orders')}
            >
              <Package className="w-4 h-4 mr-1.5" />
              Xem Lịch sử Đơn hàng
            </Button>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}

function ProductsPage() {
  const navigate = useNavigate();
  return (
    <MainLayout activeTab="products" onSelectTab={(tab) => navigate(`/${tab === 'products' ? '' : tab}`)}>
      <ProductsView />
    </MainLayout>
  );
}

function ProductDetailPage() {
  const navigate = useNavigate();
  return (
    <MainLayout activeTab="products" onSelectTab={(tab) => navigate(`/${tab === 'products' ? '' : tab}`)}>
      <ProductDetailView />
    </MainLayout>
  );
}

function CartPage() {
  const navigate = useNavigate();
  return (
    <MainLayout activeTab="cart" onSelectTab={(tab) => navigate(`/${tab === 'products' ? '' : tab}`)}>
      <CartView />
    </MainLayout>
  );
}

function CheckoutPage() {
  const navigate = useNavigate();
  return (
    <MainLayout activeTab="cart" onSelectTab={(tab) => navigate(`/${tab === 'products' ? '' : tab}`)}>
      <CheckoutView onBackToCart={() => navigate('/cart')} />
    </MainLayout>
  );
}

function OrdersPage() {
  const navigate = useNavigate();
  return (
    <MainLayout activeTab="orders" onSelectTab={(tab) => navigate(`/${tab === 'products' ? '' : tab}`)}>
      <OrderHistoryView />
    </MainLayout>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/products',
    element: <ProductsPage />,
  },
  {
    path: '/products/:id',
    element: <ProductDetailPage />,
  },
  {
    path: '/cart',
    element: <CartPage />,
  },
  {
    path: '/checkout',
    element: <CheckoutPage />,
  },
  {
    path: '/orders',
    element: <OrdersPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    element: <ProtectedRoute redirectPath="/login" />,
    children: [
      {
        path: '/profile',
        element: <ProfilePage />,
      },
    ],
  },
  {
    path: '*',
    element: <HomePage />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
