import { cn } from '@/lib/utils';
import { formatSalaryRange } from '@/lib/utils';

interface Props {
  min?: number;
  max?: number;
  hide?: boolean;
  negotiable?: boolean;
  className?: string;
}

export default function SalaryRange({ min, max, hide, negotiable, className }: Props) {
  const label = negotiable && !hide ? 'Negotiable' : formatSalaryRange(min, max, hide);

  return (
    <span className={cn('text-sm font-medium text-slate-700', className)}>
      {label}
    </span>
  );
}
