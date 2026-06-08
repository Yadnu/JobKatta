'use client';

import { useState } from 'react';
import { Users, Search, ShieldOff, ShieldCheck, BadgeCheck, ArrowUpCircle } from 'lucide-react';
import {
  useAdminCandidates,
  useAdminEmployers,
  useSuspendCandidate,
  useSuspendEmployer,
  useVerifyEmployer,
  useUpgradePlan,
  type AdminCandidate,
  type AdminEmployer,
} from '@/hooks/useAdmin';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import Pagination from '@/components/shared/Pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn, formatDate, getInitials } from '@/lib/utils';

type TabId = 'candidates' | 'employers';

const planColors: Record<string, string> = {
  FREE: 'bg-slate-100 text-slate-600',
  BASIC: 'bg-blue-50 text-blue-700',
  STANDARD: 'bg-violet-50 text-violet-700',
  PREMIUM: 'bg-amber-50 text-amber-700',
  ANNUAL: 'bg-emerald-50 text-emerald-700',
};

function Avatar({ name }: { name: string }) {
  return (
    <div className="h-8 w-8 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center shrink-0">
      {getInitials(name)}
    </div>
  );
}

function CandidateRow({
  candidate,
  onSuspend,
}: {
  candidate: AdminCandidate;
  onSuspend: (id: string) => void;
}) {
  const name = `${candidate.firstName} ${candidate.lastName}`;
  const suspended = candidate.user.isSuspended;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar name={name} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
          <p className="text-xs text-slate-500 truncate">{candidate.user.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap shrink-0">
        <span
          className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full',
            planColors[candidate.planType] ?? 'bg-slate-100 text-slate-500'
          )}
        >
          {candidate.planType}
        </span>
        <span className="text-xs text-slate-400">{candidate.city}</span>
        {suspended && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600">
            Suspended
          </span>
        )}
        <Button
          size="sm"
          variant="outline"
          className={cn(
            'h-8 px-3 text-xs',
            suspended
              ? 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
              : 'text-red-600 border-red-200 hover:bg-red-50'
          )}
          onClick={() => onSuspend(candidate.id)}
        >
          {suspended ? (
            <>
              <ShieldCheck className="h-3 w-3 mr-1" /> Unsuspend
            </>
          ) : (
            <>
              <ShieldOff className="h-3 w-3 mr-1" /> Suspend
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function EmployerRow({
  employer,
  onSuspend,
  onVerify,
  onUpgrade,
}: {
  employer: AdminEmployer;
  onSuspend: (id: string) => void;
  onVerify: (id: string) => void;
  onUpgrade: (employer: AdminEmployer) => void;
}) {
  const suspended = employer.user.isSuspended;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar name={employer.companyName} />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-slate-800 truncate">{employer.companyName}</p>
            {employer.isVerified && (
              <BadgeCheck className="h-4 w-4 text-violet-500 shrink-0" />
            )}
          </div>
          <p className="text-xs text-slate-500 truncate">{employer.user.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap shrink-0">
        <span
          className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full',
            planColors[employer.planType] ?? 'bg-slate-100 text-slate-500'
          )}
        >
          {employer.planType}
        </span>
        {suspended && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600">
            Suspended
          </span>
        )}
        {!employer.isVerified && (
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-3 text-xs text-violet-600 border-violet-200 hover:bg-violet-50"
            onClick={() => onVerify(employer.id)}
          >
            <BadgeCheck className="h-3 w-3 mr-1" /> Verify
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          className="h-8 px-3 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
          onClick={() => onUpgrade(employer)}
        >
          <ArrowUpCircle className="h-3 w-3 mr-1" /> Plan
        </Button>
        <Button
          size="sm"
          variant="outline"
          className={cn(
            'h-8 px-3 text-xs',
            suspended
              ? 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
              : 'text-red-600 border-red-200 hover:bg-red-50'
          )}
          onClick={() => onSuspend(employer.id)}
        >
          {suspended ? (
            <>
              <ShieldCheck className="h-3 w-3 mr-1" /> Unsuspend
            </>
          ) : (
            <>
              <ShieldOff className="h-3 w-3 mr-1" /> Suspend
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [tab, setTab] = useState<TabId>('candidates');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [upgradeTarget, setUpgradeTarget] = useState<AdminEmployer | null>(null);
  const [upgradePlan, setUpgradePlan] = useState('STANDARD');
  const [upgradeDays, setUpgradeDays] = useState('30');

  const candidatesQuery = useAdminCandidates(page, search || undefined);
  const employersQuery = useAdminEmployers(page, search || undefined);
  const suspendCandidate = useSuspendCandidate();
  const suspendEmployer = useSuspendEmployer();
  const verifyEmployer = useVerifyEmployer();
  const upgradePlanMutation = useUpgradePlan();

  const isCandidates = tab === 'candidates';
  const query = isCandidates ? candidatesQuery : employersQuery;
  const candidates: AdminCandidate[] = (candidatesQuery.data?.data ?? []) as AdminCandidate[];
  const employers: AdminEmployer[] = (employersQuery.data?.data ?? []) as AdminEmployer[];
  const pagination = query.data?.pagination;

  function handleTabChange(t: TabId) {
    setTab(t);
    setPage(1);
    setSearch('');
  }

  function handleUpgradeSubmit() {
    if (!upgradeTarget) return;
    upgradePlanMutation.mutate(
      {
        id: upgradeTarget.id,
        planType: upgradePlan,
        durationDays: parseInt(upgradeDays) || 30,
      },
      { onSuccess: () => setUpgradeTarget(null) }
    );
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'candidates', label: 'Candidates' },
    { id: 'employers', label: 'Employers' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="User Management" subtitle="Manage candidates and employers on the platform." />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => handleTabChange(t.id)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t.id
                ? 'border-violet-600 text-violet-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder={`Search ${isCandidates ? 'candidates' : 'employers'}…`}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {query.isLoading ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : isCandidates ? (
          candidates.length === 0 ? (
            <EmptyState icon={Users} title="No candidates found" />
          ) : (
            <>
              {candidates.map((c) => (
                <CandidateRow
                  key={c.id}
                  candidate={c}
                  onSuspend={(id) => suspendCandidate.mutate(id)}
                />
              ))}
            </>
          )
        ) : employers.length === 0 ? (
          <EmptyState icon={Users} title="No employers found" />
        ) : (
          <>
            {employers.map((e) => (
              <EmployerRow
                key={e.id}
                employer={e}
                onSuspend={(id) => suspendEmployer.mutate(id)}
                onVerify={(id) => verifyEmployer.mutate(id)}
                onUpgrade={(emp) => {
                  setUpgradeTarget(emp);
                  setUpgradePlan(emp.planType === 'FREE' ? 'STANDARD' : emp.planType);
                  setUpgradeDays('30');
                }}
              />
            ))}
          </>
        )}
        {pagination && pagination.pages > 1 && (
          <div className="px-5 py-4 border-t border-slate-100">
            <Pagination page={pagination.page} pages={pagination.pages} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* Upgrade Plan Dialog */}
      <Dialog open={!!upgradeTarget} onOpenChange={(open) => !open && setUpgradeTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Upgrade Plan</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Employer: <strong>{upgradeTarget?.companyName}</strong>
          </p>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Plan</label>
              <Select value={upgradePlan} onValueChange={setUpgradePlan}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BASIC">Basic</SelectItem>
                  <SelectItem value="STANDARD">Standard</SelectItem>
                  <SelectItem value="PREMIUM">Premium</SelectItem>
                  <SelectItem value="ANNUAL">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Duration (days)</label>
              <Input
                type="number"
                min={1}
                value={upgradeDays}
                onChange={(e) => setUpgradeDays(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpgradeTarget(null)}>
              Cancel
            </Button>
            <Button
              className="bg-violet-600 hover:bg-violet-700 text-white"
              disabled={upgradePlanMutation.isPending}
              onClick={handleUpgradeSubmit}
            >
              {upgradePlanMutation.isPending ? 'Upgrading…' : 'Upgrade Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
