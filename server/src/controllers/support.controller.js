import db from '../config/database.js';
import { catchAsync, AppError } from '../middleware/errorHandler.middleware.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.util.js';
import xss from 'xss';

export const createTicket = catchAsync(async (req, res) => {
  const { subject, message } = req.body;
  if (!subject || !message) throw new AppError('Subject and message are required', 400);

  const ticket = await db.supportTicket.create({
    data: {
      userId: req.user.id,
      subject: xss(subject),
      message: xss(message),
    },
  });

  res.status(201).json({ success: true, message: 'Ticket submitted', data: ticket });
});

export const getMyTickets = catchAsync(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const [tickets, total] = await Promise.all([
    db.supportTicket.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    db.supportTicket.count({ where: { userId: req.user.id } }),
  ]);

  res.json({
    success: true,
    message: 'Tickets fetched',
    data: tickets,
    pagination: buildPaginationMeta(page, limit, total),
  });
});

export const getTicket = catchAsync(async (req, res) => {
  const ticket = await db.supportTicket.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!ticket) throw new AppError('Ticket not found', 404);
  res.json({ success: true, message: 'Ticket fetched', data: ticket });
});
