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
  useCandidate,
  useUpdateProfile,
  useUpdateProfileStep,
  useAddEducation,
  useUpdateEducation,
  useDeleteEducation,
  useAddExperience,
  useUpdateExperience,
  useDeleteExperience,
  useUpdateSkills,
  useToggleOpenToWork,
  useCandidateApplications,
  useSavedJobs,
} from './useCandidate';

beforeEach(() => {
  vi.clearAllMocks();
  apiMock.get.mockResolvedValue({ data: { data: {} } });
  apiMock.put.mockResolvedValue({ data: { data: {} } });
  apiMock.post.mockResolvedValue({ data: {} });
  apiMock.delete.mockResolvedValue({ data: {} });
});

// ─── useCandidate ─────────────────────────────────────────────────────────────

describe('useCandidate', () => {
  it('uses query key ["candidate", "profile"]', () => {
    const cfg = useCandidate() as any;
    expect(cfg.queryKey).toEqual(['candidate', 'profile']);
  });

  it('queryFn calls GET /candidate/profile', async () => {
    const cfg = useCandidate() as any;
    await cfg.queryFn();
    expect(apiMock.get).toHaveBeenCalledWith('/candidate/profile');
  });
});

// ─── useUpdateProfile ─────────────────────────────────────────────────────────

describe('useUpdateProfile', () => {
  it('mutationFn calls PUT /candidate/profile with data', async () => {
    const cfg = useUpdateProfile() as any;
    await cfg.mutationFn({ firstName: 'Alice' });
    expect(apiMock.put).toHaveBeenCalledWith('/candidate/profile', { firstName: 'Alice' });
  });

  it('onSuccess invalidates candidate profile and me queries', async () => {
    const cfg = useUpdateProfile() as any;
    await cfg.onSuccess();
    expect(invalidateQueriesMock).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['candidate', 'profile'] }));
    expect(invalidateQueriesMock).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['me'] }));
  });
});

// ─── useUpdateProfileStep ─────────────────────────────────────────────────────

describe('useUpdateProfileStep', () => {
  it('mutationFn calls PUT /candidate/profile/step/:step', async () => {
    const cfg = useUpdateProfileStep() as any;
    await cfg.mutationFn({ step: 2, data: { city: 'Pune' } });
    expect(apiMock.put).toHaveBeenCalledWith('/candidate/profile/step/2', { city: 'Pune' });
  });
});

// ─── Education ────────────────────────────────────────────────────────────────

describe('useAddEducation', () => {
  it('mutationFn calls POST /candidate/education', async () => {
    const cfg = useAddEducation() as any;
    await cfg.mutationFn({ degree: 'B.E.' });
    expect(apiMock.post).toHaveBeenCalledWith('/candidate/education', { degree: 'B.E.' });
  });
});

describe('useUpdateEducation', () => {
  it('mutationFn calls PUT /candidate/education/:id', async () => {
    const cfg = useUpdateEducation() as any;
    await cfg.mutationFn({ id: 'edu-1', data: { degree: 'M.E.' } });
    expect(apiMock.put).toHaveBeenCalledWith('/candidate/education/edu-1', { degree: 'M.E.' });
  });
});

describe('useDeleteEducation', () => {
  it('mutationFn calls DELETE /candidate/education/:id', async () => {
    const cfg = useDeleteEducation() as any;
    await cfg.mutationFn('edu-1');
    expect(apiMock.delete).toHaveBeenCalledWith('/candidate/education/edu-1');
  });

  it('onSuccess invalidates candidate profile', async () => {
    const cfg = useDeleteEducation() as any;
    await cfg.onSuccess();
    expect(invalidateQueriesMock).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['candidate', 'profile'] }));
  });
});

// ─── Experience ───────────────────────────────────────────────────────────────

describe('useAddExperience', () => {
  it('mutationFn calls POST /candidate/experience', async () => {
    const cfg = useAddExperience() as any;
    await cfg.mutationFn({ company: 'TCS' });
    expect(apiMock.post).toHaveBeenCalledWith('/candidate/experience', { company: 'TCS' });
  });
});

describe('useUpdateExperience', () => {
  it('mutationFn calls PUT /candidate/experience/:id', async () => {
    const cfg = useUpdateExperience() as any;
    await cfg.mutationFn({ id: 'exp-2', data: { company: 'Infosys' } });
    expect(apiMock.put).toHaveBeenCalledWith('/candidate/experience/exp-2', { company: 'Infosys' });
  });
});

describe('useDeleteExperience', () => {
  it('mutationFn calls DELETE /candidate/experience/:id', async () => {
    const cfg = useDeleteExperience() as any;
    await cfg.mutationFn('exp-2');
    expect(apiMock.delete).toHaveBeenCalledWith('/candidate/experience/exp-2');
  });
});

// ─── Skills ───────────────────────────────────────────────────────────────────

describe('useUpdateSkills', () => {
  it('mutationFn calls PUT /candidate/skills with skillIds array', async () => {
    const cfg = useUpdateSkills() as any;
    await cfg.mutationFn(['skill-1', 'skill-2']);
    expect(apiMock.put).toHaveBeenCalledWith('/candidate/skills', { skillIds: ['skill-1', 'skill-2'] });
  });
});

// ─── useToggleOpenToWork ──────────────────────────────────────────────────────

describe('useToggleOpenToWork', () => {
  it('mutationFn calls PUT /candidate/open-to-work', async () => {
    const cfg = useToggleOpenToWork() as any;
    await cfg.mutationFn();
    expect(apiMock.put).toHaveBeenCalledWith('/candidate/open-to-work');
  });

  it('onSuccess invalidates profile and me', async () => {
    apiMock.put.mockResolvedValue({ data: { data: { openToWork: true } } });
    const cfg = useToggleOpenToWork() as any;
    await cfg.onSuccess({ data: { data: { openToWork: true } } });
    expect(invalidateQueriesMock).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['candidate', 'profile'] }));
    expect(invalidateQueriesMock).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['me'] }));
  });
});

// ─── Queries ──────────────────────────────────────────────────────────────────

describe('useCandidateApplications', () => {
  it('uses page in query key', () => {
    const cfg = useCandidateApplications(3) as any;
    expect(cfg.queryKey).toEqual(['candidate', 'applications', 3]);
  });

  it('queryFn calls GET /candidate/applications with page param', async () => {
    const cfg = useCandidateApplications(2) as any;
    await cfg.queryFn();
    expect(apiMock.get).toHaveBeenCalledWith('/candidate/applications?page=2');
  });
});

describe('useSavedJobs', () => {
  it('queryFn calls GET /candidate/saved-jobs with page param', async () => {
    const cfg = useSavedJobs(2) as any;
    await cfg.queryFn();
    expect(apiMock.get).toHaveBeenCalledWith('/candidate/saved-jobs?page=2');
  });
});
