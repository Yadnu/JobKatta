'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Briefcase, Users, Building2, TrendingUp, CheckCircle2, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useFeaturedJobs } from '@/hooks/useJobs';
import { formatSalaryRange, timeAgo, employmentTypeLabel } from '@/lib/utils';
import { JOB_CATEGORIES } from '@/lib/constants';

const STATS = [
  { icon: Briefcase, value: '2,400+', label: 'Active Jobs' },
  { icon: Building2, value: '350+', label: 'Verified Companies' },
  { icon: Users, value: '18,000+', label: 'Registered Candidates' },
  { icon: TrendingUp, value: '82%', label: 'Placement Rate' },
];

const HOW_IT_WORKS_CANDIDATE = [
  { step: '01', title: 'Create Your Profile', desc: 'Add your skills, experience, and preferred job locations.' },
  { step: '02', title: 'Browse Local Jobs', desc: 'Search and filter jobs by city, category, and salary range.' },
  { step: '03', title: 'Apply in One Click', desc: 'Apply directly with your profile — no lengthy forms.' },
];

const HOW_IT_WORKS_EMPLOYER = [
  { step: '01', title: 'Post Your Job', desc: 'Describe the role, requirements, and salary. Approved within 24 hours.' },
  { step: '02', title: 'Receive Applications', desc: 'Review applicants on your dashboard with a Kanban-style pipeline.' },
  { step: '03', title: 'Hire Locally', desc: 'Unlock contact details and reach out directly to candidates.' },
];

export default function LandingPage() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const { data: featuredJobs, isLoading } = useFeaturedJobs();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (city) params.set('city', city);
    router.push(`/jobs?${params}`);
  };

  return (
    <div className="bg-[#F8FAFC]">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-center">
          <Badge className="mb-5 bg-primary-500/20 text-primary-300 border-primary-500/30 hover:bg-primary-500/30">
            🇮🇳 Built for Indian Job Seekers
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight mb-4">
            Apni Naukri,{' '}
            <span className="text-primary-400">Apne Shehar</span>{' '}
            Mein
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10">
            Find jobs in your city — no relocation needed. Freshers welcome. Direct employer contact.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto bg-white rounded-xl shadow-xl p-2 flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search className="h-5 w-5 text-slate-400 flex-shrink-0" />
              <Input
                type="text"
                placeholder="Job title, skill, company…"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="border-0 shadow-none focus-visible:ring-0 p-0 text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <div className="hidden sm:block w-px bg-slate-200" />
            <div className="flex-1 flex items-center gap-2 px-3">
              <MapPin className="h-5 w-5 text-slate-400 flex-shrink-0" />
              <Input
                type="text"
                placeholder="City (e.g. Nashik, Pune…)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="border-0 shadow-none focus-visible:ring-0 p-0 text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <Button type="submit" className="bg-primary-500 hover:bg-primary-600 rounded-lg px-8 shrink-0">
              Search Jobs
            </Button>
          </form>

          <p className="mt-4 text-sm text-slate-400">
            Popular: <span className="space-x-2">
              {['Sales', 'IT / Software', 'Healthcare', 'Accounting'].map((c) => (
                <Link key={c} href={`/jobs?category=${encodeURIComponent(c)}`} className="hover:text-primary-300 transition-colors">{c}</Link>
              ))}
            </span>
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary-500" />
              </div>
              <div>
                <p className="text-xl font-heading font-bold text-slate-800">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-heading font-bold text-slate-800">Browse by Category</h2>
          <p className="text-slate-500 mt-1 text-sm">Find jobs across all major sectors</p>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {JOB_CATEGORIES.slice(0, 12).map((cat) => (
            <Link
              key={cat}
              href={`/jobs?category=${encodeURIComponent(cat)}`}
              className="px-4 py-2 rounded-full border border-slate-200 bg-white text-sm text-slate-600 hover:border-primary-400 hover:text-primary-600 hover:bg-orange-50 transition-all"
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-heading font-bold text-slate-800">Featured Jobs</h2>
              <p className="text-slate-500 text-sm mt-1">Handpicked opportunities for you</p>
            </div>
            <Link href="/jobs" className="text-sm text-primary-500 font-medium flex items-center gap-1 hover:underline">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <div key={i} className="h-40 rounded-xl bg-slate-100 animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(featuredJobs || []).map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="bg-white border border-slate-200 rounded-xl p-5 hover:border-primary-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-400 overflow-hidden">
                        {job.employer?.logoUrl
                          ? <img src={job.employer.logoUrl} alt="" className="h-full w-full object-cover" />
                          : job.employer?.companyName?.[0]}
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">{job.employer?.companyName}</p>
                        <h3 className="text-sm font-semibold text-slate-800 group-hover:text-primary-600 transition-colors line-clamp-1">{job.title}</h3>
                      </div>
                    </div>
                    {job.isFeatured && <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="flex items-center gap-1 text-xs text-slate-500"><MapPin className="h-3 w-3" />{job.city}</span>
                    <span className="text-xs bg-orange-50 text-primary-600 px-2 py-0.5 rounded-full">{employmentTypeLabel[job.employmentType] || job.employmentType}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-700 mt-2">
                    {formatSalaryRange(job.salaryMin, job.salaryMax, job.hideSalary)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{timeAgo(job.createdAt)}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-heading font-bold text-slate-800">How It Works</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Candidates */}
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center"><Users className="h-5 w-5 text-primary-500" /></div>
              <h3 className="text-lg font-heading font-semibold text-slate-800">For Job Seekers</h3>
            </div>
            <div className="space-y-5">
              {HOW_IT_WORKS_CANDIDATE.map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="text-2xl font-heading font-bold text-primary-200 w-10 flex-shrink-0">{item.step}</div>
                  <div>
                    <p className="font-semibold text-slate-700">{item.title}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button asChild className="mt-8 bg-primary-500 hover:bg-primary-600 w-full">
              <Link href="/auth/register?role=CANDIDATE">Find Jobs Now</Link>
            </Button>
          </div>

          {/* Employers */}
          <div className="bg-slate-900 rounded-2xl p-8 border border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-9 w-9 rounded-full bg-primary-500/20 flex items-center justify-center"><Building2 className="h-5 w-5 text-primary-400" /></div>
              <h3 className="text-lg font-heading font-semibold text-white">For Employers</h3>
            </div>
            <div className="space-y-5">
              {HOW_IT_WORKS_EMPLOYER.map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="text-2xl font-heading font-bold text-primary-700 w-10 flex-shrink-0">{item.step}</div>
                  <div>
                    <p className="font-semibold text-slate-200">{item.title}</p>
                    <p className="text-sm text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button asChild variant="outline" className="mt-8 w-full border-primary-500 text-primary-400 hover:bg-primary-500/10">
              <Link href="/auth/register?role=EMPLOYER">Post a Job Free</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Job Katta */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-heading font-bold text-slate-800 mb-10">Why Job Katta?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              { title: 'Hyperlocal Focus', desc: 'Jobs tailored to Tier 2 & Tier 3 cities across Maharashtra and India — no more Mumbai-only listings.' },
              { title: 'Freshers Welcome', desc: 'Dedicated section for 0-experience candidates. Your first job is closer than you think.' },
              { title: 'Verified Employers', desc: 'All employers are reviewed before posting. No fake jobs, no scams.' },
            ].map((item) => (
              <div key={item.title} className="p-6 rounded-xl border border-slate-100 bg-slate-50">
                <CheckCircle2 className="h-6 w-6 text-primary-500 mb-3" />
                <h3 className="font-heading font-semibold text-slate-800 mb-1">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-heading font-bold text-slate-800 mb-3">Ready to find your next job?</h2>
          <p className="text-slate-500 mb-6">Join thousands of candidates and employers on Job Katta today.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="bg-primary-500 hover:bg-primary-600" asChild>
              <Link href="/auth/register">Create Free Account</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/jobs">Browse Jobs</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
