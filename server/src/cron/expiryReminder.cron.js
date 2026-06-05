import cron from 'node-cron';
import db from '../config/database.js';
import { sendJobExpiryReminderEmail } from '../services/email.service.js';

export const startExpiryReminderCron = () => {
  // Runs every day at 10:00 AM
  cron.schedule('0 10 * * *', async () => {
    try {
      const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      const dayStart = new Date(threeDaysFromNow);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(threeDaysFromNow);
      dayEnd.setHours(23, 59, 59, 999);

      const jobs = await db.job.findMany({
        where: {
          status: 'ACTIVE',
          expiresAt: { gte: dayStart, lte: dayEnd },
          renewalReminderSent: false,
        },
        include: {
          employer: { include: { user: { select: { email: true } } } },
        },
      });

      for (const job of jobs) {
        const email = job.employer?.user?.email;
        if (email) {
          await sendJobExpiryReminderEmail(email, {
            jobTitle: job.title,
            expiresAt: job.expiresAt.toDateString(),
            companyName: job.employer.companyName,
          }).catch(() => {});
        }
        await db.job.update({ where: { id: job.id }, data: { renewalReminderSent: true } });
      }

      console.log(`[Cron] Sent expiry reminders for ${jobs.length} job(s)`);
    } catch (err) {
      console.error('[Cron] expiryReminder error:', err);
    }
  });
};
