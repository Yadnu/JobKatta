'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCandidate, useUpdateProfileStep } from '@/hooks/useCandidate';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import PersonalInfoStep from './PersonalInfoStep';
import EducationStep from './EducationStep';
import ExperienceStep from './ExperienceStep';
import SkillsStep from './SkillsStep';
import PreferencesStep from './PreferencesStep';

const STEPS = [
  { label: 'Personal Info', description: 'Basic details about you' },
  { label: 'Education', description: 'Your qualifications' },
  { label: 'Experience', description: 'Work history' },
  { label: 'Skills', description: 'Your skill set' },
  { label: 'Preferences', description: 'Job preferences' },
];

interface Props {
  onComplete?: () => void;
}

export default function ProfileWizard({ onComplete }: Props) {
  const [step, setStep] = useState(1);
  const { data: candidate, isLoading } = useCandidate();
  const updateStep = useUpdateProfileStep();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const handleNext = async (data: Record<string, unknown>) => {
    try {
      if (Object.keys(data).length > 0) {
        await updateStep.mutateAsync({ step, data });
      }
      if (step < 5) {
        setStep((s) => s + 1);
      } else {
        if (onComplete) onComplete();
        else router.push('/candidate/dashboard');
      }
    } catch {
      // toast is shown by the mutation
    }
  };

  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step indicator */}
      <ol className="flex items-start mb-8">
        {STEPS.map((s, i) => {
          const idx = i + 1;
          const done = idx < step;
          const active = idx === step;
          return (
            <li key={idx} className={cn('flex items-center', i < STEPS.length - 1 ? 'flex-1' : '')}>
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    'h-8 w-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-colors shrink-0',
                    done
                      ? 'border-primary-500 bg-primary-500 text-white'
                      : active
                      ? 'border-primary-500 bg-white text-primary-600'
                      : 'border-slate-200 bg-white text-slate-400'
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : idx}
                </span>
                <span
                  className={cn(
                    'mt-1.5 text-xs font-medium text-center hidden sm:block',
                    active ? 'text-primary-600' : done ? 'text-slate-600' : 'text-slate-400'
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-px mx-2 mt-[-12px]',
                    done ? 'bg-primary-400' : 'bg-slate-200'
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Step card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-lg font-heading font-semibold text-slate-800">
            Step {step} of 5 — {STEPS[step - 1].label}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">{STEPS[step - 1].description}</p>
        </div>

        {step === 1 && (
          <PersonalInfoStep
            candidate={candidate ?? null}
            onNext={handleNext}
            saving={updateStep.isPending}
          />
        )}
        {step === 2 && (
          <EducationStep
            candidate={candidate ?? null}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        {step === 3 && (
          <ExperienceStep
            candidate={candidate ?? null}
            onNext={handleNext}
            onBack={handleBack}
            saving={updateStep.isPending}
          />
        )}
        {step === 4 && (
          <SkillsStep
            candidate={candidate ?? null}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        {step === 5 && (
          <PreferencesStep
            candidate={candidate ?? null}
            onNext={handleNext}
            onBack={handleBack}
            saving={updateStep.isPending}
          />
        )}
      </div>
    </div>
  );
}
