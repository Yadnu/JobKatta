import { beforeEach, describe, expect, it, vi } from 'vitest';

const scheduleMock = vi.fn();
vi.mock('node-cron', () => ({
  default: { schedule: scheduleMock },
}));

const jobUpdateManyMock = vi.fn();
vi.mock('../config/database.js', () => ({
  default: { job: { updateMany: jobUpdateManyMock } },
}));

const { startExpireJobsCron } = await import('./expireJobs.cron.js');

const runScheduled = async () => {
  startExpireJobsCron();
  const [, task] = scheduleMock.mock.calls[0];
  await task();
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('startExpireJobsCron', () => {
  it('schedules the job to run every day at midnight', () => {
    startExpireJobsCron();
    expect(scheduleMock).toHaveBeenCalledWith('0 0 * * *', expect.any(Function));
  });

  it('marks active jobs past their expiry as EXPIRED', async () => {
    jobUpdateManyMock.mockResolvedValue({ count: 4 });
    await runScheduled();

    expect(jobUpdateManyMock).toHaveBeenCalledWith({
      where: { status: 'ACTIVE', expiresAt: { lt: expect.any(Date) } },
      data: { status: 'EXPIRED' },
    });
    expect(console.log).toHaveBeenCalledWith('[Cron] Expired 4 job(s)');
  });

  it('logs and swallows a database error', async () => {
    const err = new Error('db down');
    jobUpdateManyMock.mockRejectedValue(err);
    await runScheduled();
    expect(console.error).toHaveBeenCalledWith('[Cron] expireJobs error:', err);
  });
});
