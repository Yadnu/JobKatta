import { z } from 'zod';

const ROLES = ['CANDIDATE', 'EMPLOYER'];

export const createOrderSchema = z.object({
  body: z.object({
    planKey: z.string().min(1, 'Plan key required'),
    forRole: z.enum(ROLES, { errorMap: () => ({ message: 'forRole must be CANDIDATE or EMPLOYER' }) }),
  }),
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    razorpay_order_id: z.string().min(1, 'Order ID required'),
    razorpay_payment_id: z.string().min(1, 'Payment ID required'),
    razorpay_signature: z.string().min(1, 'Signature required'),
    subscriptionId: z.string().min(1, 'Subscription ID required'),
    planKey: z.string().min(1, 'Plan key required'),
    forRole: z.enum(ROLES, { errorMap: () => ({ message: 'forRole must be CANDIDATE or EMPLOYER' }) }),
  }),
});
