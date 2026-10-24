import { beforeEach, describe, expect, it, vi } from 'vitest';

// ─── mock database ────────────────────────────────────────────────────────────
const notifFindManyMock = vi.fn();
const notifCountMock = vi.fn();
const notifFindFirstMock = vi.fn();
const notifUpdateManyMock = vi.fn();
const notifUpdateMock = vi.fn();

vi.mock('../config/database.js', () => ({
  default: {
    notification: {
      findMany: notifFindManyMock,
      count: notifCountMock,
      findFirst: notifFindFirstMock,
      updateMany: notifUpdateManyMock,
      update: notifUpdateMock,
    },
  },
}));

const { getNotifications, markAllRead, markOneRead } = await import('./notification.controller.js');

const makeRes = () => {
  const res = {};
  res.json = vi.fn().mockReturnValue(res);
  res.status = vi.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => vi.clearAllMocks());

// ─── getNotifications ─────────────────────────────────────────────────────────

describe('getNotifications', () => {
  it('returns notifications and unread count for the authenticated user', async () => {
    const notifications = [{ id: 'n1', isRead: false }];
    notifFindManyMock.mockResolvedValue(notifications);
    notifCountMock.mockResolvedValue(3);

    const req = { user: { id: 'user-1' } };
    const res = makeRes();
    await getNotifications(req, res, vi.fn());

    expect(notifFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' }, take: 20 }),
    );
    expect(notifCountMock).toHaveBeenCalledWith({ where: { userId: 'user-1', isRead: false } });
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: { notifications, unreadCount: 3 } }),
    );
  });
});

// ─── markAllRead ──────────────────────────────────────────────────────────────

describe('markAllRead', () => {
  it('updates all unread notifications for the user to isRead: true', async () => {
    notifUpdateManyMock.mockResolvedValue({ count: 2 });

    const req = { user: { id: 'user-1' } };
    const res = makeRes();
    await markAllRead(req, res, vi.fn());

    expect(notifUpdateManyMock).toHaveBeenCalledWith({
      where: { userId: 'user-1', isRead: false },
      data: { isRead: true },
    });
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    );
  });
});

// ─── markOneRead ──────────────────────────────────────────────────────────────

describe('markOneRead', () => {
  it('marks the specified notification as read', async () => {
    const notification = { id: 'n1', userId: 'user-1', isRead: false };
    notifFindFirstMock.mockResolvedValue(notification);
    notifUpdateMock.mockResolvedValue({ ...notification, isRead: true });

    const req = { user: { id: 'user-1' }, params: { id: 'n1' } };
    const res = makeRes();
    await markOneRead(req, res, vi.fn());

    expect(notifUpdateMock).toHaveBeenCalledWith({
      where: { id: 'n1' },
      data: { isRead: true },
    });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('calls next with a 404 AppError when notification is not found or not owned by user', async () => {
    notifFindFirstMock.mockResolvedValue(null);

    const req = { user: { id: 'user-1' }, params: { id: 'n-missing' } };
    const res = makeRes();
    const next = vi.fn();
    await markOneRead(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(next.mock.calls[0][0].statusCode).toBe(404);
    expect(notifUpdateMock).not.toHaveBeenCalled();
  });
});
