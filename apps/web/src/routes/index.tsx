import React, { useState } from 'react';
import { createBrowserRouter, RouterProvider, Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../lib/axios.ts';
import type { HealthResponse } from '@repo/shared-types';
import { Header } from '../components/layout/Header.tsx';
import { Footer } from '../components/layout/Footer.tsx';
import { Sidebar } from '../components/layout/Sidebar.tsx';
import { PageWrapper } from '../components/layout/PageWrapper.tsx';
import { Card } from '../components/ui/Card.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Badge } from '../components/ui/Badge.tsx';
import { Modal } from '../components/ui/Modal.tsx';
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
import {
  CartView,
  CartDrawer,
} from '../features/checkout/index.ts';
import { ProtectedRoute } from './ProtectedRoute.tsx';
import {
  Server,
  Database,
  Activity,
  CheckCircle2,
  RefreshCw,
  FolderTree,
  ShieldCheck,
  Cpu,
  User,
  Shield,
  KeyRound,
  ArrowRight,
  LogOut,
} from 'lucide-react';

/**
 * Main Layout wrapper with Header, Sidebar, and Auth Modal
 */
function MainLayout({ children, activeTab, onSelectTab }: {
  children: React.ReactNode;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}) {
  const [authModalState, setAuthModalState] = useState<{ isOpen: boolean; mode: 'login' | 'register' }>({
    isOpen: false,
    mode: 'login',
  });

  // Call useCurrentUser so state persists and rehydrates across reloads
  useCurrentUser();

  const { data: health, isLoading, error } = useQuery({
    queryKey: ['health-status'],
    queryFn: async () => {
      try {
        const res = await apiClient.get<HealthResponse>('/health');
        return res.data;
      } catch {
        return null;
      }
    },
    refetchInterval: 20000,
  });

  const apiStatus = isLoading ? 'loading' : error || !health ? 'error' : health.status === 'ok' ? 'ok' : 'degraded';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header
        apiStatus={apiStatus}
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        onOpenAuthModal={(mode) => setAuthModalState({ isOpen: true, mode })}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          activeSection={
            activeTab === 'cart'
              ? 'cart'
              : activeTab === 'products'
              ? 'products'
              : activeTab === 'auth'
              ? 'auth'
              : activeTab === 'overview'
              ? 'overview'
              : 'structure'
          }
          onSelectSection={(sec) => {
            if (sec === 'cart') onSelectTab('cart');
            else if (sec === 'products') onSelectTab('products');
            else if (sec === 'auth') onSelectTab('auth');
            else if (sec === 'overview') onSelectTab('overview');
            else if (sec === 'structure') onSelectTab('architecture');
            else onSelectTab('roadmap');
          }}
        />

        <PageWrapper>
          {children}
        </PageWrapper>
      </div>

      <Footer />

      {/* Mini-Cart Slide-Over Drawer */}
      <CartDrawer onNavigateToCart={() => onSelectTab('cart')} />

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
  const [activeTab, setActiveTab] = useState<'products' | 'cart' | 'auth' | 'overview' | 'architecture' | 'roadmap'>('products');

  const {
    data: health,
    isLoading: isHealthLoading,
    isFetching: isHealthFetching,
    refetch: refetchHealth,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['health-check'],
    queryFn: async (): Promise<HealthResponse> => {
      const response = await apiClient.get<HealthResponse>('/health');
      return response.data;
    },
    refetchInterval: 15000,
  });

  return (
    <MainLayout activeTab={activeTab} onSelectTab={(tab) => setActiveTab(tab as any)}>
      {activeTab === 'products' && <ProductsView />}

      {activeTab === 'cart' && <CartView />}

      {activeTab === 'auth' && <AuthView />}

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center space-x-2">
                <Badge variant="success" className="px-2 py-0.5 font-mono text-[11px]">
                  Phase 0 &amp; 1 Active
                </Badge>
                <span className="text-xs text-slate-500 font-mono">Express • Drizzle • React 19</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                Hạ tầng &amp; Trạng thái Hệ thống
              </h1>
              <p className="text-sm text-slate-600 mt-0.5">
                Kiểm tra kết nối thời gian thực giữa apps/web và apps/api Express backend.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchHealth()}
              isLoading={isHealthFetching}
              id="btn-refetch-health-page"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isHealthFetching ? 'animate-spin' : ''}`} />
              Ping GET /health
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Backend Gateway
                </span>
                <Server className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-xl font-bold text-slate-900">{health?.service || '@apps/api'}</span>
                <Badge variant={health ? 'success' : 'warning'}>
                  {health?.status ? `200 OK (${health.status})` : 'Connecting...'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Endpoints: <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono">/health</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono">/api/auth/*</code>
              </p>
            </Card>

            <Card className="border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Database / Storage
                </span>
                <Database className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-xl font-bold text-slate-900">PostgreSQL</span>
                <Badge variant="info">Drizzle ORM</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Tự động fallback memory store khi Docker offline
              </p>
            </Card>

            <Card className="border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Frontend App
                </span>
                <Cpu className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-xl font-bold text-slate-900">@apps/web</span>
                <Badge variant="success">Vite 6 + React 19</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Axios interceptor tự động đính Bearer token
              </p>
            </Card>
          </div>

          <Card>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Phản hồi từ GET /health
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : '...'}
              </span>
            </div>
            <div className="bg-slate-950 text-slate-200 p-4 rounded-lg font-mono text-xs overflow-x-auto shadow-inner">
              <pre>{JSON.stringify(health, null, 2)}</pre>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <Card>
            <div className="flex items-center space-x-2 mb-3">
              <FolderTree className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-slate-900">
                Cấu trúc Monorepo theo Hướng dẫn Giai đoạn 1
              </h3>
            </div>
            <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs leading-relaxed overflow-x-auto">
{`ecommerce/
├── apps/
│   ├── api/                           # Express Backend
│   │   ├── src/
│   │   │   ├── connection.ts          # postgres connection client
│   │   │   ├── db.ts                  # drizzle instance
│   │   │   ├── index.ts               # express app & route mounting
│   │   │   ├── shared/
│   │   │   │   └── middlewares/
│   │   │   │       └── auth.middleware.ts  # JWT Verification & RBAC
│   │   │   ├── users/
│   │   │   │   ├── users.schema.ts    # Drizzle pgTable users
│   │   │   │   ├── users.repository.ts# Query & seed fallback
│   │   │   │   ├── users.service.ts   # bcrypt + JWT generation
│   │   │   │   └── users.controller.ts# POST /auth/register, /login, GET /me
│   │   │   └── routes/health.router.ts
│   │   ├── drizzle.config.ts
│   │   └── package.json
│   │
│   └── web/                           # Vite + React 19 Frontend
│       ├── src/
│       │   ├── features/
│       │   │   └── auth/
│       │   │       ├── api/           # useLogin, useRegister, useCurrentUser
│       │   │       ├── components/    # LoginForm, RegisterForm, AuthView
│       │   │       ├── store/         # authStore (zustand)
│       │   │       ├── types.ts
│       │   │       └── index.ts
│       │   ├── routes/
│       │   │   ├── index.tsx
│       │   │   └── ProtectedRoute.tsx # Route Guard chặn khi chưa auth
│       │   └── lib/
│       │       ├── axios.ts           # Interceptor đính Bearer token
│       │       └── queryClient.ts
│
├── packages/
│   └── shared-types/                  # Type chia sẻ: User, RegisterPayload...
├── docker-compose.yml                 # PostgreSQL 16 local container
└── turbo.json                         # Turborepo pipelines`}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'roadmap' && (
        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Lộ trình Phát triển 5 Giai đoạn</h3>
            <div className="space-y-3">
              {[
                {
                  phase: 'Giai đoạn 0',
                  title: 'Khởi tạo monorepo & tooling',
                  desc: 'Turborepo, apps/api (Express + Drizzle), apps/web (Vite + React Query + Axios), packages/shared-types, Docker Compose, GET /health.',
                  status: 'Hoàn thành',
                  badgeVariant: 'success' as const,
                },
                {
                  phase: 'Giai đoạn 1',
                  title: 'Module users + Auth (Nền tảng bắt buộc)',
                  desc: 'users.schema.ts, users.repository.ts, users.service.ts, auth.middleware.ts, useLogin, useRegister, useCurrentUser, ProtectedRoute.',
                  status: 'Hoàn thành',
                  badgeVariant: 'success' as const,
                },
                {
                  phase: 'Giai đoạn 2',
                  title: 'Module products (Đọc dữ liệu)',
                  desc: 'CRUD sản phẩm, phân trang, lọc danh mục, ProductCard, ProductList, react-query cache.',
                  status: 'Tiếp theo',
                  badgeVariant: 'warning' as const,
                },
                {
                  phase: 'Giai đoạn 3',
                  title: 'Giỏ hàng (Client State)',
                  desc: 'Zustand cartStore, mini-cart, giỏ hàng client-side.',
                  status: 'Đang chờ',
                  badgeVariant: 'neutral' as const,
                },
                {
                  phase: 'Giai đoạn 4',
                  title: 'Module orders (Nghiệp vụ phức tạp)',
                  desc: 'orders.schema.ts, transaction Drizzle, kiểm tra giá & tồn kho ở server.',
                  status: 'Đang chờ',
                  badgeVariant: 'neutral' as const,
                },
                {
                  phase: 'Giai đoạn 5',
                  title: 'Hoàn thiện & vận hành',
                  desc: 'Validation Zod 2 phía, error middleware, tối ưu hóa deploy.',
                  status: 'Đang chờ',
                  badgeVariant: 'neutral' as const,
                },
              ].map((p, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-blue-600">{p.phase}:</span>
                      <span className="font-semibold text-sm text-slate-900">{p.title}</span>
                    </div>
                    <p className="text-xs text-slate-600">{p.desc}</p>
                  </div>
                  <Badge variant={p.badgeVariant} className="self-start sm:self-center">
                    {p.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </MainLayout>
  );
}

/**
 * Dedicated /login page
 */
function LoginPage() {
  const navigate = useNavigate();
  return (
    <MainLayout activeTab="auth" onSelectTab={() => {}}>
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
    <MainLayout activeTab="auth" onSelectTab={() => {}}>
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
    <MainLayout activeTab="auth" onSelectTab={() => {}}>
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="success">Trang Được Bảo Vệ (Protected)</Badge>
              <span className="text-xs text-slate-400 font-mono">/profile</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Hồ sơ Người dùng</h1>
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
            <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-xs">
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{user?.fullName}</h3>
                <Badge variant={user?.role === 'admin' ? 'info' : 'success'}>
                  {user?.role === 'admin' ? 'Admin' : 'Customer'}
                </Badge>
              </div>
              <p className="text-sm text-slate-600">{user?.email}</p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {user?.id}</p>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Chi tiết Xác thực &amp; Token
            </h4>
            <div className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto">
              <p className="text-slate-400 mb-1">// JWT Bearer Token trong Header:</p>
              <p className="break-all text-emerald-400">{token}</p>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}

function ProductsPage() {
  return (
    <MainLayout activeTab="products" onSelectTab={() => {}}>
      <ProductsView />
    </MainLayout>
  );
}

function ProductDetailPage() {
  return (
    <MainLayout activeTab="products" onSelectTab={() => {}}>
      <ProductDetailView />
    </MainLayout>
  );
}

function CartPage() {
  const navigate = useNavigate();
  return (
    <MainLayout
      activeTab="cart"
      onSelectTab={(tab) => {
        if (tab === 'cart') navigate('/cart');
        else if (tab === 'products') navigate('/products');
        else navigate('/');
      }}
    >
      <CartView />
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
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/health',
    element: <HomePage />,
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
