import { z } from 'zod';

/** Validates a non-empty :id route param. */
export const idParam = z.object({
  params: z.object({
    id: z.string().min(1, 'ID required'),
  }),
});

/** Coerce-friendly pagination — query params arrive as strings. */
export const paginationQuery = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'FREELANCE', 'CONTRACT'];
export const APPLICATION_STATUSES = ['APPLIED', 'VIEWED', 'SHORTLISTED', 'INTERVIEWING', 'HIRED', 'REJECTED'];
