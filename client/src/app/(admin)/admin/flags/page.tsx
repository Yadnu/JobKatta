'use client';

import { useState } from 'react';
import { Flag, CheckCircle } from 'lucide-react';
import { useAdminFlags, useResolveFlag, type FlagReport } from '@/hooks/useAdmin';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import Pagination from '@/components/shared/Pagination';
import { Button } from '@/components/ui/button';
import { cn, formatDate, timeAgo } from '@/lib/utils';

const TARGET_COLORS: Record<string, string> = {
  JOB: 'bg-blue-50 text-blue-700',
  EMPLOYER: 'bg-violet-50 text-violet-700',
  CANDIDATE: 'bg-amber-50 text-amber-700',
  COMMENT: 'bg-slate-100 text-slate-600',
};

export default function AdminFlagsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminFlags(page);
  const resolveFlag = useResolveFlag();

  const flags: FlagReport[] = (data?.data ?? []) as FlagReport[];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Flagged Content"
        subtitle="Review and resolve content reports from users."
      />

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : flags.length === 0 ? (
          <EmptyState
            icon={Flag}
            title="No flags to review"
            description="All reported content has been resolved."
          />
        ) : (
          <>
            {flags.map((flag) => (
              <div
                key={flag.id}
                className={cn(
                  'flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 last:border-0',
                  flag.isResolved && 'opacity-50'
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={cn(
                        'inline-block text-xs font-semibold px-2 py-0.5 rounded-full',
                        TARGET_COLORS[flag.targetType] ?? 'bg-slate-100 text-slate-500'
                      )}
                    >
                      {flag.targetType}
                    </span>
                    <p className="text-sm font-medium text-slate-800">{flag.reason}</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Reported by {flag.user.email} · {timeAgo(flag.createdAt)}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Target ID: <span className="font-mono">{flag.targetId}</span>
                  </p>
                </div>
                <div className="shrink-0">
                  {flag.isResolved ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Resolved
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                      disabled={resolveFlag.isPending}
                      onClick={() => resolveFlag.mutate(flag.id)}
                    >
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      Resolve
                    </Button>
                  )}
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
