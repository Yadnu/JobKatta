'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCandidateApplications } from '@/hooks/useCandidate';
import { ApplicationStatusBadge } from '@/components/shared/StatusBadge';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import Pagination from '@/components/shared/Pagination';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate } from '@/lib/utils';
import type { Application } from '@/types';

const STATUS_TABS = [
  { value: 'ALL', label: 'All' },
  { value: 'APPLIED', label: 'Applied' },
  { value: 'SHORTLISTED', label: 'Shortlisted' },
  { value: 'INTERVIEWING', label: 'Interviewing' },
  { value: 'HIRED', label: 'Hired' },
  { value: 'REJECTED', label: 'Rejected' },
];

export default function ApplicationsPage() {
  const [tab, setTab] = useState('ALL');
  const [page, setPage] = useState(1);
  const router = useRouter();

  const { data, isLoading } = useCandidateApplications(page);

  const allApps: Application[] = data?.data ?? [];
  const filtered = tab === 'ALL' ? allApps : allApps.filter((a) => a.status === tab);
  const pagination = data?.pagination;

  const handleTabChange = (value: string) => {
    setTab(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Applications"
        subtitle="Track the status of all your job applications."
      />

      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList className="flex flex-wrap gap-1 h-auto bg-white border border-slate-200 p-1 rounded-lg w-full sm:w-auto">
          {STATUS_TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="text-xs sm:text-sm rounded-md">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <LoadingSpinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={tab === 'ALL' ? "No applications yet" : `No ${tab.toLowerCase()} applications`}
          description={
            tab === 'ALL'
              ? "You haven't applied to any jobs yet. Browse open positions and start applying!"
              : `You have no applications with "${STATUS_TABS.find((t) => t.value === tab)?.label}" status.`
          }
          actionLabel={tab === 'ALL' ? 'Browse Jobs' : undefined}
          onAction={tab === 'ALL' ? () => router.push('/jobs') : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <div
              key={app.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/jobs/${app.jobId}`}
                  className="text-sm font-semibold text-slate-900 hover:text-primary-600 transition-colors"
                >
                  {app.job?.title ?? '—'}
                </Link>
                <p className="text-xs text-slate-500 mt-0.5">
                  {app.job?.employer?.companyName ?? '—'}
                </p>
                {(app.job?.city || app.job?.state) && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {[app.job?.city, app.job?.state].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
              <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1.5 flex-shrink-0">
                <ApplicationStatusBadge status={app.status} />
                <span className="text-xs text-slate-400">
                  Applied {formatDate(app.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <Pagination page={page} pages={pagination.pages} onPageChange={setPage} className="mt-4" />
      )}
    </div>
  );
}
