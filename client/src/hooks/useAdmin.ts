'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import type { ApiResponse, Job, Subscription } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminStats {
  totalCandidates: number;
  totalEmployers: number;
  totalJobs: number;
  applicationsThisMonth: number;
  pendingApprovals: number;
  activeSubscriptions: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
}

export interface RevenuePoint {
  month: string;
  revenue: number;
}

export interface AdminCandidate {
  id: string;
  firstName: string;
  lastName: string;
  city: string;
  state: string;
  planType: string;
  profileComplete: number;
  createdAt: string;
  user: {
    email: string;
    mobile?: string;
    isActive: boolean;
    isSuspended: boolean;
    createdAt: string;
  };
}

export interface AdminEmployer {
  id: string;
  companyName: string;
  logoUrl?: string;
  city: string;
  state: string;
  isVerified: boolean;
  planType: string;
  planExpiresAt?: string;
  activeJobLimit: number;
  createdAt: string;
  user: {
    email: string;
    isSuspended: boolean;
    createdAt: string;
  };
  jobs?: { id: string; title: string; status: string; createdAt: string }[];
}

export interface FlagReport {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  isResolved: boolean;
  createdAt: string;
  user: { email: string };
}

export interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  adminReply?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: { email: string; role: string };
}

// ─── Stats & Revenue ──────────────────────────────────────────────────────────

export const useAdminStats = () =>
  useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () =>
      api.get<ApiResponse<AdminStats>>('/admin/stats').then((r) => r.data.data),
    staleTime: 60 * 1000,
  });

export const useAdminRevenue = () =>
  useQuery({
    queryKey: ['admin', 'revenue'],
    queryFn: () =>
      api.get<ApiResponse<RevenuePoint[]>>('/admin/revenue').then((r) => r.data.data),
    staleTime: 60 * 1000,
  });

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export const useAdminPendingJobs = (page = 1) =>
  useQuery({
    queryKey: ['admin', 'jobs', 'pending', page],
    queryFn: () =>
      api
        .get<ApiResponse<Job[]>>(`/admin/jobs/pending?page=${page}`)
        .then((r) => r.data),
  });

export const useAdminJobs = (page = 1, filters: { status?: string; search?: string } = {}) => {
  const params = new URLSearchParams({ page: String(page) });
  if (filters.status) params.set('status', filters.status);
  if (filters.search) params.set('search', filters.search);
  return useQuery({
    queryKey: ['admin', 'jobs', page, filters],
    queryFn: () =>
      api.get<ApiResponse<Job[]>>(`/admin/jobs?${params}`).then((r) => r.data),
  });
};

export const useApproveJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.put(`/admin/jobs/${id}/approve`),
    onSuccess: () => {
      toast.success('Job approved');
      qc.invalidateQueries({ queryKey: ['admin', 'jobs'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
    onError: () => toast.error('Failed to approve job'),
  });
};

export const useRejectJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rejectionReason }: { id: string; rejectionReason: string }) =>
      api.put(`/admin/jobs/${id}/reject`, { rejectionReason }),
    onSuccess: () => {
      toast.success('Job rejected');
      qc.invalidateQueries({ queryKey: ['admin', 'jobs'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
    onError: () => toast.error('Failed to reject job'),
  });
};

// ─── Candidates ───────────────────────────────────────────────────────────────

export const useAdminCandidates = (page = 1, search?: string) => {
  const params = new URLSearchParams({ page: String(page) });
  if (search) params.set('search', search);
  return useQuery({
    queryKey: ['admin', 'candidates', page, search],
    queryFn: () =>
      api
        .get<ApiResponse<AdminCandidate[]>>(`/admin/candidates?${params}`)
        .then((r) => r.data),
  });
};

export const useAdminCandidate = (id: string) =>
  useQuery({
    queryKey: ['admin', 'candidate', id],
    queryFn: () =>
      api
        .get<ApiResponse<AdminCandidate>>(`/admin/candidates/${id}`)
        .then((r) => r.data.data),
    enabled: !!id,
  });

export const useSuspendCandidate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.put(`/admin/candidates/${id}/suspend`),
    onSuccess: (_, id) => {
      toast.success('Candidate suspension toggled');
      qc.invalidateQueries({ queryKey: ['admin', 'candidates'] });
      qc.invalidateQueries({ queryKey: ['admin', 'candidate', id] });
    },
    onError: () => toast.error('Failed to update suspension'),
  });
};

// ─── Employers ────────────────────────────────────────────────────────────────

export const useAdminEmployers = (page = 1, search?: string) => {
  const params = new URLSearchParams({ page: String(page) });
  if (search) params.set('search', search);
  return useQuery({
    queryKey: ['admin', 'employers', page, search],
    queryFn: () =>
      api
        .get<ApiResponse<AdminEmployer[]>>(`/admin/employers?${params}`)
        .then((r) => r.data),
  });
};

export const useAdminEmployer = (id: string) =>
  useQuery({
    queryKey: ['admin', 'employer', id],
    queryFn: () =>
      api
        .get<ApiResponse<AdminEmployer>>(`/admin/employers/${id}`)
        .then((r) => r.data.data),
    enabled: !!id,
  });

export const useSuspendEmployer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.put(`/admin/employers/${id}/suspend`),
    onSuccess: (_, id) => {
      toast.success('Employer suspension toggled');
      qc.invalidateQueries({ queryKey: ['admin', 'employers'] });
      qc.invalidateQueries({ queryKey: ['admin', 'employer', id] });
    },
    onError: () => toast.error('Failed to update suspension'),
  });
};

export const useVerifyEmployer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.put(`/admin/employers/${id}/verify`),
    onSuccess: (_, id) => {
      toast.success('Employer verified');
      qc.invalidateQueries({ queryKey: ['admin', 'employers'] });
      qc.invalidateQueries({ queryKey: ['admin', 'employer', id] });
    },
    onError: () => toast.error('Failed to verify employer'),
  });
};

export const useUpgradePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      planType,
      durationDays,
    }: {
      id: string;
      planType: string;
      durationDays?: number;
    }) => api.put(`/admin/employers/${id}/upgrade-plan`, { planType, durationDays }),
    onSuccess: (_, vars) => {
      toast.success('Plan upgraded');
      qc.invalidateQueries({ queryKey: ['admin', 'employers'] });
      qc.invalidateQueries({ queryKey: ['admin', 'employer', vars.id] });
    },
    onError: () => toast.error('Failed to upgrade plan'),
  });
};

// ─── Subscriptions ────────────────────────────────────────────────────────────

export const useAdminSubscriptions = (
  page = 1,
  filters: { status?: string; planType?: string } = {}
) => {
  const params = new URLSearchParams({ page: String(page) });
  if (filters.status) params.set('status', filters.status);
  if (filters.planType) params.set('planType', filters.planType);
  return useQuery({
    queryKey: ['admin', 'subscriptions', page, filters],
    queryFn: () =>
      api
        .get<ApiResponse<Subscription[]>>(`/admin/subscriptions?${params}`)
        .then((r) => r.data),
  });
};

// ─── Flags ────────────────────────────────────────────────────────────────────

export const useAdminFlags = (page = 1) =>
  useQuery({
    queryKey: ['admin', 'flags', page],
    queryFn: () =>
      api
        .get<ApiResponse<FlagReport[]>>(`/admin/flags?page=${page}`)
        .then((r) => r.data),
  });

export const useResolveFlag = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.put(`/admin/flags/${id}/resolve`),
    onSuccess: () => {
      toast.success('Flag resolved');
      qc.invalidateQueries({ queryKey: ['admin', 'flags'] });
    },
    onError: () => toast.error('Failed to resolve flag'),
  });
};

// ─── Support Tickets ──────────────────────────────────────────────────────────

export const useAdminTickets = (page = 1) =>
  useQuery({
    queryKey: ['admin', 'tickets', page],
    queryFn: () =>
      api
        .get<ApiResponse<SupportTicket[]>>(`/admin/support?page=${page}`)
        .then((r) => r.data),
  });

export const useReplyTicket = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reply }: { id: string; reply: string }) =>
      api.put(`/admin/support/${id}/reply`, { reply }),
    onSuccess: () => {
      toast.success('Reply sent');
      qc.invalidateQueries({ queryKey: ['admin', 'tickets'] });
    },
    onError: () => toast.error('Failed to send reply'),
  });
};

export const useUpdateTicketStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/admin/support/${id}/status`, { status }),
    onSuccess: () => {
      toast.success('Ticket status updated');
      qc.invalidateQueries({ queryKey: ['admin', 'tickets'] });
    },
    onError: () => toast.error('Failed to update ticket status'),
  });
};
