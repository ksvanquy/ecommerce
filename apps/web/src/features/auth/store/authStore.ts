import { create } from 'zustand';
import type { AuthState, User } from '../types.ts';

const initialToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

export const useAuthStore = create<AuthState>((set) => {
  // Listen for global logout events dispatched by axios interceptor
  if (typeof window !== 'undefined') {
    window.addEventListener('auth:logout', () => {
      set({ user: null, token: null, isAuthenticated: false });
    });
  }

  return {
    user: null,
    token: initialToken,
    isAuthenticated: !!initialToken,
    isLoading: !!initialToken, // Initial loading if token exists and profile needs fetching

    setAuth: (user: User, token: string) => {
      try {
        localStorage.setItem('auth_token', token);
      } catch {
        // ignore
      }
      set({ user, token, isAuthenticated: true, isLoading: false });
    },

    setUser: (user: User | null) => {
      set({ user, isLoading: false });
    },

    setLoading: (isLoading: boolean) => {
      set({ isLoading });
    },

    logout: () => {
      try {
        localStorage.removeItem('auth_token');
      } catch {
        // ignore
      }
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    },
  };
});
