'use client';

import { useParams } from 'next/navigation';
import { useJob } from '@/hooks/useJobs';
import PageHeader from '@/components/shared/PageHeader';
import PostJobForm from '@/components/employer/steps/PostJobForm';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function EditJobPage() {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading } = useJob(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="py-12 text-center text-slate-500">Job not found.</div>
    );
  }

  return (
    <div className="py-6 px-4">
      <PageHeader
        title="Edit Job"
        subtitle={`Editing: ${job.title}`}
      />
      <PostJobForm mode="edit" jobId={id} initialData={job} />
    </div>
  );
}
