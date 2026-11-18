import { createContext, use, useEffect, useState, type ReactNode } from 'react';

import { ApiError } from '@/lib/api';
import { deleteItem, getItem, setItem } from '@/lib/token-storage';
import { AuthService } from '@/services/auth.service';
import type { AuthUser, LoginInput, RegisterInput, RegisterResult } from '@/types/auth.types';

const TOKEN_KEY = 'tixo.accessToken';
const USER_KEY = 'tixo.user';

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  signIn: (input: LoginInput) => Promise<void>;
  signUp: (input: RegisterInput) => Promise<RegisterResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function saveSession(nextToken: string, nextUser: AuthUser) {
    await Promise.all([setItem(TOKEN_KEY, nextToken), setItem(USER_KEY, JSON.stringify(nextUser))]);
    setToken(nextToken);
    setUser(nextUser);
  }

  async function clearSession() {
    await Promise.all([deleteItem(TOKEN_KEY), deleteItem(USER_KEY)]);
    setToken(null);
    setUser(null);
  }

  // Pulihkan sesi saat app dibuka: cek token ke /auth/me, refresh jika kedaluwarsa.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([getItem(TOKEN_KEY), getItem(USER_KEY)]);
        if (!storedToken || !storedUser) return;
        const cachedUser = JSON.parse(storedUser) as AuthUser;

        let activeToken = storedToken;
        try {
          await AuthService.profile(activeToken);
        } catch (error) {
          if (!(error instanceof ApiError) || error.status !== 401) {
            // Offline / server mati: tetap pakai sesi tersimpan.
            if (!cancelled) {
              setToken(storedToken);
              setUser(cachedUser);
            }
            return;
          }
          activeToken = (await AuthService.refreshToken()).accessToken;
        }

        const profile = await AuthService.profile(activeToken);
        if (cancelled) return;
        await saveSession(activeToken, {
          public_id: profile.public_id,
          email: profile.email,
          full_name: profile.full_name ?? cachedUser.full_name,
          role: profile.role,
        });
      } catch {
        if (!cancelled) await clearSession();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function signIn(input: LoginInput) {
    const result = await AuthService.login(input);
    await saveSession(result.accessToken, result.user);
  }

  function signUp(input: RegisterInput) {
    return AuthService.register(input);
  }

  async function signOut() {
    try {
      if (token) await AuthService.logout(token);
    } catch {
      // Tetap hapus sesi lokal walau request gagal.
    }
    await clearSession();
  }

  return (
    <AuthContext value={{ user, token, isLoading, signIn, signUp, signOut }}>{children}</AuthContext>
  );
}

export function useAuth() {
  const ctx = use(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam <AuthProvider>.');
  return ctx;
}
