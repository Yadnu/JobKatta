'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bookmark } from 'lucide-react';
import { useSavedJobs } from '@/hooks/useCandidate';
import JobCard from '@/components/shared/JobCard';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import Pagination from '@/components/shared/Pagination';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import type { Job, ApiResponse } from '@/types';

export default function SavedJobsPage() {
  const [page, setPage] = useState(1);
  const router = useRouter();

  const { data, isLoading } = useSavedJobs(page);

  const response = data as ApiResponse<Job[]> | undefined;
  const savedJobs: Job[] = response?.data ?? [];
  const pagination = response?.pagination;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Saved Jobs"
        subtitle="Jobs you've bookmarked for later."
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <LoadingSpinner size="lg" />
        </div>
      ) : savedJobs.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved jobs"
          description="Save jobs you're interested in to find them quickly later."
          actionLabel="Browse Jobs"
          onAction={() => router.push('/jobs')}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {savedJobs.map((job) => (
            <JobCard key={job.id} job={job} saved showSkills />
          ))}
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <Pagination page={page} pages={pagination.pages} onPageChange={setPage} className="mt-4" />
      )}
    </div>
  );
}
