import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(value: number | string) {
  const number = typeof value === 'string' ? parseInt(value) : value;
  return 'Rp' + number.toLocaleString('id-ID');
}
