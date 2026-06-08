import { cn } from '@/lib/utils';
import type { PlanType } from '@/types';

interface Props {
  plan: PlanType;
  className?: string;
}

const planStyles: Record<PlanType, string> = {
  FREE: 'bg-slate-100 text-slate-600 border-slate-200',
  BASIC: 'bg-blue-50 text-blue-700 border-blue-200',
  STANDARD: 'bg-violet-50 text-violet-700 border-violet-200',
  PREMIUM: 'bg-amber-50 text-amber-700 border-amber-200',
  ANNUAL: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const planLabels: Record<PlanType, string> = {
  FREE: 'Free',
  BASIC: 'Basic',
  STANDARD: 'Standard',
  PREMIUM: 'Premium',
  ANNUAL: 'Annual',
};

export default function PlanBadge({ plan, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        planStyles[plan] ?? 'bg-slate-100 text-slate-600 border-slate-200',
        className
      )}
    >
      {planLabels[plan] ?? plan}
    </span>
  );
}
