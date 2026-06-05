import db from '../config/database.js';
import { catchAsync, AppError } from '../middleware/errorHandler.middleware.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.util.js';
import { checkEmployerJobLimit } from '../services/subscription.service.js';
import xss from 'xss';

export const getProfile = catchAsync(async (req, res) => {
  const employer = await db.employer.findUnique({ where: { userId: req.user.id } });
  if (!employer) throw new AppError('Employer profile not found', 404);
  res.json({ success: true, message: 'Profile fetched', data: employer });
});

export const updateProfile = catchAsync(async (req, res) => {
  const employer = await db.employer.findUnique({ where: { userId: req.user.id } });
  if (!employer) throw new AppError('Employer profile not found', 404);

  const allowedFields = [
    'companyName', 'companyEmail', 'contactNumber', 'website', 'industry',
    'companySize', 'foundedYear', 'description', 'addressLine1', 'city', 'state',
    'pincode', 'gstNumber', 'cinNumber', 'hrName', 'hrDesignation',
  ];

  const data = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      data[field] = typeof req.body[field] === 'string' ? xss(req.body[field]) : req.body[field];
    }
  }

  const updated = await db.employer.update({ where: { id: employer.id }, data });
  res.json({ success: true, message: 'Profile updated', data: updated });
});

export const getJobs = catchAsync(async (req, res) => {
  const employer = await db.employer.findUnique({ where: { userId: req.user.id } });
  if (!employer) throw new AppError('Employer profile not found', 404);

  const { page, limit, skip } = parsePagination(req.query);
  const [jobs, total] = await Promise.all([
    db.job.findMany({
      where: { employerId: employer.id },
      include: { skills: { include: { skill: true } }, _count: { select: { applications: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    db.job.count({ where: { employerId: employer.id } }),
  ]);

  res.json({
    success: true,
    message: 'Jobs fetched',
    data: jobs,
    pagination: buildPaginationMeta(page, limit, total),
  });
});

export const createJob = catchAsync(async (req, res) => {
  const employer = await db.employer.findUnique({ where: { userId: req.user.id } });
  if (!employer) throw new AppError('Employer profile not found', 404);

  const limitCheck = await checkEmployerJobLimit(employer.id);
  if (!limitCheck.allowed) throw new AppError(limitCheck.reason, 403);

  const { skills, ...jobData } = req.body;

  const job = await db.job.create({
    data: {
      employerId: employer.id,
      title: xss(jobData.title),
      description: xss(jobData.description),
      requirements: jobData.requirements ? xss(jobData.requirements) : null,
      hiringProcess: jobData.hiringProcess ? xss(jobData.hiringProcess) : null,
      category: jobData.category,
      employmentType: jobData.employmentType,
      salaryMin: jobData.salaryMin,
      salaryMax: jobData.salaryMax,
      isSalaryNegotiable: jobData.isSalaryNegotiable || false,
      hideSalary: jobData.hideSalary || false,
      openings: jobData.openings || 1,
      experienceMin: jobData.experienceMin || 0,
      experienceMax: jobData.experienceMax,
      qualification: jobData.qualification,
      shiftTiming: jobData.shiftTiming,
      city: xss(jobData.city),
      state: xss(jobData.state),
      pincode: jobData.pincode,
      isRemote: jobData.isRemote || false,
      applicationDeadline: jobData.applicationDeadline ? new Date(jobData.applicationDeadline) : null,
      status: 'PENDING_APPROVAL',
      scheduledAt: jobData.scheduledAt ? new Date(jobData.scheduledAt) : null,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  if (Array.isArray(skills) && skills.length > 0) {
    await db.jobSkill.createMany({
      data: skills.map((skillId) => ({ jobId: job.id, skillId })),
      skipDuplicates: true,
    });
  }

  res.status(201).json({ success: true, message: 'Job post submitted for approval', data: job });
});

export const updateJob = catchAsync(async (req, res) => {
  const employer = await db.employer.findUnique({ where: { userId: req.user.id } });
  const job = await db.job.findFirst({ where: { id: req.params.id, employerId: employer.id } });
  if (!job) throw new AppError('Job not found', 404);

  if (!['DRAFT', 'REJECTED'].includes(job.status)) {
    throw new AppError('Only draft or rejected jobs can be edited', 400);
  }

  const { skills, ...jobData } = req.body;

  const updated = await db.job.update({
    where: { id: job.id },
    data: { ...jobData, status: 'PENDING_APPROVAL', rejectionReason: null },
  });

  if (Array.isArray(skills)) {
    await db.jobSkill.deleteMany({ where: { jobId: job.id } });
    if (skills.length > 0) {
      await db.jobSkill.createMany({
        data: skills.map((skillId) => ({ jobId: job.id, skillId })),
        skipDuplicates: true,
      });
    }
  }

  res.json({ success: true, message: 'Job updated', data: updated });
});

export const deleteJob = catchAsync(async (req, res) => {
  const employer = await db.employer.findUnique({ where: { userId: req.user.id } });
  const job = await db.job.findFirst({ where: { id: req.params.id, employerId: employer.id } });
  if (!job) throw new AppError('Job not found', 404);

  await db.job.delete({ where: { id: job.id } });
  res.json({ success: true, message: 'Job deleted' });
});

export const duplicateJob = catchAsync(async (req, res) => {
  const employer = await db.employer.findUnique({ where: { userId: req.user.id } });
  const original = await db.job.findFirst({
    where: { id: req.params.id, employerId: employer.id },
    include: { skills: true },
  });
  if (!original) throw new AppError('Job not found', 404);

  const limitCheck = await checkEmployerJobLimit(employer.id);
  if (!limitCheck.allowed) throw new AppError(limitCheck.reason, 403);

  const { id, createdAt, updatedAt, approvedAt, approvedBy, viewCount, applicationCount, ...rest } = original;

  const newJob = await db.job.create({
    data: {
      ...rest,
      title: `${rest.title} (Copy)`,
      status: 'PENDING_APPROVAL',
      rejectionReason: null,
      renewalReminderSent: false,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  if (original.skills.length > 0) {
    await db.jobSkill.createMany({
      data: original.skills.map((s) => ({ jobId: newJob.id, skillId: s.skillId })),
    });
  }

  res.status(201).json({ success: true, message: 'Job duplicated', data: newJob });
});

export const closeJob = catchAsync(async (req, res) => {
  const employer = await db.employer.findUnique({ where: { userId: req.user.id } });
  const job = await db.job.findFirst({ where: { id: req.params.id, employerId: employer.id } });
  if (!job) throw new AppError('Job not found', 404);

  const updated = await db.job.update({ where: { id: job.id }, data: { status: 'CLOSED' } });
  res.json({ success: true, message: 'Job closed', data: updated });
});

export const getApplicants = catchAsync(async (req, res) => {
  const employer = await db.employer.findUnique({ where: { userId: req.user.id } });
  const job = await db.job.findFirst({ where: { id: req.params.id, employerId: employer.id } });
  if (!job) throw new AppError('Job not found', 404);

  const applications = await db.application.findMany({
    where: { jobId: job.id },
    include: {
      candidate: {
        select: {
          id: true, firstName: true, lastName: true, photoUrl: true, city: true,
          totalExperienceYrs: true, isFresher: true, bio: true, resumeUrl: true,
          skills: { include: { skill: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, message: 'Applicants fetched', data: applications });
});

export const updateApplicationStatus = catchAsync(async (req, res) => {
  const employer = await db.employer.findUnique({ where: { userId: req.user.id } });
  const application = await db.application.findFirst({
    where: { id: req.params.id },
    include: { job: true },
  });

  if (!application || application.job.employerId !== employer.id) {
    throw new AppError('Application not found', 404);
  }

  const updated = await db.application.update({
    where: { id: application.id },
    data: { status: req.body.status },
  });

  res.json({ success: true, message: 'Application status updated', data: updated });
});

export const updateApplicationNote = catchAsync(async (req, res) => {
  const employer = await db.employer.findUnique({ where: { userId: req.user.id } });
  const application = await db.application.findFirst({
    where: { id: req.params.id },
    include: { job: true },
  });

  if (!application || application.job.employerId !== employer.id) {
    throw new AppError('Application not found', 404);
  }

  const updated = await db.application.update({
    where: { id: application.id },
    data: { internalNote: xss(req.body.internalNote || '') },
  });

  res.json({ success: true, message: 'Note updated', data: updated });
});

export const updateApplicationFollowUp = catchAsync(async (req, res) => {
  const employer = await db.employer.findUnique({ where: { userId: req.user.id } });
  const application = await db.application.findFirst({
    where: { id: req.params.id },
    include: { job: true },
  });

  if (!application || application.job.employerId !== employer.id) {
    throw new AppError('Application not found', 404);
  }

  const updated = await db.application.update({
    where: { id: application.id },
    data: { followUpDate: req.body.followUpDate ? new Date(req.body.followUpDate) : null },
  });

  res.json({ success: true, message: 'Follow-up date updated', data: updated });
});

export const getJobAnalytics = catchAsync(async (req, res) => {
  const employer = await db.employer.findUnique({ where: { userId: req.user.id } });
  const job = await db.job.findFirst({ where: { id: req.params.id, employerId: employer.id } });
  if (!job) throw new AppError('Job not found', 404);

  const shortlistedCount = await db.application.count({
    where: { jobId: job.id, status: 'SHORTLISTED' },
  });

  res.json({
    success: true,
    message: 'Analytics fetched',
    data: {
      viewCount: job.viewCount,
      applicationCount: job.applicationCount,
      shortlistedCount,
    },
  });
});

export const unlockContact = catchAsync(async (req, res) => {
  const employer = await db.employer.findUnique({ where: { userId: req.user.id } });
  if (!employer) throw new AppError('Employer profile not found', 404);

  if (employer.planType === 'FREE') {
    throw new AppError('Upgrade your plan to unlock candidate contact details', 403);
  }

  const application = await db.application.findFirst({
    where: { id: req.params.applicationId },
    include: { job: true },
  });

  if (!application || application.job.employerId !== employer.id) {
    throw new AppError('Application not found', 404);
  }

  const updated = await db.application.update({
    where: { id: application.id },
    data: { contactUnlocked: true },
  });

  const candidate = await db.candidate.findUnique({ where: { id: application.candidateId } });

  res.json({
    success: true,
    message: 'Contact unlocked',
    data: {
      contactUnlocked: true,
      mobile: candidate.mobile,
      email: candidate.email,
    },
  });
});
