import { Router } from 'express';
import { listJobs, getJob, getFeaturedJobs, getPublicEmployers, toggleSaveJob, applyToJob } from '../controllers/jobs.controller.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware.js';
import { requireCandidate } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { idParam } from '../validations/shared.validations.js';
import { listJobsSchema, listPublicEmployersSchema, applyJobSchema } from '../validations/jobs.validations.js';

const router = Router();

router.get('/', validate(listJobsSchema), listJobs);
router.get('/featured', getFeaturedJobs);
router.get('/employers', validate(listPublicEmployersSchema), getPublicEmployers);
router.get('/:id', optionalAuthenticate, validate(idParam), getJob);
router.post('/:id/save', authenticate, requireCandidate, validate(idParam), toggleSaveJob);
router.post('/:id/apply', authenticate, requireCandidate, validate(applyJobSchema), applyToJob);

export default router;
