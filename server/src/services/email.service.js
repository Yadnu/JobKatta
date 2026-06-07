import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const resend = new Resend(process.env.RESEND_API_KEY);

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
  await resend.emails.send({
    from: 'JobKatta <noreply@jobkatta.in>',
    to,
    subject,
    html,
  });
};

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
