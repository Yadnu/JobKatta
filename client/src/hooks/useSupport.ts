'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import type { ApiResponse, SupportTicket } from '@/types';

export const useMyTickets = (page = 1) =>
  useQuery({
    queryKey: ['support', 'tickets', page],
    queryFn: () =>
      api
        .get<ApiResponse<SupportTicket[]>>('/support/tickets', { params: { page } })
        .then((r) => r.data),
    staleTime: 2 * 60 * 1000,
  });

export const useTicket = (id: string) =>
  useQuery({
    queryKey: ['support', 'ticket', id],
    queryFn: () =>
      api
        .get<ApiResponse<SupportTicket>>(`/support/tickets/${id}`)
        .then((r) => r.data.data),
    enabled: !!id,
  });

export interface TicketInput {
  subject: string;
  message: string;
}

export const useCreateTicket = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TicketInput) => api.post('/support/tickets', data),
    onSuccess: () => {
      toast.success('Ticket submitted successfully');
      qc.invalidateQueries({ queryKey: ['support', 'tickets'] });
    },
    onError: () => toast.error('Failed to submit ticket'),
  });
};
