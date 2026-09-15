/// <reference types="vite/client" />

export const env = {
  API_BASE_URL: (import.meta.env?.VITE_API_BASE_URL as string) || '/api',
  APP_NAME: (import.meta.env?.VITE_APP_NAME as string) || 'Ecommerce',
  IS_DEV: import.meta.env?.DEV ?? true,
  IS_PROD: import.meta.env?.PROD ?? false,
} as const;

export function validateEnv(): boolean {
  if (!env.API_BASE_URL) {
    console.warn('[config/env] Missing VITE_API_BASE_URL, defaulting to /api');
  }
  return true;
}
