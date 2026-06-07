'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import type { ApiResponse, Employer, Job, Application } from '@/types';
import type { JobPostInput } from '@/lib/validations';

export const useEmployerProfile = () =>
  useQuery({
    queryKey: ['employer', 'profile'],
    queryFn: () => api.get<ApiResponse<Employer>>('/employer/profile').then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

export const useUpdateEmployerProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Employer>) => api.put('/employer/profile', data),
    onSuccess: () => {
      toast.success('Company profile updated');
      qc.invalidateQueries({ queryKey: ['employer', 'profile'] });
      qc.invalidateQueries({ queryKey: ['me'] });
    },
    onError: () => toast.error('Failed to update profile'),
  });
};

export const useEmployerJobs = (page = 1) =>
  useQuery({
    queryKey: ['employer', 'jobs', page],
    queryFn: () => api.get<ApiResponse<Job[]>>(`/employer/jobs?page=${page}`).then((r) => r.data),
  });

export const useCreateJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: JobPostInput) => api.post<ApiResponse<Job>>('/employer/jobs', data),
    onSuccess: () => {
      toast.success('Job submitted for approval');
      qc.invalidateQueries({ queryKey: ['employer', 'jobs'] });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create job';
      toast.error(msg);
    },
  });
};

export const useUpdateJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<JobPostInput> }) => api.put(`/employer/jobs/${id}`, data),
    onSuccess: () => {
      toast.success('Job updated and resubmitted for approval');
      qc.invalidateQueries({ queryKey: ['employer', 'jobs'] });
    },
    onError: () => toast.error('Failed to update job'),
  });
};

export const useDeleteJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/employer/jobs/${id}`),
    onSuccess: () => { toast.success('Job deleted'); qc.invalidateQueries({ queryKey: ['employer', 'jobs'] }); },
    onError: () => toast.error('Failed to delete job'),
  });
};

export const useCloseJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.put(`/employer/jobs/${id}/close`),
    onSuccess: () => { toast.success('Job closed'); qc.invalidateQueries({ queryKey: ['employer', 'jobs'] }); },
    onError: () => toast.error('Failed to close job'),
  });
};

export const useDuplicateJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/employer/jobs/${id}/duplicate`),
    onSuccess: () => { toast.success('Job duplicated'); qc.invalidateQueries({ queryKey: ['employer', 'jobs'] }); },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to duplicate';
      toast.error(msg);
    },
  });
};

export const useJobApplicants = (jobId: string) =>
  useQuery({
    queryKey: ['employer', 'applicants', jobId],
    queryFn: () => api.get<ApiResponse<Application[]>>(`/employer/jobs/${jobId}/applications`).then((r) => r.data.data),
    enabled: !!jobId,
  });

export const useEmployerRecentApplications = () =>
  useQuery({
    queryKey: ['employer', 'applications', 'recent'],
    queryFn: () =>
      api.get<ApiResponse<Application[]>>('/employer/applications').then((r) => r.data.data ?? []),
  });

export const useUpdateApplicationStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/employer/applications/${id}/status`, { status }),
    onSuccess: (_, vars) => {
      toast.success('Status updated');
      qc.invalidateQueries({ queryKey: ['employer', 'applicants'] });
      qc.invalidateQueries({ queryKey: ['employer', 'application', vars.id] });
    },
    onError: () => toast.error('Failed to update status'),
  });
};

export const useJobAnalytics = (jobId: string) =>
  useQuery({
    queryKey: ['employer', 'analytics', jobId],
    queryFn: () => api.get(`/employer/jobs/${jobId}/analytics`).then((r) => r.data),
    enabled: !!jobId,
  });

export const useUnlockContact = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (applicationId: string) => api.post(`/employer/unlock-contact/${applicationId}`),
    onSuccess: () => {
      toast.success('Contact details unlocked');
      qc.invalidateQueries({ queryKey: ['employer', 'applicants'] });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to unlock contact';
      toast.error(msg);
    },
  });
};
