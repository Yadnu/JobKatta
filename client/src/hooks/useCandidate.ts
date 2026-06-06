'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import type { ApiResponse, Candidate, Application } from '@/types';

export const useCandidate = () =>
  useQuery({
    queryKey: ['candidate', 'profile'],
    queryFn: () => api.get<ApiResponse<Candidate>>('/candidate/profile').then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Candidate>) => api.put('/candidate/profile', data),
    onSuccess: () => {
      toast.success('Profile updated');
      qc.invalidateQueries({ queryKey: ['candidate', 'profile'] });
      qc.invalidateQueries({ queryKey: ['me'] });
    },
    onError: () => toast.error('Failed to update profile'),
  });
};

export const useUpdateProfileStep = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ step, data }: { step: number; data: Record<string, unknown> }) =>
      api.put(`/candidate/profile/step/${step}`, data),
    onSuccess: () => {
      toast.success('Progress saved');
      qc.invalidateQueries({ queryKey: ['candidate', 'profile'] });
    },
    onError: () => toast.error('Failed to save'),
  });
};

export const useAddEducation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/candidate/education', data),
    onSuccess: () => { toast.success('Education added'); qc.invalidateQueries({ queryKey: ['candidate', 'profile'] }); },
    onError: () => toast.error('Failed to add education'),
  });
};

export const useUpdateEducation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => api.put(`/candidate/education/${id}`, data),
    onSuccess: () => { toast.success('Education updated'); qc.invalidateQueries({ queryKey: ['candidate', 'profile'] }); },
    onError: () => toast.error('Failed to update education'),
  });
};

export const useDeleteEducation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/candidate/education/${id}`),
    onSuccess: () => { toast.success('Education deleted'); qc.invalidateQueries({ queryKey: ['candidate', 'profile'] }); },
    onError: () => toast.error('Failed to delete'),
  });
};

export const useAddExperience = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/candidate/experience', data),
    onSuccess: () => { toast.success('Experience added'); qc.invalidateQueries({ queryKey: ['candidate', 'profile'] }); },
    onError: () => toast.error('Failed to add experience'),
  });
};

export const useUpdateExperience = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => api.put(`/candidate/experience/${id}`, data),
    onSuccess: () => { toast.success('Experience updated'); qc.invalidateQueries({ queryKey: ['candidate', 'profile'] }); },
    onError: () => toast.error('Failed to update experience'),
  });
};

export const useDeleteExperience = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/candidate/experience/${id}`),
    onSuccess: () => { toast.success('Experience deleted'); qc.invalidateQueries({ queryKey: ['candidate', 'profile'] }); },
    onError: () => toast.error('Failed to delete'),
  });
};

export const useUpdateSkills = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (skillIds: string[]) => api.put('/candidate/skills', { skillIds }),
    onSuccess: () => { toast.success('Skills updated'); qc.invalidateQueries({ queryKey: ['candidate', 'profile'] }); },
    onError: () => toast.error('Failed to update skills'),
  });
};

export const useToggleOpenToWork = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.put('/candidate/open-to-work'),
    onSuccess: (res) => {
      const { openToWork } = (res.data as ApiResponse<{ openToWork: boolean }>).data;
      toast.success(openToWork ? 'Now visible to employers' : 'Hidden from employers');
      qc.invalidateQueries({ queryKey: ['candidate', 'profile'] });
      qc.invalidateQueries({ queryKey: ['me'] });
    },
    onError: () => toast.error('Failed to update'),
  });
};

export const useCandidateApplications = (page = 1) =>
  useQuery({
    queryKey: ['candidate', 'applications', page],
    queryFn: () => api.get<ApiResponse<Application[]>>(`/candidate/applications?page=${page}`).then((r) => r.data),
  });

export const useSavedJobs = (page = 1) =>
  useQuery({
    queryKey: ['candidate', 'saved-jobs', page],
    queryFn: () => api.get(`/candidate/saved-jobs?page=${page}`).then((r) => r.data),
  });
