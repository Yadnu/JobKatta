import { Router } from 'express';
import { createOrder, verifyPayment, webhook, getHistory } from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createOrderSchema, verifyPaymentSchema } from '../validations/payment.validations.js';

const router = Router();

// Webhook must receive raw body — handled in app.js with express.raw()
router.post('/webhook', webhook);

router.use(authenticate);
router.post('/create-order', validate(createOrderSchema), createOrder);
router.post('/verify', validate(verifyPaymentSchema), verifyPayment);
router.get('/history', getHistory);

export default router;
