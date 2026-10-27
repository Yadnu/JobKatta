import { beforeEach, describe, expect, it, vi } from 'vitest';

// ─── mock fs ─────────────────────────────────────────────────────────────────
const existsSyncMock = vi.fn();
const unlinkMock = vi.fn();
vi.mock('fs', () => ({
  default: { existsSync: existsSyncMock, unlink: unlinkMock },
  existsSync: existsSyncMock,
  unlink: unlinkMock,
}));

// ─── mock database ────────────────────────────────────────────────────────────
const candidateFindUniqueMock = vi.fn();
const candidateUpdateMock = vi.fn();
const employerFindUniqueMock = vi.fn();
const employerUpdateMock = vi.fn();

vi.mock('../config/database.js', () => ({
  default: {
    candidate: { findUnique: candidateFindUniqueMock, update: candidateUpdateMock },
    employer: { findUnique: employerFindUniqueMock, update: employerUpdateMock },
  },
}));

// ─── mock profileComplete service ─────────────────────────────────────────────
const calculateProfileCompleteMock = vi.fn();
vi.mock('../services/profileComplete.service.js', () => ({
  calculateProfileComplete: calculateProfileCompleteMock,
}));

const { uploadPhoto, uploadResume, uploadLogo } = await import('./upload.controller.js');

const makeRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  vi.clearAllMocks();
  existsSyncMock.mockReturnValue(false);
  calculateProfileCompleteMock.mockResolvedValue(undefined);
});

// ─── uploadPhoto ──────────────────────────────────────────────────────────────

describe('uploadPhoto', () => {
  it('returns 400 when no file is attached', async () => {
    const req = { file: null, user: { id: 'u1' } };
    const res = makeRes();
    const next = vi.fn();
    await uploadPhoto(req, res, next);
    expect(next).toHaveBeenCalledOnce();
    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('returns 404 when candidate profile does not exist', async () => {
    candidateFindUniqueMock.mockResolvedValue(null);
    const req = { file: { filename: 'photo.jpg' }, user: { id: 'u1' } };
    const res = makeRes();
    const next = vi.fn();
    await uploadPhoto(req, res, next);
    expect(next.mock.calls[0][0].statusCode).toBe(404);
  });

  it('saves the photo URL and recalculates profile completeness', async () => {
    candidateFindUniqueMock.mockResolvedValue({ id: 'cand-1', photoUrl: null });
    candidateUpdateMock.mockResolvedValue({});

    const req = { file: { filename: 'avatar.jpg' }, user: { id: 'u1' } };
    const res = makeRes();
    await uploadPhoto(req, res, vi.fn());

    expect(candidateUpdateMock).toHaveBeenCalledWith({
      where: { id: 'cand-1' },
      data: { photoUrl: '/uploads/photos/avatar.jpg' },
    });
    expect(calculateProfileCompleteMock).toHaveBeenCalledWith('cand-1');
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: { photoUrl: '/uploads/photos/avatar.jpg' } }),
    );
  });

  it('deletes the previous photo file when one exists', async () => {
    existsSyncMock.mockReturnValue(true);
    candidateFindUniqueMock.mockResolvedValue({ id: 'cand-1', photoUrl: '/uploads/photos/old.jpg' });
    candidateUpdateMock.mockResolvedValue({});

    const req = { file: { filename: 'new.jpg' }, user: { id: 'u1' } };
    await uploadPhoto(req, makeRes(), vi.fn());

    expect(existsSyncMock).toHaveBeenCalledOnce();
    expect(unlinkMock).toHaveBeenCalledOnce();
  });
});

// ─── uploadResume ─────────────────────────────────────────────────────────────

describe('uploadResume', () => {
  it('returns 400 when no file is attached', async () => {
    const req = { file: null, user: { id: 'u1' } };
    const next = vi.fn();
    await uploadResume(req, makeRes(), next);
    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('saves the resume URL', async () => {
    candidateFindUniqueMock.mockResolvedValue({ id: 'cand-1', resumeUrl: null });
    candidateUpdateMock.mockResolvedValue({});

    const req = { file: { filename: 'cv.pdf' }, user: { id: 'u1' } };
    const res = makeRes();
    await uploadResume(req, res, vi.fn());

    expect(candidateUpdateMock).toHaveBeenCalledWith({
      where: { id: 'cand-1' },
      data: { resumeUrl: '/uploads/resumes/cv.pdf' },
    });
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: { resumeUrl: '/uploads/resumes/cv.pdf' } }),
    );
  });
});

// ─── uploadLogo ───────────────────────────────────────────────────────────────

describe('uploadLogo', () => {
  it('returns 400 when no file is attached', async () => {
    const req = { file: null, user: { id: 'u1' } };
    const next = vi.fn();
    await uploadLogo(req, makeRes(), next);
    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('returns 404 when employer profile does not exist', async () => {
    employerFindUniqueMock.mockResolvedValue(null);
    const req = { file: { filename: 'logo.png' }, user: { id: 'u1' } };
    const next = vi.fn();
    await uploadLogo(req, makeRes(), next);
    expect(next.mock.calls[0][0].statusCode).toBe(404);
  });

  it('saves the logo URL', async () => {
    employerFindUniqueMock.mockResolvedValue({ id: 'emp-1', logoUrl: null });
    employerUpdateMock.mockResolvedValue({});

    const req = { file: { filename: 'brand.png' }, user: { id: 'u1' } };
    const res = makeRes();
    await uploadLogo(req, res, vi.fn());

    expect(employerUpdateMock).toHaveBeenCalledWith({
      where: { id: 'emp-1' },
      data: { logoUrl: '/uploads/logos/brand.png' },
    });
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: { logoUrl: '/uploads/logos/brand.png' } }),
    );
  });
});
