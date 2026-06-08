import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    label: string;
  };
  iconClassName?: string;
  className?: string;
}

const trendColors = {
  up: 'text-emerald-600',
  down: 'text-red-500',
  neutral: 'text-slate-500',
};

const trendIcons = {
  up: '↑',
  down: '↓',
  neutral: '→',
};

export default function StatsCard({ label, value, icon: Icon, trend, iconClassName, className }: Props) {
  return (
    <div className={cn('rounded-xl border border-slate-200 bg-white p-5 shadow-sm', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 truncate">{value}</p>
          {trend && (
            <p className={cn('mt-1 text-xs font-medium', trendColors[trend.direction])}>
              {trendIcons[trend.direction]} {trend.label}
            </p>
          )}
        </div>
        <div
          className={cn(
            'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50',
            iconClassName
          )}
        >
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
      </div>
    </div>
  );
}
