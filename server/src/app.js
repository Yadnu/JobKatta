import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.routes.js';
import candidateRoutes from './routes/candidate.routes.js';
import jobsRoutes from './routes/jobs.routes.js';
import employerRoutes from './routes/employer.routes.js';
import adminRoutes from './routes/admin.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import supportRoutes from './routes/support.routes.js';
import skillsRoutes from './routes/skills.routes.js';
import notificationRoutes from './routes/notifications.routes.js';

import { errorHandler, notFound } from './middleware/errorHandler.middleware.js';
import { generalApiLimit } from './middleware/rateLimit.middleware.js';
import { getUploadPath } from './config/upload.js';

import { startExpireJobsCron } from './cron/expireJobs.cron.js';
import { startExpiryReminderCron } from './cron/expiryReminder.cron.js';
import { startResetAppCountCron } from './cron/resetAppCount.cron.js';
import { startEmailAlertsCron } from './cron/emailAlerts.cron.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security ──────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Raw body for Razorpay webhook (must come before express.json()) ───────
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// ─── Body Parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Logging ───────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ─── Rate Limiting ─────────────────────────────────────────────────────────
app.use('/api', generalApiLimit);

// ─── Static Uploads ────────────────────────────────────────────────────────
app.use('/uploads', express.static(getUploadPath()));

// ─── API Routes ────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/employer', employerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/notifications', notificationRoutes);

// ─── Health Check ──────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ─── 404 + Error Handler ───────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Job Katta API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);

  if (process.env.NODE_ENV === 'production') {
    startExpireJobsCron();
    startExpiryReminderCron();
    startResetAppCountCron();
    startEmailAlertsCron();
    console.log('⏰ Cron jobs started');
  }
});

export default app;
