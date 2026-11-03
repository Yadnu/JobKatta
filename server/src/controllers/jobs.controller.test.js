import { beforeEach, describe, expect, it, vi } from 'vitest';

const jobFindManyMock = vi.fn();
const jobCountMock = vi.fn();
const jobFindFirstMock = vi.fn();
const jobFindUniqueMock = vi.fn();
const jobUpdateMock = vi.fn();
const candidateFindUniqueMock = vi.fn();
const candidateUpdateMock = vi.fn();
const recentlyViewedUpsertMock = vi.fn();
const savedJobFindUniqueMock = vi.fn();
const savedJobDeleteMock = vi.fn();
const savedJobCreateMock = vi.fn();
const employerFindManyMock = vi.fn();
const employerCountMock = vi.fn();
const employerFindUniqueMock = vi.fn();
const applicationFindUniqueMock = vi.fn();
const applicationCreateMock = vi.fn();

vi.mock('../config/database.js', () => ({
  default: {
    job: {
      findMany: jobFindManyMock,
      count: jobCountMock,
      findFirst: jobFindFirstMock,
      findUnique: jobFindUniqueMock,
      update: jobUpdateMock,
    },
    candidate: {
      findUnique: candidateFindUniqueMock,
      update: candidateUpdateMock,
    },
    recentlyViewedJob: { upsert: recentlyViewedUpsertMock },
    savedJob: {
      findUnique: savedJobFindUniqueMock,
      delete: savedJobDeleteMock,
      create: savedJobCreateMock,
    },
    employer: {
      findMany: employerFindManyMock,
      count: employerCountMock,
      findUnique: employerFindUniqueMock,
    },
    application: {
      findUnique: applicationFindUniqueMock,
      create: applicationCreateMock,
    },
  },
}));

const checkCandidateAppLimitMock = vi.fn();
vi.mock('../services/subscription.service.js', () => ({
  checkCandidateAppLimit: checkCandidateAppLimitMock,
}));

const sendApplicationSubmittedEmailMock = vi.fn();
vi.mock('../services/email.service.js', () => ({
  sendApplicationSubmittedEmail: sendApplicationSubmittedEmailMock,
}));

const createNotificationMock = vi.fn();
vi.mock('../utils/notification.util.js', () => ({
  createNotification: createNotificationMock,
}));

const {
  listJobs,
  getJob,
  getFeaturedJobs,
  toggleSaveJob,
  getPublicEmployers,
  applyToJob,
} = await import('./jobs.controller.js');

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

beforeEach(() => {
  vi.clearAllMocks();
  jobUpdateMock.mockResolvedValue({});
  candidateUpdateMock.mockResolvedValue({});
  recentlyViewedUpsertMock.mockResolvedValue({});
  savedJobDeleteMock.mockResolvedValue({});
  savedJobCreateMock.mockResolvedValue({});
  checkCandidateAppLimitMock.mockResolvedValue({ allowed: true });
  sendApplicationSubmittedEmailMock.mockResolvedValue({ ok: true });
});

describe('listJobs', () => {
  it('returns active jobs with default pagination', async () => {
    const jobs = [{ id: 'job-1' }];
    jobFindManyMock.mockResolvedValue(jobs);
    jobCountMock.mockResolvedValue(1);

    const res = makeRes();
    await listJobs({ query: {} }, res, vi.fn());

    expect(jobFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: 'ACTIVE' },
        skip: 0,
        take: 10,
        orderBy: [{ isPriority: 'desc' }, { isFeatured: 'desc' }, { createdAt: 'desc' }],
      }),
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: jobs,
        pagination: { page: 1, limit: 10, total: 1, pages: 1 },
      }),
    );
  });

  it('applies keyword, location, category, type, salary, and employer filters', async () => {
    jobFindManyMock.mockResolvedValue([]);
    jobCountMock.mockResolvedValue(0);

    await listJobs(
      {
        query: {
          keyword: 'react',
          city: 'Pune',
          state: 'MH',
          category: 'Engineering',
          type: 'FULL_TIME',
          salaryMin: '500000',
          salaryMax: '1200000',
          employerId: 'emp-1',
          page: '2',
          limit: '5',
        },
      },
      makeRes(),
      vi.fn(),
    );

    expect(jobFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: 'ACTIVE',
          OR: [
            { title: { contains: 'react' } },
            { description: { contains: 'react' } },
            { category: { contains: 'react' } },
          ],
          city: { contains: 'Pune' },
          state: { contains: 'MH' },
          category: 'Engineering',
          employmentType: 'FULL_TIME',
          salaryMax: { gte: 500000 },
          salaryMin: { lte: 1200000 },
          employerId: 'emp-1',
        },
        skip: 5,
        take: 5,
      }),
    );
  });
});

describe('getJob', () => {
  const job = { id: 'job-1', title: 'Engineer' };

  it('returns 404 when the job is missing or not active', async () => {
    jobFindFirstMock.mockResolvedValue(null);
    const next = vi.fn();
    await getJob({ params: { id: 'missing' } }, makeRes(), next);
    expectStatus(next, 404);
    expect(jobUpdateMock).not.toHaveBeenCalled();
  });

  it('increments the view count and returns the job for a guest', async () => {
    jobFindFirstMock.mockResolvedValue(job);
    const res = makeRes();
    await getJob({ params: { id: 'job-1' } }, res, vi.fn());

    expect(jobFindFirstMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'job-1', status: 'ACTIVE' } }),
    );
    expect(jobUpdateMock).toHaveBeenCalledWith({
      where: { id: 'job-1' },
      data: { viewCount: { increment: 1 } },
    });
    expect(candidateFindUniqueMock).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Job fetched', data: job });
  });

  it('records a recently viewed row when the viewer is a candidate', async () => {
    jobFindFirstMock.mockResolvedValue(job);
    candidateFindUniqueMock.mockResolvedValue({ id: 'cand-1' });

    await getJob({ params: { id: 'job-1' }, user: { id: 'user-1' } }, makeRes(), vi.fn());

    expect(recentlyViewedUpsertMock).toHaveBeenCalledWith({
      where: { candidateId_jobId: { candidateId: 'cand-1', jobId: 'job-1' } },
      update: { viewedAt: expect.any(Date) },
      create: { candidateId: 'cand-1', jobId: 'job-1' },
    });
  });

  it('does not record a view when the signed-in user has no candidate profile', async () => {
    jobFindFirstMock.mockResolvedValue(job);
    candidateFindUniqueMock.mockResolvedValue(null);

    await getJob({ params: { id: 'job-1' }, user: { id: 'user-1' } }, makeRes(), vi.fn());

    expect(recentlyViewedUpsertMock).not.toHaveBeenCalled();
  });
});

describe('getFeaturedJobs', () => {
  it('returns up to six active featured jobs', async () => {
    const jobs = [{ id: 'job-1' }];
    jobFindManyMock.mockResolvedValue(jobs);
    const res = makeRes();
    await getFeaturedJobs({}, res, vi.fn());

    expect(jobFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: 'ACTIVE', isFeatured: true },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
    );
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Featured jobs', data: jobs });
  });
});

describe('toggleSaveJob', () => {
  it('returns 404 when the candidate profile is missing', async () => {
    candidateFindUniqueMock.mockResolvedValue(null);
    const next = vi.fn();
    await toggleSaveJob({ user: { id: 'user-1' }, params: { id: 'job-1' } }, makeRes(), next);
    expectStatus(next, 404);
  });

  it('returns 404 when the job does not exist', async () => {
    candidateFindUniqueMock.mockResolvedValue({ id: 'cand-1' });
    jobFindUniqueMock.mockResolvedValue(null);
    const next = vi.fn();
    await toggleSaveJob({ user: { id: 'user-1' }, params: { id: 'job-1' } }, makeRes(), next);
    expectStatus(next, 404);
  });

  it('unsaves a job that is already saved', async () => {
    candidateFindUniqueMock.mockResolvedValue({ id: 'cand-1' });
    jobFindUniqueMock.mockResolvedValue({ id: 'job-1' });
    savedJobFindUniqueMock.mockResolvedValue({ candidateId: 'cand-1', jobId: 'job-1' });

    const res = makeRes();
    await toggleSaveJob({ user: { id: 'user-1' }, params: { id: 'job-1' } }, res, vi.fn());

    expect(savedJobDeleteMock).toHaveBeenCalledWith({
      where: { candidateId_jobId: { candidateId: 'cand-1', jobId: 'job-1' } },
    });
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Job unsaved', data: { saved: false } });
  });

  it('saves a job that is not yet saved', async () => {
    candidateFindUniqueMock.mockResolvedValue({ id: 'cand-1' });
    jobFindUniqueMock.mockResolvedValue({ id: 'job-1' });
    savedJobFindUniqueMock.mockResolvedValue(null);

    const res = makeRes();
    await toggleSaveJob({ user: { id: 'user-1' }, params: { id: 'job-1' } }, res, vi.fn());

    expect(savedJobCreateMock).toHaveBeenCalledWith({ data: { candidateId: 'cand-1', jobId: 'job-1' } });
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Job saved', data: { saved: true } });
  });
});

describe('getPublicEmployers', () => {
  it('returns verified employers and maps the active job count', async () => {
    employerFindManyMock.mockResolvedValue([
      { id: 'emp-1', companyName: 'Acme', _count: { jobs: 3 } },
    ]);
    employerCountMock.mockResolvedValue(1);

    const res = makeRes();
    await getPublicEmployers({ query: { keyword: 'Ac', industry: 'Software', page: '1', limit: '10' } }, res, vi.fn());

    expect(employerFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          isVerified: true,
          companyName: { contains: 'Ac' },
          industry: { contains: 'Software' },
        },
        skip: 0,
        take: 10,
      }),
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [{ id: 'emp-1', companyName: 'Acme', _count: undefined, activeJobCount: 3 }],
        pagination: { page: 1, limit: 10, total: 1, pages: 1 },
      }),
    );
  });
});

describe('applyToJob', () => {
  const candidate = {
    id: 'cand-1',
    firstName: 'Ada',
    lastName: 'Lovelace',
    resumeUrl: '/uploads/resumes/cv.pdf',
    user: { email: 'ada@mail.com' },
  };
  const job = { id: 'job-1', title: 'Engineer', employerId: 'emp-1' };

  it('returns 404 when the candidate profile is missing', async () => {
    candidateFindUniqueMock.mockResolvedValue(null);
    const next = vi.fn();
    await applyToJob({ user: { id: 'user-1' }, params: { id: 'job-1' }, body: {} }, makeRes(), next);
    expectStatus(next, 404);
  });

  it('returns 404 when the job is not active', async () => {
    candidateFindUniqueMock.mockResolvedValue(candidate);
    jobFindFirstMock.mockResolvedValue(null);
    const next = vi.fn();
    await applyToJob({ user: { id: 'user-1' }, params: { id: 'job-1' }, body: {} }, makeRes(), next);
    expectStatus(next, 404);
  });

  it('returns 409 when the candidate has already applied', async () => {
    candidateFindUniqueMock.mockResolvedValue(candidate);
    jobFindFirstMock.mockResolvedValue(job);
    applicationFindUniqueMock.mockResolvedValue({ id: 'app-1' });
    const next = vi.fn();
    await applyToJob({ user: { id: 'user-1' }, params: { id: 'job-1' }, body: {} }, makeRes(), next);
    expectStatus(next, 409);
    expect(applicationCreateMock).not.toHaveBeenCalled();
  });

  it('returns 403 when the monthly application limit is reached', async () => {
    candidateFindUniqueMock.mockResolvedValue(candidate);
    jobFindFirstMock.mockResolvedValue(job);
    applicationFindUniqueMock.mockResolvedValue(null);
    checkCandidateAppLimitMock.mockResolvedValue({ allowed: false, reason: 'Free plan limit' });
    const next = vi.fn();
    await applyToJob({ user: { id: 'user-1' }, params: { id: 'job-1' }, body: {} }, makeRes(), next);
    expectStatus(next, 403);
    expect(next.mock.calls[0][0].message).toBe('Free plan limit');
  });

  it('creates the application, increments counts, emails the candidate, and notifies the employer', async () => {
    candidateFindUniqueMock.mockResolvedValue(candidate);
    jobFindFirstMock.mockResolvedValue(job);
    applicationFindUniqueMock.mockResolvedValue(null);
    applicationCreateMock.mockResolvedValue({ id: 'app-1', status: 'APPLIED' });
    employerFindUniqueMock.mockResolvedValue({ userId: 'employer-user' });

    const res = makeRes();
    await applyToJob(
      { user: { id: 'user-1' }, params: { id: 'job-1' }, body: { coverNote: 'Hello' } },
      res,
      vi.fn(),
    );

    expect(checkCandidateAppLimitMock).toHaveBeenCalledWith('cand-1');
    expect(applicationCreateMock).toHaveBeenCalledWith({
      data: {
        candidateId: 'cand-1',
        jobId: 'job-1',
        coverNote: 'Hello',
        resumeUrl: '/uploads/resumes/cv.pdf',
        status: 'APPLIED',
      },
    });
    expect(jobUpdateMock).toHaveBeenCalledWith({
      where: { id: 'job-1' },
      data: { applicationCount: { increment: 1 } },
    });
    expect(candidateUpdateMock).toHaveBeenCalledWith({
      where: { id: 'cand-1' },
      data: { appCountThisMonth: { increment: 1 } },
    });
    expect(sendApplicationSubmittedEmailMock).toHaveBeenCalledWith('ada@mail.com', {
      name: 'Ada Lovelace',
      jobTitle: 'Engineer',
    });
    expect(createNotificationMock).toHaveBeenCalledWith({
      userId: 'employer-user',
      type: 'APPLICATION_RECEIVED',
      title: 'New Application',
      message: 'Ada Lovelace applied for "Engineer"',
      link: '/employer/jobs/job-1/applicants',
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: { id: 'app-1', status: 'APPLIED' } }),
    );
  });

  it('skips the email and the employer notification when neither exists', async () => {
    candidateFindUniqueMock.mockResolvedValue({ ...candidate, user: { email: null } });
    jobFindFirstMock.mockResolvedValue(job);
    applicationFindUniqueMock.mockResolvedValue(null);
    applicationCreateMock.mockResolvedValue({ id: 'app-1' });
    employerFindUniqueMock.mockResolvedValue(null);

    const res = makeRes();
    await applyToJob({ user: { id: 'user-1' }, params: { id: 'job-1' }, body: {} }, res, vi.fn());

    expect(sendApplicationSubmittedEmailMock).not.toHaveBeenCalled();
    expect(createNotificationMock).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('still submits the application when the confirmation email fails', async () => {
    candidateFindUniqueMock.mockResolvedValue(candidate);
    jobFindFirstMock.mockResolvedValue(job);
    applicationFindUniqueMock.mockResolvedValue(null);
    applicationCreateMock.mockResolvedValue({ id: 'app-1' });
    employerFindUniqueMock.mockResolvedValue(null);
    sendApplicationSubmittedEmailMock.mockRejectedValue(new Error('smtp down'));

    const res = makeRes();
    await applyToJob({ user: { id: 'user-1' }, params: { id: 'job-1' }, body: {} }, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(201);
  });
});
