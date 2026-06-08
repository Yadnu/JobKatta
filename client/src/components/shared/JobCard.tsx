'use client';

import Link from 'next/link';
import { Bookmark, MapPin, Briefcase, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, timeAgo, getInitials, employmentTypeLabel } from '@/lib/utils';
import SalaryRange from './SalaryRange';
import SkillBadge from './SkillBadge';
import { useSaveJob } from '@/hooks/useJobs';
import type { Job } from '@/types';

interface Props {
  job: Job;
  saved?: boolean;
  className?: string;
  showSkills?: boolean;
}

export default function JobCard({ job, saved = false, className, showSkills = false }: Props) {
  const saveJob = useSaveJob();

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    saveJob.mutate(job.id);
  };

  const companyInitials = getInitials(job.employer.companyName);
  const location = job.isRemote
    ? 'Remote'
    : [job.city, job.state].filter(Boolean).join(', ');

  return (
    <Link
      href={`/jobs/${job.id}`}
      className={cn(
        'group block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-11 w-11 rounded-lg border border-slate-100 flex-shrink-0">
          <AvatarImage src={job.employer.logoUrl} alt={job.employer.companyName} />
          <AvatarFallback className="rounded-lg bg-blue-50 text-blue-700 text-sm font-semibold">
            {companyInitials}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                {job.title}
              </h3>
              <p className="mt-0.5 truncate text-xs text-slate-500">{job.employer.companyName}</p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8 flex-shrink-0 text-slate-400 hover:text-blue-600',
                saved && 'text-blue-600'
              )}
              onClick={handleSave}
              disabled={saveJob.isPending}
              aria-label={saved ? 'Unsave job' : 'Save job'}
            >
              <Bookmark className={cn('h-4 w-4', saved && 'fill-current')} />
            </Button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            {location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {location}
              </span>
            )}
            {job.employmentType && (
              <span className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                {employmentTypeLabel[job.employmentType] ?? job.employmentType}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {timeAgo(job.createdAt)}
            </span>
          </div>

          <div className="mt-2">
            <SalaryRange
              min={job.salaryMin}
              max={job.salaryMax}
              hide={job.hideSalary}
              negotiable={job.isSalaryNegotiable}
              className="text-xs"
            />
          </div>

          {showSkills && job.skills.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {job.skills.slice(0, 4).map((js) => (
                <SkillBadge key={js.skillId} name={js.skill.name} />
              ))}
              {job.skills.length > 4 && (
                <span className="text-xs text-slate-400">+{job.skills.length - 4} more</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
