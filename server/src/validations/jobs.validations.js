import { z } from 'zod';
import { EMPLOYMENT_TYPES } from './shared.validations.js';

/**
 * GET /api/jobs — optional keyword/location/category filters.
 * All query params arrive as strings; values are optional.
 */
export const listJobsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    keyword: z.string().max(200).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    category: z.string().max(100).optional(),
    type: z.enum(EMPLOYMENT_TYPES).optional(),
    salaryMin: z.string().optional(),
    salaryMax: z.string().optional(),
    employerId: z.string().optional(),
  }),
});

/**
 * GET /api/jobs/employers — public employer listing filters.
 */
export const listPublicEmployersSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    keyword: z.string().max(200).optional(),
    industry: z.string().max(100).optional(),
  }),
});

/**
 * POST /api/jobs/:id/apply — cover note is optional but length-capped.
 */
export const applyJobSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Job ID required'),
  }),
  body: z.object({
    coverNote: z.string().max(1000, 'Cover note must be 1000 characters or fewer').optional(),
  }),
});
