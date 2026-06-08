'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Briefcase,
  LayoutDashboard,
  FileText,
  Bookmark,
  User,
  CreditCard,
  Search,
  X,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

const NAV_LINKS = [
  { href: '/candidate/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/jobs', label: 'Find Jobs', icon: Search },
  { href: '/candidate/applications', label: 'My Applications', icon: FileText },
  { href: '/candidate/saved-jobs', label: 'Saved Jobs', icon: Bookmark },
  { href: '/candidate/profile', label: 'Profile', icon: User },
  { href: '/candidate/subscription', label: 'Subscription', icon: CreditCard },
];

interface CandidateSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const profileComplete = user?.candidate?.profileComplete ?? 0;

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100 shrink-0">
        <Link
          href="/candidate/dashboard"
          onClick={onClose}
          className="flex items-center gap-2"
        >
          <div className="h-8 w-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <Briefcase className="h-4 w-4 text-white" />
          </div>
          <span className="font-heading font-bold text-xl text-slate-800">Job Katta</span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="lg:hidden p-1 text-slate-400 hover:text-slate-600 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== '/jobs' && href !== '/candidate/dashboard' && pathname.startsWith(href)) ||
            (href === '/candidate/dashboard' && pathname === '/candidate/dashboard');

          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0',
                  isActive ? 'text-primary-500' : 'text-slate-400'
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Profile completion bar */}
      <div className="px-4 py-4 border-t border-slate-100 shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-slate-500">Profile Complete</span>
          <span className="text-xs font-semibold text-primary-600">{profileComplete}%</span>
        </div>
        <Progress value={profileComplete} className="h-1.5" />
        {profileComplete < 80 && (
          <Link
            href="/candidate/profile/setup"
            onClick={onClose}
            className="mt-2 block text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            Complete your profile →
          </Link>
        )}
      </div>
    </div>
  );
}

export default function CandidateSidebar({ open, onClose }: CandidateSidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-white border-r border-slate-200 h-screen sticky top-0 overflow-hidden">
        <SidebarContent />
      </aside>

      {/* Mobile overlay + drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="relative w-64 flex flex-col bg-white shadow-xl z-50">
            <SidebarContent onClose={onClose} />
          </aside>
        </div>
      )}
    </>
  );
}
