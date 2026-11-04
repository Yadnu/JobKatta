import { beforeEach, describe, expect, it, vi } from 'vitest';

const employerFindUniqueMock = vi.fn();
const employerUpdateMock = vi.fn();
const jobFindManyMock = vi.fn();
const jobCountMock = vi.fn();
const jobFindFirstMock = vi.fn();
const jobCreateMock = vi.fn();
const jobUpdateMock = vi.fn();
const jobDeleteMock = vi.fn();
const jobSkillCreateManyMock = vi.fn();
const jobSkillDeleteManyMock = vi.fn();
const applicationFindManyMock = vi.fn();
const applicationFindFirstMock = vi.fn();
const applicationUpdateMock = vi.fn();
const applicationCountMock = vi.fn();
const candidateFindUniqueMock = vi.fn();

vi.mock('../config/database.js', () => ({
  default: {
    employer: { findUnique: employerFindUniqueMock, update: employerUpdateMock },
    job: {
      findMany: jobFindManyMock,
      count: jobCountMock,
      findFirst: jobFindFirstMock,
      create: jobCreateMock,
      update: jobUpdateMock,
      delete: jobDeleteMock,
    },
    jobSkill: { createMany: jobSkillCreateManyMock, deleteMany: jobSkillDeleteManyMock },
    application: {
      findMany: applicationFindManyMock,
      findFirst: applicationFindFirstMock,
      update: applicationUpdateMock,
      count: applicationCountMock,
    },
    candidate: { findUnique: candidateFindUniqueMock },
  },
}));

const checkEmployerJobLimitMock = vi.fn();
vi.mock('../services/subscription.service.js', () => ({
  checkEmployerJobLimit: checkEmployerJobLimitMock,
}));

const createNotificationMock = vi.fn();
vi.mock('../utils/notification.util.js', () => ({
  createNotification: createNotificationMock,
}));

vi.mock('xss', () => ({ default: (s) => `safe:${s}` }));

const {
  getPublicEmployerById,
  getProfile,
  updateProfile,
  getJobs,
  createJob,
  updateJob,
  deleteJob,
  duplicateJob,
  closeJob,
  getApplicants,
  updateApplicationStatus,
  updateApplicationNote,
  updateApplicationFollowUp,
  getJobAnalytics,
  getRecentApplications,
  unlockContact,
} = await import('./employer.controller.js');

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

const userReq = (extra = {}) => ({ user: { id: 'user-1' }, body: {}, params: {}, query: {}, ...extra });

beforeEach(() => {
  vi.clearAllMocks();
  checkEmployerJobLimitMock.mockResolvedValue({ allowed: true });
  employerUpdateMock.mockResolvedValue({ id: 'emp-1' });
  jobUpdateMock.mockResolvedValue({ id: 'job-1' });
  jobDeleteMock.mockResolvedValue({});
  jobSkillCreateManyMock.mockResolvedValue({ count: 1 });
  jobSkillDeleteManyMock.mockResolvedValue({ count: 1 });
  applicationUpdateMock.mockResolvedValue({ id: 'app-1' });
});

describe('getPublicEmployerById', () => {
  it('returns 404 when the employer does not exist', async () => {
    employerFindUniqueMock.mockResolvedValue(null);
    const next = vi.fn();
    await getPublicEmployerById({ params: { id: 'missing' } }, makeRes(), next);
    expectStatus(next, 404);
  });

  it('returns the public employer profile', async () => {
    const employer = { id: 'emp-1', companyName: 'Acme' };
    employerFindUniqueMock.mockResolvedValue(employer);
    const res = makeRes();
    await getPublicEmployerById({ params: { id: 'emp-1' } }, res, vi.fn());
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Employer fetched', data: employer });
  });
});

describe('profile', () => {
  it('returns 404 when the employer profile is missing', async () => {
    employerFindUniqueMock.mockResolvedValue(null);
    const next = vi.fn();
    await getProfile(userReq(), makeRes(), next);
    expectStatus(next, 404);
  });

  it('returns the authenticated employer profile', async () => {
    const employer = { id: 'emp-1' };
    employerFindUniqueMock.mockResolvedValue(employer);
    const res = makeRes();
    await getProfile(userReq(), res, vi.fn());
    expect(employerFindUniqueMock).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Profile fetched', data: employer });
  });

  it('sanitises string fields and leaves numbers untouched', async () => {
    employerFindUniqueMock.mockResolvedValue({ id: 'emp-1' });
    employerUpdateMock.mockResolvedValue({ id: 'emp-1', companyName: 'safe:Acme' });
    const res = makeRes();
    await updateProfile(userReq({ body: { companyName: 'Acme', foundedYear: 2010, ignored: 'nope' } }), res, vi.fn());
    expect(employerUpdateMock).toHaveBeenCalledWith({
      where: { id: 'emp-1' },
      data: { companyName: 'safe:Acme', foundedYear: 2010 },
    });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Profile updated' }));
  });
});

describe('getJobs', () => {
  it('returns 404 when the employer profile is missing', async () => {
    employerFindUniqueMock.mockResolvedValue(null);
    const next = vi.fn();
    await getJobs(userReq(), makeRes(), next);
    expectStatus(next, 404);
  });

  it('returns paginated jobs for the employer', async () => {
    employerFindUniqueMock.mockResolvedValue({ id: 'emp-1' });
    jobFindManyMock.mockResolvedValue([{ id: 'job-1' }]);
    jobCountMock.mockResolvedValue(1);
    const res = makeRes();
    await getJobs(userReq({ query: { page: '2', limit: '5' } }), res, vi.fn());
    expect(jobFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { employerId: 'emp-1' }, skip: 5, take: 5 }),
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ pagination: { page: 2, limit: 5, total: 1, pages: 1 } }),
    );
  });
});

describe('createJob', () => {
  it('returns 404 when the employer profile is missing', async () => {
    employerFindUniqueMock.mockResolvedValue(null);
    const next = vi.fn();
    await createJob(userReq(), makeRes(), next);
    expectStatus(next, 404);
  });

  it('returns 403 when the job limit is reached', async () => {
    employerFindUniqueMock.mockResolvedValue({ id: 'emp-1' });
    checkEmployerJobLimitMock.mockResolvedValue({ allowed: false, reason: 'Plan limit' });
    const next = vi.fn();
    await createJob(userReq({ body: { title: 'Engineer' } }), makeRes(), next);
    expectStatus(next, 403);
    expect(next.mock.calls[0][0].message).toBe('Plan limit');
    expect(jobCreateMock).not.toHaveBeenCalled();
  });

  it('creates a pending job and attaches skills', async () => {
    employerFindUniqueMock.mockResolvedValue({ id: 'emp-1' });
    jobCreateMock.mockResolvedValue({ id: 'job-1', title: 'safe:Engineer' });
    const res = makeRes();
    await createJob(
      userReq({
        body: {
          title: 'Engineer',
          description: 'Build things',
          requirements: 'JS',
          city: 'Pune',
          state: 'MH',
          category: 'Engineering',
          employmentType: 'FULL_TIME',
          skills: ['s1'],
          applicationDeadline: '2026-12-01',
        },
      }),
      res,
      vi.fn(),
    );

    expect(jobCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        employerId: 'emp-1',
        title: 'safe:Engineer',
        description: 'safe:Build things',
        requirements: 'safe:JS',
        city: 'safe:Pune',
        state: 'safe:MH',
        openings: 1,
        experienceMin: 0,
        isRemote: false,
        status: 'PENDING_APPROVAL',
        applicationDeadline: new Date('2026-12-01'),
        expiresAt: expect.any(Date),
      }),
    });
    expect(jobSkillCreateManyMock).toHaveBeenCalledWith({
      data: [{ jobId: 'job-1', skillId: 's1' }],
      skipDuplicates: true,
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('skips skill rows when none are provided', async () => {
    employerFindUniqueMock.mockResolvedValue({ id: 'emp-1' });
    jobCreateMock.mockResolvedValue({ id: 'job-1' });
    await createJob(userReq({ body: { title: 'Engineer', description: 'Build', city: 'Pune', state: 'MH' } }), makeRes(), vi.fn());
    expect(jobSkillCreateManyMock).not.toHaveBeenCalled();
  });
});

describe('updateJob', () => {
  it('returns 404 when the job is not owned by the employer', async () => {
    employerFindUniqueMock.mockResolvedValue({ id: 'emp-1' });
    jobFindFirstMock.mockResolvedValue(null);
    const next = vi.fn();
    await updateJob(userReq({ params: { id: 'job-x' } }), makeRes(), next);
    expectStatus(next, 404);
  });

  it('returns 400 unless the job is a draft or rejected', async () => {
    employerFindUniqueMock.mockResolvedValue({ id: 'emp-1' });
    jobFindFirstMock.mockResolvedValue({ id: 'job-1', status: 'ACTIVE' });
    const next = vi.fn();
    await updateJob(userReq({ params: { id: 'job-1' }, body: { title: 'New' } }), makeRes(), next);
    expectStatus(next, 400);
    expect(jobUpdateMock).not.toHaveBeenCalled();
  });

  it('resubmits a rejected job and replaces its skills', async () => {
    employerFindUniqueMock.mockResolvedValue({ id: 'emp-1' });
    jobFindFirstMock.mockResolvedValue({ id: 'job-1', status: 'REJECTED' });
    const res = makeRes();
    await updateJob(userReq({ params: { id: 'job-1' }, body: { title: 'New', skills: ['s2'] } }), res, vi.fn());
    expect(jobUpdateMock).toHaveBeenCalledWith({
      where: { id: 'job-1' },
      data: { title: 'New', status: 'PENDING_APPROVAL', rejectionReason: null },
    });
    expect(jobSkillDeleteManyMock).toHaveBeenCalledWith({ where: { jobId: 'job-1' } });
    expect(jobSkillCreateManyMock).toHaveBeenCalledWith({
      data: [{ jobId: 'job-1', skillId: 's2' }],
      skipDuplicates: true,
    });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Job updated' }));
  });

  it('clears skills without recreating them when the list is empty', async () => {
    employerFindUniqueMock.mockResolvedValue({ id: 'emp-1' });
    jobFindFirstMock.mockResolvedValue({ id: 'job-1', status: 'DRAFT' });
    await updateJob(userReq({ params: { id: 'job-1' }, body: { skills: [] } }), makeRes(), vi.fn());
    expect(jobSkillDeleteManyMock).toHaveBeenCalledOnce();
    expect(jobSkillCreateManyMock).not.toHaveBeenCalled();
  });
});

describe('deleteJob, closeJob, duplicateJob', () => {
  it('returns 404 when deleting a job the employer does not own', async () => {
    employerFindUniqueMock.mockResolvedValue({ id: 'emp-1' });
    jobFindFirstMock.mockResolvedValue(null);
    const next = vi.fn();
    await deleteJob(userReq({ params: { id: 'job-x' } }), makeRes(), next);
    expectStatus(next, 404);
  });

  it('deletes an owned job', async () => {
    employerFindUniqueMock.mockResolvedValue({ id: 'emp-1' });
    jobFindFirstMock.mockResolvedValue({ id: 'job-1' });
    const res = makeRes();
    await deleteJob(userReq({ params: { id: 'job-1' } }), res, vi.fn());
    expect(jobDeleteMock).toHaveBeenCalledWith({ where: { id: 'job-1' } });
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Job deleted' });
  });

  it('closes an owned job', async () => {
    employerFindUniqueMock.mockResolvedValue({ id: 'emp-1' });
    jobFindFirstMock.mockResolvedValue({ id: 'job-1' });
    const res = makeRes();
    await closeJob(userReq({ params: { id: 'job-1' } }), res, vi.fn());
    expect(jobUpdateMock).toHaveBeenCalledWith({ where: { id: 'job-1' }, data: { status: 'CLOSED' } });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Job closed' }));
  });

  it('returns 403 when duplicating would exceed the job limit', async () => {
    employerFindUniqueMock.mockResolvedValue({ id: 'emp-1' });
    jobFindFirstMock.mockResolvedValue({ id: 'job-1', title: 'Engineer', skills: [] });
    checkEmployerJobLimitMock.mockResolvedValue({ allowed: false, reason: 'Plan limit' });
    const next = vi.fn();
    await duplicateJob(userReq({ params: { id: 'job-1' } }), makeRes(), next);
    expectStatus(next, 403);
    expect(jobCreateMock).not.toHaveBeenCalled();
  });

  it('duplicates a job, resets approval fields, and copies skills', async () => {
    employerFindUniqueMock.mockResolvedValue({ id: 'emp-1' });
    jobFindFirstMock.mockResolvedValue({
      id: 'job-1',
      createdAt: 'old',
      updatedAt: 'old',
      approvedAt: 'old',
      approvedBy: 'admin',
      viewCount: 9,
      applicationCount: 4,
      title: 'Engineer',
      employerId: 'emp-1',
      description: 'Build',
      skills: [{ skillId: 's1' }],
    });
    jobCreateMock.mockResolvedValue({ id: 'job-2' });
    const res = makeRes();
    await duplicateJob(userReq({ params: { id: 'job-1' } }), res, vi.fn());

    expect(jobCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: 'Engineer (Copy)',
        employerId: 'emp-1',
        description: 'Build',
        status: 'PENDING_APPROVAL',
        rejectionReason: null,
        renewalReminderSent: false,
        expiresAt: expect.any(Date),
      }),
    });
    const created = jobCreateMock.mock.calls[0][0].data;
    expect(created).not.toHaveProperty('id');
    expect(created).not.toHaveProperty('viewCount');
    expect(jobSkillCreateManyMock).toHaveBeenCalledWith({
      data: [{ jobId: 'job-2', skillId: 's1' }],
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe('applicants', () => {
  it('returns 404 when the job is not owned', async () => {
    employerFindUniqueMock.mockResolvedValue({ id: 'emp-1' });
    jobFindFirstMock.mockResolvedValue(null);
    const next = vi.fn();
    await getApplicants(userReq({ params: { id: 'job-x' } }), makeRes(), next);
    expectStatus(next, 404);
  });

  it('returns applicants for an owned job', async () => {
    employerFindUniqueMock.mockResolvedValue({ id: 'emp-1' });
    jobFindFirstMock.mockResolvedValue({ id: 'job-1' });
    applicationFindManyMock.mockResolvedValue([{ id: 'app-1' }]);
    const res = makeRes();
    await getApplicants(userReq({ params: { id: 'job-1' } }), res, vi.fn());
    expect(applicationFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { jobId: 'job-1' } }),
    );
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: [{ id: 'app-1' }] }));
  });

  it('returns 404 when updating a status for another employer', async () => {
    employerFindUniqueMock.mockResolvedValue({ id: 'emp-1' });
    applicationFindFirstMock.mockResolvedValue({ id: 'app-1', job: { employerId: 'emp-other', title: 'Role' } });
    const next = vi.fn();
    await updateApplicationStatus(userReq({ params: { id: 'app-1' }, body: { status: 'SHORTLISTED' } }), makeRes(), next);
    expectStatus(next, 404);
  });

  it('updates status and notifies the candidate', async () => {
    employerFindUniqueMock.mockResolvedValue({ id: 'emp-1' });
    applicationFindFirstMock.mockResolvedValue({
      id: 'app-1',
      candidateId: 'cand-1',
      job: { employerId: 'emp-1', title: 'Engineer' },
    });
    candidateFindUniqueMock.mockResolvedValue({ userId: 'cand-user' });
    applicationUpdateMock.mockResolvedValue({ id: 'app-1', status: 'SHORTLISTED' });
    const res = makeRes();
    await updateApplicationStatus(userReq({ params: { id: 'app-1' }, body: { status: 'SHORTLISTED' } }), res, vi.fn());
    expect(applicationUpdateMock).toHaveBeenCalledWith({
      where: { id: 'app-1' },
      data: { status: 'SHORTLISTED' },
    });
    expect(createNotificationMock).toHaveBeenCalledWith({
      userId: 'cand-user',
      type: 'STATUS_CHANGED',
      title: 'Application Update',
      message: 'Your application for "Engineer" is now shortlisted',
      link: '/candidate/applications',
    });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Status updated' }));
  });

  it('sanitises an internal note', async () => {
    employerFindUniqueMock.mockResolvedValue({ id: 'emp-1' });
    applicationFindFirstMock.mockResolvedValue({ id: 'app-1', job: { employerId: 'emp-1' } });
    await updateApplicationNote(userReq({ params: { id: 'app-1' }, body: { internalNote: 'call back' } }), makeRes(), vi.fn());
    expect(applicationUpdateMock).toHaveBeenCalledWith({
      where: { id: 'app-1' },
      data: { internalNote: 'safe:call back' },
    });
  });

  it('sets and clears a follow-up date', async () => {
    employerFindUniqueMock.mockResolvedValue({ id: 'emp-1' });
    applicationFindFirstMock.mockResolvedValue({ id: 'app-1', job: { employerId: 'emp-1' } });
    await updateApplicationFollowUp(userReq({ params: { id: 'app-1' }, body: { followUpDate: '2026-12-01' } }), makeRes(), vi.fn());
    expect(applicationUpdateMock).toHaveBeenCalledWith({
      where: { id: 'app-1' },
      data: { followUpDate: new Date('2026-12-01') },
    });

    await updateApplicationFollowUp(userReq({ params: { id: 'app-1' }, body: {} }), makeRes(), vi.fn());
    expect(applicationUpdateMock).toHaveBeenLastCalledWith({
      where: { id: 'app-1' },
      data: { followUpDate: null },
    });
  });
});

describe('analytics and recent applications', () => {
  it('returns 404 when analytics are requested for an unowned job', async () => {
    employerFindUniqueMock.mockResolvedValue({ id: 'emp-1' });
    jobFindFirstMock.mockResolvedValue(null);
    const next = vi.fn();
    await getJobAnalytics(userReq({ params: { id: 'job-x' } }), makeRes(), next);
    expectStatus(next, 404);
  });

  it('returns view, application, and shortlisted counts', async () => {
    employerFindUniqueMock.mockResolvedValue({ id: 'emp-1' });
    jobFindFirstMock.mockResolvedValue({ id: 'job-1', viewCount: 12, applicationCount: 4 });
    applicationCountMock.mockResolvedValue(2);
    const res = makeRes();
    await getJobAnalytics(userReq({ params: { id: 'job-1' } }), res, vi.fn());
    expect(applicationCountMock).toHaveBeenCalledWith({ where: { jobId: 'job-1', status: 'SHORTLISTED' } });
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Analytics fetched',
      data: { viewCount: 12, applicationCount: 4, shortlistedCount: 2 },
    });
  });

  it('returns the ten most recent applications', async () => {
    employerFindUniqueMock.mockResolvedValue({ id: 'emp-1' });
    applicationFindManyMock.mockResolvedValue([{ id: 'app-1' }]);
    const res = makeRes();
    await getRecentApplications(userReq(), res, vi.fn());
    expect(applicationFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { job: { employerId: 'emp-1' } }, take: 10 }),
    );
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Recent applications fetched' }));
  });
});

describe('unlockContact', () => {
  it('returns 404 when the employer profile is missing', async () => {
    employerFindUniqueMock.mockResolvedValue(null);
    const next = vi.fn();
    await unlockContact(userReq({ params: { applicationId: 'app-1' } }), makeRes(), next);
    expectStatus(next, 404);
  });

  it('returns 403 on the free plan', async () => {
    employerFindUniqueMock.mockResolvedValue({ id: 'emp-1', planType: 'FREE' });
    const next = vi.fn();
    await unlockContact(userReq({ params: { applicationId: 'app-1' } }), makeRes(), next);
    expectStatus(next, 403);
  });

  it('returns 404 when the application belongs to another employer', async () => {
    employerFindUniqueMock.mockResolvedValue({ id: 'emp-1', planType: 'PREMIUM' });
    applicationFindFirstMock.mockResolvedValue({ id: 'app-1', job: { employerId: 'emp-other' } });
    const next = vi.fn();
    await unlockContact(userReq({ params: { applicationId: 'app-1' } }), makeRes(), next);
    expectStatus(next, 404);
  });

  it('unlocks contact details and notifies the candidate', async () => {
    employerFindUniqueMock.mockResolvedValue({ id: 'emp-1', planType: 'PREMIUM', companyName: 'Acme' });
    applicationFindFirstMock.mockResolvedValue({ id: 'app-1', candidateId: 'cand-1', job: { employerId: 'emp-1' } });
    candidateFindUniqueMock.mockResolvedValue({ userId: 'cand-user', mobile: '9876543210', email: 'ada@mail.com' });
    const res = makeRes();
    await unlockContact(userReq({ params: { applicationId: 'app-1' } }), res, vi.fn());

    expect(applicationUpdateMock).toHaveBeenCalledWith({
      where: { id: 'app-1' },
      data: { contactUnlocked: true },
    });
    expect(createNotificationMock).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'cand-user', type: 'CONTACT_UNLOCKED' }),
    );
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Contact unlocked',
      data: { contactUnlocked: true, mobile: '9876543210', email: 'ada@mail.com' },
    });
  });
});
