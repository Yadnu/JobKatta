import cron from 'node-cron';
import db from '../config/database.js';

export const startExpireJobsCron = () => {
  // Runs every day at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      const result = await db.job.updateMany({
        where: { status: 'ACTIVE', expiresAt: { lt: new Date() } },
        data: { status: 'EXPIRED' },
      });
      console.log(`[Cron] Expired ${result.count} job(s)`);
    } catch (err) {
      console.error('[Cron] expireJobs error:', err);
    }
  });
};
