'use client';

import Link from 'next/link';
import { FileText, BarChart3, Bookmark, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCandidate, useCandidateApplications } from '@/hooks/useCandidate';
import { useJobs } from '@/hooks/useJobs';
import StatsCard from '@/components/shared/StatsCard';
import ProfileCompletionBanner from '@/components/shared/ProfileCompletionBanner';
import JobCard from '@/components/shared/JobCard';
import { ApplicationStatusBadge } from '@/components/shared/StatusBadge';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { CANDIDATE_FREE_APP_LIMIT } from '@/lib/constants';
import type { Application, Job } from '@/types';

export default function CandidateDashboardPage() {
  const { user } = useAuthStore();
  const { data: candidate, isLoading: candidateLoading } = useCandidate();
  const { data: appsData, isLoading: appsLoading } = useCandidateApplications(1);
  const { data: jobsData } = useJobs({ limit: 3 });

  const appsThisMonth = candidate?.appCountThisMonth ?? 0;
  const isFreePlan = (user?.candidate?.planType ?? 'FREE') === 'FREE';
  const appLimitLabel = isFreePlan ? `${appsThisMonth} / ${CANDIDATE_FREE_APP_LIMIT}` : String(appsThisMonth);
  const profilePct = candidate?.profileComplete ?? 0;

  const recentApplications: Application[] = (appsData?.data ?? []).slice(0, 5);
  const recommendedJobs: Job[] = jobsData?.data?.slice(0, 3) ?? [];

  if (candidateLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${candidate?.firstName ?? 'there'}!`}
        subtitle="Here's an overview of your job search activity."
      />

      {candidate && <ProfileCompletionBanner completion={candidate.profileComplete} />}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard
          label="Applications This Month"
          value={appLimitLabel}
          icon={FileText}
          iconClassName="bg-blue-50"
          trend={
            isFreePlan && appsThisMonth >= CANDIDATE_FREE_APP_LIMIT
              ? { direction: 'down', label: 'Monthly limit reached' }
              : { direction: 'neutral', label: isFreePlan ? `${CANDIDATE_FREE_APP_LIMIT - appsThisMonth} remaining` : 'Unlimited plan' }
          }
        />
        <StatsCard
          label="Profile Completion"
          value={`${profilePct}%`}
          icon={BarChart3}
          iconClassName="bg-emerald-50"
          trend={
            profilePct < 80
              ? { direction: 'down', label: 'Low visibility to employers' }
              : { direction: 'up', label: 'Profile looks strong' }
          }
        />
        <StatsCard
          label="Saved Jobs"
          value="—"
          icon={Bookmark}
          iconClassName="bg-amber-50"
          trend={{ direction: 'neutral', label: 'View saved jobs' }}
        />
      </div>

      {/* Recent Applications */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-heading font-semibold text-slate-800">Recent Applications</h2>
          <Button variant="ghost" size="sm" asChild className="text-primary-600 hover:text-primary-700 gap-1">
            <Link href="/candidate/applications">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {appsLoading ? (
          <div className="flex items-center justify-center py-10">
            <LoadingSpinner />
          </div>
        ) : recentApplications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center px-4">
            <p className="text-sm text-slate-500">No applications yet.</p>
            <Button variant="link" asChild className="mt-1 text-primary-600 h-auto p-0">
              <Link href="/jobs">Browse jobs to get started →</Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentApplications.map((app) => (
              <div key={app.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {app.job?.title ?? '—'}
                  </p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {app.job?.employer?.companyName ?? '—'}
                    {app.job?.city ? ` · ${app.job.city}` : ''}
                  </p>
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

      {/* Recommended Jobs */}
      {recommendedJobs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-slate-800">Recommended Jobs</h2>
            <Button variant="ghost" size="sm" asChild className="text-primary-600 hover:text-primary-700 gap-1">
              <Link href="/jobs">
                Browse all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendedJobs.map((job) => (
              <JobCard key={job.id} job={job} showSkills />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
