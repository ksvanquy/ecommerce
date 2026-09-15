import type {
  User,
  UserRole,
  RegisterPayload,
  LoginPayload,
  AuthResponseData,
  ApiResponse,
} from '@repo/shared-types';

export type { User, UserRole, RegisterPayload, LoginPayload, AuthResponseData, ApiResponse };

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}
