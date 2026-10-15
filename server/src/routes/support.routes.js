import { Router } from 'express';
import { createTicket, getMyTickets, getTicket } from '../controllers/support.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { idParam } from '../validations/shared.validations.js';
import { createTicketSchema } from '../validations/support.validations.js';

const router = Router();
router.use(authenticate);

router.post('/tickets', validate(createTicketSchema), createTicket);
router.get('/tickets', getMyTickets);
router.get('/tickets/:id', validate(idParam), getTicket);

export default router;
