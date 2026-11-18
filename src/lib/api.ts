import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Bentuk respons mengikuti Backend_UKK — src/utils/api-response.ts.
export type ApiResponse<T> = {
  success: boolean;
  code: string;
  status: number;
  message: string;
  data?: T;
  errors?: { field: string; message: string }[] | unknown;
};

// Backend default: PORT=5000, prefix /api/v1. Bisa dioverride lewat EXPO_PUBLIC_API_URL.
function resolveBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  // Saat dev, pakai IP mesin yang menjalankan Metro agar HP fisik bisa mengakses backend.
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (host && Platform.OS !== 'web') return `http://${host}:5000/api/v1`;
  if (Platform.OS === 'android') return 'http://10.0.2.2:5000/api/v1';
  return 'http://localhost:5000/api/v1';
}

export const API_URL = resolveBaseUrl();

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message);
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
};

export async function request<T>(path: string, { method = 'GET', body, token }: RequestOptions = {}) {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      // Refresh token dikirim backend sebagai cookie httpOnly.
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Tidak dapat terhubung ke server. Periksa koneksi kamu.', 0, 'NETWORK_ERROR');
  }

  const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;

  if (!res.ok || !json?.success) {
    const fieldErrors: Record<string, string> = {};
    if (Array.isArray(json?.errors)) {
      for (const e of json.errors as { field?: string; message?: string }[]) {
        if (e.field && e.message && !fieldErrors[e.field]) fieldErrors[e.field] = e.message;
      }
    }
    throw new ApiError(
      json?.message ?? 'Terjadi kesalahan. Coba lagi.',
      res.status,
      json?.code ?? 'UNKNOWN_ERROR',
      fieldErrors,
    );
  }

  return json.data as T;
}
