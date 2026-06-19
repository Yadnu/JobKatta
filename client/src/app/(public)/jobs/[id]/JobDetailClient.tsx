'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MapPin, Briefcase, Clock, Users, GraduationCap, IndianRupee,
  Globe, Bookmark, Share2, Building2, ArrowLeft, CalendarDays,
  Moon, CheckCircle2,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import SalaryRange from '@/components/shared/SalaryRange';
import SkillBadge from '@/components/shared/SkillBadge';
import { useJob, useSaveJob, useApplyJob } from '@/hooks/useJobs';
import { useAuthStore } from '@/store/authStore';
import { cn, timeAgo, formatDate, getInitials, employmentTypeLabel } from '@/lib/utils';

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Skeleton className="h-6 w-32 mb-6" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

export default function JobDetailClient({ id }: { id: string }) {
  const { data: job, isLoading } = useJob(id);
  const saveJob = useSaveJob();
  const applyJob = useApplyJob();
  const { user, isAuthenticated } = useAuthStore();

  const [applyOpen, setApplyOpen] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [saved, setSaved] = useState(false);

  if (isLoading) return <DetailSkeleton />;
  if (!job) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-700">Job not found</h2>
          <Link href="/jobs" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
            Back to job listings
          </Link>
        </div>
      </div>
    );
  }

  const location = job.isRemote ? 'Remote' : [job.city, job.state].filter(Boolean).join(', ');
  const companyInitials = getInitials(job.employer.companyName);
  const isCandidate = isAuthenticated && user?.role === 'CANDIDATE';

  const handleSave = () => {
    saveJob.mutate(job.id);
    setSaved((s) => !s);
  };

  const handleApply = () => {
    if (!isAuthenticated) {
      window.location.href = `/auth/login?next=/jobs/${id}`;
      return;
    }
    setApplyOpen(true);
  };

  const submitApplication = () => {
    applyJob.mutate(
      { jobId: job.id, coverNote: coverNote.trim() || undefined },
      {
        onSuccess: () => {
          setApplyOpen(false);
          setCoverNote('');
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/jobs"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14 rounded-xl border border-slate-100 flex-shrink-0">
                  <AvatarImage src={job.employer.logoUrl} alt={job.employer.companyName} />
                  <AvatarFallback className="rounded-xl bg-blue-50 text-blue-700 font-semibold">
                    {companyInitials}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-bold text-slate-900">{job.title}</h1>
                  <Link
                    href={`/companies/${job.employerId}`}
                    className="mt-0.5 text-sm text-blue-600 hover:underline font-medium"
                  >
                    {job.employer.companyName}
                  </Link>
                  {job.employer.isVerified && (
                    <span className="ml-2 inline-flex items-center gap-1 text-xs text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                    </span>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSave}
                  disabled={saveJob.isPending}
                  className={cn('flex-shrink-0 text-slate-400 hover:text-blue-600', saved && 'text-blue-600')}
                  aria-label={saved ? 'Unsave job' : 'Save job'}
                >
                  <Bookmark className={cn('h-5 w-5', saved && 'fill-current')} />
                </Button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {location && (
                  <Badge variant="secondary" className="gap-1 text-xs font-normal">
                    <MapPin className="h-3 w-3" /> {location}
                  </Badge>
                )}
                {job.employmentType && (
                  <Badge variant="secondary" className="gap-1 text-xs font-normal">
                    <Briefcase className="h-3 w-3" /> {employmentTypeLabel[job.employmentType] ?? job.employmentType}
                  </Badge>
                )}
                {job.shiftTiming && (
                  <Badge variant="secondary" className="gap-1 text-xs font-normal">
                    <Moon className="h-3 w-3" /> {job.shiftTiming} shift
                  </Badge>
                )}
                <Badge variant="secondary" className="gap-1 text-xs font-normal">
                  <Clock className="h-3 w-3" /> Posted {timeAgo(job.createdAt)}
                </Badge>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <SalaryRange
                  min={job.salaryMin}
                  max={job.salaryMax}
                  hide={job.hideSalary}
                  negotiable={job.isSalaryNegotiable}
                  className="text-sm font-semibold text-slate-800"
                />
              </div>

              <div className="mt-5 flex gap-3">
                <Button onClick={handleApply} className="flex-1 sm:flex-none sm:min-w-[140px]">
                  Apply Now
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigator.clipboard?.writeText(window.location.href)}
                  aria-label="Copy link"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              {job.applicationDeadline && (
                <p className="mt-3 text-xs text-slate-500 flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Apply before {formatDate(job.applicationDeadline)}
                </p>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <h2 className="text-base font-semibold text-slate-900">Job Details</h2>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <Users className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-slate-500 text-xs">Openings</p>
                    <p className="font-medium text-slate-800">{job.openings}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Briefcase className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-slate-500 text-xs">Experience</p>
                    <p className="font-medium text-slate-800">
                      {job.experienceMin === 0 && !job.experienceMax
                        ? 'Fresher / No experience'
                        : job.experienceMax
                        ? `${job.experienceMin}–${job.experienceMax} yrs`
                        : `${job.experienceMin}+ yrs`}
                    </p>
                  </div>
                </div>
                {job.qualification && (
                  <div className="flex items-start gap-2">
                    <GraduationCap className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-slate-500 text-xs">Qualification</p>
                      <p className="font-medium text-slate-800">{job.qualification}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <Building2 className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-slate-500 text-xs">Category</p>
                    <p className="font-medium text-slate-800">{job.category}</p>
                  </div>
                </div>
              </div>

              {job.skills.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((js) => (
                        <SkillBadge key={js.skillId} name={js.skill.name} />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-slate-900">Job Description</h2>
              <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
                {job.description}
              </div>
            </div>

            {job.requirements && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-slate-900">Requirements</h2>
                <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {job.requirements}
                </div>
              </div>
            )}

            {job.hiringProcess && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-slate-900">Hiring Process</h2>
                <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {job.hiringProcess}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-slate-700">About the Company</h2>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12 rounded-xl border border-slate-100">
                  <AvatarImage src={job.employer.logoUrl} alt={job.employer.companyName} />
                  <AvatarFallback className="rounded-xl bg-blue-50 text-blue-700 font-semibold text-sm">
                    {companyInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{job.employer.companyName}</p>
                  <p className="text-xs text-slate-500">{[job.employer.city, job.employer.state].filter(Boolean).join(', ')}</p>
                </div>
              </div>

              {job.employer.isVerified && (
                <div className="mb-3 flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Verified Employer
                </div>
              )}

              <Link href={`/companies/${job.employerId}`}>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Globe className="h-3.5 w-3.5" />
                  View Company Profile
                </Button>
              </Link>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-sm">
              <h2 className="mb-3 text-sm font-semibold text-slate-700">Job Overview</h2>
              <ul className="space-y-2.5 text-slate-600">
                <li className="flex justify-between">
                  <span className="text-slate-500">Posted</span>
                  <span className="font-medium">{formatDate(job.createdAt)}</span>
                </li>
                {job.expiresAt && (
                  <li className="flex justify-between">
                    <span className="text-slate-500">Expires</span>
                    <span className="font-medium">{formatDate(job.expiresAt)}</span>
                  </li>
                )}
                <li className="flex justify-between">
                  <span className="text-slate-500">Openings</span>
                  <span className="font-medium">{job.openings}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-500">Applicants</span>
                  <span className="font-medium">{job.applicationCount}</span>
                </li>
                {job.isRemote && (
                  <li className="flex justify-between">
                    <span className="text-slate-500">Work mode</span>
                    <span className="font-medium text-emerald-600">Remote</span>
                  </li>
                )}
              </ul>
            </div>

            {!isCandidate && (
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 text-sm text-center">
                <p className="text-slate-700 mb-3">
                  {isAuthenticated
                    ? 'Switch to a candidate account to apply'
                    : 'Create a free account to apply for this job'}
                </p>
                <Link href={isAuthenticated ? '/candidate/dashboard' : '/auth/register'}>
                  <Button size="sm" className="w-full">
                    {isAuthenticated ? 'Go to Candidate Dashboard' : 'Register Free'}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Apply for {job.title}</DialogTitle>
            <DialogDescription>
              Your profile and resume will be shared with {job.employer.companyName}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Cover Note <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <Textarea
              placeholder="Tell the employer why you're a great fit for this role…"
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-slate-400">{coverNote.length}/500 characters</p>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setApplyOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitApplication} disabled={applyJob.isPending}>
              {applyJob.isPending ? 'Submitting…' : 'Submit Application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
