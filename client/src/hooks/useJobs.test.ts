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
  useJobs,
  useJob,
  useFeaturedJobs,
  useSaveJob,
  usePublicEmployers,
  usePublicEmployer,
  useSkills,
  useApplyJob,
} from './useJobs';

beforeEach(() => {
  vi.clearAllMocks();
  apiMock.get.mockResolvedValue({ data: { data: [] } });
  apiMock.post.mockResolvedValue({ data: { data: { saved: true } } });
});

// ─── useJobs ──────────────────────────────────────────────────────────────────

describe('useJobs', () => {
  it('uses the correct query key for an empty filter', () => {
    const cfg = useJobs() as any;
    expect(cfg.queryKey).toEqual(['jobs', {}]);
  });

  it('uses the correct query key when filters are provided', () => {
    const filters = { keyword: 'react', city: 'Pune' };
    const cfg = useJobs(filters) as any;
    expect(cfg.queryKey).toEqual(['jobs', filters]);
  });

  it('queryFn calls GET /jobs with serialised filter params', async () => {
    const cfg = useJobs({ keyword: 'node', page: 2 }) as any;
    await cfg.queryFn();
    const url: string = apiMock.get.mock.calls[0][0];
    expect(url).toContain('/jobs');
    expect(url).toContain('keyword=node');
    expect(url).toContain('page=2');
  });

  it('queryFn omits undefined/empty filter values', async () => {
    const cfg = useJobs({ keyword: '', city: undefined }) as any;
    await cfg.queryFn();
    const url: string = apiMock.get.mock.calls[0][0];
    expect(url).not.toContain('keyword');
    expect(url).not.toContain('city');
  });
});

// ─── useJob ───────────────────────────────────────────────────────────────────

describe('useJob', () => {
  it('uses query key ["job", id]', () => {
    const cfg = useJob('job-1') as any;
    expect(cfg.queryKey).toEqual(['job', 'job-1']);
  });

  it('queryFn calls GET /jobs/:id', async () => {
    apiMock.get.mockResolvedValue({ data: { data: { id: 'job-1' } } });
    const cfg = useJob('job-1') as any;
    await cfg.queryFn();
    expect(apiMock.get).toHaveBeenCalledWith('/jobs/job-1');
  });

  it('is disabled when id is empty', () => {
    const cfg = useJob('') as any;
    expect(cfg.enabled).toBe(false);
  });
});

// ─── useFeaturedJobs ──────────────────────────────────────────────────────────

describe('useFeaturedJobs', () => {
  it('uses query key ["jobs", "featured"]', () => {
    const cfg = useFeaturedJobs() as any;
    expect(cfg.queryKey).toEqual(['jobs', 'featured']);
  });

  it('queryFn calls GET /jobs/featured', async () => {
    const cfg = useFeaturedJobs() as any;
    await cfg.queryFn();
    expect(apiMock.get).toHaveBeenCalledWith('/jobs/featured');
  });
});

// ─── useSaveJob ───────────────────────────────────────────────────────────────

describe('useSaveJob', () => {
  it('mutationFn calls POST /jobs/:id/save', async () => {
    const cfg = useSaveJob() as any;
    await cfg.mutationFn('job-42');
    expect(apiMock.post).toHaveBeenCalledWith('/jobs/job-42/save');
  });

  it('onSuccess invalidates saved-jobs query', async () => {
    const cfg = useSaveJob() as any;
    await cfg.onSuccess({ data: { data: { saved: true } } });
    expect(invalidateQueriesMock).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['candidate', 'saved-jobs'] }),
    );
  });
});

// ─── usePublicEmployers ───────────────────────────────────────────────────────

describe('usePublicEmployers', () => {
  it('queryFn calls GET /jobs/employers', async () => {
    const cfg = usePublicEmployers() as any;
    await cfg.queryFn();
    expect(apiMock.get.mock.calls[0][0]).toContain('/jobs/employers');
  });
});

// ─── usePublicEmployer ────────────────────────────────────────────────────────

describe('usePublicEmployer', () => {
  it('is disabled when employerId is empty', () => {
    const cfg = usePublicEmployer('') as any;
    expect(cfg.enabled).toBe(false);
  });

  it('queryFn calls GET /employer/public/:id', async () => {
    apiMock.get.mockResolvedValue({ data: { data: {} } });
    const cfg = usePublicEmployer('emp-1') as any;
    await cfg.queryFn();
    expect(apiMock.get).toHaveBeenCalledWith('/employer/public/emp-1');
  });
});

// ─── useSkills ────────────────────────────────────────────────────────────────

describe('useSkills', () => {
  it('queryFn calls GET /skills without search param when undefined', async () => {
    const cfg = useSkills() as any;
    await cfg.queryFn();
    expect(apiMock.get).toHaveBeenCalledWith('/skills');
  });

  it('queryFn encodes the search term in the URL', async () => {
    const cfg = useSkills('react') as any;
    await cfg.queryFn();
    expect(apiMock.get).toHaveBeenCalledWith('/skills?q=react');
  });
});

// ─── useApplyJob ──────────────────────────────────────────────────────────────

describe('useApplyJob', () => {
  it('mutationFn calls POST /jobs/:id/apply with coverNote', async () => {
    const cfg = useApplyJob() as any;
    await cfg.mutationFn({ jobId: 'job-5', coverNote: 'I am a great fit.' });
    expect(apiMock.post).toHaveBeenCalledWith('/jobs/job-5/apply', { coverNote: 'I am a great fit.' });
  });

  it('onSuccess invalidates candidate applications', async () => {
    const cfg = useApplyJob() as any;
    await cfg.onSuccess();
    expect(invalidateQueriesMock).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['candidate', 'applications'] }),
    );
  });
});
