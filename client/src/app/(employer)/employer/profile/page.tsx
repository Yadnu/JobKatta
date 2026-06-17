'use client';

import { useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, Building2, Globe, Phone, Mail, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { useEmployerProfile, useUpdateEmployerProfile } from '@/hooks/useEmployer';
import { INDIAN_STATES, COMPANY_SIZES } from '@/lib/constants';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import PageHeader from '@/components/shared/PageHeader';
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

const employerProfileSchema = z.object({
  companyName: z.string().min(2, 'Min 2 characters').max(100),
  companyEmail: z.string().email('Valid email required').optional().or(z.literal('')),
  contactNumber: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit number').optional().or(z.literal('')),
  website: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  foundedYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  description: z.string().max(2000).optional(),
  city: z.string().min(2, 'City required'),
  state: z.string().min(2, 'State required'),
  pincode: z.string().length(6).regex(/^\d+$/).optional().or(z.literal('')),
  addressLine1: z.string().max(200).optional(),
  gstNumber: z.string().optional(),
  cinNumber: z.string().optional(),
  hrName: z.string().optional(),
  hrDesignation: z.string().optional(),
});

type ProfileInput = z.infer<typeof employerProfileSchema>;

export default function EmployerProfilePage() {
  const { data: employer, isLoading } = useEmployerProfile();
  const updateProfile = useUpdateEmployerProfile();
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileInput>({
    resolver: zodResolver(employerProfileSchema),
    values: employer
      ? {
          companyName: employer.companyName ?? '',
          companyEmail: employer.companyEmail ?? '',
          contactNumber: employer.contactNumber ?? '',
          website: employer.website ?? '',
          industry: employer.industry ?? '',
          companySize: employer.companySize ?? '',
          foundedYear: employer.foundedYear ?? undefined,
          description: employer.description ?? '',
          city: employer.city ?? '',
          state: employer.state ?? '',
          pincode: employer.pincode ?? '',
          addressLine1: employer.addressLine1 ?? '',
          gstNumber: employer.gstNumber ?? '',
          cinNumber: employer.cinNumber ?? '',
          hrName: employer.hrName ?? '',
          hrDesignation: employer.hrDesignation ?? '',
        }
      : undefined,
  });

  const handleLogoClick = () => fileInputRef.current?.click();

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

  const onSubmit = async (data: ProfileInput) => {
    const payload: Partial<Employer> = {
      ...data,
      companyEmail: data.companyEmail || undefined,
      contactNumber: data.contactNumber || undefined,
      website: data.website || undefined,
      industry: data.industry || undefined,
      companySize: data.companySize || undefined,
      description: data.description || undefined,
      pincode: data.pincode || undefined,
      addressLine1: data.addressLine1 || undefined,
      gstNumber: data.gstNumber || undefined,
      cinNumber: data.cinNumber || undefined,
      hrName: data.hrName || undefined,
      hrDesignation: data.hrDesignation || undefined,
    };
    await updateProfile.mutateAsync(payload);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Company Profile"
        subtitle="Manage your company information to attract the right candidates."
      />

      {/* Logo + Company name header */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <Avatar className="h-16 w-16 rounded-xl border-2 border-slate-200">
              <AvatarImage src={employer?.logoUrl} alt={employer?.companyName} />
              <AvatarFallback className="rounded-xl bg-primary-100 text-primary-700 text-xl font-bold">
                {getInitials(employer?.companyName ?? '?')}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={handleLogoClick}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
              aria-label="Change logo"
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
              onChange={handleLogoChange}
            />
          </div>
          <div>
            <h2 className="text-lg font-heading font-bold text-slate-900">
              {employer?.companyName ?? '—'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              {employer?.city && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="h-3 w-3" />
                  {employer.city}, {employer.state}
                </span>
              )}
              {employer?.isVerified && (
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-4 w-4 text-slate-500" />
              <h3 className="font-heading font-semibold text-slate-700 text-sm">Company Details</h3>
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

            <FormField control={form.control} name="foundedYear" render={({ field }) => (
              <FormItem>
                <FormLabel>Founded Year</FormLabel>
                <FormControl>
                  <Input
                    type="number" min={1800} max={new Date().getFullYear()}
                    placeholder="e.g. 2010"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>About the Company</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your company, culture, mission…"
                    rows={4}
                    className="resize-none"
                    maxLength={2000}
                    {...field}
                  />
                </FormControl>
                <p className="text-xs text-slate-400 mt-1">{(field.value ?? '').length}/2000</p>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          {/* Contact Info */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Phone className="h-4 w-4 text-slate-500" />
              <h3 className="font-heading font-semibold text-slate-700 text-sm">Contact Information</h3>
            </div>
            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="companyEmail" render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> Company Email</span>
                  </FormLabel>
                  <FormControl><Input type="email" placeholder="hr@company.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="contactNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl><Input placeholder="10-digit mobile" maxLength={10} {...field} /></FormControl>
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

          {/* Address */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-4 w-4 text-slate-500" />
              <h3 className="font-heading font-semibold text-slate-700 text-sm">Address</h3>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="pincode" render={({ field }) => (
                <FormItem>
                  <FormLabel>Pincode</FormLabel>
                  <FormControl><Input maxLength={6} placeholder="400001" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="addressLine1" render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line</FormLabel>
                  <FormControl><Input placeholder="Street / Building" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          {/* HR & Legal */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
            <h3 className="font-heading font-semibold text-slate-700 text-sm">HR & Legal Details</h3>
            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="hrName" render={({ field }) => (
                <FormItem>
                  <FormLabel>HR Contact Name</FormLabel>
                  <FormControl><Input placeholder="e.g. Priya Sharma" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="hrDesignation" render={({ field }) => (
                <FormItem>
                  <FormLabel>HR Designation</FormLabel>
                  <FormControl><Input placeholder="e.g. HR Manager" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="gstNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>GST Number</FormLabel>
                  <FormControl><Input placeholder="Optional" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="cinNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>CIN Number</FormLabel>
                  <FormControl><Input placeholder="Optional" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pb-6">
            <Button
              type="submit"
              disabled={updateProfile.isPending}
              className="min-w-[120px]"
            >
              {updateProfile.isPending ? 'Saving…' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
