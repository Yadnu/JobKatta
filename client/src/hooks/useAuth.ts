'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { LoginInput, RegisterInput } from '@/lib/validations';
import type { ApiResponse, AuthTokens, User } from '@/types';

export const useAuth = () => {
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();

  const registerMutation = useMutation({
    mutationFn: (data: RegisterInput) => api.post<ApiResponse<{ userId: string; role: string }>>('/auth/register', data),
    onSuccess: (_, vars) => {
      toast.success('Registration successful! Please check your email to verify.');
      router.push(`/auth/login?registered=1&email=${encodeURIComponent(vars.email)}`);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed';
      toast.error(msg);
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginInput) => api.post<ApiResponse<AuthTokens>>('/auth/login', data),
    onSuccess: async ({ data }) => {
      const { accessToken, refreshToken, user: u } = data.data;
      const meRes = await api.get<ApiResponse<User>>('/auth/me', { headers: { Authorization: `Bearer ${accessToken}` } });
      setAuth(meRes.data.data, accessToken, refreshToken);
      toast.success('Welcome back!');
      if (u.role === 'CANDIDATE') router.push('/candidate/dashboard');
      else if (u.role === 'EMPLOYER') router.push('/employer/dashboard');
      else router.push('/admin/dashboard');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed';
      toast.error(msg);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSettled: () => {
      clearAuth();
      qc.clear();
      router.push('/auth/login');
      toast.success('Logged out');
    },
  });

  const sendOtpMutation = useMutation({
    mutationFn: (mobile: string) => api.post('/auth/send-otp', { mobile }),
    onSuccess: () => toast.success('OTP sent!'),
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to send OTP';
      toast.error(msg);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (data: { mobile: string; otp: string; role?: string; firstName?: string; lastName?: string }) =>
      api.post<ApiResponse<AuthTokens & { isNewUser: boolean }>>('/auth/verify-otp', data),
    onSuccess: async ({ data }) => {
      const { accessToken, refreshToken, isNewUser } = data.data;
      const meRes = await api.get<ApiResponse<User>>('/auth/me', { headers: { Authorization: `Bearer ${accessToken}` } });
      setAuth(meRes.data.data, accessToken, refreshToken);
      toast.success(isNewUser ? 'Account created!' : 'Welcome back!');
      const role = meRes.data.data.role;
      if (role === 'CANDIDATE') router.push(isNewUser ? '/candidate/onboarding' : '/candidate/dashboard');
      else router.push(isNewUser ? '/employer/onboarding' : '/employer/dashboard');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'OTP verification failed';
      toast.error(msg);
    },
  });

  const { data: meData } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get<ApiResponse<User>>('/auth/me').then((r) => r.data.data),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  return {
    user: meData || user,
    isAuthenticated,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutate,
    sendOtp: sendOtpMutation.mutate,
    isSendingOtp: sendOtpMutation.isPending,
    verifyOtp: verifyOtpMutation.mutate,
    isVerifyingOtp: verifyOtpMutation.isPending,
  };
};
