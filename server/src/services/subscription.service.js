import db from '../config/database.js';
import { CANDIDATE_PLANS, EMPLOYER_PLANS } from '../config/plans.js';

export const activateCandidatePlan = async (candidateId, planKey, subscriptionId) => {
  const plan = CANDIDATE_PLANS[planKey];
  if (!plan) throw new Error('Invalid plan');

  const expiresAt = new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000);

  await db.candidate.update({
    where: { id: candidateId },
    data: { planType: plan.planType, planExpiresAt: expiresAt },
  });

  await db.subscription.update({
    where: { id: subscriptionId },
    data: { status: 'paid', startsAt: new Date(), expiresAt },
  });
};

export const activateEmployerPlan = async (employerId, planKey, subscriptionId) => {
  const plan = EMPLOYER_PLANS[planKey];
  if (!plan) throw new Error('Invalid plan');

  const expiresAt = new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000);

  await db.employer.update({
    where: { id: employerId },
    data: {
      planType: plan.planType,
      planExpiresAt: expiresAt,
      activeJobLimit: plan.activeJobs,
    },
  });

  await db.subscription.update({
    where: { id: subscriptionId },
    data: { status: 'paid', startsAt: new Date(), expiresAt },
  });
};

export const checkEmployerJobLimit = async (employerId) => {
  const employer = await db.employer.findUnique({ where: { id: employerId } });
  if (!employer) throw new Error('Employer not found');

  const planValid = employer.planType !== 'FREE' && employer.planExpiresAt && employer.planExpiresAt > new Date();
  if (!planValid) return { allowed: false, reason: 'Active subscription required to post jobs' };

  const activeJobs = await db.job.count({
    where: { employerId, status: { in: ['ACTIVE', 'PENDING_APPROVAL'] } },
  });

  if (activeJobs >= employer.activeJobLimit) {
    return { allowed: false, reason: `Your plan allows maximum ${employer.activeJobLimit} active job post(s). Please upgrade.` };
  }

  return { allowed: true };
};

export const checkCandidateAppLimit = async (candidateId) => {
  const candidate = await db.candidate.findUnique({ where: { id: candidateId } });
  if (!candidate) throw new Error('Candidate not found');

  if (candidate.planType === 'PREMIUM' && candidate.planExpiresAt && candidate.planExpiresAt > new Date()) {
    return { allowed: true };
  }

  const now = new Date();
  const needsReset = !candidate.appCountReset ||
    (now.getFullYear() > candidate.appCountReset.getFullYear()) ||
    (now.getMonth() > candidate.appCountReset.getMonth());

  if (needsReset) {
    await db.candidate.update({
      where: { id: candidateId },
      data: { appCountThisMonth: 0, appCountReset: now },
    });
    return { allowed: true };
  }

  if (candidate.appCountThisMonth >= 5) {
    return { allowed: false, reason: 'Free plan limit: 5 applications per month. Upgrade to Premium for unlimited applications.' };
  }

  return { allowed: true };
};
