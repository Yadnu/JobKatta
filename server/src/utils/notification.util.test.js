import { beforeEach, describe, expect, it, vi } from 'vitest';

// ─── mock database ────────────────────────────────────────────────────────────
const notificationCreateMock = vi.fn();
vi.mock('../config/database.js', () => ({
  default: {
    notification: { create: notificationCreateMock },
  },
}));

const { createNotification } = await import('./notification.util.js');

beforeEach(() => vi.clearAllMocks());

describe('createNotification', () => {
  it('creates a notification with all provided fields', async () => {
    notificationCreateMock.mockResolvedValue({ id: 'notif-1' });

    await createNotification({
      userId: 'user-1',
      type: 'APPLICATION_UPDATE',
      title: 'Application viewed',
      message: 'Your application was viewed by the employer.',
      link: '/candidate/dashboard',
    });

    expect(notificationCreateMock).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        type: 'APPLICATION_UPDATE',
        title: 'Application viewed',
        message: 'Your application was viewed by the employer.',
        link: '/candidate/dashboard',
      },
    });
  });

  it('silently swallows a database error (never throws)', async () => {
    notificationCreateMock.mockRejectedValue(new Error('DB connection lost'));
    await expect(
      createNotification({ userId: 'u', type: 'JOB_ALERT', title: 'x', message: 'y', link: null }),
    ).resolves.toBeUndefined();
  });

  it('still resolves when link is null', async () => {
    notificationCreateMock.mockResolvedValue({});
    await expect(
      createNotification({ userId: 'u', type: 'PAYMENT', title: 'Receipt', message: 'Paid', link: null }),
    ).resolves.toBeDefined();
  });
});
