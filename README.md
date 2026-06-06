# Job Katta

**Apni Naukri, Apne Shehar Mein** — Hyperlocal hiring platform for India

A full-stack job portal built for Tier 2 & Tier 3 Indian cities, connecting local candidates with local employers.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| State | Zustand (global), TanStack Query (server state) |
| Backend | Node.js 20 + Express.js (ESM) |
| ORM | Prisma + MySQL 8 |
| Auth | JWT (access + refresh) + bcrypt, Mobile OTP via MSG91 |
| Payments | Razorpay |
| Email | Nodemailer + Brevo SMTP |
| Uploads | Multer (photos, resumes, logos) |
| Jobs | node-cron (4 scheduled tasks) |
| Deployment | Hostinger VPS, PM2 cluster, Nginx, Let's Encrypt |

---

## Project Structure

```
JobKatta/
├── client/          # Next.js 14 frontend
│   └── src/
│       ├── app/
│       │   ├── (public)/   # Landing, browse jobs
│       │   ├── auth/        # Login, register, verify, reset
│       │   ├── candidate/   # Candidate dashboard & profile
│       │   ├── employer/    # Employer dashboard & job management
│       │   └── admin/       # Admin panel
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       ├── store/
│       └── types/
└── server/          # Express.js API
    ├── prisma/
    │   ├── schema.prisma
    │   └── seed.js
    └── src/
        ├── config/
        ├── controllers/
        ├── cron/
        ├── middleware/
        ├── routes/
        ├── services/
        ├── templates/emails/
        └── utils/
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- MySQL 8
- (Optional) Redis for future job queues

### Server Setup

```bash
cd server
cp .env.example .env       # fill in your values
npm install
npx prisma migrate dev --name init
node prisma/seed.js
npm run dev                # starts on port 5000
```

### Client Setup

```bash
cd client
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL
npm install
npm run dev                         # starts on port 3000
```

---

## Seed Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@jobkatta.in | Admin@123! |
| Employer | hr@puneshop.in | Employer@123! |
| Candidate | rahul.sharma@example.com | Candidate@123! |

---

## API Endpoints

| Module | Base Path |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login` |
| Candidate | `GET/PUT /api/candidate/profile` |
| Jobs | `GET /api/jobs`, `POST /api/jobs/:id/apply` |
| Employer | `POST /api/employer/jobs`, `GET /api/employer/jobs/:id/applications` |
| Admin | `GET /api/admin/stats`, `PUT /api/admin/jobs/:id/approve` |
| Payments | `POST /api/payments/create-order`, `POST /api/payments/verify` |
| Uploads | `POST /api/upload/photo`, `POST /api/upload/resume` |
| Support | `POST /api/support/tickets` |
| Skills | `GET /api/skills` |

---

## User Roles

- **Candidate** — profile, apply to jobs, track applications, upgrade to Premium
- **Employer** — post jobs (plan-gated), manage applicants via Kanban, unlock contacts
- **Admin** — approve/reject jobs, manage users, view revenue, handle support tickets

---

## Plans

### Candidate
| Plan | Price | Limit |
|---|---|---|
| Free | ₹0 | 5 applications/month |
| Premium Monthly | ₹99 | Unlimited |
| Premium Yearly | ₹999 | Unlimited |

### Employer
| Plan | Price | Active Jobs | Validity |
|---|---|---|---|
| Basic | ₹499 | 1 | 30 days |
| Standard | ₹1,499 | 5 | 30 days |
| Annual | ₹4,999 | 10 | 365 days |
