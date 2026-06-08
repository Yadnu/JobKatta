export const CANDIDATE_PLANS = {
  FREE: { label: 'Free', price: 0, appLimit: 5 },
  PREMIUM_MONTHLY: { label: 'Premium Monthly', price: 99, appLimit: -1, duration: 30, planType: 'PREMIUM' },
  PREMIUM_YEARLY: { label: 'Premium 6 Months', price: 499, appLimit: -1, duration: 180, planType: 'PREMIUM' },
};

export const EMPLOYER_PLANS = {
  BASIC: { label: 'Basic', price: 499, activeJobs: 1, duration: 30, priority: false, featured: false, planType: 'BASIC' },
  STANDARD: { label: 'Standard', price: 1499, activeJobs: 5, duration: 30, priority: true, featured: false, planType: 'STANDARD' },
  ANNUAL: { label: 'Annual', price: 4999, activeJobs: 10, duration: 365, priority: true, featured: true, planType: 'ANNUAL' },
};

export const getPlanByKey = (role, key) => {
  if (role === 'CANDIDATE') return CANDIDATE_PLANS[key];
  if (role === 'EMPLOYER') return EMPLOYER_PLANS[key];
  return null;
};
