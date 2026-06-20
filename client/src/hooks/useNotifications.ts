'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { ApiResponse, Notification } from '@/types';

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

export const useNotifications = () =>
  useQuery({
    queryKey: ['notifications'],
    queryFn: () =>
      api.get<ApiResponse<NotificationsResponse>>('/notifications').then((r) => r.data.data),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

export const useMarkAllRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.put('/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
};

export const useMarkRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.put(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
};
