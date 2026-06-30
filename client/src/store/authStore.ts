import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { setTokens, clearTokens } from '@/lib/auth';

const SESSION_COOKIE = 'jk-has-session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function setHasSessionCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

function clearHasSessionCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  updateUser: (user: Partial<User>) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),

      setAuth: (user, accessToken, refreshToken) => {
        setTokens(accessToken, refreshToken);
        setHasSessionCookie();
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },

      updateUser: (partial) =>
        set((state) => ({ user: state.user ? { ...state.user, ...partial } : null })),

      clearAuth: () => {
        clearTokens();
        clearHasSessionCookie();
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },
    }),
    {
      name: 'jk-auth',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
