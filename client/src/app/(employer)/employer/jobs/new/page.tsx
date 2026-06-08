import PageHeader from '@/components/shared/PageHeader';
import PostJobForm from '@/components/employer/steps/PostJobForm';

export default function NewJobPage() {
  return (
    <div className="py-6 px-4">
      <PageHeader
        title="Post a New Job"
        subtitle="Fill in the details to attract the right candidates"
      />
      <PostJobForm mode="create" />
    </div>
  );
}
