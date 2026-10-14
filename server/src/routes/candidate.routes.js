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
import { validate } from '../middleware/validate.middleware.js';
import { idParam } from '../validations/shared.validations.js';
import {
  updateCandidateProfileSchema,
  addEducationSchema,
  updateEducationSchema,
  addExperienceSchema,
  updateExperienceSchema,
  updateSkillsSchema,
  updatePreferencesSchema,
  createAlertSchema,
  updateAlertSchema,
} from '../validations/candidate.validations.js';

const router = Router();
router.use(authenticate, requireCandidate);

router.get('/profile', getProfile);
router.put('/profile', validate(updateCandidateProfileSchema), updateProfile);
router.put('/profile/step/:stepNumber', updateProfileStep);
router.get('/profile/completeness', getProfileCompleteness);

router.post('/education', validate(addEducationSchema), addEducation);
router.put('/education/:id', validate(updateEducationSchema), updateEducation);
router.delete('/education/:id', validate(idParam), deleteEducation);

router.post('/experience', validate(addExperienceSchema), addExperience);
router.put('/experience/:id', validate(updateExperienceSchema), updateExperience);
router.delete('/experience/:id', validate(idParam), deleteExperience);

router.put('/skills', validate(updateSkillsSchema), updateSkills);
router.put('/preferences', validate(updatePreferencesSchema), updatePreferences);

router.get('/applications', getApplications);
router.get('/saved-jobs', getSavedJobs);
router.put('/open-to-work', toggleOpenToWork);

router.post('/alerts', validate(createAlertSchema), createAlert);
router.get('/alerts', getAlerts);
router.put('/alerts/:id', validate(updateAlertSchema), updateAlert);
router.delete('/alerts/:id', validate(idParam), deleteAlert);

export default router;
