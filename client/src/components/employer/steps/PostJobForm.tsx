'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { jobPostSchema, type JobPostInput } from '@/lib/validations';
import { useCreateJob, useUpdateJob } from '@/hooks/useEmployer';
import type { Job } from '@/types';
import JobDetailsStep from './JobDetailsStep';
import JobDescriptionStep from './JobDescriptionStep';
import JobPreferencesStep from './JobPreferencesStep';
import JobReviewStep from './JobReviewStep';

const STEPS = [
  { label: 'Details', description: 'Role & location' },
  { label: 'Description', description: 'Job content' },
  { label: 'Preferences', description: 'Salary & skills' },
  { label: 'Review', description: 'Confirm & submit' },
];

// Fields validated at each step before advancing
const STEP_FIELDS: Record<number, (keyof JobPostInput)[]> = {
  1: ['title', 'category', 'employmentType', 'city', 'state'],
  2: ['description'],
  3: ['skills'],
  4: [],
};

function buildDefaults(job?: Partial<Job>): Partial<JobPostInput> {
  if (!job) return { hideSalary: false, isSalaryNegotiable: false, openings: 1, experienceMin: 0, isRemote: false, skills: [] };
  return {
    title: job.title ?? '',
    category: job.category ?? '',
    employmentType: job.employmentType,
    description: job.description ?? '',
    requirements: job.requirements ?? '',
    hiringProcess: job.hiringProcess ?? '',
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    hideSalary: job.hideSalary ?? false,
    isSalaryNegotiable: job.isSalaryNegotiable ?? false,
    openings: job.openings ?? 1,
    experienceMin: job.experienceMin ?? 0,
    experienceMax: job.experienceMax,
    qualification: job.qualification ?? '',
    shiftTiming: job.shiftTiming ?? '',
    city: job.city ?? '',
    state: job.state ?? '',
    pincode: job.pincode ?? '',
    isRemote: job.isRemote ?? false,
    applicationDeadline: job.applicationDeadline ? job.applicationDeadline.split('T')[0] : '',
    skills: job.skills?.map((s) => s.skillId) ?? [],
  };
}

interface Props {
  mode?: 'create' | 'edit';
  jobId?: string;
  initialData?: Partial<Job>;
  onSuccess?: () => void;
}

export default function PostJobForm({ mode = 'create', jobId, initialData, onSuccess }: Props) {
  const [step, setStep] = useState(1);
  const router = useRouter();

  const createJob = useCreateJob();
  const updateJob = useUpdateJob();
  const isPending = createJob.isPending || updateJob.isPending;

  const form = useForm<JobPostInput>({
    resolver: zodResolver(jobPostSchema) as never,
    defaultValues: buildDefaults(initialData),
    mode: 'onTouched',
  });

  // Explicit cast to avoid resolver generic mismatch with @hookform/resolvers v5
  const ctrl = form.control as Control<JobPostInput>;

  const handleNext = async () => {
    const fields = STEP_FIELDS[step];
    const valid = fields.length > 0 ? await form.trigger(fields) : true;
    if (valid) setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async () => {
    const valid = await form.trigger();
    if (!valid) return;

    const data = form.getValues();
    try {
      if (mode === 'edit' && jobId) {
        await updateJob.mutateAsync({ id: jobId, data });
      } else {
        await createJob.mutateAsync(data);
      }
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/employer/jobs');
      }
    } catch {
      // toast handled by the mutation
    }
  };

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
            Step {step} of {STEPS.length} — {STEPS[step - 1].label}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">{STEPS[step - 1].description}</p>
        </div>

        <Form {...form}>
          <form>
            {step === 1 && (
              <JobDetailsStep control={ctrl} onNext={handleNext} />
            )}
            {step === 2 && (
              <JobDescriptionStep
                control={ctrl}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            {step === 3 && (
              <JobPreferencesStep
                control={ctrl}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            {step === 4 && (
              <JobReviewStep
                control={ctrl}
                onBack={handleBack}
                onSubmit={handleSubmit}
                isPending={isPending}
                mode={mode}
              />
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}
