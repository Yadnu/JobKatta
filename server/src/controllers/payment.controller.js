import db from '../config/database.js';
import razorpay from '../config/razorpay.js';
import { catchAsync, AppError } from '../middleware/errorHandler.middleware.js';
import { verifyRazorpaySignature, verifyWebhookSignature } from '../utils/razorpay.util.js';
import { activateCandidatePlan, activateEmployerPlan } from '../services/subscription.service.js';
import { sendPaymentReceiptEmail } from '../services/email.service.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.util.js';

export const createOrder = catchAsync(async (req, res) => {
  const { planKey, forRole } = req.body;
  if (!planKey || !forRole) throw new AppError('planKey and forRole are required', 400);

  const planPrices = {
    CANDIDATE: { PREMIUM_MONTHLY: 99, PREMIUM_YEARLY: 999 },
    EMPLOYER: { BASIC: 499, STANDARD: 1499, ANNUAL: 4999 },
  };

  const price = planPrices[forRole]?.[planKey];
  if (!price) throw new AppError('Invalid plan', 400);

  const amountPaise = price * 100;
  const receipt = `rcpt_${req.user.id}_${Date.now()}`;

  const order = await razorpay.orders.create({
    amount: amountPaise,
    currency: 'INR',
    receipt,
    notes: { userId: req.user.id, planKey, forRole },
  });

  let candidateId = null;
  let employerId = null;

  if (forRole === 'CANDIDATE') {
    const candidate = await db.candidate.findUnique({ where: { userId: req.user.id } });
    candidateId = candidate?.id;
  } else {
    const employer = await db.employer.findUnique({ where: { userId: req.user.id } });
    employerId = employer?.id;
  }

  const subscription = await db.subscription.create({
    data: {
      userId: req.user.id,
      candidateId,
      employerId,
      planType: planKey.startsWith('PREMIUM') ? 'PREMIUM' : planKey,
      amount: price,
      currency: 'INR',
      razorpayOrderId: order.id,
      status: 'pending',
    },
  });

  res.json({
    success: true,
    message: 'Order created',
    data: {
      orderId: order.id,
      amount: amountPaise,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID,
      subscriptionId: subscription.id,
      planKey,
      forRole,
    },
  });
});

export const verifyPayment = catchAsync(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, subscriptionId, planKey, forRole } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new AppError('Payment details incomplete', 400);
  }

  const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  if (!isValid) throw new AppError('Payment verification failed', 400);

  const subscription = await db.subscription.findUnique({ where: { id: subscriptionId } });
  if (!subscription) throw new AppError('Subscription record not found', 404);
  if (subscription.status === 'paid') {
    return res.json({ success: true, message: 'Payment already processed', data: subscription });
  }

  await db.subscription.update({
    where: { id: subscriptionId },
    data: { razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature },
  });

  if (forRole === 'CANDIDATE') {
    await activateCandidatePlan(subscription.candidateId, planKey, subscriptionId);
  } else {
    await activateEmployerPlan(subscription.employerId, planKey, subscriptionId);
  }

  const user = await db.user.findUnique({ where: { id: req.user.id }, select: { email: true } });
  if (user?.email) {
    await sendPaymentReceiptEmail(user.email, {
      planKey,
      amount: subscription.amount,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    }).catch(() => {});
  }

  res.json({ success: true, message: 'Payment verified and plan activated' });
});

export const webhook = catchAsync(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const isValid = verifyWebhookSignature(req.body, signature);

  if (!isValid) {
    return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
  }

  const event = req.body;
  if (event.event === 'payment.captured') {
    const paymentId = event.payload?.payment?.entity?.id;
    const orderId = event.payload?.payment?.entity?.order_id;

    if (orderId) {
      const subscription = await db.subscription.findFirst({ where: { razorpayOrderId: orderId } });
      if (subscription && subscription.status !== 'paid') {
        const notes = event.payload?.payment?.entity?.notes || {};
        const { planKey, forRole } = notes;

        if (forRole === 'CANDIDATE') {
          await activateCandidatePlan(subscription.candidateId, planKey, subscription.id);
        } else if (forRole === 'EMPLOYER') {
          await activateEmployerPlan(subscription.employerId, planKey, subscription.id);
        }

        await db.subscription.update({
          where: { id: subscription.id },
          data: { razorpayPaymentId: paymentId },
        });
      }
    }
  }

  res.json({ received: true });
});

export const getHistory = catchAsync(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const [subscriptions, total] = await Promise.all([
    db.subscription.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    db.subscription.count({ where: { userId: req.user.id } }),
  ]);
  res.json({
    success: true,
    message: 'Payment history',
    data: subscriptions,
    pagination: buildPaginationMeta(page, limit, total),
  });
});
