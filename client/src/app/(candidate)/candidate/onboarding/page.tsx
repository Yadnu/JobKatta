'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCandidate } from '@/hooks/useCandidate';
import ProfileWizard from '@/components/candidate/profile/ProfileWizard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function OnboardingPage() {
  const router = useRouter();
  const { data: candidate, isLoading } = useCandidate();

  useEffect(() => {
    if (!isLoading && candidate && candidate.profileComplete >= 80) {
      router.replace('/candidate/dashboard');
    }
  }, [isLoading, candidate, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center pb-2">
        <h1 className="text-2xl font-heading font-bold text-slate-800">
          Welcome to JobKatta! 🎉
        </h1>
        <p className="text-slate-500 mt-1 text-sm max-w-md mx-auto">
          Let's set up your profile so employers can find you. It only takes a few minutes.
        </p>
      </div>
      <ProfileWizard onComplete={() => router.push('/candidate/dashboard')} />
    </div>
  );
}
