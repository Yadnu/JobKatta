import { Router } from 'express';
import { listJobs, getJob, getFeaturedJobs, toggleSaveJob, applyToJob } from '../controllers/jobs.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireCandidate } from '../middleware/role.middleware.js';

const router = Router();

router.get('/', listJobs);
router.get('/featured', getFeaturedJobs);
router.get('/:id', authenticate, getJob);
router.post('/:id/save', authenticate, requireCandidate, toggleSaveJob);
router.post('/:id/apply', authenticate, requireCandidate, applyToJob);

export default router;
