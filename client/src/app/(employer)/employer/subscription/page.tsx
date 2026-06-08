'use client';

import { Check, Zap } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { usePlanInfo, usePaymentHistory } from '@/hooks/useSubscription';
import { useEmployerProfile } from '@/hooks/useEmployer';
import PlanBadge from '@/components/shared/PlanBadge';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { cn, formatDate, formatINR } from '@/lib/utils';

export default function EmployerSubscriptionPage() {
  const { user } = useAuthStore();
  const { data: employer, isLoading } = useEmployerProfile();
  const plans = usePlanInfo('EMPLOYER');
  const { data: historyData } = usePaymentHistory();

  const currentPlan = user?.employer?.planType ?? 'FREE';
  const planExpiresAt = user?.employer?.planExpiresAt;
  const activeJobLimit = user?.employer?.activeJobLimit ?? 0;
  const paymentHistory = historyData?.data ?? [];

  const planKeyMap: Record<string, string> = {
    FREE: 'FREE',
    BASIC: 'BASIC',
    STANDARD: 'STANDARD',
    ANNUAL: 'ANNUAL',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Subscription"
        subtitle="Manage your plan and unlock more job posting capacity."
      />

      {/* Current Plan Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-2">Current Plan</p>
            <div className="flex items-center gap-3">
              <PlanBadge plan={currentPlan} className="text-sm px-3 py-1" />
              {currentPlan !== 'FREE' && planExpiresAt && (
                <span className="text-sm text-slate-500">
                  Expires {formatDate(planExpiresAt)}
                </span>
              )}
            </div>
          </div>
          {activeJobLimit > 0 && (
            <div className="text-right">
              <p className="text-sm text-slate-500">Active job limit</p>
              <p className="text-2xl font-bold text-slate-800 mt-0.5">{activeJobLimit}</p>
            </div>
          )}
        </div>

        {currentPlan === 'FREE' && (
          <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>Free Access:</strong> You currently have limited job posting access.
              Upgrade to a paid plan to post more jobs and get priority listing visibility.
            </p>
          </div>
        )}
      </div>

      {/* Plan Comparison */}
      <div>
        <h2 className="text-lg font-heading font-semibold text-slate-800 mb-4">Choose a Plan</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {plans.map((plan) => {
            const isCurrentPlan = planKeyMap[currentPlan] === plan.key;

            return (
              <div
                key={plan.key}
                className={cn(
                  'relative rounded-xl border-2 bg-white p-6 shadow-sm flex flex-col',
                  plan.highlight
                    ? 'border-primary-500 shadow-md shadow-primary-100'
                    : 'border-slate-200',
                  isCurrentPlan && 'bg-slate-50'
                )}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="font-heading font-semibold text-slate-800">{plan.label}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-slate-900">
                      {formatINR(plan.price)}
                    </span>
                    <span className="text-sm text-slate-500 ml-1">
                      {plan.key === 'ANNUAL' ? '/year' : '/month'}
                    </span>
                  </div>
                </div>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                      <Check className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <Button disabled variant="outline" className="w-full">
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    className={cn(
                      'w-full',
                      plan.highlight
                        ? 'bg-primary-500 hover:bg-primary-600 text-white'
                        : ''
                    )}
                    onClick={() => {
                      // Payment flow — Phase 3
                      alert('Payment integration coming soon!');
                    }}
                  >
                    Upgrade to {plan.label}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature comparison note */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="font-heading font-semibold text-slate-700 text-sm mb-3">All plans include</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            'Job listing on JobKatta platform',
            'Applicant tracking dashboard',
            'Candidate profile view',
            'Application status management',
            'Email notifications for new applicants',
            'Access to candidate database',
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-sm text-slate-600">
              <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              {feature}
            </div>
          ))}
        </div>
      </div>

      {/* Payment History */}
      {paymentHistory.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-heading font-semibold text-slate-800">Payment History</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {paymentHistory.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between px-5 py-3.5 gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{payment.planType} Plan</p>
                  <p className="text-xs text-slate-500 mt-0.5">{formatDate(payment.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    {formatINR(payment.amount)}
                  </p>
                  <span
                    className={cn(
                      'text-xs font-medium',
                      payment.status === 'PAID' ? 'text-emerald-600' : 'text-slate-500'
                    )}
                  >
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {employer && (
        <p className="text-xs text-slate-400 text-center pb-4">
          Need a custom plan? Contact us at{' '}
          <a href="mailto:support@jobkatta.in" className="text-primary-600 hover:underline">
            support@jobkatta.in
          </a>
        </p>
      )}
    </div>
  );
}
