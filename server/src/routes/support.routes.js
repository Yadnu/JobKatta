import { Router } from 'express';
import { createTicket, getMyTickets, getTicket } from '../controllers/support.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authenticate);

router.post('/tickets', createTicket);
router.get('/tickets', getMyTickets);
router.get('/tickets/:id', getTicket);

export default router;
