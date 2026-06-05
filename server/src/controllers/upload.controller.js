import fs from 'fs';
import path from 'path';
import db from '../config/database.js';
import { catchAsync, AppError } from '../middleware/errorHandler.middleware.js';
import { calculateProfileComplete } from '../services/profileComplete.service.js';

const deleteOldFile = (filePath) => {
  if (!filePath) return;
  const uploadBase = process.env.UPLOAD_PATH || path.join(process.cwd(), 'uploads');
  const absolute = path.join(uploadBase, '..', filePath);
  if (fs.existsSync(absolute)) {
    fs.unlink(absolute, () => {});
  }
};

export const uploadPhoto = catchAsync(async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded', 400);

  const candidate = await db.candidate.findUnique({ where: { userId: req.user.id } });
  if (!candidate) throw new AppError('Candidate profile not found', 404);

  deleteOldFile(candidate.photoUrl);

  const photoUrl = `/uploads/photos/${req.file.filename}`;
  await db.candidate.update({ where: { id: candidate.id }, data: { photoUrl } });
  await calculateProfileComplete(candidate.id);

  res.json({ success: true, message: 'Photo uploaded', data: { photoUrl } });
});

export const uploadResume = catchAsync(async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded', 400);

  const candidate = await db.candidate.findUnique({ where: { userId: req.user.id } });
  if (!candidate) throw new AppError('Candidate profile not found', 404);

  deleteOldFile(candidate.resumeUrl);

  const resumeUrl = `/uploads/resumes/${req.file.filename}`;
  await db.candidate.update({ where: { id: candidate.id }, data: { resumeUrl } });
  await calculateProfileComplete(candidate.id);

  res.json({ success: true, message: 'Resume uploaded', data: { resumeUrl } });
});

export const uploadLogo = catchAsync(async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded', 400);

  const employer = await db.employer.findUnique({ where: { userId: req.user.id } });
  if (!employer) throw new AppError('Employer profile not found', 404);

  deleteOldFile(employer.logoUrl);

  const logoUrl = `/uploads/logos/${req.file.filename}`;
  await db.employer.update({ where: { id: employer.id }, data: { logoUrl } });

  res.json({ success: true, message: 'Logo uploaded', data: { logoUrl } });
});
