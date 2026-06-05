import db from '../config/database.js';
import { catchAsync, AppError } from '../middleware/errorHandler.middleware.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.util.js';
import { sendJobApprovedEmail, sendJobRejectedEmail, sendTicketReplyEmail } from '../services/email.service.js';

export const getStats = catchAsync(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const [totalCandidates, totalEmployers, totalJobs, applicationsThisMonth, pendingApprovals, activeSubscriptions, revenueThisMonth, revenueLastMonth] = await Promise.all([
    db.candidate.count(), db.employer.count(), db.job.count(),
    db.application.count({ where: { createdAt: { gte: startOfMonth } } }),
    db.job.count({ where: { status: 'PENDING_APPROVAL' } }),
    db.subscription.count({ where: { status: 'paid', expiresAt: { gt: now } } }),
    db.subscription.aggregate({ where: { status: 'paid', createdAt: { gte: startOfMonth } }, _sum: { amount: true } }),
    db.subscription.aggregate({ where: { status: 'paid', createdAt: { gte: startOfLastMonth, lt: startOfMonth } }, _sum: { amount: true } }),
  ]);
  res.json({ success: true, message: 'Stats fetched', data: { totalCandidates, totalEmployers, totalJobs, applicationsThisMonth, pendingApprovals, activeSubscriptions, revenueThisMonth: revenueThisMonth._sum.amount||0, revenueLastMonth: revenueLastMonth._sum.amount||0 } });
});

export const getPendingJobs = catchAsync(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const [jobs, total] = await Promise.all([
    db.job.findMany({ where: { status: 'PENDING_APPROVAL' }, include: { employer: { select: { companyName: true, city: true, user: { select: { email: true } } } } }, orderBy: { createdAt: 'asc' }, skip, take: limit }),
    db.job.count({ where: { status: 'PENDING_APPROVAL' } }),
  ]);
  res.json({ success: true, message: 'Pending jobs', data: jobs, pagination: buildPaginationMeta(page, limit, total) });
});

export const approveJob = catchAsync(async (req, res) => {
  const job = await db.job.findUnique({ where: { id: req.params.id }, include: { employer: { include: { user: { select: { email: true } } } } } });
  if (!job) throw new AppError('Job not found', 404);
  const updated = await db.job.update({ where: { id: req.params.id }, data: { status: 'ACTIVE', approvedAt: new Date(), approvedBy: req.user.id } });
  if (job.employer?.user?.email) await sendJobApprovedEmail(job.employer.user.email, { jobTitle: job.title, companyName: job.employer.companyName }).catch(() => {});
  res.json({ success: true, message: 'Job approved', data: updated });
});

export const rejectJob = catchAsync(async (req, res) => {
  const { rejectionReason } = req.body;
  if (!rejectionReason) throw new AppError('Rejection reason required', 400);
  const job = await db.job.findUnique({ where: { id: req.params.id }, include: { employer: { include: { user: { select: { email: true } } } } } });
  if (!job) throw new AppError('Job not found', 404);
  const updated = await db.job.update({ where: { id: req.params.id }, data: { status: 'REJECTED', rejectionReason } });
  if (job.employer?.user?.email) await sendJobRejectedEmail(job.employer.user.email, { jobTitle: job.title, reason: rejectionReason }).catch(() => {});
  res.json({ success: true, message: 'Job rejected', data: updated });
});

export const getAllJobs = catchAsync(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const where = {};
  if (req.query.status) where.status = req.query.status;
  if (req.query.search) where.title = { contains: req.query.search };
  const [jobs, total] = await Promise.all([
    db.job.findMany({ where, include: { employer: { select: { companyName: true, city: true } } }, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    db.job.count({ where }),
  ]);
  res.json({ success: true, message: 'Jobs fetched', data: jobs, pagination: buildPaginationMeta(page, limit, total) });
});

export const getCandidates = catchAsync(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const where = {};
  if (req.query.search) where.OR = [{ firstName: { contains: req.query.search } }, { lastName: { contains: req.query.search } }];
  const [candidates, total] = await Promise.all([
    db.candidate.findMany({ where, include: { user: { select: { email: true, mobile: true, isActive: true, isSuspended: true, createdAt: true } } }, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    db.candidate.count({ where }),
  ]);
  res.json({ success: true, message: 'Candidates fetched', data: candidates, pagination: buildPaginationMeta(page, limit, total) });
});

export const getCandidate = catchAsync(async (req, res) => {
  const candidate = await db.candidate.findUnique({ where: { id: req.params.id }, include: { user: { select: { email: true, mobile: true, isSuspended: true, createdAt: true } }, educations: true, experiences: true, skills: { include: { skill: true } } } });
  if (!candidate) throw new AppError('Candidate not found', 404);
  res.json({ success: true, message: 'Candidate fetched', data: candidate });
});

export const suspendCandidate = catchAsync(async (req, res) => {
  const candidate = await db.candidate.findUnique({ where: { id: req.params.id } });
  if (!candidate) throw new AppError('Candidate not found', 404);
  const user = await db.user.findUnique({ where: { id: candidate.userId } });
  const updated = await db.user.update({ where: { id: candidate.userId }, data: { isSuspended: !user.isSuspended } });
  res.json({ success: true, message: `Candidate ${updated.isSuspended ? 'suspended' : 'unsuspended'}`, data: { isSuspended: updated.isSuspended } });
});

export const getEmployers = catchAsync(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const where = {};
  if (req.query.search) where.companyName = { contains: req.query.search };
  const [employers, total] = await Promise.all([
    db.employer.findMany({ where, include: { user: { select: { email: true, isSuspended: true, createdAt: true } } }, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    db.employer.count({ where }),
  ]);
  res.json({ success: true, message: 'Employers fetched', data: employers, pagination: buildPaginationMeta(page, limit, total) });
});

export const getEmployer = catchAsync(async (req, res) => {
  const employer = await db.employer.findUnique({ where: { id: req.params.id }, include: { user: { select: { email: true, isSuspended: true, createdAt: true } }, jobs: { select: { id: true, title: true, status: true, createdAt: true } } } });
  if (!employer) throw new AppError('Employer not found', 404);
  res.json({ success: true, message: 'Employer fetched', data: employer });
});

export const suspendEmployer = catchAsync(async (req, res) => {
  const employer = await db.employer.findUnique({ where: { id: req.params.id } });
  if (!employer) throw new AppError('Employer not found', 404);
  const user = await db.user.findUnique({ where: { id: employer.userId } });
  const updated = await db.user.update({ where: { id: employer.userId }, data: { isSuspended: !user.isSuspended } });
  res.json({ success: true, message: `Employer ${updated.isSuspended ? 'suspended' : 'unsuspended'}`, data: { isSuspended: updated.isSuspended } });
});

export const verifyEmployer = catchAsync(async (req, res) => {
  const employer = await db.employer.findUnique({ where: { id: req.params.id } });
  if (!employer) throw new AppError('Employer not found', 404);
  const updated = await db.employer.update({ where: { id: req.params.id }, data: { isVerified: true } });
  res.json({ success: true, message: 'Employer verified', data: updated });
});

export const upgradeEmployerPlan = catchAsync(async (req, res) => {
  const { planType, durationDays } = req.body;
  const employer = await db.employer.findUnique({ where: { id: req.params.id } });
  if (!employer) throw new AppError('Employer not found', 404);
  const planLimits = { BASIC: 1, STANDARD: 5, ANNUAL: 10, FREE: 0 };
  const expiresAt = new Date(Date.now() + (durationDays||30)*24*60*60*1000);
  const updated = await db.employer.update({ where: { id: req.params.id }, data: { planType, planExpiresAt: expiresAt, activeJobLimit: planLimits[planType]||0 } });
  res.json({ success: true, message: 'Plan upgraded', data: updated });
});

export const getSubscriptions = catchAsync(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const where = {};
  if (req.query.status) where.status = req.query.status;
  if (req.query.planType) where.planType = req.query.planType;
  const [subscriptions, total] = await Promise.all([
    db.subscription.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    db.subscription.count({ where }),
  ]);
  res.json({ success: true, message: 'Subscriptions fetched', data: subscriptions, pagination: buildPaginationMeta(page, limit, total) });
});

export const getFlags = catchAsync(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const [flags, total] = await Promise.all([
    db.flagReport.findMany({ include: { user: { select: { email: true } } }, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    db.flagReport.count(),
  ]);
  res.json({ success: true, message: 'Flags fetched', data: flags, pagination: buildPaginationMeta(page, limit, total) });
});

export const resolveFlag = catchAsync(async (req, res) => {
  const flag = await db.flagReport.findUnique({ where: { id: req.params.id } });
  if (!flag) throw new AppError('Flag not found', 404);
  const updated = await db.flagReport.update({ where: { id: req.params.id }, data: { isResolved: true } });
  res.json({ success: true, message: 'Flag resolved', data: updated });
});

export const getTickets = catchAsync(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const [tickets, total] = await Promise.all([
    db.supportTicket.findMany({ include: { user: { select: { email: true, role: true } } }, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    db.supportTicket.count(),
  ]);
  res.json({ success: true, message: 'Tickets fetched', data: tickets, pagination: buildPaginationMeta(page, limit, total) });
});

export const replyTicket = catchAsync(async (req, res) => {
  const ticket = await db.supportTicket.findUnique({ where: { id: req.params.id }, include: { user: { select: { email: true } } } });
  if (!ticket) throw new AppError('Ticket not found', 404);
  const updated = await db.supportTicket.update({ where: { id: req.params.id }, data: { adminReply: req.body.reply, status: 'IN_PROGRESS' } });
  if (ticket.user?.email) await sendTicketReplyEmail(ticket.user.email, { subject: ticket.subject, reply: req.body.reply }).catch(() => {});
  res.json({ success: true, message: 'Reply sent', data: updated });
});

export const updateTicketStatus = catchAsync(async (req, res) => {
  const ticket = await db.supportTicket.findUnique({ where: { id: req.params.id } });
  if (!ticket) throw new AppError('Ticket not found', 404);
  const updated = await db.supportTicket.update({ where: { id: req.params.id }, data: { status: req.body.status } });
  res.json({ success: true, message: 'Ticket status updated', data: updated });
});

export const getRevenue = catchAsync(async (req, res) => {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    const agg = await db.subscription.aggregate({ where: { status: 'paid', createdAt: { gte: start, lte: end } }, _sum: { amount: true } });
    months.push({ month: start.toLocaleString('default', { month: 'short', year: 'numeric' }), revenue: agg._sum.amount||0 });
  }
  res.json({ success: true, message: 'Revenue data', data: months });
});
