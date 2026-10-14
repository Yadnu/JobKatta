import { z } from 'zod';
import { EMPLOYMENT_TYPES } from './shared.validations.js';

const indianMobile = z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number');

// ─── Profile ──────────────────────────────────────────────────────────────────

export const updateCandidateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(2).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']).optional(),
    dob: z.string().optional(),
    mobile: indianMobile.optional(),
    email: z.string().email().optional(),
    addressLine1: z.string().max(200).optional(),
    city: z.string().min(2).max(100).optional(),
    state: z.string().min(2).max(100).optional(),
    pincode: z.string().length(6).regex(/^\d+$/).optional().or(z.literal('')),
    portfolioUrl: z.string().url().optional().or(z.literal('')),
    linkedinUrl: z.string().url().optional().or(z.literal('')),
    githubUrl: z.string().url().optional().or(z.literal('')),
    bio: z.string().max(500).optional(),
    isFresher: z.boolean().optional(),
    totalExperienceYrs: z.number().min(0).max(60).optional(),
    openToWork: z.boolean().optional(),
  }),
});

// ─── Education ────────────────────────────────────────────────────────────────

export const addEducationSchema = z.object({
  body: z.object({
    degree: z.string().min(2, 'Degree required'),
    institution: z.string().min(2, 'Institution required'),
    fieldOfStudy: z.string().optional(),
    board: z.string().optional(),
    percentage: z.number().min(0).max(100).optional(),
    startYear: z.number().int().min(1980).max(new Date().getFullYear()),
    endYear: z.number().int().min(1980).optional(),
    isCurrently: z.boolean(),
  }),
});

export const updateEducationSchema = z.object({
  params: z.object({ id: z.string().min(1, 'ID required') }),
  body: addEducationSchema.shape.body.partial(),
});

// ─── Experience ───────────────────────────────────────────────────────────────

export const addExperienceSchema = z.object({
  body: z.object({
    jobTitle: z.string().min(2, 'Job title required'),
    companyName: z.string().min(2, 'Company name required'),
    city: z.string().optional(),
    employmentType: z.enum(EMPLOYMENT_TYPES).optional(),
    startDate: z.string().min(1, 'Start date required'),
    endDate: z.string().optional(),
    isCurrent: z.boolean(),
    description: z.string().max(1000).optional(),
  }),
});

export const updateExperienceSchema = z.object({
  params: z.object({ id: z.string().min(1, 'ID required') }),
  body: addExperienceSchema.shape.body.partial(),
});

// ─── Skills ───────────────────────────────────────────────────────────────────

export const updateSkillsSchema = z.object({
  body: z.object({
    skillIds: z.array(z.string().min(1)).min(1, 'At least one skill required'),
  }),
});

// ─── Preferences ─────────────────────────────────────────────────────────────

export const updatePreferencesSchema = z.object({
  body: z.object({
    preferredRoles: z.string().max(200).optional(),
    preferredIndustries: z.string().max(200).optional(),
    preferredCities: z.string().max(200).optional(),
    preferredEmpType: z.string().optional(),
    expectedSalaryMin: z.number().min(0).optional(),
    expectedSalaryMax: z.number().min(0).optional(),
  }),
});

// ─── Job Alerts ───────────────────────────────────────────────────────────────

export const createAlertSchema = z.object({
  body: z.object({
    keywords: z.string().min(1, 'Keywords required').max(200),
    city: z.string().max(100).optional(),
    jobType: z.enum(EMPLOYMENT_TYPES).optional(),
  }),
});

export const updateAlertSchema = z.object({
  params: z.object({ id: z.string().min(1, 'ID required') }),
  body: z.object({
    keywords: z.string().min(1).max(200).optional(),
    city: z.string().max(100).optional(),
    jobType: z.enum(EMPLOYMENT_TYPES).optional(),
    isActive: z.boolean().optional(),
  }),
});
