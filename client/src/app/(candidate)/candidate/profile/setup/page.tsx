import ProfileWizard from '@/components/candidate/profile/ProfileWizard';
import PageHeader from '@/components/shared/PageHeader';

export default function ProfileSetupPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Set Up Your Profile"
        subtitle="Complete your profile to stand out to employers and unlock more applications."
      />
      <ProfileWizard />
    </div>
  );
}
