'use client';

import { useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Globe, Phone, Mail, MapPin, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useEmployerProfile, useUpdateEmployerProfile } from '@/hooks/useEmployer';
import { INDIAN_STATES, COMPANY_SIZES } from '@/lib/constants';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { getInitials } from '@/lib/utils';
import api from '@/lib/api';
import type { Employer, ApiResponse } from '@/types';

const JOB_INDUSTRIES = [
  'IT / Software', 'Sales & Marketing', 'Healthcare', 'Education & Training',
  'Manufacturing', 'Retail', 'Hospitality & Food', 'Finance & Accounts',
  'Administration', 'Logistics & Delivery', 'Construction', 'Automobile',
  'Security', 'Customer Support', 'Other',
];

const onboardingSchema = z.object({
  companyName: z.string().min(2, 'Min 2 characters').max(100),
  companyEmail: z.string().email('Valid email required').optional().or(z.literal('')),
  contactNumber: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit number').optional().or(z.literal('')),
  website: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  description: z.string().max(2000).optional(),
  city: z.string().min(2, 'City required'),
  state: z.string().min(2, 'State required'),
  hrName: z.string().optional(),
  hrDesignation: z.string().optional(),
});

type OnboardingInput = z.infer<typeof onboardingSchema>;

export default function EmployerOnboardingPage() {
  const router = useRouter();
  const { data: employer, isLoading } = useEmployerProfile();
  const updateProfile = useUpdateEmployerProfile();
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    values: employer
      ? {
          companyName: employer.companyName ?? '',
          companyEmail: employer.companyEmail ?? '',
          contactNumber: employer.contactNumber ?? '',
          website: employer.website ?? '',
          industry: employer.industry ?? '',
          companySize: employer.companySize ?? '',
          description: employer.description ?? '',
          city: employer.city ?? '',
          state: employer.state ?? '',
          hrName: employer.hrName ?? '',
          hrDesignation: employer.hrDesignation ?? '',
        }
      : undefined,
  });

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);
      await api.post<ApiResponse<{ logoUrl: string }>>('/upload/logo', formData);
      qc.invalidateQueries({ queryKey: ['employer', 'profile'] });
    } catch {
      toast.error('Failed to upload logo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: OnboardingInput) => {
    const payload: Partial<Employer> = {
      ...data,
      companyEmail: data.companyEmail || undefined,
      contactNumber: data.contactNumber || undefined,
      website: data.website || undefined,
      industry: data.industry || undefined,
      companySize: data.companySize || undefined,
      description: data.description || undefined,
      hrName: data.hrName || undefined,
      hrDesignation: data.hrDesignation || undefined,
    };
    await updateProfile.mutateAsync(payload);
    router.push('/employer/dashboard');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      {/* Welcome banner */}
      <div className="rounded-xl border border-primary-200 bg-primary-50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 flex-shrink-0">
            <Sparkles className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-lg font-heading font-bold text-primary-900">
              Welcome to JobKatta!
            </h1>
            <p className="text-sm text-primary-700 mt-1">
              Let&apos;s complete your company profile so candidates can find and trust your job listings.
              It only takes a few minutes.
            </p>
          </div>
        </div>
      </div>

      {/* Logo upload */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
        <h2 className="font-heading font-semibold text-slate-700 text-sm mb-4">Company Logo</h2>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 rounded-xl border-2 border-slate-200">
            <AvatarImage src={employer?.logoUrl} alt={employer?.companyName} />
            <AvatarFallback className="rounded-xl bg-primary-100 text-primary-700 text-xl font-bold">
              {getInitials(employer?.companyName ?? '?')}
            </AvatarFallback>
          </Avatar>
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="gap-2"
            >
              {uploading ? <LoadingSpinner size="sm" className="h-3 w-3" /> : null}
              {uploading ? 'Uploading…' : 'Upload Logo'}
            </Button>
            <p className="text-xs text-slate-400 mt-1">JPG, PNG or WebP · Max 2 MB</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleLogoChange}
          />
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Company basics */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-500" />
              <h3 className="font-heading font-semibold text-slate-700 text-sm">About Your Company</h3>
            </div>
            <Separator />

            <FormField control={form.control} name="companyName" render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name *</FormLabel>
                <FormControl><Input placeholder="Your company name" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="industry" render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry</FormLabel>
                  <Select value={field.value ?? ''} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger></FormControl>
                    <SelectContent className="max-h-64">
                      {JOB_INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="companySize" render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Size</FormLabel>
                  <Select value={field.value ?? ''} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {COMPANY_SIZES.map((s) => <SelectItem key={s} value={s}>{s} employees</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>About the Company</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell candidates about your company, culture, and what makes you a great place to work…"
                    rows={3}
                    className="resize-none"
                    maxLength={2000}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          {/* Contact */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-slate-500" />
              <h3 className="font-heading font-semibold text-slate-700 text-sm">Contact Details</h3>
            </div>
            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="companyEmail" render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> Email</span>
                  </FormLabel>
                  <FormControl><Input type="email" placeholder="hr@company.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="contactNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl><Input placeholder="10-digit number" maxLength={10} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="website" render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> Website</span>
                </FormLabel>
                <FormControl><Input placeholder="https://yourcompany.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          {/* Location */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-500" />
              <h3 className="font-heading font-semibold text-slate-700 text-sm">Location</h3>
            </div>
            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="city" render={({ field }) => (
                <FormItem>
                  <FormLabel>City *</FormLabel>
                  <FormControl><Input placeholder="e.g. Mumbai" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
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
          </div>

          {/* HR Contact */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
            <h3 className="font-heading font-semibold text-slate-700 text-sm">HR Contact</h3>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="hrName" render={({ field }) => (
                <FormItem>
                  <FormLabel>HR Name</FormLabel>
                  <FormControl><Input placeholder="e.g. Priya Sharma" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="hrDesignation" render={({ field }) => (
                <FormItem>
                  <FormLabel>Designation</FormLabel>
                  <FormControl><Input placeholder="e.g. HR Manager" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          <Button
            type="submit"
            disabled={updateProfile.isPending}
            className="w-full h-11 text-base"
          >
            {updateProfile.isPending ? 'Saving…' : 'Complete Setup & Go to Dashboard →'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
