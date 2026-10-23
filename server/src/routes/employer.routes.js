import { Router } from 'express';
import {
  getPublicEmployerById,
  getProfile, updateProfile,
  getJobs, createJob, updateJob, deleteJob, duplicateJob, closeJob,
  getApplicants, getRecentApplications,
  updateApplicationStatus, updateApplicationNote, updateApplicationFollowUp,
  getJobAnalytics, unlockContact,
} from '../controllers/employer.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireEmployer } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { idParam } from '../validations/shared.validations.js';
import {
  updateEmployerProfileSchema,
  createJobSchema,
  updateJobSchema,
  updateApplicationStatusSchema,
  updateApplicationNoteSchema,
  updateApplicationFollowUpSchema,
} from '../validations/employer.validations.js';

const router = Router();

router.get('/public/:id', validate(idParam), getPublicEmployerById);

router.use(authenticate, requireEmployer);

router.get('/profile', getProfile);
router.put('/profile', validate(updateEmployerProfileSchema), updateProfile);

router.get('/jobs', getJobs);
router.post('/jobs', validate(createJobSchema), createJob);
router.put('/jobs/:id', validate(updateJobSchema), updateJob);
router.delete('/jobs/:id', validate(idParam), deleteJob);
router.post('/jobs/:id/duplicate', validate(idParam), duplicateJob);
router.put('/jobs/:id/close', validate(idParam), closeJob);
router.get('/jobs/:id/applications', validate(idParam), getApplicants);
router.get('/jobs/:id/analytics', validate(idParam), getJobAnalytics);

router.get('/applications', getRecentApplications);
router.put('/applications/:id/status', validate(updateApplicationStatusSchema), updateApplicationStatus);
router.put('/applications/:id/note', validate(updateApplicationNoteSchema), updateApplicationNote);
router.put('/applications/:id/followup', validate(updateApplicationFollowUpSchema), updateApplicationFollowUp);

router.post('/unlock-contact/:applicationId', unlockContact);

export default router;
