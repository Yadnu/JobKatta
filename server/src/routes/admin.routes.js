import { Router } from 'express';
import {
  getStats, getPendingJobs, approveJob, rejectJob, getAllJobs,
  getCandidates, getCandidate, suspendCandidate,
  getEmployers, getEmployer, suspendEmployer, verifyEmployer, upgradeEmployerPlan,
  getSubscriptions, getFlags, resolveFlag,
  getTickets, replyTicket, updateTicketStatus,
  getRevenue,
} from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { idParam } from '../validations/shared.validations.js';
import {
  rejectJobSchema,
  adminJobsQuerySchema,
  upgradeEmployerPlanSchema,
  adminSearchQuerySchema,
  adminSubscriptionsQuerySchema,
  replyTicketSchema,
  updateAdminTicketStatusSchema,
} from '../validations/admin.validations.js';

const router = Router();
router.use(authenticate, requireAdmin);

router.get('/stats', getStats);
router.get('/revenue', getRevenue);

router.get('/jobs/pending', getPendingJobs);
router.put('/jobs/:id/approve', validate(idParam), approveJob);
router.put('/jobs/:id/reject', validate(rejectJobSchema), rejectJob);
router.get('/jobs', validate(adminJobsQuerySchema), getAllJobs);

router.get('/candidates', validate(adminSearchQuerySchema), getCandidates);
router.get('/candidates/:id', validate(idParam), getCandidate);
router.put('/candidates/:id/suspend', validate(idParam), suspendCandidate);

router.get('/employers', validate(adminSearchQuerySchema), getEmployers);
router.get('/employers/:id', validate(idParam), getEmployer);
router.put('/employers/:id/suspend', validate(idParam), suspendEmployer);
router.put('/employers/:id/verify', validate(idParam), verifyEmployer);
router.put('/employers/:id/upgrade-plan', validate(upgradeEmployerPlanSchema), upgradeEmployerPlan);

router.get('/subscriptions', validate(adminSubscriptionsQuerySchema), getSubscriptions);

router.get('/flags', getFlags);
router.put('/flags/:id/resolve', validate(idParam), resolveFlag);

router.get('/support', getTickets);
router.put('/support/:id/reply', validate(replyTicketSchema), replyTicket);
router.put('/support/:id/status', validate(updateAdminTicketStatusSchema), updateTicketStatus);

export default router;
