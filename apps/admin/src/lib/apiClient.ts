import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to automatically attach stored Admin Bearer Token
apiClient.interceptors.request.use((config) => {
  try {
    const rawAuth = localStorage.getItem('techstore_admin_auth');
    if (rawAuth) {
      const parsed = JSON.parse(rawAuth);
      const token = parsed?.state?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch {
    // ignore parse error
  }
  return config;
});

// Response interceptor for session expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear admin storage if token expired
      localStorage.removeItem('techstore_admin_auth');
    }
    return Promise.reject(error);
  }
);
