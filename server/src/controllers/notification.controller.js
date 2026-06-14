import db from '../config/database.js';
import { catchAsync, AppError } from '../middleware/errorHandler.middleware.js';

export const getNotifications = catchAsync(async (req, res) => {
  const [notifications, unreadCount] = await Promise.all([
    db.notification.findMany({
      where: { userId: req.user.id },
      orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }],
      take: 20,
    }),
    db.notification.count({ where: { userId: req.user.id, isRead: false } }),
  ]);
  res.json({ success: true, message: 'Notifications fetched', data: { notifications, unreadCount } });
});

export const markAllRead = catchAsync(async (req, res) => {
  await db.notification.updateMany({
    where: { userId: req.user.id, isRead: false },
    data: { isRead: true },
  });
  res.json({ success: true, message: 'All notifications marked as read' });
});

export const markOneRead = catchAsync(async (req, res) => {
  const notification = await db.notification.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!notification) throw new AppError('Notification not found', 404);
  await db.notification.update({ where: { id: notification.id }, data: { isRead: true } });
  res.json({ success: true, message: 'Notification marked as read' });
});
