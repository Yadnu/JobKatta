'use client';

import Link from 'next/link';
import { Bell, Menu, LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/authStore';
import { getInitials } from '@/lib/utils';

interface DashboardTopbarProps {
  onMenuClick?: () => void;
}

export default function DashboardTopbar({ onMenuClick }: DashboardTopbarProps) {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.push('/auth/login');
  };

  const photoUrl = user?.candidate?.photoUrl || user?.employer?.logoUrl;
  const displayName = user?.candidate
    ? `${user.candidate.firstName} ${user.candidate.lastName}`
    : user?.employer?.companyName || user?.email || '';

  const profileHref =
    user?.role === 'CANDIDATE' ? '/candidate/profile' : '/employer/profile';

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-4 sm:px-6">
      <button
        onClick={onMenuClick}
        aria-label="Open menu"
        className="lg:hidden -ml-2 p-2 text-slate-500 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-1 sm:gap-2">
        {/* Notification bell — placeholder */}
        <button
          aria-label="Notifications"
          className="relative p-2 text-slate-500 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
        >
          <Bell className="h-5 w-5" />
        </button>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-slate-50 transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarImage src={photoUrl || ''} />
                <AvatarFallback className="bg-primary-100 text-primary-600 text-xs font-semibold">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[140px] truncate">
                {displayName}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem asChild>
              <Link href={profileHref} className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 focus:text-red-600 cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
