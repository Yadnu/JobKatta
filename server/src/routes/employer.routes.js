import { Router } from 'express';
import {
  getProfile, updateProfile,
  getJobs, createJob, updateJob, deleteJob, duplicateJob, closeJob,
  getApplicants,
  updateApplicationStatus, updateApplicationNote, updateApplicationFollowUp,
  getJobAnalytics, unlockContact,
} from '../controllers/employer.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireEmployer } from '../middleware/role.middleware.js';

const router = Router();
router.use(authenticate, requireEmployer);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

router.get('/jobs', getJobs);
router.post('/jobs', createJob);
router.put('/jobs/:id', updateJob);
router.delete('/jobs/:id', deleteJob);
router.post('/jobs/:id/duplicate', duplicateJob);
router.put('/jobs/:id/close', closeJob);
router.get('/jobs/:id/applications', getApplicants);
router.get('/jobs/:id/analytics', getJobAnalytics);

router.put('/applications/:id/status', updateApplicationStatus);
router.put('/applications/:id/note', updateApplicationNote);
router.put('/applications/:id/followup', updateApplicationFollowUp);

router.post('/unlock-contact/:applicationId', unlockContact);

export default router;
