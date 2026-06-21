import Link from 'next/link';
import { CheckCircle2, Briefcase, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const CANDIDATE_PLANS = [
  {
    name: 'Free',
    price: 0,
    badge: null,
    features: [
      '5 applications per month',
      'Basic profile',
      'Job alerts',
      'Save up to 10 jobs',
    ],
    cta: 'Get Started Free',
    href: '/auth/register',
    highlight: false,
  },
  {
    name: 'Premium',
    price: 299,
    badge: 'Most Popular',
    features: [
      'Unlimited applications',
      'Priority profile visibility',
      'Advanced job alerts',
      'Resume boost',
      'Dedicated support',
    ],
    cta: 'Upgrade to Premium',
    href: '/candidate/subscription',
    highlight: true,
  },
];

const EMPLOYER_PLANS = [
  {
    name: 'Basic',
    price: 999,
    badge: null,
    features: [
      '3 active job postings',
      'Standard listing',
      'Applicant management',
      '30-day job validity',
    ],
    cta: 'Start Hiring',
    href: '/auth/register',
    highlight: false,
  },
  {
    name: 'Standard',
    price: 2499,
    badge: 'Best Value',
    features: [
      '10 active job postings',
      'Featured listings',
      'Priority placement',
      'Contact unlock (50/month)',
      'Analytics dashboard',
    ],
    cta: 'Get Standard',
    href: '/employer/subscription',
    highlight: true,
  },
  {
    name: 'Annual',
    price: 9999,
    badge: null,
    features: [
      'Unlimited job postings',
      'Top featured placement',
      'Unlimited contact unlock',
      'Dedicated account manager',
      'Advanced analytics',
    ],
    cta: 'Go Annual',
    href: '/employer/subscription',
    highlight: false,
  },
];

function PlanCard({
  plan,
}: {
  plan: { name: string; price: number; badge: string | null; features: string[]; cta: string; href: string; highlight: boolean };
}) {
  return (
    <div
      className={`relative rounded-2xl border p-6 flex flex-col gap-5 ${
        plan.highlight
          ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100'
          : 'border-slate-200 bg-white shadow-sm'
      }`}
    >
      {plan.badge && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
          {plan.badge}
        </Badge>
      )}
      <div>
        <h3 className="font-semibold text-lg text-slate-800">{plan.name}</h3>
        <div className="mt-1 flex items-baseline gap-1">
          {plan.price === 0 ? (
            <span className="text-3xl font-bold text-slate-900">Free</span>
          ) : (
            <>
              <span className="text-sm text-slate-500">₹</span>
              <span className="text-3xl font-bold text-slate-900">{plan.price.toLocaleString()}</span>
              <span className="text-sm text-slate-500">/month</span>
            </>
          )}
        </div>
      </div>

      <ul className="space-y-2.5 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>

      <Button asChild variant={plan.highlight ? 'default' : 'outline'} className="w-full">
        <Link href={plan.href}>{plan.cta}</Link>
      </Button>
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Simple, Transparent Pricing</h1>
          <p className="mt-3 text-slate-500 max-w-xl mx-auto">
            Whether you're a job seeker or an employer, we have a plan that fits your needs.
          </p>
        </div>

        {/* Candidate Plans */}
        <section className="mb-14">
          <div className="flex items-center gap-2 mb-6">
            <User className="h-5 w-5 text-blue-500" />
            <h2 className="text-xl font-semibold text-slate-800">For Job Seekers</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
            {CANDIDATE_PLANS.map((plan) => (
              <PlanCard key={plan.name} plan={plan} />
            ))}
          </div>
        </section>

        {/* Employer Plans */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Briefcase className="h-5 w-5 text-blue-500" />
            <h2 className="text-xl font-semibold text-slate-800">For Employers</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {EMPLOYER_PLANS.map((plan) => (
              <PlanCard key={plan.name} plan={plan} />
            ))}
          </div>
        </section>

        <p className="mt-10 text-center text-xs text-slate-400">
          All prices are in INR and exclusive of GST. Payments processed securely via Razorpay.
        </p>
      </div>
    </div>
  );
}
