import db from '../config/database.js';
import { catchAsync, AppError } from '../middleware/errorHandler.middleware.js';
import { calculateProfileComplete } from '../services/profileComplete.service.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.util.js';
import xss from 'xss';

export const getProfile = catchAsync(async (req, res) => {
  const candidate = await db.candidate.findUnique({
    where: { userId: req.user.id },
    include: { educations: { orderBy: { startYear: 'desc' } }, experiences: { orderBy: { startDate: 'desc' } }, skills: { include: { skill: true } } },
  });
  if (!candidate) throw new AppError('Profile not found', 404);
  res.json({ success: true, message: 'Profile fetched', data: candidate });
});

export const updateProfile = catchAsync(async (req, res) => {
  const candidate = await db.candidate.findUnique({ where: { userId: req.user.id } });
  if (!candidate) throw new AppError('Profile not found', 404);
  const fields = ['firstName','lastName','gender','dob','mobile','email','addressLine1','city','state','pincode','portfolioUrl','linkedinUrl','githubUrl','bio','isFresher','totalExperienceYrs','openToWork'];
  const data = {};
  for (const f of fields) {
    if (req.body[f] !== undefined) data[f] = typeof req.body[f] === 'string' ? xss(req.body[f]) : req.body[f];
  }
  if ('dob' in data) {
    if (data.dob) data.dob = new Date(data.dob);
    else delete data.dob;
  }
  const updated = await db.candidate.update({ where: { id: candidate.id }, data });
  const profileComplete = await calculateProfileComplete(candidate.id);
  res.json({ success: true, message: 'Profile updated', data: { ...updated, profileComplete } });
});

export const updateProfileStep = catchAsync(async (req, res) => {
  const candidate = await db.candidate.findUnique({ where: { userId: req.user.id } });
  if (!candidate) throw new AppError('Profile not found', 404);
  let data = {};
  switch (parseInt(req.params.stepNumber)) {
    case 1: data = { firstName: xss(req.body.firstName||''), lastName: xss(req.body.lastName||''), gender: req.body.gender, dob: req.body.dob ? new Date(req.body.dob) : undefined, mobile: req.body.mobile, addressLine1: xss(req.body.addressLine1||''), city: xss(req.body.city||''), state: xss(req.body.state||''), pincode: req.body.pincode }; break;
    case 3: data = { isFresher: req.body.isFresher, totalExperienceYrs: req.body.totalExperienceYrs }; break;
    case 4: data = { preferredRoles: req.body.preferredRoles, preferredIndustries: req.body.preferredIndustries, preferredCities: req.body.preferredCities, preferredEmpType: req.body.preferredEmpType, expectedSalaryMin: req.body.expectedSalaryMin, expectedSalaryMax: req.body.expectedSalaryMax }; break;
    case 5: data = { portfolioUrl: req.body.portfolioUrl, linkedinUrl: req.body.linkedinUrl, githubUrl: req.body.githubUrl }; break;
    default: throw new AppError('Invalid step number', 400);
  }
  await db.candidate.update({ where: { id: candidate.id }, data });
  const profileComplete = await calculateProfileComplete(candidate.id);
  res.json({ success: true, message: `Step ${req.params.stepNumber} saved`, data: { profileComplete } });
});

export const getProfileCompleteness = catchAsync(async (req, res) => {
  const candidate = await db.candidate.findUnique({ where: { userId: req.user.id } });
  if (!candidate) throw new AppError('Profile not found', 404);
  const score = await calculateProfileComplete(candidate.id);
  res.json({ success: true, message: 'Completeness', data: { score } });
});

export const addEducation = catchAsync(async (req, res) => {
  const candidate = await db.candidate.findUnique({ where: { userId: req.user.id } });
  if (!candidate) throw new AppError('Profile not found', 404);
  const edu = await db.education.create({ data: { candidateId: candidate.id, degree: xss(req.body.degree), fieldOfStudy: req.body.fieldOfStudy ? xss(req.body.fieldOfStudy) : null, institution: xss(req.body.institution), board: req.body.board ? xss(req.body.board) : null, percentage: req.body.percentage, startYear: parseInt(req.body.startYear), endYear: req.body.endYear ? parseInt(req.body.endYear) : null, isCurrently: req.body.isCurrently || false } });
  await calculateProfileComplete(candidate.id);
  res.status(201).json({ success: true, message: 'Education added', data: edu });
});

export const updateEducation = catchAsync(async (req, res) => {
  const candidate = await db.candidate.findUnique({ where: { userId: req.user.id } });
  const edu = await db.education.findFirst({ where: { id: req.params.id, candidateId: candidate.id } });
  if (!edu) throw new AppError('Education not found', 404);
  const updated = await db.education.update({ where: { id: req.params.id }, data: { degree: req.body.degree ? xss(req.body.degree) : undefined, institution: req.body.institution ? xss(req.body.institution) : undefined, startYear: req.body.startYear ? parseInt(req.body.startYear) : undefined, endYear: req.body.endYear ? parseInt(req.body.endYear) : null, isCurrently: req.body.isCurrently } });
  res.json({ success: true, message: 'Education updated', data: updated });
});

export const deleteEducation = catchAsync(async (req, res) => {
  const candidate = await db.candidate.findUnique({ where: { userId: req.user.id } });
  const edu = await db.education.findFirst({ where: { id: req.params.id, candidateId: candidate.id } });
  if (!edu) throw new AppError('Education not found', 404);
  await db.education.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Education deleted' });
});

export const addExperience = catchAsync(async (req, res) => {
  const candidate = await db.candidate.findUnique({ where: { userId: req.user.id } });
  if (!candidate) throw new AppError('Profile not found', 404);
  const exp = await db.experience.create({ data: { candidateId: candidate.id, jobTitle: xss(req.body.jobTitle), companyName: xss(req.body.companyName), city: req.body.city ? xss(req.body.city) : null, employmentType: req.body.employmentType, startDate: new Date(req.body.startDate), endDate: req.body.endDate ? new Date(req.body.endDate) : null, isCurrent: req.body.isCurrent || false, description: req.body.description ? xss(req.body.description) : null } });
  await calculateProfileComplete(candidate.id);
  res.status(201).json({ success: true, message: 'Experience added', data: exp });
});

export const updateExperience = catchAsync(async (req, res) => {
  const candidate = await db.candidate.findUnique({ where: { userId: req.user.id } });
  const exp = await db.experience.findFirst({ where: { id: req.params.id, candidateId: candidate.id } });
  if (!exp) throw new AppError('Experience not found', 404);
  const updated = await db.experience.update({ where: { id: req.params.id }, data: { jobTitle: req.body.jobTitle ? xss(req.body.jobTitle) : undefined, companyName: req.body.companyName ? xss(req.body.companyName) : undefined, startDate: req.body.startDate ? new Date(req.body.startDate) : undefined, endDate: req.body.endDate ? new Date(req.body.endDate) : null, isCurrent: req.body.isCurrent } });
  res.json({ success: true, message: 'Experience updated', data: updated });
});

export const deleteExperience = catchAsync(async (req, res) => {
  const candidate = await db.candidate.findUnique({ where: { userId: req.user.id } });
  const exp = await db.experience.findFirst({ where: { id: req.params.id, candidateId: candidate.id } });
  if (!exp) throw new AppError('Experience not found', 404);
  await db.experience.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Experience deleted' });
});

export const updateSkills = catchAsync(async (req, res) => {
  const candidate = await db.candidate.findUnique({ where: { userId: req.user.id } });
  if (!candidate) throw new AppError('Profile not found', 404);
  const { skillIds } = req.body;
  if (!Array.isArray(skillIds)) throw new AppError('skillIds must be an array', 400);
  await db.candidateSkill.deleteMany({ where: { candidateId: candidate.id } });
  if (skillIds.length > 0) await db.candidateSkill.createMany({ data: skillIds.map((skillId) => ({ candidateId: candidate.id, skillId })), skipDuplicates: true });
  await calculateProfileComplete(candidate.id);
  res.json({ success: true, message: 'Skills updated' });
});

export const updatePreferences = catchAsync(async (req, res) => {
  const candidate = await db.candidate.findUnique({ where: { userId: req.user.id } });
  if (!candidate) throw new AppError('Profile not found', 404);
  const updated = await db.candidate.update({ where: { id: candidate.id }, data: { preferredRoles: req.body.preferredRoles, preferredIndustries: req.body.preferredIndustries, preferredCities: req.body.preferredCities, preferredEmpType: req.body.preferredEmpType, expectedSalaryMin: req.body.expectedSalaryMin, expectedSalaryMax: req.body.expectedSalaryMax } });
  res.json({ success: true, message: 'Preferences updated', data: updated });
});

export const getApplications = catchAsync(async (req, res) => {
  const candidate = await db.candidate.findUnique({ where: { userId: req.user.id } });
  if (!candidate) throw new AppError('Profile not found', 404);
  const { page, limit, skip } = parsePagination(req.query);
  const [applications, total] = await Promise.all([
    db.application.findMany({ where: { candidateId: candidate.id }, include: { job: { include: { employer: { select: { companyName: true, logoUrl: true, city: true } } } } }, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    db.application.count({ where: { candidateId: candidate.id } }),
  ]);
  res.json({ success: true, message: 'Applications fetched', data: applications, pagination: buildPaginationMeta(page, limit, total) });
});

export const getSavedJobs = catchAsync(async (req, res) => {
  const candidate = await db.candidate.findUnique({ where: { userId: req.user.id } });
  if (!candidate) throw new AppError('Profile not found', 404);
  const { page, limit, skip } = parsePagination(req.query);
  const [saved, total] = await Promise.all([
    db.savedJob.findMany({ where: { candidateId: candidate.id }, include: { job: { include: { employer: { select: { companyName: true, logoUrl: true, city: true } }, skills: { include: { skill: true } } } } }, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    db.savedJob.count({ where: { candidateId: candidate.id } }),
  ]);
  res.json({ success: true, message: 'Saved jobs fetched', data: saved, pagination: buildPaginationMeta(page, limit, total) });
});

export const toggleOpenToWork = catchAsync(async (req, res) => {
  const candidate = await db.candidate.findUnique({ where: { userId: req.user.id } });
  if (!candidate) throw new AppError('Profile not found', 404);
  const updated = await db.candidate.update({ where: { id: candidate.id }, data: { openToWork: !candidate.openToWork } });
  res.json({ success: true, message: `Open to work: ${updated.openToWork}`, data: { openToWork: updated.openToWork } });
});

export const createAlert = catchAsync(async (req, res) => {
  const candidate = await db.candidate.findUnique({ where: { userId: req.user.id } });
  if (!candidate) throw new AppError('Profile not found', 404);
  const alert = await db.emailAlert.create({ data: { candidateId: candidate.id, keywords: req.body.keywords, city: req.body.city, jobType: req.body.jobType, isActive: true } });
  res.status(201).json({ success: true, message: 'Alert created', data: alert });
});

export const getAlerts = catchAsync(async (req, res) => {
  const candidate = await db.candidate.findUnique({ where: { userId: req.user.id } });
  if (!candidate) throw new AppError('Profile not found', 404);
  const alerts = await db.emailAlert.findMany({ where: { candidateId: candidate.id } });
  res.json({ success: true, message: 'Alerts fetched', data: alerts });
});

export const updateAlert = catchAsync(async (req, res) => {
  const candidate = await db.candidate.findUnique({ where: { userId: req.user.id } });
  const alert = await db.emailAlert.findFirst({ where: { id: req.params.id, candidateId: candidate.id } });
  if (!alert) throw new AppError('Alert not found', 404);
  const updated = await db.emailAlert.update({ where: { id: req.params.id }, data: { keywords: req.body.keywords, city: req.body.city, jobType: req.body.jobType, isActive: req.body.isActive } });
  res.json({ success: true, message: 'Alert updated', data: updated });
});

export const deleteAlert = catchAsync(async (req, res) => {
  const candidate = await db.candidate.findUnique({ where: { userId: req.user.id } });
  const alert = await db.emailAlert.findFirst({ where: { id: req.params.id, candidateId: candidate.id } });
  if (!alert) throw new AppError('Alert not found', 404);
  await db.emailAlert.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Alert deleted' });
});
