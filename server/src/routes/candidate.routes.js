import { Router } from 'express';
import {
  getProfile, updateProfile, updateProfileStep, getProfileCompleteness,
  addEducation, updateEducation, deleteEducation,
  addExperience, updateExperience, deleteExperience,
  updateSkills, updatePreferences,
  getApplications, getSavedJobs,
  toggleOpenToWork,
  createAlert, getAlerts, updateAlert, deleteAlert,
} from '../controllers/candidate.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireCandidate } from '../middleware/role.middleware.js';

const router = Router();
router.use(authenticate, requireCandidate);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/profile/step/:stepNumber', updateProfileStep);
router.get('/profile/completeness', getProfileCompleteness);

router.post('/education', addEducation);
router.put('/education/:id', updateEducation);
router.delete('/education/:id', deleteEducation);

router.post('/experience', addExperience);
router.put('/experience/:id', updateExperience);
router.delete('/experience/:id', deleteExperience);

router.put('/skills', updateSkills);
router.put('/preferences', updatePreferences);

router.get('/applications', getApplications);
router.get('/saved-jobs', getSavedJobs);
router.put('/open-to-work', toggleOpenToWork);

router.post('/alerts', createAlert);
router.get('/alerts', getAlerts);
router.put('/alerts/:id', updateAlert);
router.delete('/alerts/:id', deleteAlert);

export default router;
