'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import type { ApiResponse, Job } from '@/types';

interface JobFilters {
  keyword?: string;
  city?: string;
  category?: string;
  type?: string;
  salaryMin?: number;
  salaryMax?: number;
  page?: number;
  limit?: number;
}

export const useJobs = (filters: JobFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v !== undefined && v !== '') params.set(k, String(v)); });

  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => api.get<ApiResponse<Job[]>>(`/jobs?${params}`).then((r) => r.data),
    staleTime: 2 * 60 * 1000,
  });
};

export const useJob = (id: string) =>
  useQuery({
    queryKey: ['job', id],
    queryFn: () => api.get<ApiResponse<Job>>(`/jobs/${id}`).then((r) => r.data.data),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

export const useFeaturedJobs = () =>
  useQuery({
    queryKey: ['jobs', 'featured'],
    queryFn: () => api.get<ApiResponse<Job[]>>('/jobs/featured').then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

export const useSaveJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => api.post<ApiResponse<{ saved: boolean }>>(`/jobs/${jobId}/save`),
    onSuccess: (res) => {
      toast.success(res.data.data.saved ? 'Job saved' : 'Job unsaved');
      qc.invalidateQueries({ queryKey: ['candidate', 'saved-jobs'] });
    },
    onError: () => toast.error('Failed to save job'),
  });
};

export const useApplyJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, coverNote }: { jobId: string; coverNote?: string }) =>
      api.post(`/jobs/${jobId}/apply`, { coverNote }),
    onSuccess: () => {
      toast.success('Application submitted!');
      qc.invalidateQueries({ queryKey: ['candidate', 'applications'] });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to apply';
      toast.error(msg);
    },
  });
};
