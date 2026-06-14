import { Router } from 'express';
import { getNotifications, markAllRead, markOneRead } from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authenticate);

router.get('/', getNotifications);
router.put('/read-all', markAllRead);
router.put('/:id/read', markOneRead);

export default router;
