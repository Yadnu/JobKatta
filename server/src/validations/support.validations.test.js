import { describe, expect, it } from 'vitest';
import { createTicketSchema } from './support.validations.js';

const b = (body) => ({ body, query: {}, params: {} });

describe('createTicketSchema', () => {
  it('accepts a valid subject and message', () => {
    expect(createTicketSchema.safeParse(b({ subject: 'Login issue', message: 'I cannot log in to my account.' })).success).toBe(true);
  });

  it('rejects a subject shorter than 5 chars', () => {
    expect(createTicketSchema.safeParse(b({ subject: 'Hi', message: 'I have a problem with my account.' })).success).toBe(false);
  });

  it('rejects a message shorter than 10 chars', () => {
    expect(createTicketSchema.safeParse(b({ subject: 'Login issue', message: 'Problem' })).success).toBe(false);
  });

  it('rejects missing subject', () => {
    expect(createTicketSchema.safeParse(b({ message: 'I cannot log in to my account.' })).success).toBe(false);
  });

  it('rejects missing message', () => {
    expect(createTicketSchema.safeParse(b({ subject: 'Login issue' })).success).toBe(false);
  });

  it('rejects a subject exceeding 200 chars', () => {
    expect(createTicketSchema.safeParse(b({ subject: 'x'.repeat(201), message: 'Detailed message here.' })).success).toBe(false);
  });

  it('rejects a message exceeding 2000 chars', () => {
    expect(createTicketSchema.safeParse(b({ subject: 'Login issue', message: 'x'.repeat(2001) })).success).toBe(false);
  });
});
