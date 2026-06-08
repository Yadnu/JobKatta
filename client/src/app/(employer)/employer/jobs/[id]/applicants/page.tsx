'use client';

import { useParams } from 'next/navigation';
import { useJob } from '@/hooks/useJobs';
import { useJobApplicants, useUpdateApplicationStatus, useUnlockContact } from '@/hooks/useEmployer';
import { ApplicationStatusBadge } from '@/components/shared/StatusBadge';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { MapPin, Briefcase, Phone, Mail, FileText, Lock, ExternalLink } from 'lucide-react';
import { formatDate, getInitials } from '@/lib/utils';
import type { Application, ApplicationStatus } from '@/types';

const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: 'APPLIED', label: 'Applied' },
  { value: 'VIEWED', label: 'Viewed' },
  { value: 'SHORTLISTED', label: 'Shortlisted' },
  { value: 'INTERVIEWING', label: 'Interviewing' },
  { value: 'HIRED', label: 'Hired' },
  { value: 'REJECTED', label: 'Rejected' },
];

function ApplicantCard({ app }: { app: Application }) {
  const updateStatus = useUpdateApplicationStatus();
  const unlockContact = useUnlockContact();

  const candidate = app.candidate;
  const fullName = [candidate?.firstName, candidate?.lastName].filter(Boolean).join(' ') || 'Candidate';
  const location = [candidate?.city, candidate?.state].filter(Boolean).join(', ');

  const handleStatusChange = (status: string) => {
    updateStatus.mutate({ id: app.id, status });
  };

  const handleUnlock = () => {
    unlockContact.mutate(app.id);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 rounded-xl border border-slate-200">
            <AvatarImage src={candidate?.photoUrl} alt={fullName} />
            <AvatarFallback className="rounded-xl bg-primary-100 text-primary-700 font-bold">
              {getInitials(fullName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm text-slate-800">{fullName}</p>
            {location && (
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {location}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <ApplicationStatusBadge status={app.status} />
          <Select
            value={app.status}
            onValueChange={handleStatusChange}
            disabled={updateStatus.isPending}
          >
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Candidate details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
        {(candidate?.totalExperienceYrs ?? 0) > 0 && (
          <div className="flex items-center gap-2">
            <Briefcase className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
            <span>{candidate?.totalExperienceYrs} yr{candidate?.totalExperienceYrs !== 1 ? 's' : ''} experience</span>
          </div>
        )}
        {candidate?.isFresher && (
          <div className="flex items-center gap-2">
            <Briefcase className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
            <span>Fresher</span>
          </div>
        )}
      </div>

      {/* Skills */}
      {candidate?.skills && candidate.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {candidate.skills.slice(0, 6).map((cs) => (
            <span
              key={cs.skillId}
              className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 font-medium"
            >
              {cs.skill.name}
            </span>
          ))}
          {candidate.skills.length > 6 && (
            <span className="text-xs text-slate-400">+{candidate.skills.length - 6} more</span>
          )}
        </div>
      )}

      {/* Cover note */}
      {app.coverNote && (
        <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
          <p className="text-xs font-medium text-slate-500 mb-1">Cover Note</p>
          <p className="text-sm text-slate-700 leading-relaxed">{app.coverNote}</p>
        </div>
      )}

      {/* Action row */}
      <div className="flex items-center justify-between gap-3 flex-wrap pt-1 border-t border-slate-100">
        <span className="text-xs text-slate-400">
          Applied {formatDate(app.createdAt)}
        </span>

        <div className="flex items-center gap-2">
          {app.resumeUrl && (
            <Button variant="outline" size="sm" asChild className="gap-1.5 h-8 text-xs">
              <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer">
                <FileText className="h-3.5 w-3.5" />
                Resume
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            </Button>
          )}

          {app.contactUnlocked ? (
            <div className="flex items-center gap-3">
              {candidate?.mobile && (
                <a
                  href={`tel:${candidate.mobile}`}
                  className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {candidate.mobile}
                </a>
              )}
              {candidate?.email && (
                <a
                  href={`mailto:${candidate.email}`}
                  className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {candidate.email}
                </a>
              )}
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 h-8 text-xs"
              onClick={handleUnlock}
              disabled={unlockContact.isPending}
            >
              <Lock className="h-3.5 w-3.5" />
              {unlockContact.isPending ? 'Unlocking…' : 'Unlock Contact'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function JobApplicantsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading: jobLoading } = useJob(id);
  const { data: applicants, isLoading: appsLoading } = useJobApplicants(id);

  const isLoading = jobLoading || appsLoading;
  const apps: Application[] = applicants ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={job ? `Applicants — ${job.title}` : 'Applicants'}
        subtitle={
          job
            ? `${job.city} · ${apps.length} applicant${apps.length !== 1 ? 's' : ''}`
            : undefined
        }
      />

      {apps.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-12 text-center">
          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <Briefcase className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-700">No applicants yet</p>
          <p className="text-xs text-slate-500 mt-1">
            Candidates who apply to this job will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {apps.map((app) => (
            <ApplicantCard key={app.id} app={app} />
          ))}
        </div>
      )}
    </div>
  );
}
