'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, Briefcase, ChevronDown, LogOut, User, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/authStore';
import { getInitials } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/jobs', label: 'Browse Jobs' },
  { href: '/companies', label: 'Companies' },
];

export default function Navbar() {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    router.push('/auth/login');
  };

  const dashboardHref =
    user?.role === 'CANDIDATE' ? '/candidate/dashboard'
    : user?.role === 'EMPLOYER' ? '/employer/dashboard'
    : '/admin/dashboard';

  const photoUrl = user?.candidate?.photoUrl || user?.employer?.logoUrl;
  const displayName = user?.candidate
    ? `${user.candidate.firstName} ${user.candidate.lastName}`
    : user?.employer?.companyName || user?.email || '';

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-slate-800">Job Katta</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm font-medium text-slate-600 hover:text-primary-500 transition-colors">
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full pr-2 hover:bg-slate-50 transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={photoUrl || ''} />
                      <AvatarFallback className="bg-primary-100 text-primary-600 text-xs font-semibold">
                        {getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate">{displayName}</span>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={() => router.push(dashboardHref)}>
                    <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(user.role === 'CANDIDATE' ? '/candidate/profile' : '/employer/profile')}>
                    <User className="h-4 w-4 mr-2" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                    <LogOut className="h-4 w-4 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button size="sm" className="bg-primary-500 hover:bg-primary-600" asChild>
                  <Link href="/auth/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 text-slate-600" onClick={() => setMobileOpen((p) => !p)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-3">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-slate-700 py-1">
              {l.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <Link href={dashboardHref} onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-slate-700 py-1">Dashboard</Link>
              <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="block text-sm font-medium text-red-600 py-1">Sign Out</button>
            </>
          ) : (
            <div className="flex gap-2 pt-1">
              <Button variant="outline" size="sm" asChild className="flex-1"><Link href="/auth/login">Sign In</Link></Button>
              <Button size="sm" className="flex-1 bg-primary-500 hover:bg-primary-600" asChild><Link href="/auth/register">Register</Link></Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
