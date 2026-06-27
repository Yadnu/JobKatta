import cron from 'node-cron';
import db from '../config/database.js';
import { sendJobAlertDigestEmail } from '../services/email.service.js';

export const startEmailAlertsCron = () => {
  // Runs every day at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    try {
      const alerts = await db.emailAlert.findMany({
        where: { isActive: true },
        include: { candidate: { include: { user: { select: { email: true } } } } },
      });

      for (const alert of alerts) {
        try {
          const email = alert.candidate?.user?.email;
          if (!email) continue;

          const since = alert.lastSentAt || new Date(0);
          const where = {
            status: 'ACTIVE',
            createdAt: { gt: since },
          };

          if (alert.keywords) {
            where.OR = [
              { title: { contains: alert.keywords } },
              { description: { contains: alert.keywords } },
            ];
          }
          if (alert.city) where.city = { contains: alert.city };
          if (alert.jobType) where.employmentType = alert.jobType;

          const jobs = await db.job.findMany({
            where,
            include: { employer: { select: { companyName: true } } },
            take: 10,
          });

          if (jobs.length === 0) continue;

          const fullName = [alert.candidate?.firstName, alert.candidate?.lastName]
            .filter(Boolean)
            .join(' ')
            .trim();

          await sendJobAlertDigestEmail(email, {
            name: fullName || 'there',
            jobCount: jobs.length,
            jobs: jobs.map((j) => ({
              title: j.title,
              company: j.employer?.companyName ?? 'A company',
              city: j.city,
              url: `${process.env.BASE_URL}/jobs/${j.id}`,
            })),
          }).catch(() => {});

          await db.emailAlert.update({ where: { id: alert.id }, data: { lastSentAt: new Date() } });
        } catch (alertErr) {
          console.error(`[Cron] emailAlerts failed for alert ${alert.id}:`, alertErr);
        }
      }

      console.log(`[Cron] Processed ${alerts.length} email alert(s)`);
    } catch (err) {
      console.error('[Cron] emailAlerts error:', err);
    }
  });
};
