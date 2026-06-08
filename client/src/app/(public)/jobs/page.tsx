'use client';

import { useCallback, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import JobCard from '@/components/shared/JobCard';
import Pagination from '@/components/shared/Pagination';
import EmptyState from '@/components/shared/EmptyState';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useJobs } from '@/hooks/useJobs';
import { JOB_CATEGORIES, EMPLOYMENT_TYPES, INDIAN_STATES } from '@/lib/constants';
import { Briefcase } from 'lucide-react';

const ALL_VALUE = '__all__';

function useFilters() {
  const searchParams = useSearchParams();
  return {
    keyword: searchParams.get('keyword') ?? '',
    category: searchParams.get('category') ?? '',
    state: searchParams.get('state') ?? '',
    type: searchParams.get('type') ?? '',
    page: Number(searchParams.get('page') ?? '1'),
  };
}

function FilterSidebar({ onApply }: { onApply?: () => void }) {
  const router = useRouter();
  const filters = useFilters();
  const [keyword, setKeyword] = useState(filters.keyword);
  const [category, setCategory] = useState(filters.category);
  const [state, setState] = useState(filters.state);
  const [type, setType] = useState(filters.type);
  const [, startTransition] = useTransition();

  const apply = useCallback(() => {
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (category) params.set('category', category);
    if (state) params.set('state', state);
    if (type) params.set('type', type);
    params.set('page', '1');
    startTransition(() => router.push(`/jobs?${params.toString()}`));
    onApply?.();
  }, [keyword, category, state, type, router, onApply]);

  const reset = useCallback(() => {
    setKeyword('');
    setCategory('');
    setState('');
    setType('');
    startTransition(() => router.push('/jobs'));
    onApply?.();
  }, [router, onApply]);

  const hasFilters = keyword || category || state || type;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Label htmlFor="kw" className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5 block">
          Keyword
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            id="kw"
            placeholder="Job title, skill…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && apply()}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      <Separator />

      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5 block">
          Category
        </Label>
        <Select value={category || ALL_VALUE} onValueChange={(v) => setCategory(v === ALL_VALUE ? '' : v)}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All categories</SelectItem>
            {JOB_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5 block">
          State
        </Label>
        <Select value={state || ALL_VALUE} onValueChange={(v) => setState(v === ALL_VALUE ? '' : v)}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="All states" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All states</SelectItem>
            {INDIAN_STATES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5 block">
          Employment Type
        </Label>
        <Select value={type || ALL_VALUE} onValueChange={(v) => setType(v === ALL_VALUE ? '' : v)}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All types</SelectItem>
            {EMPLOYMENT_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <Button size="sm" onClick={apply} className="w-full">
          Apply Filters
        </Button>
        {hasFilters && (
          <Button size="sm" variant="ghost" onClick={reset} className="w-full text-slate-500">
            <X className="h-3.5 w-3.5 mr-1" /> Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}

export default function JobsPage() {
  const filters = useFilters();
  const { data, isLoading } = useJobs({
    keyword: filters.keyword || undefined,
    category: filters.category || undefined,
    state: filters.state || undefined,
    type: filters.type || undefined,
    page: filters.page,
    limit: 12,
  });

  const router = useRouter();
  const [, startTransition] = useTransition();

  const jobs = data?.data ?? [];
  const pagination = data?.pagination;

  const handlePageChange = (page: number) => {
    const sp = new URLSearchParams();
    if (filters.keyword) sp.set('keyword', filters.keyword);
    if (filters.category) sp.set('category', filters.category);
    if (filters.state) sp.set('state', filters.state);
    if (filters.type) sp.set('type', filters.type);
    sp.set('page', String(page));
    startTransition(() => router.push(`/jobs?${sp.toString()}`));
  };

  const activeFilterCount = [filters.keyword, filters.category, filters.state, filters.type].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Browse Jobs</h1>
            {pagination && (
              <p className="mt-1 text-sm text-slate-500">
                {pagination.total.toLocaleString('en-IN')} job{pagination.total !== 1 ? 's' : ''} found
              </p>
            )}
          </div>

          {/* Mobile filter trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1 rounded-full bg-blue-600 text-white text-xs w-4 h-4 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SheetHeader className="px-5 pt-5 pb-4 border-b">
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-full">
                <div className="p-5">
                  <FilterSidebar />
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-slate-700">Filters</h2>
              <FilterSidebar />
            </div>
          </aside>

          {/* Job list */}
          <div className="min-w-0 flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-24">
                <LoadingSpinner size="lg" />
              </div>
            ) : jobs.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No jobs found"
                description="Try adjusting your filters or search for a different keyword."
              />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-2">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} showSkills />
                  ))}
                </div>

                {pagination && pagination.pages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination
                      page={pagination.page}
                      pages={pagination.pages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
