import type { Gender, ProfileResult } from '@/types/auth.types';

// Mengikuti role & enum Gender di backend.
export const ROLE_LABEL: Record<string, string> = {
  buyer: 'Pecinta Konser',
  organizer: 'Penyelenggara Acara',
  admin: 'Administrator',
};

export const GENDER_OPTIONS: { value: Gender; label: string; icon: string }[] = [
  { value: 'male', label: 'Laki-laki', icon: 'male' },
  { value: 'female', label: 'Perempuan', icon: 'female' },
  { value: 'other', label: 'Lainnya', icon: 'transgender' },
];

export const GENDER_LABEL: Record<string, string> = Object.fromEntries(
  GENDER_OPTIONS.map((option) => [option.value, option.label]),
);

export type ProfileField = 'full_name' | 'phone' | 'gender' | 'birth_date' | 'address';

export const PROFILE_FIELDS: { key: ProfileField; label: string; icon: string }[] = [
  { key: 'full_name', label: 'Nama lengkap', icon: 'badge' },
  { key: 'phone', label: 'Nomor telepon', icon: 'call' },
  { key: 'gender', label: 'Jenis kelamin', icon: 'wc' },
  { key: 'birth_date', label: 'Tanggal lahir', icon: 'cake' },
  { key: 'address', label: 'Alamat', icon: 'location_on' },
];

export function missingFields(profile: ProfileResult | null) {
  if (!profile) return [];
  return PROFILE_FIELDS.filter(({ key }) => !profile[key]);
}

export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function formatDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

// ISO -> "DD/MM/YYYY"
export function isoToInput(value: string | null | undefined) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${date.getUTCFullYear()}`;
}

// 10032005 -> 10/03/2005
export function maskDate(text: string) {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

// "DD/MM/YYYY" -> "YYYY-MM-DD" (null jika tidak valid)
export function inputToIso(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const date = new Date(Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd)));
  const valid =
    date.getUTCDate() === Number(dd) &&
    date.getUTCMonth() === Number(mm) - 1 &&
    Number(yyyy) >= 1900 &&
    date.getTime() <= Date.now();
  return valid ? `${yyyy}-${mm}-${dd}` : null;
}

export const PHONE_PATTERN = /^(\+62|62|0)8[0-9]{7,12}$/;
