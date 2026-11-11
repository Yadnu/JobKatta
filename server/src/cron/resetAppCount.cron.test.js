import { beforeEach, describe, expect, it, vi } from 'vitest';

const scheduleMock = vi.fn();
vi.mock('node-cron', () => ({
  default: { schedule: scheduleMock },
}));

const candidateUpdateManyMock = vi.fn();
vi.mock('../config/database.js', () => ({
  default: { candidate: { updateMany: candidateUpdateManyMock } },
}));

const { startResetAppCountCron } = await import('./resetAppCount.cron.js');

const runScheduled = async () => {
  startResetAppCountCron();
  const [, task] = scheduleMock.mock.calls[0];
  await task();
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('startResetAppCountCron', () => {
  it('schedules the reset for midnight on the first of each month', () => {
    startResetAppCountCron();
    expect(scheduleMock).toHaveBeenCalledWith('0 0 1 * *', expect.any(Function));
  });

  it('zeroes every candidate application count', async () => {
    candidateUpdateManyMock.mockResolvedValue({ count: 12 });
    await runScheduled();

    expect(candidateUpdateManyMock).toHaveBeenCalledWith({
      data: { appCountThisMonth: 0, appCountReset: expect.any(Date) },
    });
    expect(console.log).toHaveBeenCalledWith('[Cron] Reset application count for 12 candidate(s)');
  });

  it('logs and swallows a database error', async () => {
    const err = new Error('db down');
    candidateUpdateManyMock.mockRejectedValue(err);
    await runScheduled();
    expect(console.error).toHaveBeenCalledWith('[Cron] resetAppCount error:', err);
  });
});
