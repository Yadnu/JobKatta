import { beforeEach, describe, expect, it, vi } from 'vitest';

// ─── mock database ────────────────────────────────────────────────────────────
const skillFindManyMock = vi.fn();
vi.mock('../config/database.js', () => ({
  default: { skill: { findMany: skillFindManyMock } },
}));

const { listSkills, listCategories } = await import('./skills.controller.js');

const makeRes = () => {
  const res = { json: vi.fn() };
  return res;
};

beforeEach(() => vi.clearAllMocks());

describe('listSkills', () => {
  it('returns all skills ordered by name', async () => {
    const skills = [{ id: '1', name: 'JavaScript' }, { id: '2', name: 'Python' }];
    skillFindManyMock.mockResolvedValue(skills);

    const req = {};
    const res = makeRes();
    await listSkills(req, res, vi.fn());

    expect(skillFindManyMock).toHaveBeenCalledWith({ orderBy: { name: 'asc' } });
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Skills fetched', data: skills });
  });

  it('returns an empty array when there are no skills', async () => {
    skillFindManyMock.mockResolvedValue([]);
    const res = makeRes();
    await listSkills({}, res, vi.fn());
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: [] }));
  });
});

describe('listCategories', () => {
  it('returns distinct categories extracted from skill records', async () => {
    skillFindManyMock.mockResolvedValue([{ category: 'Frontend' }, { category: 'Backend' }]);

    const res = makeRes();
    await listCategories({}, res, vi.fn());

    expect(skillFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        select: { category: true },
        distinct: ['category'],
        where: { category: { not: null } },
      }),
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: ['Frontend', 'Backend'] }),
    );
  });

  it('returns an empty array when no categories exist', async () => {
    skillFindManyMock.mockResolvedValue([]);
    const res = makeRes();
    await listCategories({}, res, vi.fn());
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: [] }));
  });
});
