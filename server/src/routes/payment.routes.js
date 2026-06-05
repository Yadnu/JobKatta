import { Router } from 'express';
import { createOrder, verifyPayment, webhook, getHistory } from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import express from 'express';

const router = Router();

// Webhook must receive raw body — handled in app.js with express.raw()
router.post('/webhook', webhook);

router.use(authenticate);
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.get('/history', getHistory);

export default router;
