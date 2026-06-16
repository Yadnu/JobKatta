'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import CandidateSidebar from '@/components/layout/CandidateSidebar';
import DashboardTopbar from '@/components/layout/DashboardTopbar';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Wait for Zustand to rehydrate from localStorage before checking auth
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated || user?.role !== 'CANDIDATE') {
      router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [mounted, isAuthenticated, user, router, pathname]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (!mounted || !isAuthenticated || user?.role !== 'CANDIDATE') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <CandidateSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <DashboardTopbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
