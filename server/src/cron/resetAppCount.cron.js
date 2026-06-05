import cron from 'node-cron';
import db from '../config/database.js';

export const startResetAppCountCron = () => {
  // Runs at midnight on the 1st of every month
  cron.schedule('0 0 1 * *', async () => {
    try {
      const result = await db.candidate.updateMany({
        data: { appCountThisMonth: 0, appCountReset: new Date() },
      });
      console.log(`[Cron] Reset application count for ${result.count} candidate(s)`);
    } catch (err) {
      console.error('[Cron] resetAppCount error:', err);
    }
  });
};
