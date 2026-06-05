# Phase 1 — Project Foundation: Sequential Checklist

## Status Legend
- `[x]` Done
- `[ ]` Not started
- `[~]` In progress

---

## 1. Repository & Directory Scaffold

- [x] Create `.gitignore`
- [ ] Create root `README.md`
- [x] Create `server/` directory tree
  - `server/prisma/`
  - `server/src/config/`
  - `server/src/controllers/`
  - `server/src/middleware/`
  - `server/src/routes/`
  - `server/src/services/`
  - `server/src/cron/`
  - `server/src/utils/`
  - `server/src/templates/emails/`
- [ ] Create `client/` directory tree (Next.js scaffold)

---

## 2. Server — Package & Config

- [x] `server/package.json` (ESM, all deps listed)
- [x] `server/.env.example` (all env var keys documented)
- [x] `server/ecosystem.config.js` (PM2 cluster config)
- [x] `server/src/config/database.js` (Prisma singleton)
- [x] `server/src/config/plans.js` (candidate + employer plan definitions)
- [x] `server/src/config/razorpay.js` (Razorpay instance)
- [x] `server/src/config/upload.js` (multer config for photos/resumes/logos)

---

## 3. Prisma

- [x] `server/prisma/schema.prisma` (all 18 models, all enums)
- [x] `server/prisma/seed.js` (admin, 32 skills, 3 employers, 5 candidates, 6 jobs, 2 apps, 2 subscriptions)
- [ ] **Run**: `npm install` inside `server/`
- [ ] **Run**: `npx prisma generate`
- [ ] **Run**: `npx prisma migrate dev --name init`
- [ ] **Run**: `node prisma/seed.js`

---

## 4. Server — Utilities

- [x] `server/src/utils/jwt.util.js` (sign/verify access + refresh tokens)
- [x] `server/src/utils/hash.util.js` (bcrypt hash + compare for passwords and tokens)
- [x] `server/src/utils/pagination.util.js` (parsePagination, buildPaginationMeta)
- [x] `server/src/utils/razorpay.util.js` (signature verification)

---

## 5. Server — Middleware

- [x] `server/src/middleware/auth.middleware.js` (JWT Bearer extraction + `req.user`)
- [x] `server/src/middleware/role.middleware.js` (`requireRole`, `requireAdmin`, `requireEmployer`, `requireCandidate`)
- [x] `server/src/middleware/validate.middleware.js` (Zod schema validator)
- [x] `server/src/middleware/rateLimit.middleware.js` (login 5/15min, OTP 3/10min, general, upload)
- [x] `server/src/middleware/errorHandler.middleware.js` (`AppError`, `catchAsync`, `errorHandler`, `notFound`)

---

## 6. Server — Services

- [x] `server/src/services/email.service.js` (Nodemailer/Brevo, all 11 send functions)
- [x] `server/src/services/otp.service.js` (msg91 integration, OtpRecord CRUD)
- [x] `server/src/services/profileComplete.service.js` (5-section scoring, DB update)
- [x] `server/src/services/subscription.service.js` (plan activation, job limit check, app limit check)

---

## 7. Server — Controllers

- [x] `server/src/controllers/auth.controller.js` (register, login, logout, refresh, getMe, verifyEmail, forgotPassword, resetPassword, sendOtp, verifyOtp)
- [x] `server/src/controllers/candidate.controller.js` (profile CRUD, education, experience, skills, alerts, applications, saved jobs)
- [x] `server/src/controllers/jobs.controller.js` (list, get, featured, save toggle, apply)
- [x] `server/src/controllers/employer.controller.js` (company profile, job CRUD, duplicate, close, applicants, Kanban status, notes, analytics, contact unlock)
- [x] `server/src/controllers/admin.controller.js` (stats, job approval queue, approve, reject, candidate/employer management, subscriptions, flags, tickets, revenue)
- [ ] `server/src/controllers/payment.controller.js` (createOrder, verify, webhook, history)
- [ ] `server/src/controllers/upload.controller.js` (photo, resume, logo with old-file cleanup)
- [ ] `server/src/controllers/support.controller.js` (create ticket, list tickets, get ticket)
- [ ] `server/src/controllers/skills.controller.js` (list all skills, list categories)

---

## 8. Server — Routes

- [x] `server/src/routes/auth.routes.js`
- [ ] `server/src/routes/candidate.routes.js`
- [ ] `server/src/routes/jobs.routes.js`
- [ ] `server/src/routes/employer.routes.js`
- [ ] `server/src/routes/admin.routes.js`
- [ ] `server/src/routes/payment.routes.js`
- [ ] `server/src/routes/upload.routes.js`
- [ ] `server/src/routes/support.routes.js`
- [ ] `server/src/routes/skills.routes.js`

---

## 9. Server — Cron Jobs

- [ ] `server/src/cron/expireJobs.cron.js` (midnight daily: ACTIVE → EXPIRED)
- [ ] `server/src/cron/expiryReminder.cron.js` (10 AM daily: email 3-days-before-expiry)
- [ ] `server/src/cron/resetAppCount.cron.js` (1st of month: reset appCountThisMonth)
- [ ] `server/src/cron/emailAlerts.cron.js` (8 AM daily: matching job digest emails)

---

## 10. Server — Email Templates (HTML)

- [ ] `server/src/templates/emails/welcome-candidate.html`
- [ ] `server/src/templates/emails/verify-email.html`
- [ ] `server/src/templates/emails/reset-password.html`
- [ ] `server/src/templates/emails/application-submitted.html`
- [ ] `server/src/templates/emails/application-status.html`
- [ ] `server/src/templates/emails/job-approved.html`
- [ ] `server/src/templates/emails/job-rejected.html`
- [ ] `server/src/templates/emails/job-expiry-reminder.html`
- [ ] `server/src/templates/emails/payment-receipt.html`
- [ ] `server/src/templates/emails/job-alert-digest.html`
- [ ] `server/src/templates/emails/ticket-reply.html`

---

## 11. Server — Entry Point

- [ ] `server/src/app.js` (Express app: helmet, cors, morgan, routes, error handler, cron init, static uploads)

---

## 12. Client — Bootstrap

- [ ] `npx create-next-app@14 client --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` (run from `jobkatta/`)
- [ ] Install additional deps: `zustand`, `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `zod`, `axios`, `lucide-react`, `react-hot-toast`
- [ ] `npx shadcn@latest init` (inside `client/`)
- [ ] Add shadcn components: `button`, `input`, `label`, `card`, `badge`, `tabs`, `dialog`, `dropdown-menu`, `avatar`, `separator`, `skeleton`, `toast`, `form`, `select`, `checkbox`, `textarea`, `progress`
- [ ] `client/next.config.js` (image domains, API rewrites)
- [ ] `client/tailwind.config.js` (Poppins + Inter fonts, orange brand palette)
- [ ] `client/src/app/globals.css` (Google Fonts import, CSS variables)

---

## 13. Client — Core Library Files

- [ ] `client/src/lib/api.ts` (Axios instance, request/response interceptors, token refresh logic)
- [ ] `client/src/lib/auth.ts` (token get/set/remove helpers, isTokenExpired)
- [ ] `client/src/lib/utils.ts` (cn, formatDate, formatSalary, timeAgo, formatINR)
- [ ] `client/src/lib/constants.ts` (JOB_CATEGORIES, INDIAN_STATES, EMPLOYMENT_TYPES, SKILLS list, APPLICATION_STATUSES)
- [ ] `client/src/lib/validations.ts` (all Zod schemas: register, login, jobPost, profile steps, etc.)

---

## 14. Client — Types

- [ ] `client/src/types/index.ts` (User, Candidate, Employer, Job, Application, Subscription, etc.)

---

## 15. Client — Stores

- [ ] `client/src/store/authStore.ts` (Zustand: user, tokens, setAuth, clearAuth, isAuthenticated)
- [ ] `client/src/store/uiStore.ts` (Zustand: sidebar open, active modal, language preference)

---

## 16. Client — Hooks

- [ ] `client/src/hooks/useAuth.ts` (login, register, logout, getMe with React Query)
- [ ] `client/src/hooks/useJobs.ts` (useJobs, useJob, useFeaturedJobs, useSaveJob, useApplyJob)
- [ ] `client/src/hooks/useCandidate.ts` (useCandidate, useUpdateProfile, useAddEducation, etc.)
- [ ] `client/src/hooks/useEmployer.ts` (useEmployer, useEmployerJobs, useCreateJob, etc.)
- [ ] `client/src/hooks/useSubscription.ts` (usePlanInfo, useCreateOrder, useVerifyPayment)

---

## 17. Client — App Layout

- [ ] `client/src/app/layout.tsx` (QueryClientProvider, Zustand hydration, Toaster, font classes)
- [ ] `client/src/app/globals.css` (Tailwind base, brand CSS vars)
- [ ] `client/src/app/(public)/page.tsx` (Landing page: hero, how it works, featured jobs, employer CTA)

---

## 18. Client — Shared Components

- [ ] `client/src/components/layout/Navbar.tsx` (logo, nav links, auth CTA, mobile menu)
- [ ] `client/src/components/layout/Footer.tsx`
- [ ] `client/src/components/shared/LoadingSpinner.tsx`
- [ ] `client/src/components/shared/EmptyState.tsx`
- [ ] `client/src/components/shared/StatusBadge.tsx`
- [ ] `client/src/components/shared/PageHeader.tsx`
- [ ] `client/src/components/shared/ConfirmModal.tsx`

---

## 19. Client — Auth Pages

- [ ] `client/src/app/auth/login/page.tsx` (email/password tab + OTP tab, form validation, redirect on success)
- [ ] `client/src/app/auth/register/page.tsx` (role selector: Candidate / Employer, form, email verification prompt)
- [ ] `client/src/app/auth/verify-email/page.tsx` (token from query param → call API → success/error UI)
- [ ] `client/src/app/auth/forgot-password/page.tsx` (email input, success message)
- [ ] `client/src/app/auth/reset-password/page.tsx` (new password + confirm, token from query param)

---

## 20. Final Verification

- [ ] `npm run dev` in `server/` starts without errors on port 5000
- [ ] `GET /api/auth/me` returns 401 (unauthenticated)
- [ ] `POST /api/auth/register` creates a candidate + sends verify email
- [ ] `POST /api/auth/login` returns access + refresh tokens
- [ ] `npm run dev` in `client/` starts without errors on port 3000
- [ ] Login page renders at `http://localhost:3000/auth/login`
- [ ] Register page renders at `http://localhost:3000/auth/register`
- [ ] Auth flow end-to-end: register → verify email → login → /api/auth/me returns user

---

## Remaining Items to Complete (current session left off here)

The session was interrupted mid-phase. The following server files were **partially written** and need to be completed before moving to client setup:

1. `server/src/controllers/payment.controller.js` — **not created yet**
2. `server/src/controllers/upload.controller.js` — **not created yet**
3. `server/src/controllers/support.controller.js` — **not created yet**
4. `server/src/controllers/skills.controller.js` — **not created yet**
5. All route files (except `auth.routes.js`) — **not created yet**
6. `server/src/app.js` — **not created yet**
7. All 4 cron files — **not created yet**
8. All 11 email templates — **not created yet**
9. All client files — **not created yet**
