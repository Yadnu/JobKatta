import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatINR = (amount: number): string =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const formatSalaryRange = (min?: number, max?: number, hide?: boolean): string => {
  if (hide) return 'Salary not disclosed';
  if (!min && !max) return 'Salary not disclosed';
  if (min && max) return `${formatINR(min)} – ${formatINR(max)} / month`;
  if (min) return `From ${formatINR(min)} / month`;
  return `Up to ${formatINR(max!)} / month`;
};

export const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
};

export const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const truncate = (str: string, length = 100): string =>
  str.length > length ? `${str.slice(0, length)}...` : str;

export const getInitials = (name: string): string =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

export const employmentTypeLabel: Record<string, string> = {
  FULL_TIME: 'Full Time', PART_TIME: 'Part Time',
  INTERNSHIP: 'Internship', FREELANCE: 'Freelance', CONTRACT: 'Contract',
};
