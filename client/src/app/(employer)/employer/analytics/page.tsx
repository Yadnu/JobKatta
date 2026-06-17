'use client';

import { useState } from 'react';
import { BarChart2, Eye, Users, UserCheck, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useEmployerJobs, useJobAnalytics } from '@/hooks/useEmployer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/shared/PageHeader';

interface AnalyticsData {
  data: {
    viewCount: number;
    applicationCount: number;
    shortlistedCount: number;
  };
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">{title}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{value.toLocaleString()}</p>
          </div>
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function EmployerAnalyticsPage() {
  const { data: jobsData } = useEmployerJobs();
  const jobs = jobsData?.data ?? [];
  const [selectedJobId, setSelectedJobId] = useState<string>('');

  const { data: analyticsRaw, isLoading } = useJobAnalytics(selectedJobId) as { data: AnalyticsData | undefined; isLoading: boolean };
  const analytics = analyticsRaw?.data;

  const viewCount = analytics?.viewCount ?? 0;
  const applicationCount = analytics?.applicationCount ?? 0;
  const shortlistedCount = analytics?.shortlistedCount ?? 0;
  const conversionRate = applicationCount > 0 ? Math.round((shortlistedCount / applicationCount) * 100) : 0;

  const chartData = selectedJobId && analytics
    ? [
        { name: 'Views', value: viewCount, fill: '#3b82f6' },
        { name: 'Applications', value: applicationCount, fill: '#10b981' },
        { name: 'Shortlisted', value: shortlistedCount, fill: '#f59e0b' },
      ]
    : [];

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Track performance of your job postings"
        icon={<BarChart2 className="h-5 w-5" />}
      />

      <div className="max-w-xs">
        <Select value={selectedJobId} onValueChange={setSelectedJobId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a job to view analytics" />
          </SelectTrigger>
          <SelectContent>
            {jobs.map((job) => (
              <SelectItem key={job.id} value={job.id}>
                {job.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedJobId ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center justify-center text-center text-slate-400">
            <BarChart2 className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">Select a job posting above to view its analytics</p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}><CardContent className="p-5 h-20 animate-pulse bg-slate-100 rounded-xl" /></Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Views" value={viewCount} icon={Eye} color="bg-blue-500" />
            <StatCard title="Applications" value={applicationCount} icon={Users} color="bg-emerald-500" />
            <StatCard title="Shortlisted" value={shortlistedCount} icon={UserCheck} color="bg-amber-500" />
            <StatCard title="Conversion Rate" value={conversionRate} icon={TrendingUp} color="bg-purple-500" />
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-700">
                {selectedJob?.title} — Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-slate-400 text-center py-8">No data yet for this job</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
