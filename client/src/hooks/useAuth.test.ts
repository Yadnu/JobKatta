import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiMock, clearMock, pushMock, setAuthMock, clearAuthMock, store, toastSuccess, toastError, pending, callCount } = vi.hoisted(() => ({
  apiMock: { get: vi.fn(), post: vi.fn() },
  clearMock: vi.fn(),
  pushMock: vi.fn(),
  setAuthMock: vi.fn(),
  clearAuthMock: vi.fn(),
  store: { user: null as { id: string; role: string } | null, isAuthenticated: false },
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  pending: [false, false, false, false, false],
  callCount: { current: 0 },
}));

vi.mock('@/lib/api', () => ({ default: apiMock }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({ ...store, setAuth: setAuthMock, clearAuth: clearAuthMock }),
}));
vi.mock('react-hot-toast', () => ({ default: { success: toastSuccess, error: toastError } }));
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn((cfg) => cfg),
  useMutation: vi.fn((cfg) => {
    const index = callCount.current;
    callCount.current += 1;
    return { ...cfg, mutate: vi.fn(), isPending: pending[index] ?? false };
  }),
  useQueryClient: vi.fn(() => ({ clear: clearMock })),
}));

import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';

const meUser = { id: 'user-1', role: 'CANDIDATE', email: 'ada@mail.com' };

const loginResponse = (role: string) => ({
  data: { data: { accessToken: 'access', refreshToken: 'refresh', user: { role } } },
});

const otpResponse = (isNewUser: boolean) => ({
  data: { data: { accessToken: 'access', refreshToken: 'refresh', isNewUser } },
});

function mutationAt(index: number) {
  useAuth();
  return vi.mocked(useMutation).mock.calls[index][0] as any;
}

function queryConfig() {
  useAuth();
  return vi.mocked(useQuery).mock.calls[0][0] as any;
}

beforeEach(() => {
  vi.clearAllMocks();
  store.user = null;
  store.isAuthenticated = false;
  pending.splice(0, 5, false, false, false, false, false);
  callCount.current = 0;
  window.history.pushState({}, '', '/auth/login');
  apiMock.get.mockResolvedValue({ data: { data: meUser } });
  apiMock.post.mockResolvedValue({ data: { data: {} } });
});

describe('register', () => {
  it('posts the registration payload', async () => {
    const cfg = mutationAt(0);
    const body = { email: 'ada@mail.com', password: 'Secret1', role: 'CANDIDATE' };
    await cfg.mutationFn(body);
    expect(apiMock.post).toHaveBeenCalledWith('/auth/register', body);
  });

  it('sends the user to login with their email after success', () => {
    const cfg = mutationAt(0);
    cfg.onSuccess(undefined, { email: 'Ada@Mail.com' });
    expect(toastSuccess).toHaveBeenCalledWith('Registration successful! Please check your email to verify.');
    expect(pushMock).toHaveBeenCalledWith('/auth/login?registered=1&email=Ada%40Mail.com');
  });

  it('shows the API error, or a fallback when the response has none', () => {
    const cfg = mutationAt(0);
    cfg.onError({ response: { data: { message: 'Email already registered' } } });
    expect(toastError).toHaveBeenCalledWith('Email already registered');
    cfg.onError(new Error('network'));
    expect(toastError).toHaveBeenCalledWith('Registration failed');
  });
});

describe('login', () => {
  it('posts the login payload', async () => {
    const cfg = mutationAt(1);
    await cfg.mutationFn({ email: 'ada@mail.com', password: 'Secret1' });
    expect(apiMock.post).toHaveBeenCalledWith('/auth/login', { email: 'ada@mail.com', password: 'Secret1' });
  });

  it('stores the profile and opens the role dashboard', async () => {
    const cfg = mutationAt(1);
    await cfg.onSuccess(loginResponse('EMPLOYER'));
    expect(apiMock.get).toHaveBeenCalledWith('/auth/me', { headers: { Authorization: 'Bearer access' } });
    expect(setAuthMock).toHaveBeenCalledWith(meUser, 'access', 'refresh');
    expect(toastSuccess).toHaveBeenCalledWith('Welcome back!');
    expect(pushMock).toHaveBeenCalledWith('/employer/dashboard');
  });

  it.each([
    ['CANDIDATE', '/candidate/dashboard'],
    ['ADMIN', '/admin/dashboard'],
  ])('sends a %s to %s', async (role, path) => {
    const cfg = mutationAt(1);
    await cfg.onSuccess(loginResponse(role));
    expect(pushMock).toHaveBeenCalledWith(path);
  });

  it('follows a safe next path and ignores an open redirect', async () => {
    window.history.pushState({}, '', '/auth/login?next=/candidate/profile');
    const cfg = mutationAt(1);
    await cfg.onSuccess(loginResponse('CANDIDATE'));
    expect(pushMock).toHaveBeenCalledWith('/candidate/profile');

    pushMock.mockClear();
    window.history.pushState({}, '', '/auth/login?next=//evil.com');
    await cfg.onSuccess(loginResponse('CANDIDATE'));
    expect(pushMock).toHaveBeenCalledWith('/candidate/dashboard');
  });

  it('shows the API error, or a fallback when the response has none', () => {
    const cfg = mutationAt(1);
    cfg.onError({ response: { data: { message: 'Invalid credentials' } } });
    expect(toastError).toHaveBeenCalledWith('Invalid credentials');
    cfg.onError(new Error('network'));
    expect(toastError).toHaveBeenCalledWith('Login failed');
  });
});

describe('logout', () => {
  it('posts to logout', async () => {
    const cfg = mutationAt(2);
    await cfg.mutationFn();
    expect(apiMock.post).toHaveBeenCalledWith('/auth/logout');
  });

  it('clears the session even when the request fails', () => {
    const cfg = mutationAt(2);
    cfg.onSettled();
    expect(clearAuthMock).toHaveBeenCalledOnce();
    expect(clearMock).toHaveBeenCalledOnce();
    expect(pushMock).toHaveBeenCalledWith('/auth/login');
    expect(toastSuccess).toHaveBeenCalledWith('Logged out');
  });
});

describe('otp', () => {
  it('sends an OTP and reports success or the API error', async () => {
    const cfg = mutationAt(3);
    await cfg.mutationFn('9876543210');
    expect(apiMock.post).toHaveBeenCalledWith('/auth/send-otp', { mobile: '9876543210' });
    cfg.onSuccess();
    expect(toastSuccess).toHaveBeenCalledWith('OTP sent!');
    cfg.onError({ response: { data: { message: 'Too many OTP requests' } } });
    expect(toastError).toHaveBeenCalledWith('Too many OTP requests');
    cfg.onError(new Error('network'));
    expect(toastError).toHaveBeenCalledWith('Failed to send OTP');
  });

  it('sends a new candidate to onboarding and an existing one to a safe next path', async () => {
    window.history.pushState({}, '', '/auth/login?next=/candidate/saved-jobs');
    const cfg = mutationAt(4);
    await cfg.mutationFn({ mobile: '9876543210', otp: '123456', role: 'CANDIDATE' });
    expect(apiMock.post).toHaveBeenCalledWith('/auth/verify-otp', {
      mobile: '9876543210',
      otp: '123456',
      role: 'CANDIDATE',
    });

    await cfg.onSuccess(otpResponse(true));
    expect(toastSuccess).toHaveBeenCalledWith('Account created!');
    expect(pushMock).toHaveBeenCalledWith('/candidate/onboarding');

    pushMock.mockClear();
    await cfg.onSuccess(otpResponse(false));
    expect(toastSuccess).toHaveBeenCalledWith('Welcome back!');
    expect(pushMock).toHaveBeenCalledWith('/candidate/saved-jobs');
  });

  it('sends a new employer to onboarding and an existing employer to the dashboard', async () => {
    apiMock.get.mockResolvedValue({ data: { data: { ...meUser, role: 'EMPLOYER' } } });
    const cfg = mutationAt(4);
    await cfg.onSuccess(otpResponse(true));
    expect(pushMock).toHaveBeenCalledWith('/employer/onboarding');

    pushMock.mockClear();
    window.history.pushState({}, '', '/auth/login?next=//evil.com');
    await cfg.onSuccess(otpResponse(false));
    expect(pushMock).toHaveBeenCalledWith('/employer/dashboard');
  });

  it('shows the API error, or a fallback when verification fails', () => {
    const cfg = mutationAt(4);
    cfg.onError({ response: { data: { message: 'Invalid or expired OTP' } } });
    expect(toastError).toHaveBeenCalledWith('Invalid or expired OTP');
    cfg.onError(new Error('network'));
    expect(toastError).toHaveBeenCalledWith('OTP verification failed');
  });
});

describe('session', () => {
  it('loads the current user only while authenticated', async () => {
    store.isAuthenticated = true;
    const cfg = queryConfig();
    expect(cfg.queryKey).toEqual(['me']);
    expect(cfg.enabled).toBe(true);
    expect(cfg.staleTime).toBe(5 * 60 * 1000);
    expect(cfg.retry).toBe(false);
    await expect(cfg.queryFn()).resolves.toEqual(meUser);
    expect(apiMock.get).toHaveBeenCalledWith('/auth/me');
  });

  it('does not fetch the profile when signed out', () => {
    const cfg = queryConfig();
    expect(cfg.enabled).toBe(false);
  });

  it('exposes the mutation callbacks and their pending flags', () => {
    pending.splice(0, 5, true, false, false, true, false);
    const auth = useAuth();
    expect(auth.isAuthenticated).toBe(false);
    expect(auth.user).toBeNull();
    expect(typeof auth.register).toBe('function');
    expect(typeof auth.login).toBe('function');
    expect(typeof auth.logout).toBe('function');
    expect(typeof auth.sendOtp).toBe('function');
    expect(typeof auth.verifyOtp).toBe('function');
    expect(auth.isRegistering).toBe(true);
    expect(auth.isLoggingIn).toBe(false);
    expect(auth.isSendingOtp).toBe(true);
    expect(auth.isVerifyingOtp).toBe(false);
  });
});
