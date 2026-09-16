import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { env } from '../config/env.ts';

export const apiClient = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Helper to get or generate persistent guest session ID
export function getOrCreateSessionId(): string {
  try {
    let sid = localStorage.getItem('techstore_session_id');
    if (!sid) {
      sid = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('techstore_session_id', sid);
    }
    return sid;
  } catch {
    return 'sess_fallback_default';
  }
}

// Request interceptor: attach token & session ID
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const sessionId = getOrCreateSessionId();
      if (sessionId && config.headers) {
        config.headers['x-session-id'] = sessionId;
      }
    } catch {
      // Ignore localStorage read errors in SSR/isolated frames
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: handle 401/errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    // Only clear token if an existing token was rejected on an authenticated endpoint
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      try {
        localStorage.removeItem('auth_token');
        window.dispatchEvent(new Event('auth:logout'));
      } catch {
        // ignore
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
