import { Router } from 'express';
import { listSkills, listCategories } from '../controllers/skills.controller.js';

const router = Router();

router.get('/', listSkills);
router.get('/categories', listCategories);

export default router;
