'use client';

import { Check, Zap } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { usePlanInfo, usePaymentHistory } from '@/hooks/useSubscription';
import { useCandidate } from '@/hooks/useCandidate';
import { useRazorpay } from '@/hooks/useRazorpay';
import PlanBadge from '@/components/shared/PlanBadge';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { cn, formatDate, formatINR } from '@/lib/utils';
import { CANDIDATE_FREE_APP_LIMIT } from '@/lib/constants';

export default function SubscriptionPage() {
  const { user } = useAuthStore();
  const { data: candidate, isLoading } = useCandidate();
  const plans = usePlanInfo('CANDIDATE');
  const { data: historyData } = usePaymentHistory();
  const { openCheckout, isCreatingOrder, isVerifying } = useRazorpay();

  const currentPlan = user?.candidate?.planType ?? 'FREE';
  const planExpiresAt = user?.candidate?.planExpiresAt;
  const appsThisMonth = candidate?.appCountThisMonth ?? 0;
  const paymentHistory = historyData?.data ?? [];

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
        subtitle="Manage your plan and unlock premium features."
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
          <div className="text-right">
            <p className="text-sm text-slate-500">Applications this month</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">
              {appsThisMonth}
              {currentPlan === 'FREE' && (
                <span className="text-base font-normal text-slate-400"> / {CANDIDATE_FREE_APP_LIMIT}</span>
              )}
            </p>
          </div>
        </div>

        {currentPlan === 'FREE' && (
          <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>Free Plan:</strong> You can apply to up to {CANDIDATE_FREE_APP_LIMIT} jobs per month. Upgrade to Premium for unlimited applications and priority visibility.
            </p>
          </div>
        )}
      </div>

      {/* Plan Comparison */}
      <div>
        <h2 className="text-lg font-heading font-semibold text-slate-800 mb-4">Choose a Plan</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {plans.map((plan) => {
            const isCurrentPlan =
              (currentPlan === 'FREE' && plan.key === 'FREE') ||
              (currentPlan === 'PREMIUM' && (plan.key === 'PREMIUM_MONTHLY' || plan.key === 'PREMIUM_YEARLY'));

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
                    {plan.price === 0 ? (
                      <span className="text-3xl font-bold text-slate-900">Free</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold text-slate-900">
                          {formatINR(plan.price)}
                        </span>
                        <span className="text-sm text-slate-500 ml-1">
                          {plan.key === 'PREMIUM_YEARLY' ? '/year' : '/month'}
                        </span>
                      </>
                    )}
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
                ) : plan.price === 0 ? (
                  <Button disabled variant="outline" className="w-full">
                    Default Plan
                  </Button>
                ) : (
                  <Button
                    className={cn(
                      'w-full',
                      plan.highlight
                        ? 'bg-primary-500 hover:bg-primary-600 text-white'
                        : ''
                    )}
                    disabled={isCreatingOrder || isVerifying}
                    onClick={() =>
                      openCheckout({
                        planKey: plan.key,
                        forRole: 'CANDIDATE',
                        userName: user?.name,
                        userEmail: user?.email,
                      })
                    }
                  >
                    {isCreatingOrder || isVerifying ? 'Processing…' : `Upgrade to ${plan.label}`}
                  </Button>
                )}
              </div>
            );
          })}
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
                      payment.status.toUpperCase() === 'PAID' ? 'text-emerald-600' : 'text-slate-500'
                    )}
                  >
                    {payment.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
