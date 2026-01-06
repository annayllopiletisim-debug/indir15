import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(title: string): string {
  if (!title) return '';
  return title
    .replace(/İ/g, 'i').replace(/I/g, 'i')
    .replace(/Ğ/g, 'g').replace(/Ü/g, 'u').replace(/Ş/g, 's')
    .replace(/Ö/g, 'o').replace(/Ç/g, 'c')
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export function getShortId(id: string): string {
  return id.split('-')[0];
}
