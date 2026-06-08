'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus, Pencil, Eye, Copy, X, Trash2, Users, CalendarClock,
} from 'lucide-react';
import {
  useEmployerJobs, useCloseJob, useDeleteJob, useDuplicateJob,
} from '@/hooks/useEmployer';
import { JobStatusBadge } from '@/components/shared/StatusBadge';
import ConfirmModal from '@/components/shared/ConfirmModal';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import Pagination from '@/components/shared/Pagination';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate } from '@/lib/utils';
import type { JobStatus, Job } from '@/types';

type TabStatus = 'ALL' | JobStatus;

const TABS: { value: TabStatus; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PENDING_APPROVAL', label: 'Pending' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'REJECTED', label: 'Rejected' },
];

export default function EmployerJobsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<TabStatus>('ALL');
  const [confirmClose, setConfirmClose] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data, isLoading } = useEmployerJobs(page);
  const closeJob = useCloseJob();
  const deleteJob = useDeleteJob();
  const duplicateJob = useDuplicateJob();

  const allJobs: Job[] = data?.data ?? [];
  const pagination = data?.pagination;

  const filteredJobs =
    activeTab === 'ALL' ? allJobs : allJobs.filter((j) => j.status === activeTab);

  const handleTabChange = (val: string) => {
    setActiveTab(val as TabStatus);
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Job Posts"
        subtitle="Manage, edit and track your job listings."
        action={
          <Button asChild className="gap-2">
            <Link href="/employer/jobs/new">
              <Plus className="h-4 w-4" />
              Post a Job
            </Link>
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="h-auto flex-wrap gap-1 bg-slate-100 p-1">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">
              {tab.label}
              {tab.value !== 'ALL' && (
                <span className="ml-1.5 text-[10px] font-semibold bg-white text-slate-600 rounded-full px-1.5 py-0.5">
                  {allJobs.filter((j) => j.status === tab.value).length}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <Plus className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-700">
              {activeTab === 'ALL' ? 'No jobs posted yet' : `No ${activeTab.toLowerCase().replace('_', ' ')} jobs`}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {activeTab === 'ALL' && 'Post your first job to start receiving applications.'}
            </p>
            {activeTab === 'ALL' && (
              <Button asChild className="mt-4 gap-2" size="sm">
                <Link href="/employer/jobs/new">
                  <Plus className="h-3.5 w-3.5" />
                  Post a Job
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Table header — desktop only */}
            <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <span>Job Title</span>
              <span className="w-20 text-center">Applicants</span>
              <span className="w-24 text-center">Status</span>
              <span className="w-28 text-center">Expires</span>
              <span className="w-16 text-center">Actions</span>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex flex-col sm:grid sm:grid-cols-[1fr_auto_auto_auto_auto] sm:items-center gap-2 sm:gap-4 px-5 py-4 hover:bg-slate-50/70 transition-colors"
                >
                  {/* Title + meta */}
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-slate-800 truncate">{job.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {job.city}
                      {job.state ? `, ${job.state}` : ''}
                      {' · '}
                      {job.employmentType.replace('_', ' ')}
                    </p>
                  </div>

                  {/* Applicants */}
                  <div className="flex items-center gap-1.5 sm:w-20 sm:justify-center">
                    <Users className="h-3.5 w-3.5 text-slate-400 sm:hidden" />
                    <span className="text-sm font-semibold text-slate-700">
                      {job.applicationCount ?? 0}
                    </span>
                    <span className="text-xs text-slate-400 sm:hidden">applicants</span>
                  </div>

                  {/* Status */}
                  <div className="sm:w-24 sm:flex sm:justify-center">
                    <JobStatusBadge status={job.status} />
                  </div>

                  {/* Expiry */}
                  <div className="sm:w-28 sm:text-center">
                    {job.expiresAt ? (
                      <span className="flex items-center gap-1 text-xs text-slate-500 sm:justify-center">
                        <CalendarClock className="h-3 w-3 sm:hidden" />
                        {formatDate(job.expiresAt)}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </div>

                  {/* Actions dropdown */}
                  <div className="sm:w-16 sm:flex sm:justify-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-slate-600">
                          Actions ▾
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          className="gap-2 cursor-pointer"
                          onClick={() => router.push(`/employer/jobs/${job.id}/applicants`)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View Applicants
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 cursor-pointer"
                          onClick={() => router.push(`/employer/jobs/${job.id}/edit`)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit Job
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 cursor-pointer"
                          disabled={duplicateJob.isPending}
                          onClick={() => duplicateJob.mutate(job.id)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {job.status === 'ACTIVE' && (
                          <DropdownMenuItem
                            className="gap-2 cursor-pointer text-amber-600 focus:text-amber-700"
                            onClick={() => setConfirmClose(job.id)}
                          >
                            <X className="h-3.5 w-3.5" />
                            Close Job
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="gap-2 cursor-pointer text-red-600 focus:text-red-700"
                          onClick={() => setConfirmDelete(job.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>

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

      <ConfirmModal
        open={!!confirmClose}
        onClose={() => setConfirmClose(null)}
        onConfirm={() => { if (confirmClose) closeJob.mutate(confirmClose); setConfirmClose(null); }}
        title="Close Job Posting"
        description="This job will no longer be visible to candidates and will stop accepting applications. You can duplicate it later if needed."
        confirmLabel="Close Job"
        confirmVariant="default"
        loading={closeJob.isPending}
      />

      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => { if (confirmDelete) deleteJob.mutate(confirmDelete); setConfirmDelete(null); }}
        title="Delete Job"
        description="This will permanently delete the job posting and all associated applications. This cannot be undone."
        confirmLabel="Delete Job"
        confirmVariant="destructive"
        loading={deleteJob.isPending}
      />
    </div>
  );
}
