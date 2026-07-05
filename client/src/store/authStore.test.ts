import { beforeEach, describe, expect, it } from 'vitest';
import type { User } from '@/types';
import { useAuthStore } from './authStore';

const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  role: 'CANDIDATE',
  isEmailVerified: true,
  isMobileVerified: false,
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
};

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      _hasHydrated: false,
    });
    localStorage.clear();
  });

  // ─── setAuth ────────────────────────────────────────────────────────────────

  describe('setAuth', () => {
    it('populates user, tokens, and marks as authenticated', () => {
      useAuthStore.getState().setAuth(mockUser, 'access-token', 'refresh-token');
      const s = useAuthStore.getState();
      expect(s.user).toEqual(mockUser);
      expect(s.accessToken).toBe('access-token');
      expect(s.refreshToken).toBe('refresh-token');
      expect(s.isAuthenticated).toBe(true);
    });

    it('persists tokens to localStorage', () => {
      useAuthStore.getState().setAuth(mockUser, 'access-token', 'refresh-token');
      expect(localStorage.getItem('jk_access_token')).toBe('access-token');
      expect(localStorage.getItem('jk_refresh_token')).toBe('refresh-token');
    });

    it('sets the session cookie on the document', () => {
      useAuthStore.getState().setAuth(mockUser, 'access-token', 'refresh-token');
      expect(document.cookie).toContain('jk-has-session=1');
    });
  });

  // ─── updateUser ─────────────────────────────────────────────────────────────

  describe('updateUser', () => {
    it('merges a partial update into the current user', () => {
      useAuthStore.setState({ user: mockUser });
      useAuthStore.getState().updateUser({ email: 'new@example.com' });
      const { user } = useAuthStore.getState();
      expect(user?.email).toBe('new@example.com');
      expect(user?.id).toBe('user-1');
      expect(user?.role).toBe('CANDIDATE');
    });

    it('does nothing when user is null', () => {
      useAuthStore.getState().updateUser({ email: 'irrelevant@example.com' });
      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  // ─── clearAuth ──────────────────────────────────────────────────────────────

  describe('clearAuth', () => {
    it('resets all auth state to unauthenticated', () => {
      useAuthStore.getState().setAuth(mockUser, 'access-token', 'refresh-token');
      useAuthStore.getState().clearAuth();
      const s = useAuthStore.getState();
      expect(s.user).toBeNull();
      expect(s.accessToken).toBeNull();
      expect(s.refreshToken).toBeNull();
      expect(s.isAuthenticated).toBe(false);
    });

    it('removes tokens from localStorage', () => {
      useAuthStore.getState().setAuth(mockUser, 'access-token', 'refresh-token');
      useAuthStore.getState().clearAuth();
      expect(localStorage.getItem('jk_access_token')).toBeNull();
      expect(localStorage.getItem('jk_refresh_token')).toBeNull();
    });
  });

  // ─── setHasHydrated ─────────────────────────────────────────────────────────

  describe('setHasHydrated', () => {
    it('starts as false', () => {
      expect(useAuthStore.getState()._hasHydrated).toBe(false);
    });

    it('can be set to true', () => {
      useAuthStore.getState().setHasHydrated(true);
      expect(useAuthStore.getState()._hasHydrated).toBe(true);
    });

    it('can be reset to false', () => {
      useAuthStore.getState().setHasHydrated(true);
      useAuthStore.getState().setHasHydrated(false);
      expect(useAuthStore.getState()._hasHydrated).toBe(false);
    });
  });
});
