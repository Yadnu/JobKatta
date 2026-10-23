import { describe, expect, it } from 'vitest';
import {
  adminJobsQuerySchema,
  adminSearchQuerySchema,
  adminSubscriptionsQuerySchema,
  rejectJobSchema,
  replyTicketSchema,
  updateAdminTicketStatusSchema,
  upgradeEmployerPlanSchema,
} from './admin.validations.js';

const b = (body) => ({ body, query: {}, params: {} });
const q = (query) => ({ body: {}, query, params: {} });
const bp = (body, params) => ({ body, query: {}, params });

// ─── rejectJobSchema ──────────────────────────────────────────────────────────

describe('rejectJobSchema', () => {
  it('accepts a valid rejection reason and id', () => {
    expect(rejectJobSchema.safeParse(bp({ rejectionReason: 'Misleading description' }, { id: 'job-1' })).success).toBe(true);
  });

  it('rejects an empty rejection reason', () => {
    expect(rejectJobSchema.safeParse(bp({ rejectionReason: '' }, { id: 'job-1' })).success).toBe(false);
  });

  it('rejects missing rejection reason', () => {
    expect(rejectJobSchema.safeParse(bp({}, { id: 'job-1' })).success).toBe(false);
  });

  it('rejects rejection reason exceeding 500 chars', () => {
    expect(rejectJobSchema.safeParse(bp({ rejectionReason: 'x'.repeat(501) }, { id: 'job-1' })).success).toBe(false);
  });

  it('rejects missing id param', () => {
    expect(rejectJobSchema.safeParse(bp({ rejectionReason: 'Bad content' }, {})).success).toBe(false);
  });
});

// ─── adminJobsQuerySchema ─────────────────────────────────────────────────────

describe('adminJobsQuerySchema', () => {
  it('accepts an empty query', () => {
    expect(adminJobsQuerySchema.safeParse(q({})).success).toBe(true);
  });

  it('accepts valid status and search filters', () => {
    expect(adminJobsQuerySchema.safeParse(q({ status: 'ACTIVE', search: 'developer' })).success).toBe(true);
  });

  it('rejects an invalid status', () => {
    expect(adminJobsQuerySchema.safeParse(q({ status: 'PUBLISHED' })).success).toBe(false);
  });

  it('accepts all valid job statuses', () => {
    const statuses = ['DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'EXPIRED', 'REJECTED', 'CLOSED'];
    statuses.forEach((status) => {
      expect(adminJobsQuerySchema.safeParse(q({ status })).success).toBe(true);
    });
  });

  it('rejects search exceeding 200 chars', () => {
    expect(adminJobsQuerySchema.safeParse(q({ search: 'x'.repeat(201) })).success).toBe(false);
  });
});

// ─── upgradeEmployerPlanSchema ────────────────────────────────────────────────

describe('upgradeEmployerPlanSchema', () => {
  it('accepts a valid plan upgrade', () => {
    expect(upgradeEmployerPlanSchema.safeParse(bp({ planType: 'ANNUAL' }, { id: 'emp-1' })).success).toBe(true);
  });

  it('accepts optional durationDays', () => {
    expect(upgradeEmployerPlanSchema.safeParse(bp({ planType: 'BASIC', durationDays: 60 }, { id: 'emp-1' })).success).toBe(true);
  });

  it('rejects an invalid planType', () => {
    expect(upgradeEmployerPlanSchema.safeParse(bp({ planType: 'GOLD' }, { id: 'emp-1' })).success).toBe(false);
  });

  it('accepts all valid employer plan types', () => {
    ['FREE', 'BASIC', 'STANDARD', 'ANNUAL'].forEach((planType) => {
      expect(upgradeEmployerPlanSchema.safeParse(bp({ planType }, { id: 'emp-1' })).success).toBe(true);
    });
  });

  it('rejects negative durationDays', () => {
    expect(upgradeEmployerPlanSchema.safeParse(bp({ planType: 'BASIC', durationDays: -5 }, { id: 'emp-1' })).success).toBe(false);
  });

  it('rejects missing id param', () => {
    expect(upgradeEmployerPlanSchema.safeParse(bp({ planType: 'STANDARD' }, {})).success).toBe(false);
  });
});

// ─── adminSearchQuerySchema ───────────────────────────────────────────────────

describe('adminSearchQuerySchema', () => {
  it('accepts an empty query', () => {
    expect(adminSearchQuerySchema.safeParse(q({})).success).toBe(true);
  });

  it('accepts a search string', () => {
    expect(adminSearchQuerySchema.safeParse(q({ search: 'John' })).success).toBe(true);
  });

  it('rejects search exceeding 200 chars', () => {
    expect(adminSearchQuerySchema.safeParse(q({ search: 'x'.repeat(201) })).success).toBe(false);
  });
});

// ─── adminSubscriptionsQuerySchema ────────────────────────────────────────────

describe('adminSubscriptionsQuerySchema', () => {
  it('accepts an empty query', () => {
    expect(adminSubscriptionsQuerySchema.safeParse(q({})).success).toBe(true);
  });

  it('accepts status and planType filters', () => {
    expect(adminSubscriptionsQuerySchema.safeParse(q({ status: 'paid', planType: 'ANNUAL' })).success).toBe(true);
  });
});

// ─── replyTicketSchema ────────────────────────────────────────────────────────

describe('replyTicketSchema', () => {
  it('accepts a valid reply', () => {
    expect(replyTicketSchema.safeParse(bp({ reply: 'We have resolved your issue.' }, { id: 'ticket-1' })).success).toBe(true);
  });

  it('rejects an empty reply', () => {
    expect(replyTicketSchema.safeParse(bp({ reply: '' }, { id: 'ticket-1' })).success).toBe(false);
  });

  it('rejects reply exceeding 2000 chars', () => {
    expect(replyTicketSchema.safeParse(bp({ reply: 'x'.repeat(2001) }, { id: 'ticket-1' })).success).toBe(false);
  });

  it('rejects missing id param', () => {
    expect(replyTicketSchema.safeParse(bp({ reply: 'All good' }, {})).success).toBe(false);
  });
});

// ─── updateAdminTicketStatusSchema ────────────────────────────────────────────

describe('updateAdminTicketStatusSchema', () => {
  it('accepts each valid ticket status', () => {
    ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].forEach((status) => {
      expect(updateAdminTicketStatusSchema.safeParse(bp({ status }, { id: 'ticket-1' })).success).toBe(true);
    });
  });

  it('rejects an invalid status', () => {
    expect(updateAdminTicketStatusSchema.safeParse(bp({ status: 'PENDING' }, { id: 'ticket-1' })).success).toBe(false);
  });

  it('rejects missing status', () => {
    expect(updateAdminTicketStatusSchema.safeParse(bp({}, { id: 'ticket-1' })).success).toBe(false);
  });

  it('rejects missing id param', () => {
    expect(updateAdminTicketStatusSchema.safeParse(bp({ status: 'RESOLVED' }, {})).success).toBe(false);
  });
});
