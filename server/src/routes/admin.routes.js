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

const router = Router();
router.use(authenticate, requireAdmin);

router.get('/stats', getStats);
router.get('/revenue', getRevenue);

router.get('/jobs/pending', getPendingJobs);
router.put('/jobs/:id/approve', approveJob);
router.put('/jobs/:id/reject', rejectJob);
router.get('/jobs', getAllJobs);

router.get('/candidates', getCandidates);
router.get('/candidates/:id', getCandidate);
router.put('/candidates/:id/suspend', suspendCandidate);

router.get('/employers', getEmployers);
router.get('/employers/:id', getEmployer);
router.put('/employers/:id/suspend', suspendEmployer);
router.put('/employers/:id/verify', verifyEmployer);
router.put('/employers/:id/upgrade-plan', upgradeEmployerPlan);

router.get('/subscriptions', getSubscriptions);

router.get('/flags', getFlags);
router.put('/flags/:id/resolve', resolveFlag);

router.get('/support', getTickets);
router.put('/support/:id/reply', replyTicket);
router.put('/support/:id/status', updateTicketStatus);

export default router;
