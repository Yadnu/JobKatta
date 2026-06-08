'use client';

import Link from 'next/link';
import {
  Briefcase, Users, CreditCard, Layers, ArrowRight, Plus, Eye,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import {
  useEmployerProfile,
  useEmployerJobs,
  useEmployerRecentApplications,
} from '@/hooks/useEmployer';
import StatsCard from '@/components/shared/StatsCard';
import { JobStatusBadge, ApplicationStatusBadge } from '@/components/shared/StatusBadge';
import PlanBadge from '@/components/shared/PlanBadge';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate, getInitials } from '@/lib/utils';
import type { Job, Application } from '@/types';

export default function EmployerDashboardPage() {
  const { user } = useAuthStore();
  const { data: employer, isLoading: employerLoading } = useEmployerProfile();
  const { data: jobsData, isLoading: jobsLoading } = useEmployerJobs(1);
  const { data: recentApps } = useEmployerRecentApplications();

  const jobs: Job[] = jobsData?.data ?? [];
  const activeJobs = jobs.filter((j) => j.status === 'ACTIVE').length;
  const totalApplications = jobs.reduce((sum, j) => sum + (j.applicationCount ?? 0), 0);
  const planType = user?.employer?.planType ?? 'FREE';
  const activeJobLimit = user?.employer?.activeJobLimit ?? 0;
  const jobsRemaining = Math.max(0, activeJobLimit - activeJobs);

  const recentApplications: Application[] = (recentApps ?? []).slice(0, 5);
  const recentJobs = jobs.slice(0, 5);

  if (employerLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${employer?.companyName ?? 'there'}!`}
        subtitle="Here's an overview of your hiring activity."
        action={
          <Button asChild className="gap-2">
            <Link href="/employer/jobs/new">
              <Plus className="h-4 w-4" />
              Post a Job
            </Link>
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Active Jobs"
          value={activeJobs}
          icon={Briefcase}
          iconClassName="bg-blue-50"
          trend={{ direction: 'neutral', label: 'Currently live' }}
        />
        <StatsCard
          label="Total Applications"
          value={totalApplications}
          icon={Users}
          iconClassName="bg-violet-50"
          trend={{ direction: 'neutral', label: 'Across all jobs' }}
        />
        <StatsCard
          label="Current Plan"
          value={planType}
          icon={CreditCard}
          iconClassName="bg-amber-50"
          trend={{ direction: 'neutral', label: 'View plans' }}
        />
        <StatsCard
          label="Job Posts Remaining"
          value={activeJobLimit > 0 ? jobsRemaining : '∞'}
          icon={Layers}
          iconClassName="bg-emerald-50"
          trend={
            activeJobLimit > 0 && jobsRemaining === 0
              ? { direction: 'down', label: 'Limit reached — upgrade' }
              : { direction: 'up', label: 'Available to post' }
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Applications */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-heading font-semibold text-slate-800">Recent Applications</h2>
          </div>

          {recentApplications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <Users className="h-8 w-8 text-slate-300 mb-2" />
              <p className="text-sm text-slate-500">No applications yet.</p>
              <Button variant="link" asChild className="mt-1 text-primary-600 h-auto p-0">
                <Link href="/employer/jobs/new">Post a job to start receiving applications →</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentApplications.map((app) => (
                <div key={app.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-8 w-8 rounded-lg border border-slate-200 flex-shrink-0">
                      <AvatarImage src={app.candidate?.photoUrl} />
                      <AvatarFallback className="rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
                        {getInitials(`${app.candidate?.firstName ?? ''} ${app.candidate?.lastName ?? ''}`)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {app.candidate?.firstName ?? '—'} {app.candidate?.lastName ?? ''}
                      </p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {app.job?.title ?? '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <ApplicationStatusBadge status={app.status} />
                    <span className="text-xs text-slate-400 hidden sm:block">
                      {formatDate(app.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Jobs */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-heading font-semibold text-slate-800">My Job Posts</h2>
            <Button variant="ghost" size="sm" asChild className="text-primary-600 hover:text-primary-700 gap-1">
              <Link href="/employer/jobs">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {jobsLoading ? (
            <div className="flex items-center justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : recentJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <Briefcase className="h-8 w-8 text-slate-300 mb-2" />
              <p className="text-sm text-slate-500">No jobs posted yet.</p>
              <Button variant="link" asChild className="mt-1 text-primary-600 h-auto p-0">
                <Link href="/employer/jobs/new">Post your first job →</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 truncate">{job.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {job.city}
                      {' · '}
                      <span className="text-slate-400">
                        {job.applicationCount ?? 0} applicant{job.applicationCount !== 1 ? 's' : ''}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <JobStatusBadge status={job.status} />
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-500" asChild>
                      <Link href={`/employer/jobs/${job.id}/applicants`}>
                        <Eye className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-heading font-semibold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            href="/employer/jobs/new"
            className="flex items-center gap-4 rounded-xl border-2 border-dashed border-slate-200 bg-white p-5 hover:border-primary-300 hover:bg-primary-50/30 transition-colors group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 group-hover:bg-primary-100 transition-colors">
              <Plus className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-800">Post a Job</p>
              <p className="text-xs text-slate-500 mt-0.5">Reach thousands of candidates</p>
            </div>
          </Link>

          <Link
            href="/employer/jobs"
            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 hover:shadow-sm transition-all group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Briefcase className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-800">Manage Jobs</p>
              <p className="text-xs text-slate-500 mt-0.5">Edit, close or view applicants</p>
            </div>
          </Link>

          <Link
            href="/employer/subscription"
            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 hover:shadow-sm transition-all group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
              <CreditCard className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-800">Upgrade Plan</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-xs text-slate-500">Current:</p>
                <PlanBadge plan={planType} className="text-[10px] px-1.5 py-0" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
