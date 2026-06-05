import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const loadTemplate = (templateName, data) => {
  const templatePath = path.join(__dirname, '..', 'templates', 'emails', `${templateName}.html`);
  let html = fs.readFileSync(templatePath, 'utf-8');
  Object.entries(data).forEach(([key, value]) => {
    html = html.replaceAll(`{{${key}}}`, String(value ?? ''));
  });
  return html;
};

const sendEmail = async ({ to, subject, templateName, data }) => {
  const html = loadTemplate(templateName, data);
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
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

export const sendJobAlertDigestEmail = (to, data) =>
  sendEmail({ to, subject: 'New jobs matching your preferences', templateName: 'job-alert-digest', data });

export const sendTicketReplyEmail = (to, data) =>
  sendEmail({ to, subject: 'Reply to your support ticket', templateName: 'ticket-reply', data });
