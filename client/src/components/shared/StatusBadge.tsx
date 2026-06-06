import { cn } from '@/lib/utils';
import { APPLICATION_STATUS_COLORS, APPLICATION_STATUS_LABELS } from '@/lib/constants';

interface Props {
  status: string;
  className?: string;
}

const jobStatusStyles: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  DRAFT: 'bg-slate-100 text-slate-600',
  PENDING_APPROVAL: 'bg-yellow-100 text-yellow-700',
  EXPIRED: 'bg-red-100 text-red-600',
  REJECTED: 'bg-red-100 text-red-700',
  CLOSED: 'bg-slate-100 text-slate-500',
};

const jobStatusLabels: Record<string, string> = {
  ACTIVE: 'Active', DRAFT: 'Draft', PENDING_APPROVAL: 'Pending', EXPIRED: 'Expired', REJECTED: 'Rejected', CLOSED: 'Closed',
};

export function ApplicationStatusBadge({ status, className }: Props) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', APPLICATION_STATUS_COLORS[status] || 'bg-slate-100 text-slate-600', className)}>
      {APPLICATION_STATUS_LABELS[status] || status}
    </span>
  );
}

export function JobStatusBadge({ status, className }: Props) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', jobStatusStyles[status] || 'bg-slate-100 text-slate-600', className)}>
      {jobStatusLabels[status] || status}
    </span>
  );
}

export default ApplicationStatusBadge;
