'use client';

import {
  Users,
  Briefcase,
  IndianRupee,
  Clock,
  CreditCard,
  TrendingUp,
} from 'lucide-react';
import { useAdminStats, useAdminRevenue, useAdminSubscriptions } from '@/hooks/useAdmin';
import StatsCard from '@/components/shared/StatsCard';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { formatINR, formatDate } from '@/lib/utils';

const planColors: Record<string, string> = {
  FREE: 'bg-slate-100 text-slate-600',
  BASIC: 'bg-blue-50 text-blue-700',
  STANDARD: 'bg-violet-50 text-violet-700',
  PREMIUM: 'bg-amber-50 text-amber-700',
  ANNUAL: 'bg-emerald-50 text-emerald-700',
};

const statusColors: Record<string, string> = {
  paid: 'bg-emerald-50 text-emerald-700',
  PAID: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  PENDING: 'bg-amber-50 text-amber-700',
  failed: 'bg-red-50 text-red-600',
  FAILED: 'bg-red-50 text-red-600',
};

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: revenue, isLoading: revenueLoading } = useAdminRevenue();
  const { data: recentSubs, isLoading: subsLoading } = useAdminSubscriptions(1);

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const revenuePoints = revenue ?? [];
  const maxRevenue = Math.max(...revenuePoints.map((r) => r.revenue), 1);
  const recentSubsList = recentSubs?.data?.slice(0, 8) ?? [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Platform overview and key metrics."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          label="Total Candidates"
          value={stats?.totalCandidates ?? 0}
          icon={Users}
          iconClassName="bg-violet-50"
        />
        <StatsCard
          label="Total Employers"
          value={stats?.totalEmployers ?? 0}
          icon={Briefcase}
          iconClassName="bg-violet-50"
        />
        <StatsCard
          label="Active Jobs"
          value={stats?.totalJobs ?? 0}
          icon={TrendingUp}
          iconClassName="bg-violet-50"
        />
        <StatsCard
          label="Pending Approvals"
          value={stats?.pendingApprovals ?? 0}
          icon={Clock}
          iconClassName="bg-amber-50"
        />
        <StatsCard
          label="Revenue This Month"
          value={formatINR(stats?.revenueThisMonth ?? 0)}
          icon={IndianRupee}
          iconClassName="bg-emerald-50"
          trend={
            stats?.revenueLastMonth
              ? {
                  direction:
                    (stats.revenueThisMonth ?? 0) >= stats.revenueLastMonth ? 'up' : 'down',
                  label: `vs ${formatINR(stats.revenueLastMonth)} last month`,
                }
              : undefined
          }
        />
        <StatsCard
          label="Active Subscriptions"
          value={stats?.activeSubscriptions ?? 0}
          icon={CreditCard}
          iconClassName="bg-violet-50"
        />
        <StatsCard
          label="Applications This Month"
          value={stats?.applicationsThisMonth ?? 0}
          icon={Briefcase}
          iconClassName="bg-violet-50"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-heading font-semibold text-slate-800 mb-5">Revenue Trend</h2>
          {revenueLoading ? (
            <div className="flex items-center justify-center h-40">
              <LoadingSpinner />
            </div>
          ) : revenuePoints.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-12">No revenue data yet.</p>
          ) : (
            <div className="flex items-end gap-2 h-40">
              {revenuePoints.map((point) => {
                const heightPct = Math.round((point.revenue / maxRevenue) * 100);
                return (
                  <div
                    key={point.month}
                    className="flex flex-1 flex-col items-center gap-1 min-w-0"
                  >
                    <span className="text-[10px] text-slate-500 truncate w-full text-center">
                      {formatINR(point.revenue)}
                    </span>
                    <div
                      className="w-full rounded-t-sm bg-violet-500 transition-all"
                      style={{ height: `${Math.max(heightPct, 4)}%`, minHeight: 4, maxHeight: '100%' }}
                    />
                    <span className="text-[10px] text-slate-400 truncate w-full text-center">
                      {point.month}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Subscriptions */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-heading font-semibold text-slate-800">Recent Subscriptions</h2>
            <a href="/admin/subscriptions" className="text-xs text-violet-600 hover:underline">
              View all
            </a>
          </div>
          {subsLoading ? (
            <div className="flex items-center justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : recentSubsList.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-10">No subscriptions yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentSubsList.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between px-5 py-3 gap-3">
                  <div className="min-w-0">
                    <span
                      className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${planColors[sub.planType] ?? 'bg-slate-100 text-slate-600'}`}
                    >
                      {sub.planType}
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(sub.createdAt)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-slate-800">{formatINR(sub.amount)}</p>
                    <span
                      className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[sub.status] ?? 'bg-slate-100 text-slate-500'}`}
                    >
                      {sub.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
