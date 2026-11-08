import { beforeEach, describe, expect, it, vi } from 'vitest';

const candidateCountMock = vi.fn();
const candidateFindManyMock = vi.fn();
const candidateFindUniqueMock = vi.fn();
const employerCountMock = vi.fn();
const employerFindManyMock = vi.fn();
const employerFindUniqueMock = vi.fn();
const employerUpdateMock = vi.fn();
const jobCountMock = vi.fn();
const jobFindManyMock = vi.fn();
const jobFindUniqueMock = vi.fn();
const jobUpdateMock = vi.fn();
const applicationCountMock = vi.fn();
const subscriptionCountMock = vi.fn();
const subscriptionAggregateMock = vi.fn();
const subscriptionFindManyMock = vi.fn();
const userFindUniqueMock = vi.fn();
const userUpdateMock = vi.fn();
const flagFindManyMock = vi.fn();
const flagCountMock = vi.fn();
const flagFindUniqueMock = vi.fn();
const flagUpdateMock = vi.fn();
const ticketFindManyMock = vi.fn();
const ticketCountMock = vi.fn();
const ticketFindUniqueMock = vi.fn();
const ticketUpdateMock = vi.fn();

vi.mock('../config/database.js', () => ({
  default: {
    candidate: {
      count: candidateCountMock,
      findMany: candidateFindManyMock,
      findUnique: candidateFindUniqueMock,
    },
    employer: {
      count: employerCountMock,
      findMany: employerFindManyMock,
      findUnique: employerFindUniqueMock,
      update: employerUpdateMock,
    },
    job: {
      count: jobCountMock,
      findMany: jobFindManyMock,
      findUnique: jobFindUniqueMock,
      update: jobUpdateMock,
    },
    application: { count: applicationCountMock },
    subscription: {
      count: subscriptionCountMock,
      aggregate: subscriptionAggregateMock,
      findMany: subscriptionFindManyMock,
    },
    user: { findUnique: userFindUniqueMock, update: userUpdateMock },
    flagReport: {
      findMany: flagFindManyMock,
      count: flagCountMock,
      findUnique: flagFindUniqueMock,
      update: flagUpdateMock,
    },
    supportTicket: {
      findMany: ticketFindManyMock,
      count: ticketCountMock,
      findUnique: ticketFindUniqueMock,
      update: ticketUpdateMock,
    },
  },
}));

const sendJobApprovedEmailMock = vi.fn();
const sendJobRejectedEmailMock = vi.fn();
const sendTicketReplyEmailMock = vi.fn();
vi.mock('../services/email.service.js', () => ({
  sendJobApprovedEmail: sendJobApprovedEmailMock,
  sendJobRejectedEmail: sendJobRejectedEmailMock,
  sendTicketReplyEmail: sendTicketReplyEmailMock,
}));

const createNotificationMock = vi.fn();
vi.mock('../utils/notification.util.js', () => ({
  createNotification: createNotificationMock,
}));

const {
  getStats,
  getPendingJobs,
  approveJob,
  rejectJob,
  getAllJobs,
  getCandidates,
  getCandidate,
  suspendCandidate,
  getEmployers,
  getEmployer,
  suspendEmployer,
  verifyEmployer,
  upgradeEmployerPlan,
  getSubscriptions,
  getFlags,
  resolveFlag,
  getTickets,
  replyTicket,
  updateTicketStatus,
  getRevenue,
} = await import('./admin.controller.js');

const makeRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const expectStatus = (next, statusCode) => {
  expect(next).toHaveBeenCalledOnce();
  expect(next.mock.calls[0][0].statusCode).toBe(statusCode);
};

const adminReq = (extra = {}) => ({ user: { id: 'admin-1' }, body: {}, params: {}, query: {}, ...extra });

beforeEach(() => {
  vi.clearAllMocks();
  jobUpdateMock.mockResolvedValue({ id: 'job-1', status: 'ACTIVE' });
  employerUpdateMock.mockResolvedValue({ id: 'emp-1' });
  userUpdateMock.mockResolvedValue({ isSuspended: true });
  flagUpdateMock.mockResolvedValue({ id: 'flag-1', isResolved: true });
  ticketUpdateMock.mockResolvedValue({ id: 'ticket-1' });
  sendJobApprovedEmailMock.mockResolvedValue({ ok: true });
  sendJobRejectedEmailMock.mockResolvedValue({ ok: true });
  sendTicketReplyEmailMock.mockResolvedValue({ ok: true });
});

describe('getStats', () => {
  it('returns dashboard counts and treats a missing revenue sum as zero', async () => {
    candidateCountMock.mockResolvedValue(10);
    employerCountMock.mockResolvedValue(4);
    jobCountMock.mockResolvedValueOnce(20).mockResolvedValueOnce(3);
    applicationCountMock.mockResolvedValue(7);
    subscriptionCountMock.mockResolvedValue(2);
    subscriptionAggregateMock
      .mockResolvedValueOnce({ _sum: { amount: null } })
      .mockResolvedValueOnce({ _sum: { amount: 500 } });

    const res = makeRes();
    await getStats(adminReq(), res, vi.fn());

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Stats fetched',
      data: {
        totalCandidates: 10,
        totalEmployers: 4,
        totalJobs: 20,
        applicationsThisMonth: 7,
        pendingApprovals: 3,
        activeSubscriptions: 2,
        revenueThisMonth: 0,
        revenueLastMonth: 500,
      },
    });
  });
});

describe('getPendingJobs', () => {
  it('returns pending jobs oldest first', async () => {
    jobFindManyMock.mockResolvedValue([{ id: 'job-1' }]);
    jobCountMock.mockResolvedValue(1);
    const res = makeRes();
    await getPendingJobs(adminReq({ query: { page: '1', limit: '10' } }), res, vi.fn());

    expect(jobFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: 'PENDING_APPROVAL' },
        orderBy: { createdAt: 'asc' },
        skip: 0,
        take: 10,
      }),
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [{ id: 'job-1' }],
        pagination: { page: 1, limit: 10, total: 1, pages: 1 },
      }),
    );
  });
});

describe('approveJob', () => {
  const job = {
    id: 'job-1',
    title: 'Engineer',
    employer: { userId: 'emp-user', companyName: 'Acme', user: { email: 'hr@acme.com' } },
  };

  it('returns 404 when the job does not exist', async () => {
    jobFindUniqueMock.mockResolvedValue(null);
    const next = vi.fn();
    await approveJob(adminReq({ params: { id: 'missing' } }), makeRes(), next);
    expectStatus(next, 404);
  });

  it('activates the job, emails the employer, and sends a notification', async () => {
    jobFindUniqueMock.mockResolvedValue(job);
    const res = makeRes();
    await approveJob(adminReq({ params: { id: 'job-1' } }), res, vi.fn());

    expect(jobUpdateMock).toHaveBeenCalledWith({
      where: { id: 'job-1' },
      data: { status: 'ACTIVE', approvedAt: expect.any(Date), approvedBy: 'admin-1' },
    });
    expect(sendJobApprovedEmailMock).toHaveBeenCalledWith('hr@acme.com', {
      jobTitle: 'Engineer',
      companyName: 'Acme',
    });
    expect(createNotificationMock).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'emp-user', type: 'JOB_APPROVED' }),
    );
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Job approved' }));
  });

  it('still approves when the employer has no email and the send fails', async () => {
    jobFindUniqueMock.mockResolvedValue({
      ...job,
      employer: { userId: 'emp-user', companyName: 'Acme', user: { email: 'hr@acme.com' } },
    });
    sendJobApprovedEmailMock.mockRejectedValue(new Error('smtp down'));
    const res = makeRes();
    await approveJob(adminReq({ params: { id: 'job-1' } }), res, vi.fn());
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('skips email and notification when the job has no employer', async () => {
    jobFindUniqueMock.mockResolvedValue({ id: 'job-1', title: 'Engineer', employer: null });
    await approveJob(adminReq({ params: { id: 'job-1' } }), makeRes(), vi.fn());
    expect(sendJobApprovedEmailMock).not.toHaveBeenCalled();
    expect(createNotificationMock).not.toHaveBeenCalled();
  });
});

describe('rejectJob', () => {
  const job = {
    id: 'job-1',
    title: 'Engineer',
    employer: { userId: 'emp-user', companyName: 'Acme', user: { email: 'hr@acme.com' } },
  };

  it('returns 400 when the rejection reason is missing', async () => {
    const next = vi.fn();
    await rejectJob(adminReq({ params: { id: 'job-1' }, body: {} }), makeRes(), next);
    expectStatus(next, 400);
    expect(jobFindUniqueMock).not.toHaveBeenCalled();
  });

  it('returns 404 when the job does not exist', async () => {
    jobFindUniqueMock.mockResolvedValue(null);
    const next = vi.fn();
    await rejectJob(adminReq({ params: { id: 'job-1' }, body: { rejectionReason: 'Incomplete' } }), makeRes(), next);
    expectStatus(next, 404);
  });

  it('rejects the job, emails the reason, and notifies the employer', async () => {
    jobFindUniqueMock.mockResolvedValue(job);
    jobUpdateMock.mockResolvedValue({ id: 'job-1', status: 'REJECTED' });
    const res = makeRes();
    await rejectJob(adminReq({ params: { id: 'job-1' }, body: { rejectionReason: 'Incomplete' } }), res, vi.fn());

    expect(jobUpdateMock).toHaveBeenCalledWith({
      where: { id: 'job-1' },
      data: { status: 'REJECTED', rejectionReason: 'Incomplete' },
    });
    expect(sendJobRejectedEmailMock).toHaveBeenCalledWith('hr@acme.com', {
      jobTitle: 'Engineer',
      reason: 'Incomplete',
    });
    expect(createNotificationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'JOB_REJECTED',
        message: 'Your job "Engineer" was not approved: Incomplete',
      }),
    );
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Job rejected' }));
  });

  it('still rejects when the rejection email fails', async () => {
    jobFindUniqueMock.mockResolvedValue(job);
    sendJobRejectedEmailMock.mockRejectedValue(new Error('smtp down'));
    const res = makeRes();
    await rejectJob(adminReq({ params: { id: 'job-1' }, body: { rejectionReason: 'Incomplete' } }), res, vi.fn());
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});

describe('getAllJobs', () => {
  it('filters by status and title search', async () => {
    jobFindManyMock.mockResolvedValue([]);
    jobCountMock.mockResolvedValue(0);
    await getAllJobs(adminReq({ query: { status: 'ACTIVE', search: 'react', page: '1', limit: '10' } }), makeRes(), vi.fn());
    expect(jobFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: 'ACTIVE', title: { contains: 'react' } },
        orderBy: { createdAt: 'desc' },
      }),
    );
  });
});

describe('candidates', () => {
  it('searches candidates by first or last name', async () => {
    candidateFindManyMock.mockResolvedValue([{ id: 'cand-1' }]);
    candidateCountMock.mockResolvedValue(1);
    const res = makeRes();
    await getCandidates(adminReq({ query: { search: 'Ada' } }), res, vi.fn());
    expect(candidateFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [{ firstName: { contains: 'Ada' } }, { lastName: { contains: 'Ada' } }],
        },
      }),
    );
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: [{ id: 'cand-1' }] }));
  });

  it('returns 404 when a candidate does not exist', async () => {
    candidateFindUniqueMock.mockResolvedValue(null);
    const next = vi.fn();
    await getCandidate(adminReq({ params: { id: 'missing' } }), makeRes(), next);
    expectStatus(next, 404);
  });

  it('returns one candidate', async () => {
    const candidate = { id: 'cand-1' };
    candidateFindUniqueMock.mockResolvedValue(candidate);
    const res = makeRes();
    await getCandidate(adminReq({ params: { id: 'cand-1' } }), res, vi.fn());
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Candidate fetched', data: candidate });
  });

  it('returns 404 when suspending a missing candidate', async () => {
    candidateFindUniqueMock.mockResolvedValue(null);
    const next = vi.fn();
    await suspendCandidate(adminReq({ params: { id: 'missing' } }), makeRes(), next);
    expectStatus(next, 404);
  });

  it('toggles the candidate suspension flag', async () => {
    candidateFindUniqueMock.mockResolvedValue({ id: 'cand-1', userId: 'user-1' });
    userFindUniqueMock.mockResolvedValue({ id: 'user-1', isSuspended: false });
    userUpdateMock.mockResolvedValue({ isSuspended: true });
    const res = makeRes();
    await suspendCandidate(adminReq({ params: { id: 'cand-1' } }), res, vi.fn());
    expect(userUpdateMock).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { isSuspended: true },
    });
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Candidate suspended', data: { isSuspended: true } }),
    );
  });
});

describe('employers', () => {
  it('filters employers by company name', async () => {
    employerFindManyMock.mockResolvedValue([{ id: 'emp-1' }]);
    employerCountMock.mockResolvedValue(1);
    await getEmployers(adminReq({ query: { search: 'Acme' } }), makeRes(), vi.fn());
    expect(employerFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { companyName: { contains: 'Acme' } } }),
    );
  });

  it('returns 404 when an employer does not exist', async () => {
    employerFindUniqueMock.mockResolvedValue(null);
    const next = vi.fn();
    await getEmployer(adminReq({ params: { id: 'missing' } }), makeRes(), next);
    expectStatus(next, 404);
  });

  it('returns one employer', async () => {
    const employer = { id: 'emp-1', companyName: 'Acme' };
    employerFindUniqueMock.mockResolvedValue(employer);
    const res = makeRes();
    await getEmployer(adminReq({ params: { id: 'emp-1' } }), res, vi.fn());
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Employer fetched', data: employer });
  });

  it('toggles employer suspension and unsuspends an already suspended account', async () => {
    employerFindUniqueMock.mockResolvedValue({ id: 'emp-1', userId: 'user-2' });
    userFindUniqueMock.mockResolvedValue({ id: 'user-2', isSuspended: true });
    userUpdateMock.mockResolvedValue({ isSuspended: false });
    const res = makeRes();
    await suspendEmployer(adminReq({ params: { id: 'emp-1' } }), res, vi.fn());
    expect(userUpdateMock).toHaveBeenCalledWith({
      where: { id: 'user-2' },
      data: { isSuspended: false },
    });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Employer unsuspended' }));
  });

  it('returns 404 when verifying a missing employer', async () => {
    employerFindUniqueMock.mockResolvedValue(null);
    const next = vi.fn();
    await verifyEmployer(adminReq({ params: { id: 'missing' } }), makeRes(), next);
    expectStatus(next, 404);
  });

  it('marks an employer as verified', async () => {
    employerFindUniqueMock.mockResolvedValue({ id: 'emp-1' });
    const res = makeRes();
    await verifyEmployer(adminReq({ params: { id: 'emp-1' } }), res, vi.fn());
    expect(employerUpdateMock).toHaveBeenCalledWith({
      where: { id: 'emp-1' },
      data: { isVerified: true },
    });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Employer verified' }));
  });

  it('returns 404 when upgrading a missing employer', async () => {
    employerFindUniqueMock.mockResolvedValue(null);
    const next = vi.fn();
    await upgradeEmployerPlan(adminReq({ params: { id: 'missing' }, body: { planType: 'BASIC' } }), makeRes(), next);
    expectStatus(next, 404);
  });

  it('sets the plan expiry and the active job limit for a known plan', async () => {
    employerFindUniqueMock.mockResolvedValue({ id: 'emp-1' });
    const res = makeRes();
    await upgradeEmployerPlan(
      adminReq({ params: { id: 'emp-1' }, body: { planType: 'STANDARD', durationDays: 10 } }),
      res,
      vi.fn(),
    );
    expect(employerUpdateMock).toHaveBeenCalledWith({
      where: { id: 'emp-1' },
      data: { planType: 'STANDARD', planExpiresAt: expect.any(Date), activeJobLimit: 5 },
    });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Plan upgraded' }));
  });

  it('uses a zero job limit for an unknown plan', async () => {
    employerFindUniqueMock.mockResolvedValue({ id: 'emp-1' });
    await upgradeEmployerPlan(adminReq({ params: { id: 'emp-1' }, body: { planType: 'GOLD' } }), makeRes(), vi.fn());
    expect(employerUpdateMock).toHaveBeenCalledWith({
      where: { id: 'emp-1' },
      data: expect.objectContaining({ planType: 'GOLD', activeJobLimit: 0 }),
    });
  });
});

describe('subscriptions, flags, and tickets', () => {
  it('filters subscriptions by status and plan type', async () => {
    subscriptionFindManyMock.mockResolvedValue([{ id: 'sub-1' }]);
    subscriptionCountMock.mockResolvedValue(1);
    await getSubscriptions(adminReq({ query: { status: 'paid', planType: 'ANNUAL' } }), makeRes(), vi.fn());
    expect(subscriptionFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: 'paid', planType: 'ANNUAL' } }),
    );
  });

  it('returns paginated flag reports', async () => {
    flagFindManyMock.mockResolvedValue([{ id: 'flag-1' }]);
    flagCountMock.mockResolvedValue(1);
    const res = makeRes();
    await getFlags(adminReq({ query: {} }), res, vi.fn());
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Flags fetched', data: [{ id: 'flag-1' }] }));
  });

  it('returns 404 when resolving a missing flag', async () => {
    flagFindUniqueMock.mockResolvedValue(null);
    const next = vi.fn();
    await resolveFlag(adminReq({ params: { id: 'missing' } }), makeRes(), next);
    expectStatus(next, 404);
  });

  it('marks a flag resolved', async () => {
    flagFindUniqueMock.mockResolvedValue({ id: 'flag-1' });
    const res = makeRes();
    await resolveFlag(adminReq({ params: { id: 'flag-1' } }), res, vi.fn());
    expect(flagUpdateMock).toHaveBeenCalledWith({ where: { id: 'flag-1' }, data: { isResolved: true } });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Flag resolved' }));
  });

  it('returns paginated support tickets', async () => {
    ticketFindManyMock.mockResolvedValue([{ id: 'ticket-1' }]);
    ticketCountMock.mockResolvedValue(1);
    const res = makeRes();
    await getTickets(adminReq({ query: {} }), res, vi.fn());
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Tickets fetched' }));
  });

  it('returns 404 when replying to a missing ticket', async () => {
    ticketFindUniqueMock.mockResolvedValue(null);
    const next = vi.fn();
    await replyTicket(adminReq({ params: { id: 'missing' }, body: { reply: 'Hi' } }), makeRes(), next);
    expectStatus(next, 404);
  });

  it('stores the reply, marks the ticket in progress, and emails the user', async () => {
    ticketFindUniqueMock.mockResolvedValue({
      id: 'ticket-1',
      subject: 'Login',
      user: { email: 'ada@mail.com' },
    });
    const res = makeRes();
    await replyTicket(adminReq({ params: { id: 'ticket-1' }, body: { reply: 'Try again' } }), res, vi.fn());
    expect(ticketUpdateMock).toHaveBeenCalledWith({
      where: { id: 'ticket-1' },
      data: { adminReply: 'Try again', status: 'IN_PROGRESS' },
    });
    expect(sendTicketReplyEmailMock).toHaveBeenCalledWith('ada@mail.com', {
      subject: 'Login',
      reply: 'Try again',
    });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Reply sent' }));
  });

  it('still saves the reply when the email fails and skips email when the user has none', async () => {
    ticketFindUniqueMock.mockResolvedValueOnce({ id: 'ticket-1', subject: 'Login', user: { email: 'ada@mail.com' } });
    sendTicketReplyEmailMock.mockRejectedValueOnce(new Error('smtp down'));
    const res = makeRes();
    await replyTicket(adminReq({ params: { id: 'ticket-1' }, body: { reply: 'Try again' } }), res, vi.fn());
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));

    sendTicketReplyEmailMock.mockClear();
    ticketFindUniqueMock.mockResolvedValueOnce({ id: 'ticket-1', subject: 'Login', user: null });
    await replyTicket(adminReq({ params: { id: 'ticket-1' }, body: { reply: 'Try again' } }), makeRes(), vi.fn());
    expect(sendTicketReplyEmailMock).not.toHaveBeenCalled();
  });

  it('returns 404 when updating a missing ticket status', async () => {
    ticketFindUniqueMock.mockResolvedValue(null);
    const next = vi.fn();
    await updateTicketStatus(adminReq({ params: { id: 'missing' }, body: { status: 'CLOSED' } }), makeRes(), next);
    expectStatus(next, 404);
  });

  it('updates a ticket status', async () => {
    ticketFindUniqueMock.mockResolvedValue({ id: 'ticket-1' });
    const res = makeRes();
    await updateTicketStatus(adminReq({ params: { id: 'ticket-1' }, body: { status: 'CLOSED' } }), res, vi.fn());
    expect(ticketUpdateMock).toHaveBeenCalledWith({
      where: { id: 'ticket-1' },
      data: { status: 'CLOSED' },
    });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Ticket status updated' }));
  });
});

describe('getRevenue', () => {
  it('returns six months and uses zero when a month has no paid amount', async () => {
    subscriptionAggregateMock.mockResolvedValue({ _sum: { amount: null } });
    const res = makeRes();
    await getRevenue(adminReq(), res, vi.fn());

    expect(subscriptionAggregateMock).toHaveBeenCalledTimes(6);
    const payload = res.json.mock.calls[0][0];
    expect(payload.message).toBe('Revenue data');
    expect(payload.data).toHaveLength(6);
    expect(payload.data.every((row) => row.revenue === 0 && typeof row.month === 'string')).toBe(true);
  });
});
