import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the database module before importing the service
vi.mock('../config/database.js', () => ({
  default: {
    candidate: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import db from '../config/database.js';
import { calculateProfileComplete } from './profileComplete.service.js';

function makeCandidate(overrides = {}) {
  return {
    id: 'cand-1',
    firstName: null,
    lastName: null,
    city: null,
    state: null,
    mobile: null,
    photoUrl: null,
    resumeUrl: null,
    isFresher: false,
    educations: [],
    experiences: [],
    skills: [],
    ...overrides,
  };
}

describe('calculateProfileComplete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.candidate.update.mockResolvedValue({});
  });

  it('returns 0 when candidate is not found', async () => {
    db.candidate.findUnique.mockResolvedValue(null);
    const score = await calculateProfileComplete('nonexistent-id');
    expect(score).toBe(0);
    expect(db.candidate.update).not.toHaveBeenCalled();
  });

  it('returns 0 for a completely empty profile', async () => {
    db.candidate.findUnique.mockResolvedValue(makeCandidate());
    const score = await calculateProfileComplete('cand-1');
    expect(score).toBe(0);
  });

  it('awards 20 points for completed personal info', async () => {
    const candidate = makeCandidate({
      firstName: 'John',
      lastName: 'Doe',
      city: 'Mumbai',
      state: 'Maharashtra',
      mobile: '9876543210',
    });
    db.candidate.findUnique.mockResolvedValue(candidate);
    const score = await calculateProfileComplete('cand-1');
    expect(score).toBe(20);
  });

  it('awards 15 points for at least one education entry', async () => {
    db.candidate.findUnique.mockResolvedValue(
      makeCandidate({ educations: [{ id: 'edu-1' }] })
    );
    const score = await calculateProfileComplete('cand-1');
    expect(score).toBe(15);
  });

  it('awards 15 points when candidate is a fresher', async () => {
    db.candidate.findUnique.mockResolvedValue(makeCandidate({ isFresher: true }));
    const score = await calculateProfileComplete('cand-1');
    expect(score).toBe(15);
  });

  it('awards 15 points for at least one experience entry', async () => {
    db.candidate.findUnique.mockResolvedValue(
      makeCandidate({ experiences: [{ id: 'exp-1' }] })
    );
    const score = await calculateProfileComplete('cand-1');
    expect(score).toBe(15);
  });

  it('awards 20 points for 3 or more skills', async () => {
    db.candidate.findUnique.mockResolvedValue(
      makeCandidate({ skills: [{ id: 's1' }, { id: 's2' }, { id: 's3' }] })
    );
    const score = await calculateProfileComplete('cand-1');
    expect(score).toBe(20);
  });

  it('does not award skill points for fewer than 3 skills', async () => {
    db.candidate.findUnique.mockResolvedValue(
      makeCandidate({ skills: [{ id: 's1' }, { id: 's2' }] })
    );
    const score = await calculateProfileComplete('cand-1');
    expect(score).toBe(0);
  });

  it('awards 15 points for a photo', async () => {
    db.candidate.findUnique.mockResolvedValue(makeCandidate({ photoUrl: '/uploads/photo.jpg' }));
    const score = await calculateProfileComplete('cand-1');
    expect(score).toBe(15);
  });

  it('awards 15 points for a resume', async () => {
    db.candidate.findUnique.mockResolvedValue(makeCandidate({ resumeUrl: '/uploads/resume.pdf' }));
    const score = await calculateProfileComplete('cand-1');
    expect(score).toBe(15);
  });

  it('returns 100 for a fully completed profile', async () => {
    db.candidate.findUnique.mockResolvedValue(
      makeCandidate({
        firstName: 'John',
        lastName: 'Doe',
        city: 'Mumbai',
        state: 'Maharashtra',
        mobile: '9876543210',
        educations: [{ id: 'edu-1' }],
        experiences: [{ id: 'exp-1' }],
        skills: [{ id: 's1' }, { id: 's2' }, { id: 's3' }],
        photoUrl: '/uploads/photo.jpg',
        resumeUrl: '/uploads/resume.pdf',
      })
    );
    const score = await calculateProfileComplete('cand-1');
    expect(score).toBe(100);
  });

  it('persists the computed score back to the database', async () => {
    const candidate = makeCandidate({ photoUrl: '/uploads/photo.jpg' });
    db.candidate.findUnique.mockResolvedValue(candidate);
    await calculateProfileComplete('cand-1');
    expect(db.candidate.update).toHaveBeenCalledWith({
      where: { id: 'cand-1' },
      data: { profileComplete: 15 },
    });
  });
});
