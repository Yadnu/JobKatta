'use client';

import { useState } from 'react';
import { Briefcase, Check, X, Search } from 'lucide-react';
import {
  useAdminPendingJobs,
  useAdminJobs,
  useApproveJob,
  useRejectJob,
} from '@/hooks/useAdmin';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import Pagination from '@/components/shared/Pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn, formatDate, timeAgo } from '@/lib/utils';
import type { Job } from '@/types';

type TabId = 'pending' | 'active' | 'all';

const STATUS_BADGE: Record<string, string> = {
  PENDING_APPROVAL: 'bg-amber-50 text-amber-700 border-amber-200',
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-red-50 text-red-600 border-red-200',
  DRAFT: 'bg-slate-100 text-slate-600 border-slate-200',
  EXPIRED: 'bg-slate-100 text-slate-500 border-slate-200',
  CLOSED: 'bg-slate-100 text-slate-500 border-slate-200',
};

function JobRow({
  job,
  onApprove,
  onReject,
  showActions,
}: {
  job: Job;
  onApprove: (id: string) => void;
  onReject: (job: Job) => void;
  showActions: boolean;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 last:border-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-slate-800 truncate">{job.title}</p>
          <span
            className={cn(
              'inline-block text-xs font-medium px-2 py-0.5 rounded-full border',
              STATUS_BADGE[job.status] ?? 'bg-slate-100 text-slate-500 border-slate-200'
            )}
          >
            {job.status.replace('_', ' ')}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          {job.employer?.companyName} · {job.city}, {job.state} · {timeAgo(job.createdAt)}
        </p>
      </div>
      {showActions && (
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600 text-white h-8 px-3"
            onClick={() => onApprove(job.id)}
          >
            <Check className="h-3.5 w-3.5 mr-1" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50 h-8 px-3"
            onClick={() => onReject(job)}
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Reject
          </Button>
        </div>
      )}
    </div>
  );
}

export default function AdminJobsPage() {
  const [tab, setTab] = useState<TabId>('pending');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [rejectJob, setRejectJob] = useState<Job | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const pendingQuery = useAdminPendingJobs(page);
  const allJobsQuery = useAdminJobs(page, {
    status: tab === 'active' ? 'ACTIVE' : undefined,
    search: search || undefined,
  });
  const approve = useApproveJob();
  const reject = useRejectJob();

  const isPending = tab === 'pending';
  const query = isPending ? pendingQuery : allJobsQuery;
  const jobs: Job[] = (query.data?.data ?? []) as Job[];
  const pagination = query.data?.pagination;

  function handleTabChange(t: TabId) {
    setTab(t);
    setPage(1);
    setSearch('');
  }

  function handleApprove(id: string) {
    approve.mutate(id);
  }

  function handleRejectSubmit() {
    if (!rejectJob || !rejectReason.trim()) return;
    reject.mutate(
      { id: rejectJob.id, rejectionReason: rejectReason.trim() },
      {
        onSuccess: () => {
          setRejectJob(null);
          setRejectReason('');
        },
      }
    );
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'pending', label: 'Pending' },
    { id: 'active', label: 'Active' },
    { id: 'all', label: 'All Jobs' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Job Management" subtitle="Review, approve, and manage job postings." />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => handleTabChange(t.id)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t.id
                ? 'border-violet-600 text-violet-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search (non-pending tabs) */}
      {!isPending && (
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search jobs…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {query.isLoading ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title={isPending ? 'No pending jobs' : 'No jobs found'}
            description={isPending ? 'All job postings are up to date.' : 'Try adjusting your search.'}
          />
        ) : (
          <>
            {jobs.map((job) => (
              <JobRow
                key={job.id}
                job={job}
                onApprove={handleApprove}
                onReject={(j) => setRejectJob(j)}
                showActions={isPending || job.status === 'PENDING_APPROVAL'}
              />
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

      {/* Reject Dialog */}
      <Dialog open={!!rejectJob} onOpenChange={(open) => !open && setRejectJob(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Job Posting</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            You are rejecting: <strong>{rejectJob?.title}</strong>
          </p>
          <Textarea
            placeholder="Reason for rejection (required)…"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectJob(null)}>
              Cancel
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={!rejectReason.trim() || reject.isPending}
              onClick={handleRejectSubmit}
            >
              {reject.isPending ? 'Rejecting…' : 'Reject Job'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
