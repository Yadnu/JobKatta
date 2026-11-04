import { beforeEach, describe, expect, it, vi } from 'vitest';

const candidateFindUniqueMock = vi.fn();
const candidateUpdateMock = vi.fn();
const educationCreateMock = vi.fn();
const educationFindFirstMock = vi.fn();
const educationUpdateMock = vi.fn();
const educationDeleteMock = vi.fn();
const experienceCreateMock = vi.fn();
const experienceFindFirstMock = vi.fn();
const experienceUpdateMock = vi.fn();
const experienceDeleteMock = vi.fn();
const candidateSkillDeleteManyMock = vi.fn();
const candidateSkillCreateManyMock = vi.fn();
const applicationFindManyMock = vi.fn();
const applicationCountMock = vi.fn();
const savedJobFindManyMock = vi.fn();
const savedJobCountMock = vi.fn();
const emailAlertCreateMock = vi.fn();
const emailAlertFindManyMock = vi.fn();
const emailAlertFindFirstMock = vi.fn();
const emailAlertUpdateMock = vi.fn();
const emailAlertDeleteMock = vi.fn();

vi.mock('../config/database.js', () => ({
  default: {
    candidate: { findUnique: candidateFindUniqueMock, update: candidateUpdateMock },
    education: {
      create: educationCreateMock,
      findFirst: educationFindFirstMock,
      update: educationUpdateMock,
      delete: educationDeleteMock,
    },
    experience: {
      create: experienceCreateMock,
      findFirst: experienceFindFirstMock,
      update: experienceUpdateMock,
      delete: experienceDeleteMock,
    },
    candidateSkill: {
      deleteMany: candidateSkillDeleteManyMock,
      createMany: candidateSkillCreateManyMock,
    },
    application: { findMany: applicationFindManyMock, count: applicationCountMock },
    savedJob: { findMany: savedJobFindManyMock, count: savedJobCountMock },
    emailAlert: {
      create: emailAlertCreateMock,
      findMany: emailAlertFindManyMock,
      findFirst: emailAlertFindFirstMock,
      update: emailAlertUpdateMock,
      delete: emailAlertDeleteMock,
    },
  },
}));

const calculateProfileCompleteMock = vi.fn();
vi.mock('../services/profileComplete.service.js', () => ({
  calculateProfileComplete: calculateProfileCompleteMock,
}));

vi.mock('xss', () => ({ default: (s) => `safe:${s}` }));

const {
  getProfile,
  updateProfile,
  updateProfileStep,
  getProfileCompleteness,
  addEducation,
  updateEducation,
  deleteEducation,
  addExperience,
  updateExperience,
  deleteExperience,
  updateSkills,
  updatePreferences,
  getApplications,
  getSavedJobs,
  toggleOpenToWork,
  createAlert,
  getAlerts,
  updateAlert,
  deleteAlert,
} = await import('./candidate.controller.js');

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
  calculateProfileCompleteMock.mockResolvedValue(80);
  candidateUpdateMock.mockResolvedValue({ id: 'cand-1' });
  candidateSkillDeleteManyMock.mockResolvedValue({ count: 1 });
  candidateSkillCreateManyMock.mockResolvedValue({ count: 1 });
  educationDeleteMock.mockResolvedValue({});
  experienceDeleteMock.mockResolvedValue({});
  emailAlertDeleteMock.mockResolvedValue({});
});

describe('getProfile', () => {
  it('returns 404 when the candidate profile is missing', async () => {
    candidateFindUniqueMock.mockResolvedValue(null);
    const next = vi.fn();
    await getProfile(userReq(), makeRes(), next);
    expectStatus(next, 404);
  });

  it('returns the profile with education, experience, and skills', async () => {
    const candidate = { id: 'cand-1' };
    candidateFindUniqueMock.mockResolvedValue(candidate);
    const res = makeRes();
    await getProfile(userReq(), res, vi.fn());

    expect(candidateFindUniqueMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' } }),
    );
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Profile fetched', data: candidate });
  });
});

describe('updateProfile', () => {
  it('returns 404 when the profile is missing', async () => {
    candidateFindUniqueMock.mockResolvedValue(null);
    const next = vi.fn();
    await updateProfile(userReq(), makeRes(), next);
    expectStatus(next, 404);
  });

  it('sanitises strings, parses dob, and recalculates completeness', async () => {
    candidateFindUniqueMock.mockResolvedValue({ id: 'cand-1' });
    candidateUpdateMock.mockResolvedValue({ id: 'cand-1', firstName: 'safe:Ada' });
    const res = makeRes();
    await updateProfile(
      userReq({ body: { firstName: 'Ada', openToWork: true, dob: '1990-01-02', ignored: 'nope' } }),
      res,
      vi.fn(),
    );

    expect(candidateUpdateMock).toHaveBeenCalledWith({
      where: { id: 'cand-1' },
      data: { firstName: 'safe:Ada', openToWork: true, dob: new Date('safe:1990-01-02') },
    });
    expect(calculateProfileCompleteMock).toHaveBeenCalledWith('cand-1');
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ profileComplete: 80 }) }),
    );
  });

  it('drops a null dob instead of writing it', async () => {
    candidateFindUniqueMock.mockResolvedValue({ id: 'cand-1' });
    await updateProfile(userReq({ body: { dob: null } }), makeRes(), vi.fn());
    expect(candidateUpdateMock).toHaveBeenCalledWith({ where: { id: 'cand-1' }, data: {} });
  });
});

describe('updateProfileStep', () => {
  it('returns 404 when the profile is missing', async () => {
    candidateFindUniqueMock.mockResolvedValue(null);
    const next = vi.fn();
    await updateProfileStep(userReq({ params: { stepNumber: '1' } }), makeRes(), next);
    expectStatus(next, 404);
  });

  it('returns 400 for an unknown step', async () => {
    candidateFindUniqueMock.mockResolvedValue({ id: 'cand-1' });
    const next = vi.fn();
    await updateProfileStep(userReq({ params: { stepNumber: '9' } }), makeRes(), next);
    expectStatus(next, 400);
    expect(candidateUpdateMock).not.toHaveBeenCalled();
  });

  it('saves step 1 personal details', async () => {
    candidateFindUniqueMock.mockResolvedValue({ id: 'cand-1' });
    const res = makeRes();
    await updateProfileStep(
      userReq({
        params: { stepNumber: '1' },
        body: { firstName: 'Ada', lastName: 'L', city: 'Pune', state: 'MH', dob: '1990-01-02', gender: 'F' },
      }),
      res,
      vi.fn(),
    );
    expect(candidateUpdateMock).toHaveBeenCalledWith({
      where: { id: 'cand-1' },
      data: expect.objectContaining({
        firstName: 'safe:Ada',
        lastName: 'safe:L',
        city: 'safe:Pune',
        state: 'safe:MH',
        dob: new Date('1990-01-02'),
        gender: 'F',
      }),
    });
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Step 1 saved', data: { profileComplete: 80 } }),
    );
  });

  it('saves steps 3, 4, and 5', async () => {
    candidateFindUniqueMock.mockResolvedValue({ id: 'cand-1' });
    await updateProfileStep(userReq({ params: { stepNumber: '3' }, body: { isFresher: false, totalExperienceYrs: 4 } }), makeRes(), vi.fn());
    await updateProfileStep(userReq({ params: { stepNumber: '4' }, body: { preferredRoles: ['Eng'], expectedSalaryMin: 10 } }), makeRes(), vi.fn());
    await updateProfileStep(userReq({ params: { stepNumber: '5' }, body: { githubUrl: 'https://github.com/ada' } }), makeRes(), vi.fn());

    expect(candidateUpdateMock).toHaveBeenNthCalledWith(1, {
      where: { id: 'cand-1' },
      data: { isFresher: false, totalExperienceYrs: 4 },
    });
    expect(candidateUpdateMock).toHaveBeenNthCalledWith(2, {
      where: { id: 'cand-1' },
      data: expect.objectContaining({ preferredRoles: ['Eng'], expectedSalaryMin: 10 }),
    });
    expect(candidateUpdateMock).toHaveBeenNthCalledWith(3, {
      where: { id: 'cand-1' },
      data: expect.objectContaining({ githubUrl: 'https://github.com/ada' }),
    });
  });
});

describe('getProfileCompleteness', () => {
  it('returns 404 when the profile is missing', async () => {
    candidateFindUniqueMock.mockResolvedValue(null);
    const next = vi.fn();
    await getProfileCompleteness(userReq(), makeRes(), next);
    expectStatus(next, 404);
  });

  it('returns the calculated score', async () => {
    candidateFindUniqueMock.mockResolvedValue({ id: 'cand-1' });
    const res = makeRes();
    await getProfileCompleteness(userReq(), res, vi.fn());
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Completeness', data: { score: 80 } });
  });
});

describe('education', () => {
  it('returns 404 when adding education without a profile', async () => {
    candidateFindUniqueMock.mockResolvedValue(null);
    const next = vi.fn();
    await addEducation(userReq(), makeRes(), next);
    expectStatus(next, 404);
  });

  it('creates an education record and recalculates completeness', async () => {
    candidateFindUniqueMock.mockResolvedValue({ id: 'cand-1' });
    educationCreateMock.mockResolvedValue({ id: 'edu-1' });
    const res = makeRes();
    await addEducation(
      userReq({ body: { degree: 'BSc', institution: 'Uni', startYear: '2010', endYear: '2014', fieldOfStudy: 'CS' } }),
      res,
      vi.fn(),
    );
    expect(educationCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        candidateId: 'cand-1',
        degree: 'safe:BSc',
        institution: 'safe:Uni',
        fieldOfStudy: 'safe:CS',
        startYear: 2010,
        endYear: 2014,
        isCurrently: false,
      }),
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('returns 404 when updating an education row the candidate does not own', async () => {
    candidateFindUniqueMock.mockResolvedValue({ id: 'cand-1' });
    educationFindFirstMock.mockResolvedValue(null);
    const next = vi.fn();
    await updateEducation(userReq({ params: { id: 'edu-x' } }), makeRes(), next);
    expectStatus(next, 404);
  });

  it('updates an owned education row', async () => {
    candidateFindUniqueMock.mockResolvedValue({ id: 'cand-1' });
    educationFindFirstMock.mockResolvedValue({ id: 'edu-1' });
    educationUpdateMock.mockResolvedValue({ id: 'edu-1' });
    const res = makeRes();
    await updateEducation(userReq({ params: { id: 'edu-1' }, body: { degree: 'MSc', startYear: '2015' } }), res, vi.fn());
    expect(educationUpdateMock).toHaveBeenCalledWith({
      where: { id: 'edu-1' },
      data: expect.objectContaining({ degree: 'safe:MSc', startYear: 2015, endYear: null }),
    });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Education updated' }));
  });

  it('deletes an owned education row and 404s otherwise', async () => {
    candidateFindUniqueMock.mockResolvedValue({ id: 'cand-1' });
    educationFindFirstMock.mockResolvedValueOnce(null);
    const next = vi.fn();
    await deleteEducation(userReq({ params: { id: 'edu-x' } }), makeRes(), next);
    expectStatus(next, 404);

    educationFindFirstMock.mockResolvedValueOnce({ id: 'edu-1' });
    const res = makeRes();
    await deleteEducation(userReq({ params: { id: 'edu-1' } }), res, vi.fn());
    expect(educationDeleteMock).toHaveBeenCalledWith({ where: { id: 'edu-1' } });
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Education deleted' });
  });
});

describe('experience', () => {
  it('returns 404 when adding experience without a profile', async () => {
    candidateFindUniqueMock.mockResolvedValue(null);
    const next = vi.fn();
    await addExperience(userReq(), makeRes(), next);
    expectStatus(next, 404);
  });

  it('creates an experience record', async () => {
    candidateFindUniqueMock.mockResolvedValue({ id: 'cand-1' });
    experienceCreateMock.mockResolvedValue({ id: 'exp-1' });
    const res = makeRes();
    await addExperience(
      userReq({ body: { jobTitle: 'Dev', companyName: 'Acme', startDate: '2020-01-01', city: 'Pune', isCurrent: true } }),
      res,
      vi.fn(),
    );
    expect(experienceCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        candidateId: 'cand-1',
        jobTitle: 'safe:Dev',
        companyName: 'safe:Acme',
        city: 'safe:Pune',
        startDate: new Date('2020-01-01'),
        endDate: null,
        isCurrent: true,
      }),
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('returns 404 when the experience row is not owned', async () => {
    candidateFindUniqueMock.mockResolvedValue({ id: 'cand-1' });
    experienceFindFirstMock.mockResolvedValue(null);
    const next = vi.fn();
    await updateExperience(userReq({ params: { id: 'exp-x' } }), makeRes(), next);
    expectStatus(next, 404);
  });

  it('updates and deletes an owned experience row', async () => {
    candidateFindUniqueMock.mockResolvedValue({ id: 'cand-1' });
    experienceFindFirstMock.mockResolvedValue({ id: 'exp-1' });
    experienceUpdateMock.mockResolvedValue({ id: 'exp-1' });

    await updateExperience(userReq({ params: { id: 'exp-1' }, body: { jobTitle: 'Lead', endDate: '2024-01-01' } }), makeRes(), vi.fn());
    expect(experienceUpdateMock).toHaveBeenCalledWith({
      where: { id: 'exp-1' },
      data: expect.objectContaining({ jobTitle: 'safe:Lead', endDate: new Date('2024-01-01') }),
    });

    const res = makeRes();
    await deleteExperience(userReq({ params: { id: 'exp-1' } }), res, vi.fn());
    expect(experienceDeleteMock).toHaveBeenCalledWith({ where: { id: 'exp-1' } });
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Experience deleted' });
  });
});

describe('updateSkills', () => {
  it('returns 404 when the profile is missing', async () => {
    candidateFindUniqueMock.mockResolvedValue(null);
    const next = vi.fn();
    await updateSkills(userReq({ body: { skillIds: [] } }), makeRes(), next);
    expectStatus(next, 404);
  });

  it('returns 400 when skillIds is not an array', async () => {
    candidateFindUniqueMock.mockResolvedValue({ id: 'cand-1' });
    const next = vi.fn();
    await updateSkills(userReq({ body: { skillIds: 'js' } }), makeRes(), next);
    expectStatus(next, 400);
  });

  it('replaces skills and skips createMany when the list is empty', async () => {
    candidateFindUniqueMock.mockResolvedValue({ id: 'cand-1' });
    await updateSkills(userReq({ body: { skillIds: ['s1', 's2'] } }), makeRes(), vi.fn());
    expect(candidateSkillDeleteManyMock).toHaveBeenCalledWith({ where: { candidateId: 'cand-1' } });
    expect(candidateSkillCreateManyMock).toHaveBeenCalledWith({
      data: [
        { candidateId: 'cand-1', skillId: 's1' },
        { candidateId: 'cand-1', skillId: 's2' },
      ],
      skipDuplicates: true,
    });

    candidateSkillCreateManyMock.mockClear();
    await updateSkills(userReq({ body: { skillIds: [] } }), makeRes(), vi.fn());
    expect(candidateSkillCreateManyMock).not.toHaveBeenCalled();
  });
});

describe('updatePreferences', () => {
  it('returns 404 when the profile is missing', async () => {
    candidateFindUniqueMock.mockResolvedValue(null);
    const next = vi.fn();
    await updatePreferences(userReq(), makeRes(), next);
    expectStatus(next, 404);
  });

  it('writes preference fields', async () => {
    candidateFindUniqueMock.mockResolvedValue({ id: 'cand-1' });
    candidateUpdateMock.mockResolvedValue({ id: 'cand-1', preferredCities: ['Pune'] });
    const res = makeRes();
    await updatePreferences(userReq({ body: { preferredCities: ['Pune'], expectedSalaryMax: 20 } }), res, vi.fn());
    expect(candidateUpdateMock).toHaveBeenCalledWith({
      where: { id: 'cand-1' },
      data: expect.objectContaining({ preferredCities: ['Pune'], expectedSalaryMax: 20 }),
    });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Preferences updated' }));
  });
});

describe('getApplications and getSavedJobs', () => {
  it('returns 404 when listing applications without a profile', async () => {
    candidateFindUniqueMock.mockResolvedValue(null);
    const next = vi.fn();
    await getApplications(userReq(), makeRes(), next);
    expectStatus(next, 404);
  });

  it('returns paginated applications and saved jobs', async () => {
    candidateFindUniqueMock.mockResolvedValue({ id: 'cand-1' });
    applicationFindManyMock.mockResolvedValue([{ id: 'app-1' }]);
    applicationCountMock.mockResolvedValue(1);
    savedJobFindManyMock.mockResolvedValue([{ id: 'save-1' }]);
    savedJobCountMock.mockResolvedValue(1);

    const apps = makeRes();
    await getApplications(userReq({ query: { page: '1', limit: '10' } }), apps, vi.fn());
    expect(applicationFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { candidateId: 'cand-1' }, skip: 0, take: 10 }),
    );
    expect(apps.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: [{ id: 'app-1' }], pagination: { page: 1, limit: 10, total: 1, pages: 1 } }),
    );

    const saved = makeRes();
    await getSavedJobs(userReq({ query: {} }), saved, vi.fn());
    expect(savedJobFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { candidateId: 'cand-1' } }),
    );
    expect(saved.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Saved jobs fetched' }));
  });
});

describe('toggleOpenToWork', () => {
  it('returns 404 when the profile is missing', async () => {
    candidateFindUniqueMock.mockResolvedValue(null);
    const next = vi.fn();
    await toggleOpenToWork(userReq(), makeRes(), next);
    expectStatus(next, 404);
  });

  it('flips the current openToWork flag', async () => {
    candidateFindUniqueMock.mockResolvedValue({ id: 'cand-1', openToWork: false });
    candidateUpdateMock.mockResolvedValue({ openToWork: true });
    const res = makeRes();
    await toggleOpenToWork(userReq(), res, vi.fn());
    expect(candidateUpdateMock).toHaveBeenCalledWith({ where: { id: 'cand-1' }, data: { openToWork: true } });
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: { openToWork: true } }),
    );
  });
});

describe('email alerts', () => {
  it('returns 404 when creating an alert without a profile', async () => {
    candidateFindUniqueMock.mockResolvedValue(null);
    const next = vi.fn();
    await createAlert(userReq(), makeRes(), next);
    expectStatus(next, 404);
  });

  it('creates an active alert', async () => {
    candidateFindUniqueMock.mockResolvedValue({ id: 'cand-1' });
    emailAlertCreateMock.mockResolvedValue({ id: 'alert-1' });
    const res = makeRes();
    await createAlert(userReq({ body: { keywords: 'react', city: 'Pune', jobType: 'FULL_TIME' } }), res, vi.fn());
    expect(emailAlertCreateMock).toHaveBeenCalledWith({
      data: { candidateId: 'cand-1', keywords: 'react', city: 'Pune', jobType: 'FULL_TIME', isActive: true },
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('lists alerts for the candidate', async () => {
    candidateFindUniqueMock.mockResolvedValue({ id: 'cand-1' });
    emailAlertFindManyMock.mockResolvedValue([{ id: 'alert-1' }]);
    const res = makeRes();
    await getAlerts(userReq(), res, vi.fn());
    expect(emailAlertFindManyMock).toHaveBeenCalledWith({ where: { candidateId: 'cand-1' } });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: [{ id: 'alert-1' }] }));
  });

  it('returns 404 when updating an alert the candidate does not own', async () => {
    candidateFindUniqueMock.mockResolvedValue({ id: 'cand-1' });
    emailAlertFindFirstMock.mockResolvedValue(null);
    const next = vi.fn();
    await updateAlert(userReq({ params: { id: 'alert-x' } }), makeRes(), next);
    expectStatus(next, 404);
  });

  it('updates and deletes an owned alert', async () => {
    candidateFindUniqueMock.mockResolvedValue({ id: 'cand-1' });
    emailAlertFindFirstMock.mockResolvedValue({ id: 'alert-1' });
    emailAlertUpdateMock.mockResolvedValue({ id: 'alert-1', isActive: false });

    const res = makeRes();
    await updateAlert(userReq({ params: { id: 'alert-1' }, body: { isActive: false, keywords: 'node' } }), res, vi.fn());
    expect(emailAlertUpdateMock).toHaveBeenCalledWith({
      where: { id: 'alert-1' },
      data: expect.objectContaining({ isActive: false, keywords: 'node' }),
    });

    await deleteAlert(userReq({ params: { id: 'alert-1' } }), makeRes(), vi.fn());
    expect(emailAlertDeleteMock).toHaveBeenCalledWith({ where: { id: 'alert-1' } });
  });
});
