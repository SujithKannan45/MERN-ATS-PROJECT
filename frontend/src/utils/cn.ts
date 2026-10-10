import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatScore(score: number): {
  label: string;
  color: string;
  badgeVariant: 'success' | 'warning' | 'destructive' | 'secondary';
} {
  if (score >= 80) {
    return { label: 'Excellent Match', color: 'text-emerald-500', badgeVariant: 'success' };
  }
  if (score >= 60) {
    return { label: 'Good Match', color: 'text-blue-500', badgeVariant: 'secondary' };
  }
  if (score >= 40) {
    return { label: 'Needs Improvement', color: 'text-amber-500', badgeVariant: 'warning' };
  }
  return { label: 'Critical Gap', color: 'text-rose-500', badgeVariant: 'destructive' };
}
