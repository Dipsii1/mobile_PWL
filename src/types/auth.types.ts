// Disesuaikan dengan Backend_UKK — src/modules/auth/auth.types.ts.

export type RegisterInput = {
  email: string;
  password: string;
  fullName: string;
};

export type RegisterResult = {
  user: {
    public_id: string;
    email: string;
    full_name: string;
  };
  message: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthUser = {
  public_id: string;
  email: string;
  full_name: string;
  role: string;
};

export type LoginResult = {
  accessToken: string;
  user: AuthUser;
};

export type RefreshResult = {
  accessToken: string;
};

export type ProfileResult = {
  public_id: string;
  email: string;
  role: string;
  full_name: string | null;
  phone: string | null;
  gender: string | null;
  birth_date: string | null;
  avatar: string | null;
  address: string | null;
  province_id: string | null;
  city_id: string | null;
};

export type Gender = 'male' | 'female' | 'other';

// PATCH /auth/me — field yang tidak dikirim tidak diubah, null = kosongkan.
export type UpdateProfileInput = {
  full_name?: string;
  phone?: string | null;
  gender?: Gender | null;
  birth_date?: string | null; // YYYY-MM-DD
  address?: string | null;
};

export type MessageResult = {
  message: string;
};
