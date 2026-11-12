import { beforeEach, describe, expect, it, vi } from 'vitest';

const scheduleMock = vi.fn();
vi.mock('node-cron', () => ({
  default: { schedule: scheduleMock },
}));

const alertFindManyMock = vi.fn();
const alertUpdateMock = vi.fn();
const jobFindManyMock = vi.fn();
vi.mock('../config/database.js', () => ({
  default: {
    emailAlert: { findMany: alertFindManyMock, update: alertUpdateMock },
    job: { findMany: jobFindManyMock },
  },
}));

const sendJobAlertDigestEmailMock = vi.fn();
vi.mock('../services/email.service.js', () => ({
  sendJobAlertDigestEmail: sendJobAlertDigestEmailMock,
}));

const { startEmailAlertsCron } = await import('./emailAlerts.cron.js');

const runScheduled = async () => {
  startEmailAlertsCron();
  const [, task] = scheduleMock.mock.calls.at(-1);
  await task();
};

const alert = (overrides = {}) => ({
  id: 'alert-1',
  keywords: null,
  city: null,
  jobType: null,
  lastSentAt: null,
  candidate: { firstName: 'Ada', lastName: 'Lovelace', user: { email: 'ada@mail.com' } },
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  process.env.BASE_URL = 'https://jobkatta.in';
  alertUpdateMock.mockResolvedValue({});
  sendJobAlertDigestEmailMock.mockResolvedValue({ ok: true });
});

describe('startEmailAlertsCron', () => {
  it('schedules the digest for every day at 08:00', () => {
    startEmailAlertsCron();
    expect(scheduleMock).toHaveBeenCalledWith('0 8 * * *', expect.any(Function));
  });

  it('skips an alert when the candidate has no email', async () => {
    alertFindManyMock.mockResolvedValue([
      alert({ candidate: { firstName: 'Ada', user: { email: null } } }),
    ]);
    await runScheduled();
    expect(jobFindManyMock).not.toHaveBeenCalled();
    expect(sendJobAlertDigestEmailMock).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('[Cron] Processed 1 email alert(s)');
  });

  it('filters new active jobs by keywords, city, and employment type', async () => {
    const lastSentAt = new Date('2026-11-01T00:00:00.000Z');
    alertFindManyMock.mockResolvedValue([
      alert({ keywords: 'react', city: 'Pune', jobType: 'FULL_TIME', lastSentAt }),
    ]);
    jobFindManyMock.mockResolvedValue([]);

    await runScheduled();

    expect(jobFindManyMock).toHaveBeenCalledWith({
      where: {
        status: 'ACTIVE',
        createdAt: { gt: lastSentAt },
        OR: [
          { title: { contains: 'react' } },
          { description: { contains: 'react' } },
        ],
        city: { contains: 'Pune' },
        employmentType: 'FULL_TIME',
      },
      include: { employer: { select: { companyName: true } } },
      take: 10,
    });
    expect(sendJobAlertDigestEmailMock).not.toHaveBeenCalled();
    expect(alertUpdateMock).not.toHaveBeenCalled();
  });

  it('uses the epoch as the cutoff when the alert has never been sent', async () => {
    alertFindManyMock.mockResolvedValue([alert()]);
    jobFindManyMock.mockResolvedValue([]);
    await runScheduled();
    expect(jobFindManyMock.mock.calls[0][0].where.createdAt.gt).toEqual(new Date(0));
  });

  it('sends a digest and records lastSentAt', async () => {
    alertFindManyMock.mockResolvedValue([alert()]);
    jobFindManyMock.mockResolvedValue([
      { id: 'job-1', title: 'Engineer', city: 'Pune', employer: { companyName: 'Acme' } },
      { id: 'job-2', title: 'Designer', city: 'Mumbai', employer: null },
    ]);

    await runScheduled();

    expect(sendJobAlertDigestEmailMock).toHaveBeenCalledWith('ada@mail.com', {
      name: 'Ada Lovelace',
      jobCount: 2,
      jobs: [
        { title: 'Engineer', company: 'Acme', city: 'Pune', url: 'https://jobkatta.in/jobs/job-1' },
        { title: 'Designer', company: 'A company', city: 'Mumbai', url: 'https://jobkatta.in/jobs/job-2' },
      ],
    });
    expect(alertUpdateMock).toHaveBeenCalledWith({
      where: { id: 'alert-1' },
      data: { lastSentAt: expect.any(Date) },
    });
  });

  it('falls back to a generic greeting when the candidate has no name', async () => {
    alertFindManyMock.mockResolvedValue([
      alert({ candidate: { firstName: '', lastName: null, user: { email: 'ada@mail.com' } } }),
    ]);
    jobFindManyMock.mockResolvedValue([
      { id: 'job-1', title: 'Engineer', city: 'Pune', employer: { companyName: 'Acme' } },
    ]);
    await runScheduled();
    expect(sendJobAlertDigestEmailMock.mock.calls[0][1].name).toBe('there');
  });

  it('still records lastSentAt when the digest email fails', async () => {
    alertFindManyMock.mockResolvedValue([alert()]);
    jobFindManyMock.mockResolvedValue([
      { id: 'job-1', title: 'Engineer', city: 'Pune', employer: { companyName: 'Acme' } },
    ]);
    sendJobAlertDigestEmailMock.mockRejectedValue(new Error('smtp down'));
    await runScheduled();
    expect(alertUpdateMock).toHaveBeenCalledOnce();
  });

  it('continues with the next alert when one alert throws', async () => {
    alertFindManyMock.mockResolvedValue([alert({ id: 'bad' }), alert({ id: 'good' })]);
    jobFindManyMock.mockRejectedValueOnce(new Error('bad query')).mockResolvedValueOnce([]);
    await runScheduled();
    expect(console.error).toHaveBeenCalledWith(
      '[Cron] emailAlerts failed for alert bad:',
      expect.any(Error),
    );
    expect(jobFindManyMock).toHaveBeenCalledTimes(2);
    expect(console.log).toHaveBeenCalledWith('[Cron] Processed 2 email alert(s)');
  });

  it('logs and swallows a failure while loading alerts', async () => {
    const err = new Error('db down');
    alertFindManyMock.mockRejectedValue(err);
    await runScheduled();
    expect(console.error).toHaveBeenCalledWith('[Cron] emailAlerts error:', err);
  });
});
