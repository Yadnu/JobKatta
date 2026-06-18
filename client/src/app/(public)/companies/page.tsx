'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, MapPin, Users, Briefcase, Building2, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/shared/EmptyState';
import { usePublicEmployers } from '@/hooks/useJobs';
import { getInitials } from '@/lib/utils';
import type { PublicEmployerSummary } from '@/types';

function CompanyCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

function CompanyCard({ company }: { company: PublicEmployerSummary }) {
  const initials = getInitials(company.companyName);
  const location = [company.city, company.state].filter(Boolean).join(', ');

  return (
    <Link
      href={`/companies/${company.id}`}
      className="group block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12 rounded-xl border border-slate-100 flex-shrink-0">
          <AvatarImage src={company.logoUrl} alt={company.companyName} />
          <AvatarFallback className="rounded-xl bg-blue-50 text-blue-700 font-semibold text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
              {company.companyName}
            </h3>
            {company.isVerified && (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
            )}
          </div>
          {company.industry && (
            <p className="text-xs text-slate-500 truncate mt-0.5">{company.industry}</p>
          )}
        </div>
      </div>

      {company.description && (
        <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {company.description}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {location && (
          <Badge variant="secondary" className="gap-1 text-xs font-normal">
            <MapPin className="h-3 w-3" /> {location}
          </Badge>
        )}
        {company.companySize && (
          <Badge variant="secondary" className="gap-1 text-xs font-normal">
            <Users className="h-3 w-3" /> {company.companySize}
          </Badge>
        )}
        <Badge
          variant={company.activeJobCount > 0 ? 'default' : 'secondary'}
          className="gap-1 text-xs font-normal"
        >
          <Briefcase className="h-3 w-3" />
          {company.activeJobCount > 0 ? `${company.activeJobCount} open job${company.activeJobCount !== 1 ? 's' : ''}` : 'No open jobs'}
        </Badge>
      </div>
    </Link>
  );
}

export default function CompaniesPage() {
  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = usePublicEmployers({ keyword: search, page, limit: 24 });
  const companies = data?.data ?? [];
  const pagination = data?.pagination;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(keyword);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Browse Companies</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Discover verified employers and explore their open positions.
          </p>

          <form onSubmit={handleSearch} className="mt-5 flex gap-2 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search by company name…"
                className="pl-9"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Results count */}
        {!isLoading && pagination && (
          <p className="mb-5 text-sm text-slate-500">
            {pagination.total === 0
              ? 'No companies found'
              : `Showing ${companies.length} of ${pagination.total} companies`}
          </p>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 12 }).map((_, i) => <CompanyCardSkeleton key={i} />)}
          </div>
        ) : companies.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No companies found"
            description={search ? `No results for "${search}". Try a different search.` : 'No verified companies yet.'}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-slate-500">
              Page {page} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
