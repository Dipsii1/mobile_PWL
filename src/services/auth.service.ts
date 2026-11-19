import { request } from '@/lib/api';
import type {
  LoginInput,
  LoginResult,
  MessageResult,
  ProfileResult,
  RefreshResult,
  RegisterInput,
  RegisterResult,
  UpdateProfileInput,
} from '@/types/auth.types';

// Endpoint mengikuti Backend_UKK — src/modules/auth/auth.route.ts (prefix /api/v1/auth).
export const AuthService = {
  register: (input: RegisterInput) =>
    request<RegisterResult>('/auth/register', { method: 'POST', body: input }),

  login: (input: LoginInput) =>
    request<LoginResult>('/auth/login', { method: 'POST', body: input }),

  refreshToken: () => request<RefreshResult>('/auth/refresh-token', { method: 'POST', body: {} }),

  profile: (token: string) => request<ProfileResult>('/auth/me', { token }),

  updateProfile: (token: string, input: UpdateProfileInput) =>
    request<ProfileResult>('/auth/me', { method: 'PATCH', body: input, token }),

  logout: (token: string) => request<null>('/auth/logout', { method: 'POST', token }),

  requestPasswordReset: (email: string) =>
    request<MessageResult>('/auth/reset-password/request', { method: 'POST', body: { email } }),

  requestEmailVerification: (email: string) =>
    request<MessageResult>('/auth/verify-email/request', { method: 'POST', body: { email } }),
};
