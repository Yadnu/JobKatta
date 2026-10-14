import { z } from 'zod';
import { EMPLOYMENT_TYPES, APPLICATION_STATUSES } from './shared.validations.js';

// ─── Employer profile ─────────────────────────────────────────────────────────

export const updateEmployerProfileSchema = z.object({
  body: z.object({
    companyName: z.string().min(2).max(100).optional(),
    companyEmail: z.string().email().optional(),
    contactNumber: z.string().regex(/^[0-9+\-\s]{7,15}$/).optional(),
    website: z.string().url().optional().or(z.literal('')),
    industry: z.string().max(100).optional(),
    companySize: z.string().optional(),
    foundedYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
    description: z.string().max(2000).optional(),
    addressLine1: z.string().max(200).optional(),
    city: z.string().min(2).max(100).optional(),
    state: z.string().min(2).max(100).optional(),
    pincode: z.string().length(6).regex(/^\d+$/).optional().or(z.literal('')),
    gstNumber: z.string().max(20).optional(),
    cinNumber: z.string().max(21).optional(),
    hrName: z.string().max(100).optional(),
    hrDesignation: z.string().max(100).optional(),
  }),
});

// ─── Job posting ──────────────────────────────────────────────────────────────

const jobBodySchema = z.object({
  title: z.string().min(5, 'Min 5 characters').max(100),
  category: z.string().min(1, 'Category required'),
  employmentType: z.enum(EMPLOYMENT_TYPES),
  description: z.string().min(100, 'Min 100 characters'),
  requirements: z.string().optional(),
  hiringProcess: z.string().optional(),
  salaryMin: z.number().positive().optional(),
  salaryMax: z.number().positive().optional(),
  hideSalary: z.boolean().optional(),
  isSalaryNegotiable: z.boolean().optional(),
  openings: z.number().int().min(1).optional(),
  experienceMin: z.number().int().min(0).optional(),
  experienceMax: z.number().int().optional(),
  qualification: z.string().optional(),
  shiftTiming: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().optional(),
  isRemote: z.boolean().optional(),
  applicationDeadline: z.string().optional(),
  skills: z.array(z.string()).min(1, 'At least one skill required'),
});

export const createJobSchema = z.object({ body: jobBodySchema });

export const updateJobSchema = z.object({
  params: z.object({ id: z.string().min(1, 'Job ID required') }),
  body: jobBodySchema.partial(),
});

// ─── Application management ───────────────────────────────────────────────────

export const updateApplicationStatusSchema = z.object({
  params: z.object({ id: z.string().min(1, 'ID required') }),
  body: z.object({
    status: z.enum(APPLICATION_STATUSES, { errorMap: () => ({ message: 'Invalid application status' }) }),
  }),
});

export const updateApplicationNoteSchema = z.object({
  params: z.object({ id: z.string().min(1, 'ID required') }),
  body: z.object({
    internalNote: z.string().max(1000, 'Note must be 1000 characters or fewer'),
  }),
});

export const updateApplicationFollowUpSchema = z.object({
  params: z.object({ id: z.string().min(1, 'ID required') }),
  body: z.object({
    followUpDate: z.string().optional(),
  }),
});
