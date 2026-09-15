import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@repo/shared-types';

interface AdminAuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('techstore_admin_auth');
      },
    }),
    {
      name: 'techstore_admin_auth',
    }
  )
);
