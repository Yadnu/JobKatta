import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const resend = new Resend(process.env.RESEND_API_KEY);

const emailMetrics = {
  sent: 0,
  failed: 0,
  retried: 0,
  lastFailure: null,
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const maskEmail = (email) => {
  const [local, domain] = String(email).split('@');
  if (!domain) return '***';
  const visible = local.length <= 2 ? '*' : `${local.slice(0, 2)}***`;
  return `${visible}@${domain}`;
};

export const getEmailMetrics = () => ({ ...emailMetrics, lastFailure: emailMetrics.lastFailure ? { ...emailMetrics.lastFailure } : null });

const loadTemplate = (templateName, data) => {
  const templatePath = path.join(__dirname, '..', 'templates', 'emails', `${templateName}.html`);
  let html = fs.readFileSync(templatePath, 'utf-8');
  const merged = {
    clientUrl: process.env.CLIENT_URL || 'https://jobkatta.in',
    baseUrl: process.env.BASE_URL || 'https://jobkatta.in',
    ...data,
  };
  for (const [key, value] of Object.entries(merged)) {
    html = html.replaceAll(`{{${key}}}`, String(value ?? ''));
  }
  return html;
};

const sendEmail = async ({ to, subject, templateName, data }) => {
  const html = loadTemplate(templateName, data);
  const { error } = await resend.emails.send({
    from: 'JobKatta <noreply@jobkatta.in>',
    to,
    subject,
    html,
  });
  if (error) throw new Error(error.message || 'Email provider rejected the request');
};

/**
 * Send with retries, structured logging, and in-process metrics for monitoring.
 * Returns { ok: true } or { ok: false, error: Error } — never throws.
 */
export const sendEmailReliable = async ({ to, subject, templateName, data, context = {} }, maxAttempts = 3) => {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await sendEmail({ to, subject, templateName, data });
      emailMetrics.sent++;
      if (attempt > 1) {
        console.info('[Email] Delivered after retry', { templateName, to: maskEmail(to), attempt, ...context });
      }
      return { ok: true };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxAttempts) emailMetrics.retried++;
      console.error('[Email] Send failed', {
        templateName,
        to: maskEmail(to),
        attempt,
        maxAttempts,
        error: lastError.message,
        ...context,
      });
      if (attempt < maxAttempts) await sleep(300 * attempt);
    }
  }

  emailMetrics.failed++;
  emailMetrics.lastFailure = {
    at: new Date().toISOString(),
    templateName,
    to: maskEmail(to),
    error: lastError?.message,
    ...context,
  };
  return { ok: false, error: lastError };
};

export const deliverVerifyEmail = (to, data, context = {}) =>
  sendEmailReliable(
    { to, subject: 'Verify your Job Katta email', templateName: 'verify-email', data, context: { flow: 'verify-email', ...context } },
  );

export const deliverPasswordResetEmail = (to, data, context = {}) =>
  sendEmailReliable(
    { to, subject: 'Reset your Job Katta password', templateName: 'reset-password', data, context: { flow: 'password-reset', ...context } },
  );

export const sendWelcomeEmail = (to, data) =>
  sendEmail({ to, subject: 'Welcome to Job Katta!', templateName: 'welcome-candidate', data });

export const sendVerifyEmail = (to, data) =>
  sendEmail({ to, subject: 'Verify your Job Katta email', templateName: 'verify-email', data });

export const sendPasswordResetEmail = (to, data) =>
  sendEmail({ to, subject: 'Reset your Job Katta password', templateName: 'reset-password', data });

export const sendApplicationSubmittedEmail = (to, data) =>
  sendEmail({ to, subject: 'Application submitted successfully', templateName: 'application-submitted', data });

export const sendApplicationStatusEmail = (to, data) =>
  sendEmail({ to, subject: `Application status update: ${data.status}`, templateName: 'application-status', data });

export const sendJobApprovedEmail = (to, data) =>
  sendEmail({ to, subject: 'Your job post has been approved!', templateName: 'job-approved', data });

export const sendJobRejectedEmail = (to, data) =>
  sendEmail({ to, subject: 'Job post update from Job Katta', templateName: 'job-rejected', data });

export const sendJobExpiryReminderEmail = (to, data) =>
  sendEmail({ to, subject: 'Your job post is expiring soon', templateName: 'job-expiry-reminder', data });

export const sendPaymentReceiptEmail = (to, data) =>
  sendEmail({ to, subject: 'Payment receipt - Job Katta', templateName: 'payment-receipt', data });

export const sendJobAlertDigestEmail = (to, data) => {
  const jobCards = (data.jobs || [])
    .map((j) => `<div class="job-card"><h3>${j.title}</h3><p>${j.company} &bull; ${j.city}</p><a href="${j.url}">View Job &rarr;</a></div>`)
    .join('');
  return sendEmail({ to, subject: 'New jobs matching your preferences', templateName: 'job-alert-digest', data: { ...data, jobCards } });
};

export const sendTicketReplyEmail = (to, data) =>
  sendEmail({ to, subject: 'Reply to your support ticket', templateName: 'ticket-reply', data });
