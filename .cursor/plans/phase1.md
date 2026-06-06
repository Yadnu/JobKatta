# Phase 1 — Project Foundation: Sequential Checklist

## Status Legend
- `[x]` Done
- `[ ]` Not started
- `[~]` In progress

---

## 1. Repository & Directory Scaffold

- [x] Create `.gitignore`
- [x] Create root `README.md`
- [x] Create `server/` directory tree
- [x] Create `client/` directory tree (Next.js scaffold)

---

## 2. Server — Package & Config

- [x] `server/package.json` (ESM, all deps listed)
- [x] `server/.env.example` (all env var keys documented)
- [x] `server/ecosystem.config.js` (PM2 cluster config; `REDIS_URL` in env block)
- [x] `server/src/config/redis.js` (singleton ioredis client, error handling, reconnect strategy)
- [x] `server/src/config/database.js` (Prisma singleton)
- [x] `server/src/config/plans.js` (candidate + employer plan definitions)
- [x] `server/src/config/razorpay.js` (Razorpay instance)
- [x] `server/src/config/upload.js` (multer config for photos/resumes/logos)

---

## 3. Prisma

- [x] `server/prisma/schema.prisma` (all models, all enums)
- [x] `server/prisma/seed.js` (admin, skills, 3 employers, 5 candidates, 6 jobs)
- [ ] **Run**: `npx prisma migrate dev --name init` (needs MySQL running)
- [ ] **Run**: `node prisma/seed.js`

---

## 4. Server — Utilities

- [x] `server/src/utils/jwt.util.js`
- [x] `server/src/utils/hash.util.js`
- [x] `server/src/utils/pagination.util.js`
- [x] `server/src/utils/razorpay.util.js`

---

## 5. Server — Middleware

- [x] `server/src/middleware/auth.middleware.js`
- [x] `server/src/middleware/role.middleware.js`
- [x] `server/src/middleware/validate.middleware.js`
- [x] `server/src/middleware/rateLimit.middleware.js`
- [x] `server/src/middleware/errorHandler.middleware.js`

---

## 6. Server — Services

- [x] `server/src/services/email.service.js`
- [x] `server/src/services/otp.service.js`
- [x] `server/src/services/profileComplete.service.js`
- [x] `server/src/services/subscription.service.js`

---

## 7. Server — Controllers

- [x] `server/src/controllers/auth.controller.js`
- [x] `server/src/controllers/candidate.controller.js`
- [x] `server/src/controllers/jobs.controller.js`
- [x] `server/src/controllers/employer.controller.js`
- [x] `server/src/controllers/admin.controller.js`
- [x] `server/src/controllers/payment.controller.js`
- [x] `server/src/controllers/upload.controller.js`
- [x] `server/src/controllers/support.controller.js`
- [x] `server/src/controllers/skills.controller.js`

---

## 8. Server — Routes

- [x] `server/src/routes/auth.routes.js`
- [x] `server/src/routes/candidate.routes.js`
- [x] `server/src/routes/jobs.routes.js`
- [x] `server/src/routes/employer.routes.js`
- [x] `server/src/routes/admin.routes.js`
- [x] `server/src/routes/payment.routes.js`
- [x] `server/src/routes/upload.routes.js`
- [x] `server/src/routes/support.routes.js`
- [x] `server/src/routes/skills.routes.js`

---

## 9. Server — Cron Jobs

- [x] `server/src/cron/expireJobs.cron.js`
- [x] `server/src/cron/expiryReminder.cron.js`
- [x] `server/src/cron/resetAppCount.cron.js`
- [x] `server/src/cron/emailAlerts.cron.js`

---

## 10. Server — Email Templates (HTML)

- [x] `welcome-candidate.html`
- [x] `verify-email.html`
- [x] `reset-password.html`
- [x] `application-submitted.html`
- [x] `application-status.html`
- [x] `job-approved.html`
- [x] `job-rejected.html`
- [x] `job-expiry-reminder.html`
- [x] `payment-receipt.html`
- [x] `job-alert-digest.html`
- [x] `ticket-reply.html`

---

## 11. Server — Entry Point

- [x] `server/src/app.js`

---

## 12. Client — Bootstrap

- [x] Next.js 14 + TypeScript + Tailwind + ESLint (App Router)
- [x] Dependencies: zustand, @tanstack/react-query, react-hook-form, zod, axios, lucide-react, react-hot-toast, clsx, tailwind-merge, class-variance-authority
- [x] shadcn/ui initialized + 15 components added
- [x] `client/next.config.mjs` (image domains, upload rewrite)
- [x] `client/tailwind.config.ts` (Poppins + Inter, orange brand palette)
- [x] `client/src/app/globals.css` (Google Fonts, brand CSS vars)

---

## 13. Client — Core Library Files

- [x] `client/src/lib/api.ts` (Axios + interceptors + token refresh)
- [x] `client/src/lib/auth.ts` (token helpers)
- [x] `client/src/lib/utils.ts` (cn, formatINR, formatSalaryRange, timeAgo, formatDate, getInitials)
- [x] `client/src/lib/constants.ts` (categories, states, employment types, status labels)
- [x] `client/src/lib/validations.ts` (Zod schemas: register, login, OTP, profile steps, job post)

---

## 14. Client — Types

- [x] `client/src/types/index.ts` (User, Candidate, Employer, Job, Application, Subscription, ApiResponse, AuthTokens)

---

## 15. Client — Stores

- [x] `client/src/store/authStore.ts` (Zustand + persist: user, tokens, setAuth, clearAuth)
- [x] `client/src/store/uiStore.ts` (Zustand: sidebar, language)

---

## 16. Client — Hooks

- [x] `client/src/hooks/useAuth.ts`
- [x] `client/src/hooks/useJobs.ts`
- [x] `client/src/hooks/useCandidate.ts`
- [x] `client/src/hooks/useEmployer.ts`
- [x] `client/src/hooks/useSubscription.ts`

---

## 17. Client — App Layout

- [x] `client/src/app/layout.tsx` (QueryClientProvider, Toaster, fonts)
- [x] `client/src/app/providers.tsx`
- [x] `client/src/app/(public)/layout.tsx` (Navbar + Footer wrapper)
- [x] `client/src/app/(public)/page.tsx` (Landing page: hero, search, stats, categories, featured jobs, how it works, CTA)

---

## 18. Client — Shared Components

- [x] `client/src/components/layout/Navbar.tsx`
- [x] `client/src/components/layout/Footer.tsx`
- [x] `client/src/components/shared/LoadingSpinner.tsx`
- [x] `client/src/components/shared/EmptyState.tsx`
- [x] `client/src/components/shared/StatusBadge.tsx`
- [x] `client/src/components/shared/PageHeader.tsx`
- [x] `client/src/components/shared/ConfirmModal.tsx`

---

## 19. Client — Auth Pages

- [x] `client/src/app/auth/login/page.tsx` (email+password tab + mobile OTP tab)
- [x] `client/src/app/auth/register/page.tsx` (role selector: Candidate / Employer)
- [x] `client/src/app/auth/verify-email/page.tsx`
- [x] `client/src/app/auth/forgot-password/page.tsx`
- [x] `client/src/app/auth/reset-password/page.tsx`

---

## 20. Final Verification

- [ ] Set up MySQL database and fill `server/.env`
- [ ] `npx prisma migrate dev --name init` — creates all tables
- [ ] `node prisma/seed.js` — populates sample data
- [ ] `npm run dev` in `server/` — starts on port 5000 with no errors
- [ ] `GET /api/auth/me` returns 401
- [ ] `POST /api/auth/register` creates user + sends verify email
- [ ] `POST /api/auth/login` returns access + refresh tokens
- [ ] `npm run dev` in `client/` — starts on port 3000 with no errors
- [ ] Landing page at `http://localhost:3000/` renders correctly
- [ ] Auth pages at `/auth/login`, `/auth/register` render correctly
- [ ] End-to-end: register → verify email → login → `/api/auth/me` returns user

---

## Phase 1 Status: ✅ COMPLETE (pending DB setup for final verification)
