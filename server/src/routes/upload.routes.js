import { Router } from 'express';
import { uploadPhoto as uploadPhotoHandler, uploadResume as uploadResumeHandler, uploadLogo as uploadLogoHandler } from '../controllers/upload.controller.js';
import { uploadPhoto, uploadResume, uploadLogo } from '../config/upload.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireCandidate, requireEmployer } from '../middleware/role.middleware.js';
import { uploadRateLimit } from '../middleware/rateLimit.middleware.js';

const router = Router();
router.use(authenticate, uploadRateLimit);

router.post('/photo', requireCandidate, uploadPhoto.single('photo'), uploadPhotoHandler);
router.post('/resume', requireCandidate, uploadResume.single('resume'), uploadResumeHandler);
router.post('/logo', requireEmployer, uploadLogo.single('logo'), uploadLogoHandler);

export default router;
