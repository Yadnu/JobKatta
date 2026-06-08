'use client';

import { useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Pencil, Camera, GraduationCap, Briefcase, Plus, Trash2,
  MapPin, Phone, Mail, Globe, Linkedin, Github, FileText,
  Check, X, ChevronsUpDown, Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useCandidate, useUpdateProfile,
  useAddEducation, useUpdateEducation, useDeleteEducation,
  useAddExperience, useUpdateExperience, useDeleteExperience,
  useUpdateSkills, useToggleOpenToWork,
} from '@/hooks/useCandidate';
import { useSkills } from '@/hooks/useJobs';
import {
  profileStep1Schema, educationSchema, experienceSchema,
  type EducationInput, type ExperienceInput,
} from '@/lib/validations';
import { INDIAN_STATES, EMPLOYMENT_TYPES } from '@/lib/constants';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import ConfirmModal from '@/components/shared/ConfirmModal';
import SkillBadge from '@/components/shared/SkillBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import PageHeader from '@/components/shared/PageHeader';
import { cn, formatDate, formatINR, getInitials } from '@/lib/utils';
import api from '@/lib/api';
import type { Candidate, Education, Experience, Skill, ApiResponse } from '@/types';
import type { z } from 'zod';

type PersonalInput = z.infer<typeof profileStep1Schema>;
const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'] as const;

// ────────────────────────────────────────────────────────────────────────────
// Helper: Section wrapper
// ────────────────────────────────────────────────────────────────────────────
function Section({
  title, children, onEdit, editing,
}: {
  title: string;
  children: React.ReactNode;
  onEdit?: () => void;
  editing?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h2 className="font-heading font-semibold text-slate-800">{title}</h2>
        {onEdit && !editing && (
          <Button variant="ghost" size="sm" onClick={onEdit} className="gap-1.5 text-slate-600 hover:text-slate-900">
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Profile Photo + Header
// ────────────────────────────────────────────────────────────────────────────
function ProfileHeader({ candidate }: { candidate: Candidate }) {
  const updateProfile = useUpdateProfile();
  const toggleOtW = useToggleOpenToWork();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const res = await api.post<ApiResponse<{ photoUrl: string }>>('/upload/photo', formData);
      await updateProfile.mutateAsync({ photoUrl: res.data.data.photoUrl } as Partial<Candidate>);
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const fullName = `${candidate.firstName} ${candidate.lastName}`;
  const location = [candidate.city, candidate.state].filter(Boolean).join(', ');

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
      <div className="flex flex-col sm:flex-row gap-5 items-start">
        {/* Photo */}
        <div className="relative flex-shrink-0">
          <Avatar className="h-20 w-20 rounded-xl border-2 border-slate-200">
            <AvatarImage src={candidate.photoUrl} alt={fullName} />
            <AvatarFallback className="rounded-xl bg-primary-100 text-primary-700 text-2xl font-bold">
              {getInitials(fullName)}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={handlePhotoClick}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
            aria-label="Change photo"
          >
            {uploading ? (
              <LoadingSpinner size="sm" className="h-3 w-3" />
            ) : (
              <Camera className="h-3.5 w-3.5 text-slate-600" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start gap-2">
            <h1 className="text-xl font-heading font-bold text-slate-900">{fullName}</h1>
            <button
              onClick={() => toggleOtW.mutate()}
              disabled={toggleOtW.isPending}
              className={cn(
                'flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border transition-colors',
                candidate.openToWork
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
              )}
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  candidate.openToWork ? 'bg-emerald-500' : 'bg-slate-400'
                )}
              />
              {candidate.openToWork ? 'Open to Work' : 'Not Looking'}
            </button>
          </div>

          {location && (
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> {location}
            </p>
          )}
          {candidate.bio && (
            <p className="text-sm text-slate-600 mt-2 line-clamp-2">{candidate.bio}</p>
          )}

          {/* Profile completion */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Profile completion</span>
              <span className="font-medium">{candidate.profileComplete}%</span>
            </div>
            <Progress value={candidate.profileComplete} className="h-1.5" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Personal Info Section
// ────────────────────────────────────────────────────────────────────────────
function PersonalInfoSection({ candidate }: { candidate: Candidate }) {
  const [editing, setEditing] = useState(false);
  const updateProfile = useUpdateProfile();

  const form = useForm<PersonalInput>({
    resolver: zodResolver(profileStep1Schema),
    defaultValues: {
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      gender: (candidate.gender as PersonalInput['gender']) ?? undefined,
      mobile: candidate.mobile ?? '',
      city: candidate.city,
      state: candidate.state,
      pincode: candidate.pincode ?? '',
      addressLine1: candidate.addressLine1 ?? '',
      dob: candidate.dob ? candidate.dob.split('T')[0] : '',
    },
  });

  const onSubmit = async (data: PersonalInput) => {
    await updateProfile.mutateAsync(data as Partial<Candidate>);
    setEditing(false);
  };

  if (!editing) {
    return (
      <Section title="Personal Information" onEdit={() => setEditing(true)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
          <InfoRow label="First Name" value={candidate.firstName} />
          <InfoRow label="Last Name" value={candidate.lastName} />
          <InfoRow label="Gender" value={candidate.gender} />
          <InfoRow label="Date of Birth" value={candidate.dob ? formatDate(candidate.dob) : undefined} />
          <InfoRow label="Mobile" value={candidate.mobile} icon={<Phone className="h-3.5 w-3.5" />} />
          <InfoRow label="Email" value={candidate.email} icon={<Mail className="h-3.5 w-3.5" />} />
          <InfoRow label="City" value={candidate.city} />
          <InfoRow label="State" value={candidate.state} />
          <InfoRow label="Pincode" value={candidate.pincode} />
          <InfoRow label="Address" value={candidate.addressLine1} />
        </div>
      </Section>
    );
  }

  return (
    <Section title="Personal Information" editing>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField control={form.control} name="firstName" render={({ field }) => (
              <FormItem><FormLabel>First Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="lastName" render={({ field }) => (
              <FormItem><FormLabel>Last Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>

          <FormField control={form.control} name="gender" render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <FormControl>
                <RadioGroup value={field.value ?? ''} onValueChange={field.onChange} className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
                  {GENDERS.map((g) => (
                    <div key={g} className="flex items-center gap-2">
                      <RadioGroupItem value={g} id={`g-${g}`} />
                      <Label htmlFor={`g-${g}`} className="font-normal text-sm cursor-pointer">{g}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
            </FormItem>
          )} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField control={form.control} name="dob" render={({ field }) => (
              <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="mobile" render={({ field }) => (
              <FormItem><FormLabel>Mobile</FormLabel><FormControl><Input placeholder="10-digit number" maxLength={10} {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField control={form.control} name="city" render={({ field }) => (
              <FormItem><FormLabel>City *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="state" render={({ field }) => (
              <FormItem>
                <FormLabel>State *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger></FormControl>
                  <SelectContent className="max-h-64">
                    {INDIAN_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField control={form.control} name="pincode" render={({ field }) => (
              <FormItem><FormLabel>Pincode</FormLabel><FormControl><Input maxLength={6} {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="addressLine1" render={({ field }) => (
              <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
    </Section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Bio & Links Section
// ────────────────────────────────────────────────────────────────────────────
function BioLinksSection({ candidate }: { candidate: Candidate }) {
  const [editing, setEditing] = useState(false);
  const updateProfile = useUpdateProfile();
  const [bio, setBio] = useState(candidate.bio ?? '');
  const [portfolio, setPortfolio] = useState(candidate.portfolioUrl ?? '');
  const [linkedin, setLinkedin] = useState(candidate.linkedinUrl ?? '');
  const [github, setGithub] = useState(candidate.githubUrl ?? '');
  const [resume, setResume] = useState(candidate.resumeUrl ?? '');

  const handleSave = async () => {
    await updateProfile.mutateAsync({
      bio: bio || undefined,
      portfolioUrl: portfolio || undefined,
      linkedinUrl: linkedin || undefined,
      githubUrl: github || undefined,
      resumeUrl: resume || undefined,
    } as Partial<Candidate>);
    setEditing(false);
  };

  if (!editing) {
    return (
      <Section title="Bio & Links" onEdit={() => setEditing(true)}>
        <div className="space-y-3">
          {candidate.bio ? (
            <p className="text-sm text-slate-700 leading-relaxed">{candidate.bio}</p>
          ) : (
            <p className="text-sm text-slate-400 italic">No bio added yet.</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <LinkRow icon={<Globe className="h-3.5 w-3.5" />} label="Portfolio" value={candidate.portfolioUrl} />
            <LinkRow icon={<Linkedin className="h-3.5 w-3.5" />} label="LinkedIn" value={candidate.linkedinUrl} />
            <LinkRow icon={<Github className="h-3.5 w-3.5" />} label="GitHub" value={candidate.githubUrl} />
            <LinkRow icon={<FileText className="h-3.5 w-3.5" />} label="Resume" value={candidate.resumeUrl} />
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section title="Bio & Links" editing>
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Bio</Label>
          <Textarea
            className="mt-1.5 resize-none"
            rows={3}
            placeholder="Write a short bio about yourself…"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={500}
          />
          <p className="mt-1 text-xs text-slate-400">{bio.length}/500</p>
        </div>
        {[
          { label: 'Portfolio URL', value: portfolio, onChange: setPortfolio, placeholder: 'https://yourportfolio.com' },
          { label: 'LinkedIn URL', value: linkedin, onChange: setLinkedin, placeholder: 'https://linkedin.com/in/...' },
          { label: 'GitHub URL', value: github, onChange: setGithub, placeholder: 'https://github.com/...' },
          { label: 'Resume URL', value: resume, onChange: setResume, placeholder: 'https://drive.google.com/...' },
        ].map(({ label, value, onChange, placeholder }) => (
          <div key={label}>
            <Label className="text-sm font-medium">{label}</Label>
            <Input className="mt-1.5" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
          </div>
        ))}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={updateProfile.isPending}>
            {updateProfile.isPending ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Education Section
// ────────────────────────────────────────────────────────────────────────────
const EMPTY_EDU: EducationInput = {
  degree: '', institution: '', fieldOfStudy: '', board: '',
  percentage: undefined, startYear: new Date().getFullYear() - 4, endYear: undefined, isCurrently: false,
};

function EducationSection({ candidate }: { candidate: Candidate }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Education | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const addEdu = useAddEducation();
  const updateEdu = useUpdateEducation();
  const deleteEdu = useDeleteEducation();

  const form = useForm<EducationInput>({
    resolver: zodResolver(educationSchema),
    defaultValues: EMPTY_EDU,
  });
  const isCurrently = form.watch('isCurrently');

  const openAdd = () => { form.reset(EMPTY_EDU); setEditItem(null); setDialogOpen(true); };
  const openEdit = (edu: Education) => {
    form.reset({
      degree: edu.degree, institution: edu.institution,
      fieldOfStudy: edu.fieldOfStudy ?? '', board: edu.board ?? '',
      percentage: edu.percentage ?? undefined,
      startYear: edu.startYear, endYear: edu.endYear ?? undefined, isCurrently: edu.isCurrently,
    });
    setEditItem(edu); setDialogOpen(true);
  };

  const onSubmit = async (data: EducationInput) => {
    const payload = { ...data, endYear: data.isCurrently ? undefined : data.endYear };
    if (editItem) await updateEdu.mutateAsync({ id: editItem.id, data: payload });
    else await addEdu.mutateAsync(payload);
    setDialogOpen(false);
  };

  const educations = candidate.educations ?? [];
  const isSaving = addEdu.isPending || updateEdu.isPending;

  return (
    <Section title="Education">
      <div className="space-y-3">
        {educations.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No education added yet.</p>
        ) : (
          educations.map((edu) => (
            <div key={edu.id} className="flex items-start justify-between p-4 rounded-lg border border-slate-200 bg-slate-50">
              <div className="min-w-0">
                <p className="font-medium text-sm text-slate-800">
                  {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                </p>
                <p className="text-sm text-slate-500 mt-0.5">
                  {edu.institution}{edu.board ? ` · ${edu.board}` : ''}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {edu.startYear} – {edu.isCurrently ? 'Present' : edu.endYear ?? ''}
                  {edu.percentage ? ` · ${edu.percentage}%` : ''}
                </p>
              </div>
              <div className="flex gap-1 flex-shrink-0 ml-3">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(edu)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:bg-red-50" onClick={() => setDeleteId(edu.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
        <Button variant="outline" size="sm" onClick={openAdd} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Education
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(v) => !v && setDialogOpen(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editItem ? 'Edit Education' : 'Add Education'}</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField control={form.control} name="degree" render={({ field }) => (
                <FormItem><FormLabel>Degree *</FormLabel><FormControl><Input placeholder="e.g. B.Tech, 12th Grade, MBA" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="fieldOfStudy" render={({ field }) => (
                  <FormItem><FormLabel>Field of Study</FormLabel><FormControl><Input placeholder="Computer Science" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="institution" render={({ field }) => (
                  <FormItem><FormLabel>Institution *</FormLabel><FormControl><Input placeholder="College / school name" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="board" render={({ field }) => (
                <FormItem><FormLabel>Board / University</FormLabel><FormControl><Input placeholder="e.g. CBSE, Mumbai University" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-3 gap-3">
                <FormField control={form.control} name="startYear" render={({ field }) => (
                  <FormItem><FormLabel>Start *</FormLabel><FormControl>
                    <Input type="number" min={1980} max={new Date().getFullYear()} placeholder="2018" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="endYear" render={({ field }) => (
                  <FormItem><FormLabel>End</FormLabel><FormControl>
                    <Input type="number" min={1980} max={new Date().getFullYear() + 5} placeholder="2022" disabled={isCurrently}
                      value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                  </FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="percentage" render={({ field }) => (
                  <FormItem><FormLabel>Score %</FormLabel><FormControl>
                    <Input type="number" min={0} max={100} step={0.1} placeholder="75"
                      value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                  </FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="isCurrently" render={({ field }) => (
                <FormItem className="flex items-center gap-2.5 space-y-0">
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  <FormLabel className="font-normal cursor-pointer">Currently studying here</FormLabel>
                </FormItem>
              )} />
              <DialogFooter className="gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving…' : editItem ? 'Update' : 'Add'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) deleteEdu.mutate(deleteId); setDeleteId(null); }}
        title="Delete Education"
        description="Remove this education entry? This cannot be undone."
        confirmLabel="Delete"
        loading={deleteEdu.isPending}
      />
    </Section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Experience Section
// ────────────────────────────────────────────────────────────────────────────
const EMPTY_EXP: ExperienceInput = {
  jobTitle: '', companyName: '', city: '', employmentType: undefined,
  startDate: '', endDate: '', isCurrent: false, description: '',
};

function ExperienceSection({ candidate }: { candidate: Candidate }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Experience | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const addExp = useAddExperience();
  const updateExp = useUpdateExperience();
  const deleteExp = useDeleteExperience();

  const form = useForm<ExperienceInput>({
    resolver: zodResolver(experienceSchema),
    defaultValues: EMPTY_EXP,
  });
  const isCurrent = form.watch('isCurrent');

  const openAdd = () => { form.reset(EMPTY_EXP); setEditItem(null); setDialogOpen(true); };
  const openEdit = (exp: Experience) => {
    form.reset({
      jobTitle: exp.jobTitle, companyName: exp.companyName, city: exp.city ?? '',
      employmentType: exp.employmentType ?? undefined,
      startDate: exp.startDate.split('T')[0],
      endDate: exp.endDate ? exp.endDate.split('T')[0] : '',
      isCurrent: exp.isCurrent, description: exp.description ?? '',
    });
    setEditItem(exp); setDialogOpen(true);
  };

  const onSubmit = async (data: ExperienceInput) => {
    const payload = { ...data, endDate: data.isCurrent ? undefined : data.endDate || undefined };
    if (editItem) await updateExp.mutateAsync({ id: editItem.id, data: payload });
    else await addExp.mutateAsync(payload);
    setDialogOpen(false);
  };

  const experiences = candidate.experiences ?? [];
  const isSaving = addExp.isPending || updateExp.isPending;

  return (
    <Section title="Experience">
      <div className="space-y-3">
        {experiences.length === 0 ? (
          <p className="text-sm text-slate-400 italic">
            {candidate.isFresher ? 'Marked as fresher — no work experience.' : 'No experience added yet.'}
          </p>
        ) : (
          experiences.map((exp) => (
            <div key={exp.id} className="flex items-start justify-between p-4 rounded-lg border border-slate-200 bg-slate-50">
              <div className="min-w-0">
                <p className="font-medium text-sm text-slate-800">{exp.jobTitle}</p>
                <p className="text-sm text-slate-500 mt-0.5">
                  {exp.companyName}{exp.city ? ` · ${exp.city}` : ''}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {formatDate(exp.startDate)} – {exp.isCurrent ? 'Present' : exp.endDate ? formatDate(exp.endDate) : ''}
                </p>
                {exp.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{exp.description}</p>
                )}
              </div>
              <div className="flex gap-1 flex-shrink-0 ml-3">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(exp)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:bg-red-50" onClick={() => setDeleteId(exp.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
        <Button variant="outline" size="sm" onClick={openAdd} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Experience
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(v) => !v && setDialogOpen(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editItem ? 'Edit Experience' : 'Add Experience'}</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="jobTitle" render={({ field }) => (
                  <FormItem><FormLabel>Job Title *</FormLabel><FormControl><Input placeholder="e.g. Sales Executive" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="companyName" render={({ field }) => (
                  <FormItem><FormLabel>Company *</FormLabel><FormControl><Input placeholder="Company name" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="city" render={({ field }) => (
                  <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="e.g. Pune" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="employmentType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select value={field.value ?? ''} onValueChange={field.onChange}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {EMPLOYMENT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="startDate" render={({ field }) => (
                  <FormItem><FormLabel>Start Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="endDate" render={({ field }) => (
                  <FormItem><FormLabel>End Date</FormLabel><FormControl><Input type="date" disabled={isCurrent} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="isCurrent" render={({ field }) => (
                <FormItem className="flex items-center gap-2.5 space-y-0">
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  <FormLabel className="font-normal cursor-pointer">I currently work here</FormLabel>
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl>
                  <Textarea placeholder="Brief description of your role…" rows={3} className="resize-none" {...field} />
                </FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter className="gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving…' : editItem ? 'Update' : 'Add'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) deleteExp.mutate(deleteId); setDeleteId(null); }}
        title="Delete Experience"
        description="Remove this experience? This cannot be undone."
        confirmLabel="Delete"
        loading={deleteExp.isPending}
      />
    </Section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Skills Section
// ────────────────────────────────────────────────────────────────────────────
function SkillsSection({ candidate }: { candidate: Candidate }) {
  const [editing, setEditing] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selected, setSelected] = useState<Skill[]>((candidate.skills ?? []).map((cs) => cs.skill));
  const { data: allSkills = [] } = useSkills();
  const updateSkills = useUpdateSkills();

  const toggle = useCallback((skill: Skill) => {
    setSelected((prev) =>
      prev.some((s) => s.id === skill.id) ? prev.filter((s) => s.id !== skill.id) : [...prev, skill]
    );
  }, []);

  const handleSave = async () => {
    await updateSkills.mutateAsync(selected.map((s) => s.id));
    setEditing(false);
  };

  const handleCancel = () => {
    setSelected((candidate.skills ?? []).map((cs) => cs.skill));
    setEditing(false);
  };

  const available = allSkills.filter((sk) => !selected.some((s) => s.id === sk.id));

  return (
    <Section title="Skills" onEdit={!editing ? () => setEditing(true) : undefined} editing={editing}>
      <div className="space-y-4">
        {selected.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No skills added yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selected.map((skill) => (
              <SkillBadge
                key={skill.id}
                name={skill.name}
                onRemove={editing ? () => setSelected((prev) => prev.filter((s) => s.id !== skill.id)) : undefined}
              />
            ))}
          </div>
        )}

        {editing && (
          <>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto justify-between font-normal text-slate-500" role="combobox">
                  <span className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-slate-400" />
                    Search and add skills…
                  </span>
                  <ChevronsUpDown className="h-4 w-4 ml-2 text-slate-400 shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Type a skill name…" />
                  <CommandList>
                    <CommandEmpty>No skills found.</CommandEmpty>
                    <CommandGroup>
                      {available.map((skill) => (
                        <CommandItem key={skill.id} value={skill.name} onSelect={() => { toggle(skill); setPopoverOpen(false); }}>
                          {skill.name}
                          {skill.category && <span className="ml-auto text-xs text-slate-400">{skill.category}</span>}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button onClick={handleSave} disabled={updateSkills.isPending}>
                {updateSkills.isPending ? 'Saving…' : 'Save Skills'}
              </Button>
            </div>
          </>
        )}
      </div>
    </Section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Preferences Section
// ────────────────────────────────────────────────────────────────────────────
function PreferencesSection({ candidate }: { candidate: Candidate }) {
  const [editing, setEditing] = useState(false);
  const updateProfile = useUpdateProfile();
  const [preferredRoles, setPreferredRoles] = useState(candidate.preferredRoles ?? '');
  const [preferredCities, setPreferredCities] = useState(candidate.preferredCities ?? '');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    candidate.preferredEmpType ? candidate.preferredEmpType.split(',').map((s) => s.trim()).filter(Boolean) : []
  );
  const [salaryMin, setSalaryMin] = useState(candidate.expectedSalaryMin?.toString() ?? '');
  const [salaryMax, setSalaryMax] = useState(candidate.expectedSalaryMax?.toString() ?? '');

  const toggleType = (value: string) =>
    setSelectedTypes((prev) => prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]);

  const handleSave = async () => {
    await updateProfile.mutateAsync({
      preferredRoles: preferredRoles || undefined,
      preferredCities: preferredCities || undefined,
      preferredEmpType: selectedTypes.length > 0 ? selectedTypes.join(', ') : undefined,
      expectedSalaryMin: salaryMin ? Number(salaryMin) : undefined,
      expectedSalaryMax: salaryMax ? Number(salaryMax) : undefined,
    } as Partial<Candidate>);
    setEditing(false);
  };

  if (!editing) {
    return (
      <Section title="Job Preferences" onEdit={() => setEditing(true)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
          <InfoRow label="Preferred Roles" value={candidate.preferredRoles} />
          <InfoRow label="Preferred Cities" value={candidate.preferredCities} />
          <InfoRow
            label="Employment Type"
            value={candidate.preferredEmpType || undefined}
          />
          <InfoRow
            label="Expected Salary"
            value={
              candidate.expectedSalaryMin || candidate.expectedSalaryMax
                ? `${candidate.expectedSalaryMin ? formatINR(candidate.expectedSalaryMin) : '—'} – ${candidate.expectedSalaryMax ? formatINR(candidate.expectedSalaryMax) : '—'} / month`
                : undefined
            }
          />
        </div>
      </Section>
    );
  }

  return (
    <Section title="Job Preferences" editing>
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Preferred Job Roles</Label>
          <Input className="mt-1.5" placeholder="e.g. Sales Executive, BDE" value={preferredRoles} onChange={(e) => setPreferredRoles(e.target.value)} />
          <p className="mt-1 text-xs text-slate-400">Separate with commas.</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Preferred Cities</Label>
          <Input className="mt-1.5" placeholder="e.g. Mumbai, Pune, Nashik" value={preferredCities} onChange={(e) => setPreferredCities(e.target.value)} />
          <p className="mt-1 text-xs text-slate-400">Separate with commas.</p>
        </div>
        <div>
          <p className="text-sm font-medium mb-2">Preferred Employment Type</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2.5">
            {EMPLOYMENT_TYPES.map((t) => (
              <div key={t.value} className="flex items-center gap-2">
                <Checkbox id={`et-${t.value}`} checked={selectedTypes.includes(t.value)} onCheckedChange={() => toggleType(t.value)} />
                <Label htmlFor={`et-${t.value}`} className="font-normal cursor-pointer text-sm">{t.label}</Label>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Expected Salary Min (₹/month)</Label>
            <Input className="mt-1.5" type="number" min={0} step={1000} placeholder="15000" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} />
          </div>
          <div>
            <Label className="text-sm font-medium">Expected Salary Max (₹/month)</Label>
            <Input className="mt-1.5" type="number" min={0} step={1000} placeholder="30000" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={updateProfile.isPending}>
            {updateProfile.isPending ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Small display helpers
// ────────────────────────────────────────────────────────────────────────────
function InfoRow({ label, value, icon }: { label: string; value?: string | null; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
      <p className={cn('mt-0.5 text-sm', value ? 'text-slate-700' : 'text-slate-400 italic')}>
        {icon && <span className="inline-flex mr-1 align-middle opacity-60">{icon}</span>}
        {value ?? 'Not provided'}
      </p>
    </div>
  );
}

function LinkRow({ label, value, icon }: { label: string; value?: string | null; icon?: React.ReactNode }) {
  if (!value) return null;
  return (
    <a
      href={value.startsWith('http') ? value : `https://${value}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 hover:underline"
    >
      {icon}
      <span className="truncate">{label}</span>
    </a>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────────────────────
export default function CandidateProfilePage() {
  const { data: candidate, isLoading } = useCandidate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-slate-500">Unable to load profile. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Profile"
        subtitle="Keep your profile up-to-date to attract the right employers."
      />
      <ProfileHeader candidate={candidate} />
      <PersonalInfoSection candidate={candidate} />
      <BioLinksSection candidate={candidate} />
      <EducationSection candidate={candidate} />
      <ExperienceSection candidate={candidate} />
      <SkillsSection candidate={candidate} />
      <PreferencesSection candidate={candidate} />
    </div>
  );
}
