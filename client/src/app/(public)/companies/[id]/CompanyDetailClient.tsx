'use client';

import Link from 'next/link';
import {
  MapPin, Globe, Users, Calendar, Building2, ArrowLeft,
  Mail, Phone, CheckCircle2, Briefcase,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import JobCard from '@/components/shared/JobCard';
import EmptyState from '@/components/shared/EmptyState';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { usePublicEmployer, useJobs } from '@/hooks/useJobs';
import { getInitials } from '@/lib/utils';

function CompanySkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

export default function CompanyDetailClient({ id }: { id: string }) {
  const { data: employer, isLoading: empLoading } = usePublicEmployer(id);
  const { data: jobsData, isLoading: jobsLoading } = useJobs({ employerId: id, limit: 12 });

  if (empLoading) return <CompanySkeleton />;

  if (!employer) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-700">Company not found</h2>
          <Link href="/jobs" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
            Browse all jobs
          </Link>
        </div>
      </div>
    );
  }

  const initials = getInitials(employer.companyName);
  const location = [employer.city, employer.state].filter(Boolean).join(', ');
  const activeJobs = jobsData?.data ?? [];

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
                <Avatar className="h-16 w-16 rounded-xl border border-slate-100 flex-shrink-0">
                  <AvatarImage src={employer.logoUrl} alt={employer.companyName} />
                  <AvatarFallback className="rounded-xl bg-blue-50 text-blue-700 font-bold text-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-bold text-slate-900">{employer.companyName}</h1>
                    {employer.isVerified && (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5">
                        <CheckCircle2 className="h-3 w-3" /> Verified
                      </span>
                    )}
                  </div>

                  {employer.industry && (
                    <p className="mt-0.5 text-sm text-slate-500">{employer.industry}</p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    {location && (
                      <Badge variant="secondary" className="gap-1 text-xs font-normal">
                        <MapPin className="h-3 w-3" /> {location}
                      </Badge>
                    )}
                    {employer.companySize && (
                      <Badge variant="secondary" className="gap-1 text-xs font-normal">
                        <Users className="h-3 w-3" /> {employer.companySize} employees
                      </Badge>
                    )}
                    {employer.foundedYear && (
                      <Badge variant="secondary" className="gap-1 text-xs font-normal">
                        <Calendar className="h-3 w-3" /> Founded {employer.foundedYear}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {employer.website && (
                <div className="mt-4">
                  <a
                    href={employer.website.startsWith('http') ? employer.website : `https://${employer.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    {employer.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>

            {employer.description && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-slate-900">About the Company</h2>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {employer.description}
                </p>
              </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">
                  Active Jobs
                  {jobsData?.pagination && (
                    <span className="ml-2 text-sm font-normal text-slate-400">
                      ({jobsData.pagination.total})
                    </span>
                  )}
                </h2>
              </div>

              {jobsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <LoadingSpinner size="md" />
                </div>
              ) : activeJobs.length === 0 ? (
                <EmptyState
                  icon={Briefcase}
                  title="No active jobs"
                  description="This company has no open positions right now."
                />
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {activeJobs.map((job) => (
                    <JobCard key={job.id} job={job} showSkills />
                  ))}
                </div>
              )}

              {activeJobs.length > 0 && (
                <div className="mt-4 text-center">
                  <Link href={`/jobs?employerId=${id}`}>
                    <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700">
                      View all jobs from {employer.companyName}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-sm">
              <h2 className="mb-4 text-sm font-semibold text-slate-700">Company Details</h2>
              <ul className="space-y-3">
                {employer.industry && (
                  <li className="flex items-start gap-2.5 text-slate-600">
                    <Building2 className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">Industry</p>
                      <p>{employer.industry}</p>
                    </div>
                  </li>
                )}
                {employer.companySize && (
                  <li className="flex items-start gap-2.5 text-slate-600">
                    <Users className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">Company Size</p>
                      <p>{employer.companySize} employees</p>
                    </div>
                  </li>
                )}
                {employer.foundedYear && (
                  <li className="flex items-start gap-2.5 text-slate-600">
                    <Calendar className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">Founded</p>
                      <p>{employer.foundedYear}</p>
                    </div>
                  </li>
                )}
                {location && (
                  <li className="flex items-start gap-2.5 text-slate-600">
                    <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">Location</p>
                      <p>{location}</p>
                    </div>
                  </li>
                )}
              </ul>

              {(employer.companyEmail || employer.contactNumber) && (
                <>
                  <Separator className="my-4" />
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Contact</h3>
                  <ul className="space-y-2.5">
                    {employer.hrName && (
                      <li className="text-slate-600">
                        <p className="text-xs text-slate-400">HR Contact</p>
                        <p className="font-medium">
                          {employer.hrName}
                          {employer.hrDesignation && (
                            <span className="ml-1 font-normal text-slate-500">· {employer.hrDesignation}</span>
                          )}
                        </p>
                      </li>
                    )}
                    {employer.companyEmail && (
                      <li className="flex items-center gap-2 text-slate-600">
                        <Mail className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <a href={`mailto:${employer.companyEmail}`} className="text-blue-600 hover:underline truncate">
                          {employer.companyEmail}
                        </a>
                      </li>
                    )}
                    {employer.contactNumber && (
                      <li className="flex items-center gap-2 text-slate-600">
                        <Phone className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <a href={`tel:${employer.contactNumber}`} className="text-blue-600 hover:underline">
                          {employer.contactNumber}
                        </a>
                      </li>
                    )}
                  </ul>
                </>
              )}
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 text-center">
              <p className="text-sm text-slate-700 mb-3">
                Looking for a job at {employer.companyName}?
              </p>
              <Link href={`/jobs?employerId=${id}`}>
                <Button size="sm" className="w-full gap-2">
                  <Briefcase className="h-3.5 w-3.5" />
                  See All Open Positions
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
