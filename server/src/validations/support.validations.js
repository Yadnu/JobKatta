import { z } from 'zod';

export const createTicketSchema = z.object({
  body: z.object({
    subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
    message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
  }),
});
