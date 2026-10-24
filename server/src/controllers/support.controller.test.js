import { beforeEach, describe, expect, it, vi } from 'vitest';

// ─── mock database ────────────────────────────────────────────────────────────
const ticketCreateMock = vi.fn();
const ticketFindManyMock = vi.fn();
const ticketCountMock = vi.fn();
const ticketFindFirstMock = vi.fn();

vi.mock('../config/database.js', () => ({
  default: {
    supportTicket: {
      create: ticketCreateMock,
      findMany: ticketFindManyMock,
      count: ticketCountMock,
      findFirst: ticketFindFirstMock,
    },
  },
}));

// ─── mock xss (passthrough) ───────────────────────────────────────────────────
vi.mock('xss', () => ({ default: (s) => s }));

const { createTicket, getMyTickets, getTicket } = await import('./support.controller.js');

const makeRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => vi.clearAllMocks());

// ─── createTicket ─────────────────────────────────────────────────────────────

describe('createTicket', () => {
  it('creates a ticket and responds 201 with the new ticket', async () => {
    const ticket = { id: 't1', subject: 'Login issue', message: 'Cannot log in.' };
    ticketCreateMock.mockResolvedValue(ticket);

    const req = {
      user: { id: 'user-1' },
      body: { subject: 'Login issue', message: 'Cannot log in.' },
    };
    const res = makeRes();
    await createTicket(req, res, vi.fn());

    expect(ticketCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 'user-1', subject: 'Login issue' }),
      }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: ticket }));
  });

  it('calls next with a 400 AppError when subject is missing', async () => {
    const req = { user: { id: 'user-1' }, body: { message: 'No subject here' } };
    const res = makeRes();
    const next = vi.fn();
    await createTicket(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(next.mock.calls[0][0].statusCode).toBe(400);
    expect(ticketCreateMock).not.toHaveBeenCalled();
  });

  it('calls next with a 400 AppError when message is missing', async () => {
    const req = { user: { id: 'user-1' }, body: { subject: 'Some subject' } };
    const res = makeRes();
    const next = vi.fn();
    await createTicket(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });
});

// ─── getMyTickets ─────────────────────────────────────────────────────────────

describe('getMyTickets', () => {
  it('returns paginated tickets for the authenticated user', async () => {
    const tickets = [{ id: 't1' }, { id: 't2' }];
    ticketFindManyMock.mockResolvedValue(tickets);
    ticketCountMock.mockResolvedValue(2);

    const req = { user: { id: 'user-1' }, query: { page: '1', limit: '10' } };
    const res = makeRes();
    await getMyTickets(req, res, vi.fn());

    expect(ticketFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' } }),
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: tickets, pagination: expect.any(Object) }),
    );
  });
});

// ─── getTicket ────────────────────────────────────────────────────────────────

describe('getTicket', () => {
  it('returns the ticket when found and owned by the user', async () => {
    const ticket = { id: 't1', userId: 'user-1' };
    ticketFindFirstMock.mockResolvedValue(ticket);

    const req = { user: { id: 'user-1' }, params: { id: 't1' } };
    const res = makeRes();
    await getTicket(req, res, vi.fn());

    expect(ticketFindFirstMock).toHaveBeenCalledWith({
      where: { id: 't1', userId: 'user-1' },
    });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: ticket }));
  });

  it('calls next with a 404 AppError when ticket is not found', async () => {
    ticketFindFirstMock.mockResolvedValue(null);

    const req = { user: { id: 'user-1' }, params: { id: 't-missing' } };
    const res = makeRes();
    const next = vi.fn();
    await getTicket(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(next.mock.calls[0][0].statusCode).toBe(404);
  });
});
