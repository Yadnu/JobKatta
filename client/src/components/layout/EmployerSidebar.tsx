'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Briefcase,
  LayoutDashboard,
  PlusSquare,
  ListChecks,
  CreditCard,
  Building2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/employer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/employer/jobs/new', label: 'Post a Job', icon: PlusSquare },
  { href: '/employer/jobs', label: 'My Jobs', icon: ListChecks },
  { href: '/employer/profile', label: 'Company Profile', icon: Building2 },
  { href: '/employer/subscription', label: 'Subscription', icon: CreditCard },
];

interface EmployerSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100 shrink-0">
        <Link
          href="/employer/dashboard"
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
          // "Post a Job" should only be active on exact match
          const isPostJob = href === '/employer/jobs/new';
          // "My Jobs" should not activate on /employer/jobs/new
          const isMyJobs = href === '/employer/jobs';

          const isActive = isPostJob
            ? pathname === href
            : isMyJobs
            ? pathname === '/employer/jobs' ||
              (pathname.startsWith('/employer/jobs/') && pathname !== '/employer/jobs/new')
            : pathname === href ||
              (href !== '/employer/dashboard' && pathname.startsWith(href));

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

      {/* Footer branding */}
      <div className="px-5 py-4 border-t border-slate-100 shrink-0">
        <p className="text-xs text-slate-400">Job Katta for Employers</p>
        <p className="text-xs text-slate-300 mt-0.5">Hire local talent fast</p>
      </div>
    </div>
  );
}

export default function EmployerSidebar({ open, onClose }: EmployerSidebarProps) {
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
