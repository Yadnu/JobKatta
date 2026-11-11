import { beforeEach, describe, expect, it, vi } from 'vitest';

const scheduleMock = vi.fn();
vi.mock('node-cron', () => ({
  default: { schedule: scheduleMock },
}));

const jobFindManyMock = vi.fn();
const jobUpdateMock = vi.fn();
vi.mock('../config/database.js', () => ({
  default: {
    job: { findMany: jobFindManyMock, update: jobUpdateMock },
  },
}));

const sendJobExpiryReminderEmailMock = vi.fn();
vi.mock('../services/email.service.js', () => ({
  sendJobExpiryReminderEmail: sendJobExpiryReminderEmailMock,
}));

const { startExpiryReminderCron } = await import('./expiryReminder.cron.js');

const runScheduled = async () => {
  startExpiryReminderCron();
  const [, task] = scheduleMock.mock.calls.at(-1);
  await task();
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  jobUpdateMock.mockResolvedValue({});
  sendJobExpiryReminderEmailMock.mockResolvedValue({ ok: true });
});

describe('startExpiryReminderCron', () => {
  it('schedules the job to run every day at 10:00', () => {
    startExpiryReminderCron();
    expect(scheduleMock).toHaveBeenCalledWith('0 10 * * *', expect.any(Function));
  });

  it('looks for active jobs expiring in three days that have not been reminded', async () => {
    jobFindManyMock.mockResolvedValue([]);
    await runScheduled();

    const where = jobFindManyMock.mock.calls[0][0].where;
    expect(where.status).toBe('ACTIVE');
    expect(where.renewalReminderSent).toBe(false);
    expect(where.expiresAt.gte.getHours()).toBe(0);
    expect(where.expiresAt.lte.getHours()).toBe(23);
    const threeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    expect(where.expiresAt.gte.getDate()).toBe(threeDays.getDate());
    expect(console.log).toHaveBeenCalledWith('[Cron] Sent expiry reminders for 0 job(s)');
  });

  it('emails the employer and marks the reminder as sent', async () => {
    const expiresAt = new Date('2026-12-01T12:00:00.000Z');
    jobFindManyMock.mockResolvedValue([
      {
        id: 'job-1',
        title: 'Engineer',
        expiresAt,
        employer: { companyName: 'Acme', user: { email: 'hr@acme.com' } },
      },
    ]);

    await runScheduled();

    expect(sendJobExpiryReminderEmailMock).toHaveBeenCalledWith('hr@acme.com', {
      jobTitle: 'Engineer',
      expiresAt: expiresAt.toDateString(),
      companyName: 'Acme',
    });
    expect(jobUpdateMock).toHaveBeenCalledWith({
      where: { id: 'job-1' },
      data: { renewalReminderSent: true },
    });
  });

  it('still marks the reminder sent when the employer has no email', async () => {
    jobFindManyMock.mockResolvedValue([
      { id: 'job-2', title: 'Role', expiresAt: new Date(), employer: null },
    ]);

    await runScheduled();

    expect(sendJobExpiryReminderEmailMock).not.toHaveBeenCalled();
    expect(jobUpdateMock).toHaveBeenCalledWith({
      where: { id: 'job-2' },
      data: { renewalReminderSent: true },
    });
  });

  it('still marks the reminder sent when the email fails', async () => {
    sendJobExpiryReminderEmailMock.mockRejectedValue(new Error('smtp down'));
    jobFindManyMock.mockResolvedValue([
      {
        id: 'job-3',
        title: 'Role',
        expiresAt: new Date(),
        employer: { companyName: 'Acme', user: { email: 'hr@acme.com' } },
      },
    ]);

    await runScheduled();

    expect(jobUpdateMock).toHaveBeenCalledWith({
      where: { id: 'job-3' },
      data: { renewalReminderSent: true },
    });
  });

  it('logs and swallows a database error', async () => {
    const err = new Error('db down');
    jobFindManyMock.mockRejectedValue(err);
    await runScheduled();
    expect(console.error).toHaveBeenCalledWith('[Cron] expiryReminder error:', err);
  });
});
