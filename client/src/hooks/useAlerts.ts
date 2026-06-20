'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import type { ApiResponse, EmailAlert } from '@/types';

export const useAlerts = () =>
  useQuery({
    queryKey: ['candidate', 'alerts'],
    queryFn: () =>
      api.get<ApiResponse<EmailAlert[]>>('/candidate/alerts').then((r) => r.data.data),
    staleTime: 2 * 60 * 1000,
  });

export interface AlertInput {
  keywords: string;
  city: string;
  jobType: string;
}

export const useCreateAlert = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AlertInput) => api.post('/candidate/alerts', data),
    onSuccess: () => {
      toast.success('Alert created');
      qc.invalidateQueries({ queryKey: ['candidate', 'alerts'] });
    },
    onError: () => toast.error('Failed to create alert'),
  });
};

export const useUpdateAlert = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<AlertInput> & { id: string }) =>
      api.put(`/candidate/alerts/${id}`, data),
    onSuccess: () => {
      toast.success('Alert updated');
      qc.invalidateQueries({ queryKey: ['candidate', 'alerts'] });
    },
    onError: () => toast.error('Failed to update alert'),
  });
};

export const useDeleteAlert = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/candidate/alerts/${id}`),
    onSuccess: () => {
      toast.success('Alert deleted');
      qc.invalidateQueries({ queryKey: ['candidate', 'alerts'] });
    },
    onError: () => toast.error('Failed to delete alert'),
  });
};
