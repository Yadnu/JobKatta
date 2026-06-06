'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import type { ApiResponse, Subscription } from '@/types';

interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
  subscriptionId: string;
  planKey: string;
  forRole: string;
}

export const usePaymentHistory = () =>
  useQuery({
    queryKey: ['payments', 'history'],
    queryFn: () => api.get<ApiResponse<Subscription[]>>('/payments/history').then((r) => r.data),
  });

export const useCreateOrder = () =>
  useMutation({
    mutationFn: ({ planKey, forRole }: { planKey: string; forRole: string }) =>
      api.post<ApiResponse<CreateOrderResponse>>('/payments/create-order', { planKey, forRole }).then((r) => r.data.data),
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create order';
      toast.error(msg);
    },
  });

export const useVerifyPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      subscriptionId: string;
      planKey: string;
      forRole: string;
    }) => api.post('/payments/verify', data),
    onSuccess: () => {
      toast.success('Payment successful! Your plan is now active.');
      qc.invalidateQueries({ queryKey: ['me'] });
      qc.invalidateQueries({ queryKey: ['candidate', 'profile'] });
      qc.invalidateQueries({ queryKey: ['employer', 'profile'] });
      qc.invalidateQueries({ queryKey: ['payments', 'history'] });
    },
    onError: () => toast.error('Payment verification failed. Please contact support.'),
  });
};

export const usePlanInfo = (role: 'CANDIDATE' | 'EMPLOYER' | null) => {
  const CANDIDATE_PLANS = [
    { key: 'FREE', label: 'Free', price: 0, features: ['5 applications/month', 'Basic profile'], highlight: false },
    { key: 'PREMIUM_MONTHLY', label: 'Premium Monthly', price: 99, features: ['Unlimited applications', 'Priority visibility', 'Profile badge'], highlight: true },
    { key: 'PREMIUM_YEARLY', label: 'Premium Yearly', price: 999, features: ['Everything in Premium', 'Save ₹189/year', 'Early job alerts'], highlight: false },
  ];

  const EMPLOYER_PLANS = [
    { key: 'BASIC', label: 'Basic', price: 499, features: ['1 active job post', '30 days validity', 'Standard listing'], highlight: false },
    { key: 'STANDARD', label: 'Standard', price: 1499, features: ['5 active job posts', '30 days validity', 'Priority listing'], highlight: true },
    { key: 'ANNUAL', label: 'Annual', price: 4999, features: ['10 active job posts', '365 days validity', 'Featured + Priority listing', 'Best value'], highlight: false },
  ];

  return role === 'CANDIDATE' ? CANDIDATE_PLANS : role === 'EMPLOYER' ? EMPLOYER_PLANS : [];
};
