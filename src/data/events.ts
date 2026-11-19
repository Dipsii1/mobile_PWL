// Data contoh untuk tampilan — ganti dengan data dari backend nanti.
export type Category = 'Semua' | 'Musik' | 'Olahraga' | 'Seminar' | 'Festival';

export type TixoEvent = {
  id: string;
  title: string;
  category: Exclude<Category, 'Semua'>;
  date: string;
  day: string;
  month: string;
  place: string;
  price: string;
  icon: string;
  tint: string;
  tintSoft: string;
};

export const CATEGORIES: Category[] = ['Semua', 'Musik', 'Olahraga', 'Seminar', 'Festival'];

export const CATEGORY_ICON: Record<Category, string> = {
  Semua: 'apps',
  Musik: 'music_note',
  Olahraga: 'sports_soccer',
  Seminar: 'school',
  Festival: 'celebration',
};

export const EVENTS: TixoEvent[] = [
  {
    id: '1',
    title: 'Konser Senandung Senja',
    category: 'Musik',
    date: 'Sab, 12 Des · 19.00',
    day: '12',
    month: 'DES',
    place: 'Istora Senayan, Jakarta',
    price: 'Rp150.000',
    icon: 'music_note',
    tint: '#FF4D00',
    tintSoft: '#FF4D0026',
  },
  {
    id: '2',
    title: 'Laga Puncak Liga Kota',
    category: 'Olahraga',
    date: 'Min, 13 Des · 15.30',
    day: '13',
    month: 'DES',
    place: 'Stadion Patriot, Bekasi',
    price: 'Rp75.000',
    icon: 'sports_soccer',
    tint: '#0EA472',
    tintSoft: '#0EA47226',
  },
  {
    id: '3',
    title: 'Seminar Kecerdasan Buatan untuk Pelajar',
    category: 'Seminar',
    date: 'Rab, 16 Des · 09.00',
    day: '16',
    month: 'DES',
    place: 'Aula SMK Nusantara',
    price: 'Gratis',
    icon: 'school',
    tint: '#2563EB',
    tintSoft: '#2563EB26',
  },
  {
    id: '4',
    title: 'Festival Kuliner Nusantara',
    category: 'Festival',
    date: 'Jum, 18 Des · 16.00',
    day: '18',
    month: 'DES',
    place: 'Lapangan Banteng',
    price: 'Rp25.000',
    icon: 'celebration',
    tint: '#E5487A',
    tintSoft: '#E5487A26',
  },
  {
    id: '5',
    title: 'Akustik Malam Minggu',
    category: 'Musik',
    date: 'Sab, 19 Des · 20.00',
    day: '19',
    month: 'DES',
    place: 'Kopi Ruang, Bandung',
    price: 'Rp50.000',
    icon: 'piano',
    tint: '#FF4D00',
    tintSoft: '#FF4D0026',
  },
  {
    id: '6',
    title: 'Lari Santai 5K',
    category: 'Olahraga',
    date: 'Min, 20 Des · 06.00',
    day: '20',
    month: 'DES',
    place: 'GBK, Jakarta',
    price: 'Rp120.000',
    icon: 'directions_run',
    tint: '#0EA472',
    tintSoft: '#0EA47226',
  },
];
