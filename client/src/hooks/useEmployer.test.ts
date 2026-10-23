import { describe, expect, it, vi, beforeEach } from 'vitest';

const { apiMock, invalidateQueriesMock } = vi.hoisted(() => ({
  apiMock: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  invalidateQueriesMock: vi.fn(),
}));
vi.mock('@/lib/api', () => ({ default: apiMock }));
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn((cfg) => cfg),
  useMutation: vi.fn((cfg) => cfg),
  useQueryClient: vi.fn(() => ({ invalidateQueries: invalidateQueriesMock })),
}));
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));

import {
  useEmployerProfile, useUpdateEmployerProfile,
  useEmployerJobs, useCreateJob, useUpdateJob, useDeleteJob,
  useCloseJob, useDuplicateJob,
  useJobApplicants, useEmployerRecentApplications,
  useUpdateApplicationStatus, useJobAnalytics, useUnlockContact,
} from './useEmployer';

beforeEach(() => {
  vi.clearAllMocks();
  apiMock.get.mockResolvedValue({ data: { data: {} } });
  apiMock.post.mockResolvedValue({ data: { data: {} } });
  apiMock.put.mockResolvedValue({ data: { data: {} } });
  apiMock.delete.mockResolvedValue({ data: {} });
});

describe('useEmployerProfile', () => {
  it('uses query key ["employer", "profile"]', () => {
    expect((useEmployerProfile() as any).queryKey).toEqual(['employer', 'profile']);
  });
  it('queryFn calls GET /employer/profile', async () => {
    await (useEmployerProfile() as any).queryFn();
    expect(apiMock.get).toHaveBeenCalledWith('/employer/profile');
  });
});

describe('useUpdateEmployerProfile', () => {
  it('mutationFn calls PUT /employer/profile', async () => {
    await (useUpdateEmployerProfile() as any).mutationFn({ companyName: 'Acme' });
    expect(apiMock.put).toHaveBeenCalledWith('/employer/profile', { companyName: 'Acme' });
  });
  it('onSuccess invalidates profile and me', async () => {
    await (useUpdateEmployerProfile() as any).onSuccess();
    expect(invalidateQueriesMock).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['employer', 'profile'] }));
    expect(invalidateQueriesMock).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['me'] }));
  });
});

describe('useEmployerJobs', () => {
  it('includes page in query key', () => {
    expect((useEmployerJobs(2) as any).queryKey).toEqual(['employer', 'jobs', 2]);
  });
  it('queryFn calls GET /employer/jobs with page', async () => {
    await (useEmployerJobs(3) as any).queryFn();
    expect(apiMock.get).toHaveBeenCalledWith('/employer/jobs?page=3');
  });
});

describe('useCreateJob', () => {
  it('mutationFn calls POST /employer/jobs', async () => {
    await (useCreateJob() as any).mutationFn({ title: 'Dev', type: 'FULL_TIME' });
    expect(apiMock.post).toHaveBeenCalledWith('/employer/jobs', expect.objectContaining({ title: 'Dev' }));
  });
  it('onSuccess invalidates employer jobs', async () => {
    await (useCreateJob() as any).onSuccess();
    expect(invalidateQueriesMock).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['employer', 'jobs'] }));
  });
});

describe('useUpdateJob', () => {
  it('mutationFn calls PUT /employer/jobs/:id', async () => {
    await (useUpdateJob() as any).mutationFn({ id: 'job-1', data: { title: 'Updated' } });
    expect(apiMock.put).toHaveBeenCalledWith('/employer/jobs/job-1', { title: 'Updated' });
  });
});

describe('useDeleteJob', () => {
  it('mutationFn calls DELETE /employer/jobs/:id', async () => {
    await (useDeleteJob() as any).mutationFn('job-2');
    expect(apiMock.delete).toHaveBeenCalledWith('/employer/jobs/job-2');
  });
});

describe('useCloseJob', () => {
  it('mutationFn calls PUT /employer/jobs/:id/close', async () => {
    await (useCloseJob() as any).mutationFn('job-3');
    expect(apiMock.put).toHaveBeenCalledWith('/employer/jobs/job-3/close');
  });
});

describe('useDuplicateJob', () => {
  it('mutationFn calls POST /employer/jobs/:id/duplicate', async () => {
    await (useDuplicateJob() as any).mutationFn('job-4');
    expect(apiMock.post).toHaveBeenCalledWith('/employer/jobs/job-4/duplicate');
  });
});

describe('useJobApplicants', () => {
  it('is disabled when jobId is empty', () => {
    expect((useJobApplicants('') as any).enabled).toBe(false);
  });
  it('queryFn calls GET /employer/jobs/:id/applications', async () => {
    await (useJobApplicants('job-5') as any).queryFn();
    expect(apiMock.get).toHaveBeenCalledWith('/employer/jobs/job-5/applications');
  });
});

describe('useUpdateApplicationStatus', () => {
  it('mutationFn calls PUT /employer/applications/:id/status', async () => {
    await (useUpdateApplicationStatus() as any).mutationFn({ id: 'app-1', status: 'SHORTLISTED' });
    expect(apiMock.put).toHaveBeenCalledWith('/employer/applications/app-1/status', { status: 'SHORTLISTED' });
  });
  it('onSuccess invalidates applicants queries', async () => {
    await (useUpdateApplicationStatus() as any).onSuccess({}, { id: 'app-1', status: 'HIRED' });
    expect(invalidateQueriesMock).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['employer', 'applicants'] }));
  });
});

describe('useJobAnalytics', () => {
  it('is disabled when jobId is empty', () => {
    expect((useJobAnalytics('') as any).enabled).toBe(false);
  });
  it('queryFn calls GET /employer/jobs/:id/analytics', async () => {
    apiMock.get.mockResolvedValue({ data: {} });
    await (useJobAnalytics('job-6') as any).queryFn();
    expect(apiMock.get).toHaveBeenCalledWith('/employer/jobs/job-6/analytics');
  });
});

describe('useUnlockContact', () => {
  it('mutationFn calls POST /employer/unlock-contact/:applicationId', async () => {
    await (useUnlockContact() as any).mutationFn('app-10');
    expect(apiMock.post).toHaveBeenCalledWith('/employer/unlock-contact/app-10');
  });
});
