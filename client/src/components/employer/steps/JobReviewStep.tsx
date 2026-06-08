'use client';

import { Control, useWatch } from 'react-hook-form';
import {
  Briefcase,
  MapPin,
  Building2,
  IndianRupee,
  Users,
  Clock,
  GraduationCap,
  CalendarDays,
  FileText,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSkills } from '@/hooks/useJobs';
import { EMPLOYMENT_TYPES } from '@/lib/constants';
import { formatSalaryRange } from '@/lib/utils';
import SkillBadge from '@/components/shared/SkillBadge';
import type { JobPostInput } from '@/lib/validations';

interface Props {
  control: Control<JobPostInput>;
  onBack: () => void;
  onSubmit: () => void;
  isPending: boolean;
  mode: 'create' | 'edit';
}

function ReviewRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <Icon className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <div className="text-sm font-medium text-slate-800 mt-0.5 break-words">{value}</div>
      </div>
    </div>
  );
}

export default function JobReviewStep({ control, onBack, onSubmit, isPending, mode }: Props) {
  const values = useWatch({ control });
  const { data: allSkills = [] } = useSkills();

  const empTypeLabel =
    EMPLOYMENT_TYPES.find((et) => et.value === values.employmentType)?.label ??
    values.employmentType ??
    '—';

  const skillNames = (values.skills ?? [])
    .map((id) => allSkills.find((s) => s.id === id)?.name ?? id)
    .filter(Boolean);

  const salaryDisplay = formatSalaryRange(
    values.salaryMin,
    values.salaryMax,
    values.hideSalary
  );

  const expDisplay =
    values.experienceMin !== undefined
      ? values.experienceMax
        ? `${values.experienceMin}–${values.experienceMax} years`
        : `${values.experienceMin}+ years`
      : null;

  const locationParts = [values.city, values.state, values.pincode].filter(Boolean).join(', ');
  const location = values.isRemote ? `${locationParts} (Remote)` : locationParts;

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500">
        Review your job listing before submitting. It will be sent for admin approval.
      </p>

      {/* Job Details */}
      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Job Details
          </h3>
        </div>
        <div className="px-4 divide-y divide-slate-100">
          <ReviewRow icon={Briefcase} label="Title" value={values.title || '—'} />
          <ReviewRow icon={Building2} label="Category" value={values.category || '—'} />
          <ReviewRow icon={Clock} label="Employment Type" value={empTypeLabel} />
          <ReviewRow icon={MapPin} label="Location" value={location || '—'} />
        </div>
      </div>

      {/* Description */}
      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Description
          </h3>
        </div>
        <div className="px-4 divide-y divide-slate-100">
          <ReviewRow
            icon={FileText}
            label="Job Description"
            value={
              values.description ? (
                <span className="text-slate-600 font-normal line-clamp-3">{values.description}</span>
              ) : null
            }
          />
          {values.requirements && (
            <ReviewRow
              icon={FileText}
              label="Requirements"
              value={
                <span className="text-slate-600 font-normal line-clamp-2">{values.requirements}</span>
              }
            />
          )}
          {values.hiringProcess && (
            <ReviewRow
              icon={FileText}
              label="Hiring Process"
              value={
                <span className="text-slate-600 font-normal">{values.hiringProcess}</span>
              }
            />
          )}
        </div>
      </div>

      {/* Preferences */}
      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Preferences
          </h3>
        </div>
        <div className="px-4 divide-y divide-slate-100">
          <ReviewRow
            icon={IndianRupee}
            label="Salary"
            value={
              <span>
                {salaryDisplay}
                {values.isSalaryNegotiable && !values.hideSalary && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Negotiable
                  </Badge>
                )}
              </span>
            }
          />
          <ReviewRow icon={Users} label="Openings" value={values.openings ?? 1} />
          {expDisplay && (
            <ReviewRow icon={Briefcase} label="Experience Required" value={expDisplay} />
          )}
          {values.qualification && (
            <ReviewRow icon={GraduationCap} label="Qualification" value={values.qualification} />
          )}
          {values.shiftTiming && (
            <ReviewRow icon={Clock} label="Shift Timing" value={values.shiftTiming} />
          )}
          {values.applicationDeadline && (
            <ReviewRow
              icon={CalendarDays}
              label="Application Deadline"
              value={new Date(values.applicationDeadline).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            />
          )}
          {skillNames.length > 0 && (
            <ReviewRow
              icon={Wrench}
              label={`Skills (${skillNames.length})`}
              value={
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {skillNames.map((name) => (
                    <SkillBadge key={name} name={name} />
                  ))}
                </div>
              }
            />
          )}
        </div>
      </div>

      <div className="flex justify-between pt-2 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onBack} disabled={isPending}>
          Back
        </Button>
        <Button type="button" onClick={onSubmit} disabled={isPending}>
          {isPending
            ? mode === 'edit'
              ? 'Updating…'
              : 'Submitting…'
            : mode === 'edit'
            ? 'Update Job'
            : 'Submit for Approval'}
        </Button>
      </div>
    </div>
  );
}
