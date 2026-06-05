import db from '../config/database.js';
import { catchAsync, AppError } from '../middleware/errorHandler.middleware.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.util.js';
import { checkCandidateAppLimit } from '../services/subscription.service.js';
import { sendApplicationSubmittedEmail } from '../services/email.service.js';

export const listJobs = catchAsync(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { keyword, city, category, type, salaryMin, salaryMax } = req.query;
  const where = { status: 'ACTIVE' };
  if (keyword) where.OR = [{ title: { contains: keyword } }, { description: { contains: keyword } }, { category: { contains: keyword } }];
  if (city) where.city = { contains: city };
  if (category) where.category = category;
  if (type) where.employmentType = type;
  if (salaryMin) where.salaryMax = { gte: parseInt(salaryMin) };
  if (salaryMax) where.salaryMin = { lte: parseInt(salaryMax) };

  const [jobs, total] = await Promise.all([
    db.job.findMany({ where, include: { employer: { select: { companyName: true, logoUrl: true, city: true, industry: true } }, skills: { include: { skill: true } } }, orderBy: [{ isPriority: 'desc' }, { isFeatured: 'desc' }, { createdAt: 'desc' }], skip, take: limit }),
    db.job.count({ where }),
  ]);
  res.json({ success: true, message: 'Jobs fetched', data: jobs, pagination: buildPaginationMeta(page, limit, total) });
});

export const getJob = catchAsync(async (req, res) => {
  const job = await db.job.findFirst({
    where: { id: req.params.id, status: 'ACTIVE' },
    include: { employer: { select: { companyName: true, logoUrl: true, city: true, state: true, industry: true, companySize: true, website: true, description: true } }, skills: { include: { skill: true } } },
  });
  if (!job) throw new AppError('Job not found', 404);
  await db.job.update({ where: { id: job.id }, data: { viewCount: { increment: 1 } } });
  if (req.user) {
    const candidate = await db.candidate.findUnique({ where: { userId: req.user.id } });
    if (candidate) {
      await db.recentlyViewedJob.upsert({ where: { candidateId_jobId: { candidateId: candidate.id, jobId: job.id } }, update: { viewedAt: new Date() }, create: { candidateId: candidate.id, jobId: job.id } });
    }
  }
  res.json({ success: true, message: 'Job fetched', data: job });
});

export const getFeaturedJobs = catchAsync(async (req, res) => {
  const jobs = await db.job.findMany({ where: { status: 'ACTIVE', isFeatured: true }, include: { employer: { select: { companyName: true, logoUrl: true, city: true } } }, orderBy: { createdAt: 'desc' }, take: 6 });
  res.json({ success: true, message: 'Featured jobs', data: jobs });
});

export const toggleSaveJob = catchAsync(async (req, res) => {
  const candidate = await db.candidate.findUnique({ where: { userId: req.user.id } });
  if (!candidate) throw new AppError('Candidate profile not found', 404);
  const job = await db.job.findUnique({ where: { id: req.params.id } });
  if (!job) throw new AppError('Job not found', 404);
  const existing = await db.savedJob.findUnique({ where: { candidateId_jobId: { candidateId: candidate.id, jobId: job.id } } });
  if (existing) {
    await db.savedJob.delete({ where: { candidateId_jobId: { candidateId: candidate.id, jobId: job.id } } });
    return res.json({ success: true, message: 'Job unsaved', data: { saved: false } });
  }
  await db.savedJob.create({ data: { candidateId: candidate.id, jobId: job.id } });
  res.json({ success: true, message: 'Job saved', data: { saved: true } });
});

export const applyToJob = catchAsync(async (req, res) => {
  const candidate = await db.candidate.findUnique({ where: { userId: req.user.id }, include: { user: { select: { email: true } } } });
  if (!candidate) throw new AppError('Candidate profile not found', 404);
  if (candidate.profileComplete < 50) throw new AppError('Complete at least 50% of your profile before applying', 400);
  const job = await db.job.findFirst({ where: { id: req.params.id, status: 'ACTIVE' } });
  if (!job) throw new AppError('Job not found or no longer accepting applications', 404);
  const existing = await db.application.findUnique({ where: { candidateId_jobId: { candidateId: candidate.id, jobId: job.id } } });
  if (existing) throw new AppError('You have already applied to this job', 409);
  const limitCheck = await checkCandidateAppLimit(candidate.id);
  if (!limitCheck.allowed) throw new AppError(limitCheck.reason, 403);
  const application = await db.application.create({ data: { candidateId: candidate.id, jobId: job.id, coverNote: req.body.coverNote, resumeUrl: candidate.resumeUrl, status: 'APPLIED' } });
  await db.job.update({ where: { id: job.id }, data: { applicationCount: { increment: 1 } } });
  await db.candidate.update({ where: { id: candidate.id }, data: { appCountThisMonth: { increment: 1 } } });
  if (candidate.user?.email) await sendApplicationSubmittedEmail(candidate.user.email, { name: `${candidate.firstName} ${candidate.lastName}`, jobTitle: job.title }).catch(() => {});
  res.status(201).json({ success: true, message: 'Application submitted', data: application });
});
