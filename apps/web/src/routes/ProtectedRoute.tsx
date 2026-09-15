import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/authStore.ts';
import { useCurrentUser } from '../features/auth/api/useCurrentUser.ts';

interface ProtectedRouteProps {
  redirectPath?: string;
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  redirectPath = '/login',
  children,
}) => {
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { isLoading } = useCurrentUser();

  // If there's an existing token in localStorage and we're currently fetching user profile
  if (token && isLoading) {
    return (
      <div id="auth-loading-state" className="min-h-[300px] flex flex-col items-center justify-center p-8 text-slate-500">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-medium text-slate-600">Đang xác thực phiên làm việc...</p>
      </div>
    );
  }

  if (!isAuthenticated && !token) {
    return <Navigate to={redirectPath} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
