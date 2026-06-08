'use client';

import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { useAdminSubscriptions } from '@/hooks/useAdmin';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import Pagination from '@/components/shared/Pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn, formatINR, formatDate } from '@/lib/utils';

const planColors: Record<string, string> = {
  FREE: 'bg-slate-100 text-slate-600',
  BASIC: 'bg-blue-50 text-blue-700',
  STANDARD: 'bg-violet-50 text-violet-700',
  PREMIUM: 'bg-amber-50 text-amber-700',
  ANNUAL: 'bg-emerald-50 text-emerald-700',
};

const statusColors: Record<string, string> = {
  paid: 'bg-emerald-50 text-emerald-700',
  PAID: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  PENDING: 'bg-amber-50 text-amber-700',
  failed: 'bg-red-50 text-red-600',
  FAILED: 'bg-red-50 text-red-600',
  refunded: 'bg-slate-100 text-slate-500',
  REFUNDED: 'bg-slate-100 text-slate-500',
};

export default function AdminSubscriptionsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');

  const { data, isLoading } = useAdminSubscriptions(page, {
    status: statusFilter || undefined,
    planType: planFilter || undefined,
  });

  const subscriptions = data?.data ?? [];
  const pagination = data?.pagination;

  function handleFilterChange() {
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscriptions"
        subtitle="View all subscription records across the platform."
      />

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select
          value={statusFilter || 'all'}
          onValueChange={(v) => {
            setStatusFilter(v === 'all' ? '' : v);
            handleFilterChange();
          }}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={planFilter || 'all'}
          onValueChange={(v) => {
            setPlanFilter(v === 'all' ? '' : v);
            handleFilterChange();
          }}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="FREE">Free</SelectItem>
            <SelectItem value="BASIC">Basic</SelectItem>
            <SelectItem value="STANDARD">Standard</SelectItem>
            <SelectItem value="PREMIUM">Premium</SelectItem>
            <SelectItem value="ANNUAL">Annual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Header row */}
        <div className="hidden sm:grid grid-cols-5 gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
          <div className="col-span-2">User</div>
          <div>Plan</div>
          <div>Amount</div>
          <div>Status / Date</div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : subscriptions.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No subscriptions found"
            description="Adjust filters or check back later."
          />
        ) : (
          <>
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="grid grid-cols-1 sm:grid-cols-5 gap-2 sm:gap-4 items-center px-5 py-4 border-b border-slate-100 last:border-0"
              >
                <div className="sm:col-span-2 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {sub.userId}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    Order: {sub.razorpayOrderId ?? '—'}
                  </p>
                </div>
                <div>
                  <span
                    className={cn(
                      'inline-block text-xs font-semibold px-2 py-0.5 rounded-full',
                      planColors[sub.planType] ?? 'bg-slate-100 text-slate-500'
                    )}
                  >
                    {sub.planType}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{formatINR(sub.amount)}</p>
                </div>
                <div>
                  <span
                    className={cn(
                      'inline-block text-xs font-semibold px-2 py-0.5 rounded-full',
                      statusColors[sub.status] ?? 'bg-slate-100 text-slate-500'
                    )}
                  >
                    {sub.status.toUpperCase()}
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5">{formatDate(sub.createdAt)}</p>
                </div>
              </div>
            ))}
            {pagination && pagination.pages > 1 && (
              <div className="px-5 py-4 border-t border-slate-100">
                <Pagination
                  page={pagination.page}
                  pages={pagination.pages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
