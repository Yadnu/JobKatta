import { z } from 'zod';

const JOB_STATUSES = ['DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'EXPIRED', 'REJECTED', 'CLOSED'];
const TICKET_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const EMPLOYER_PLAN_TYPES = ['FREE', 'BASIC', 'STANDARD', 'ANNUAL'];

// ─── Job moderation ───────────────────────────────────────────────────────────

export const rejectJobSchema = z.object({
  params: z.object({ id: z.string().min(1, 'Job ID required') }),
  body: z.object({
    rejectionReason: z.string().min(1, 'Rejection reason required').max(500),
  }),
});

export const adminJobsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z.enum(JOB_STATUSES).optional(),
    search: z.string().max(200).optional(),
  }),
});

// ─── Employer management ──────────────────────────────────────────────────────

export const upgradeEmployerPlanSchema = z.object({
  params: z.object({ id: z.string().min(1, 'Employer ID required') }),
  body: z.object({
    planType: z.enum(EMPLOYER_PLAN_TYPES, { errorMap: () => ({ message: 'Invalid plan type' }) }),
    durationDays: z.number().int().positive().optional(),
  }),
});

// ─── Candidate / employer search queries ──────────────────────────────────────

export const adminSearchQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().max(200).optional(),
  }),
});

export const adminSubscriptionsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z.string().optional(),
    planType: z.string().optional(),
  }),
});

// ─── Support ticket management ────────────────────────────────────────────────

export const replyTicketSchema = z.object({
  params: z.object({ id: z.string().min(1, 'Ticket ID required') }),
  body: z.object({
    reply: z.string().min(1, 'Reply is required').max(2000),
  }),
});

export const updateAdminTicketStatusSchema = z.object({
  params: z.object({ id: z.string().min(1, 'Ticket ID required') }),
  body: z.object({
    status: z.enum(TICKET_STATUSES, { errorMap: () => ({ message: 'Invalid ticket status' }) }),
  }),
});
