import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // ─── Admin User ────────────────────────────────────────────────────────────
  const adminPasswordHash = await bcrypt.hash('Admin@123!', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@jobkatta.in' },
    update: {},
    create: {
      email: 'admin@jobkatta.in',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      isEmailVerified: true,
      isActive: true,
      admin: {
        create: { name: 'Super Admin' },
      },
    },
  });
  console.log('Admin user created:', adminUser.email);

  // ─── Skills ────────────────────────────────────────────────────────────────
  const skillsData = [
    { name: 'MS Office', category: 'Technical' },
    { name: 'Tally', category: 'Technical' },
    { name: 'React', category: 'Technical' },
    { name: 'Node.js', category: 'Technical' },
    { name: 'Java', category: 'Technical' },
    { name: 'Python', category: 'Technical' },
    { name: 'PHP', category: 'Technical' },
    { name: 'MySQL', category: 'Technical' },
    { name: 'SEO', category: 'Technical' },
    { name: 'Graphic Design', category: 'Technical' },
    { name: 'Data Entry', category: 'Technical' },
    { name: 'AutoCAD', category: 'Technical' },
    { name: 'Communication', category: 'Soft Skills' },
    { name: 'Leadership', category: 'Soft Skills' },
    { name: 'Teamwork', category: 'Soft Skills' },
    { name: 'Problem Solving', category: 'Soft Skills' },
    { name: 'Time Management', category: 'Soft Skills' },
    { name: 'Sales', category: 'Sales' },
    { name: 'Telecalling', category: 'Sales' },
    { name: 'Customer Service', category: 'Sales' },
    { name: 'Business Development', category: 'Sales' },
    { name: 'Nursing', category: 'Healthcare' },
    { name: 'Billing', category: 'Healthcare' },
    { name: 'Patient Care', category: 'Healthcare' },
    { name: 'Teaching', category: 'Teaching' },
    { name: 'Curriculum Development', category: 'Teaching' },
    { name: 'Machine Operation', category: 'Manufacturing' },
    { name: 'Quality Control', category: 'Manufacturing' },
    { name: 'Cooking', category: 'Hospitality' },
    { name: 'Driving', category: 'Logistics' },
    { name: 'Accounting', category: 'Finance' },
    { name: 'GST Filing', category: 'Finance' },
  ];

  for (const skill of skillsData) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: {},
      create: skill,
    });
  }
  console.log(`${skillsData.length} skills seeded`);

  // ─── Sample Employers ──────────────────────────────────────────────────────
  const emp1Password = await bcrypt.hash('Employer@123!', 10);

  const employer1User = await prisma.user.upsert({
    where: { email: 'hr@puneshop.in' },
    update: {},
    create: {
      email: 'hr@puneshop.in',
      passwordHash: emp1Password,
      role: 'EMPLOYER',
      isEmailVerified: true,
      isActive: true,
      employer: {
        create: {
          companyName: 'Pune Retail Hub',
          companyEmail: 'hr@puneshop.in',
          contactNumber: '9876543210',
          industry: 'Retail',
          companySize: '11-50',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411001',
          isVerified: true,
          planType: 'STANDARD',
          planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          activeJobLimit: 5,
        },
      },
    },
  });

  const employer2User = await prisma.user.upsert({
    where: { email: 'careers@nagpurhospital.in' },
    update: {},
    create: {
      email: 'careers@nagpurhospital.in',
      passwordHash: emp1Password,
      role: 'EMPLOYER',
      isEmailVerified: true,
      isActive: true,
      employer: {
        create: {
          companyName: 'Nagpur City Hospital',
          companyEmail: 'careers@nagpurhospital.in',
          contactNumber: '9123456789',
          industry: 'Healthcare',
          companySize: '51-200',
          city: 'Nagpur',
          state: 'Maharashtra',
          pincode: '440001',
          isVerified: true,
          planType: 'BASIC',
          planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          activeJobLimit: 1,
        },
      },
    },
  });

  const employer3User = await prisma.user.upsert({
    where: { email: 'jobs@nashikit.in' },
    update: {},
    create: {
      email: 'jobs@nashikit.in',
      passwordHash: emp1Password,
      role: 'EMPLOYER',
      isEmailVerified: true,
      isActive: true,
      employer: {
        create: {
          companyName: 'Nashik IT Solutions',
          companyEmail: 'jobs@nashikit.in',
          contactNumber: '9988776655',
          industry: 'IT / Software',
          companySize: '11-50',
          city: 'Nashik',
          state: 'Maharashtra',
          pincode: '422001',
          isVerified: true,
          planType: 'ANNUAL',
          planExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          activeJobLimit: 10,
        },
      },
    },
  });

  console.log('Sample employers created');

  // ─── Sample Jobs ───────────────────────────────────────────────────────────
  const employer1 = await prisma.employer.findUnique({ where: { userId: employer1User.id } });
  const employer2 = await prisma.employer.findUnique({ where: { userId: employer2User.id } });
  const employer3 = await prisma.employer.findUnique({ where: { userId: employer3User.id } });

  const reactSkill = await prisma.skill.findUnique({ where: { name: 'React' } });
  const nodeSkill = await prisma.skill.findUnique({ where: { name: 'Node.js' } });
  const salesSkill = await prisma.skill.findUnique({ where: { name: 'Sales' } });
  const nursingSkill = await prisma.skill.findUnique({ where: { name: 'Nursing' } });

  await prisma.job.createMany({
    data: [
      {
        employerId: employer3.id,
        title: 'React Developer',
        description: 'We are looking for a skilled React developer to join our growing team in Nashik. You will be responsible for building modern web applications using React.js and related technologies. Minimum 1 year of experience required. Work from our Nashik office with flexible hours.',
        category: 'IT / Software',
        employmentType: 'FULL_TIME',
        salaryMin: 25000,
        salaryMax: 50000,
        openings: 2,
        experienceMin: 1,
        experienceMax: 3,
        city: 'Nashik',
        state: 'Maharashtra',
        status: 'ACTIVE',
        approvedAt: new Date(),
        isFeatured: true,
        isPriority: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        employerId: employer3.id,
        title: 'Node.js Backend Developer',
        description: 'Join our backend team to build scalable REST APIs using Node.js and Express. Experience with MySQL and Prisma ORM preferred. We offer competitive salary and a collaborative work environment in Nashik.',
        category: 'IT / Software',
        employmentType: 'FULL_TIME',
        salaryMin: 30000,
        salaryMax: 60000,
        openings: 1,
        experienceMin: 1,
        experienceMax: 4,
        city: 'Nashik',
        state: 'Maharashtra',
        status: 'ACTIVE',
        approvedAt: new Date(),
        isPriority: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        employerId: employer1.id,
        title: 'Sales Executive',
        description: 'Exciting opportunity for a motivated sales executive at Pune Retail Hub. You will be responsible for customer acquisition, relationship management, and achieving monthly sales targets. Prior retail or FMCG sales experience preferred.',
        category: 'Sales & Marketing',
        employmentType: 'FULL_TIME',
        salaryMin: 15000,
        salaryMax: 25000,
        openings: 3,
        experienceMin: 0,
        city: 'Pune',
        state: 'Maharashtra',
        status: 'ACTIVE',
        approvedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        employerId: employer1.id,
        title: 'Store Manager',
        description: 'We are hiring an experienced Store Manager for our flagship Pune outlet. You will oversee day-to-day operations, manage staff, ensure customer satisfaction, and handle inventory management.',
        category: 'Retail',
        employmentType: 'FULL_TIME',
        salaryMin: 20000,
        salaryMax: 35000,
        openings: 1,
        experienceMin: 2,
        experienceMax: 5,
        city: 'Pune',
        state: 'Maharashtra',
        status: 'ACTIVE',
        approvedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        employerId: employer2.id,
        title: 'Staff Nurse',
        description: 'Nagpur City Hospital is seeking qualified Staff Nurses for our general ward. Candidates must hold a valid nursing degree (B.Sc. Nursing or GNM) and have at least 1 year of clinical experience. Night shifts may be required.',
        category: 'Healthcare',
        employmentType: 'FULL_TIME',
        salaryMin: 18000,
        salaryMax: 28000,
        openings: 4,
        experienceMin: 1,
        city: 'Nagpur',
        state: 'Maharashtra',
        status: 'ACTIVE',
        approvedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        employerId: employer2.id,
        title: 'Medical Billing Executive',
        description: 'Looking for a detail-oriented Medical Billing Executive to manage patient billing, insurance claims, and accounts receivable. Knowledge of hospital billing software and TPA procedures is an advantage.',
        category: 'Finance & Accounts',
        employmentType: 'FULL_TIME',
        salaryMin: 14000,
        salaryMax: 22000,
        openings: 2,
        experienceMin: 0,
        city: 'Nagpur',
        state: 'Maharashtra',
        status: 'ACTIVE',
        approvedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    ],
    skipDuplicates: true,
  });

  // Attach skills to jobs
  const reactJob = await prisma.job.findFirst({ where: { title: 'React Developer', employerId: employer3.id } });
  const nodeJob = await prisma.job.findFirst({ where: { title: 'Node.js Backend Developer', employerId: employer3.id } });
  const salesJob = await prisma.job.findFirst({ where: { title: 'Sales Executive', employerId: employer1.id } });
  const nurseJob = await prisma.job.findFirst({ where: { title: 'Staff Nurse', employerId: employer2.id } });

  if (reactJob && reactSkill) {
    await prisma.jobSkill.upsert({
      where: { jobId_skillId: { jobId: reactJob.id, skillId: reactSkill.id } },
      update: {},
      create: { jobId: reactJob.id, skillId: reactSkill.id },
    });
  }
  if (nodeJob && nodeSkill) {
    await prisma.jobSkill.upsert({
      where: { jobId_skillId: { jobId: nodeJob.id, skillId: nodeSkill.id } },
      update: {},
      create: { jobId: nodeJob.id, skillId: nodeSkill.id },
    });
  }
  if (salesJob && salesSkill) {
    await prisma.jobSkill.upsert({
      where: { jobId_skillId: { jobId: salesJob.id, skillId: salesSkill.id } },
      update: {},
      create: { jobId: salesJob.id, skillId: salesSkill.id },
    });
  }
  if (nurseJob && nursingSkill) {
    await prisma.jobSkill.upsert({
      where: { jobId_skillId: { jobId: nurseJob.id, skillId: nursingSkill.id } },
      update: {},
      create: { jobId: nurseJob.id, skillId: nursingSkill.id },
    });
  }

  console.log('Sample jobs created');

  // ─── Sample Candidates ─────────────────────────────────────────────────────
  const candPassword = await bcrypt.hash('Candidate@123!', 10);

  const cand1User = await prisma.user.upsert({
    where: { email: 'rahul.sharma@example.com' },
    update: {},
    create: {
      email: 'rahul.sharma@example.com',
      passwordHash: candPassword,
      role: 'CANDIDATE',
      isEmailVerified: true,
      isActive: true,
      candidate: {
        create: {
          firstName: 'Rahul',
          lastName: 'Sharma',
          city: 'Nashik',
          state: 'Maharashtra',
          pincode: '422005',
          isFresher: false,
          totalExperienceYrs: 2,
          openToWork: true,
          profileComplete: 85,
          bio: 'Passionate React developer with 2 years of experience building web apps.',
          planType: 'PREMIUM',
          planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  const cand2User = await prisma.user.upsert({
    where: { email: 'priya.patil@example.com' },
    update: {},
    create: {
      email: 'priya.patil@example.com',
      passwordHash: candPassword,
      role: 'CANDIDATE',
      isEmailVerified: true,
      isActive: true,
      candidate: {
        create: {
          firstName: 'Priya',
          lastName: 'Patil',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411002',
          isFresher: true,
          totalExperienceYrs: 0,
          openToWork: true,
          profileComplete: 70,
          bio: 'MBA fresher looking for sales and marketing opportunities.',
        },
      },
    },
  });

  const cand3User = await prisma.user.upsert({
    where: { email: 'suresh.nagre@example.com' },
    update: {},
    create: {
      email: 'suresh.nagre@example.com',
      passwordHash: candPassword,
      role: 'CANDIDATE',
      isEmailVerified: true,
      isActive: true,
      candidate: {
        create: {
          firstName: 'Suresh',
          lastName: 'Nagre',
          city: 'Nagpur',
          state: 'Maharashtra',
          pincode: '440010',
          isFresher: false,
          totalExperienceYrs: 5,
          openToWork: true,
          profileComplete: 100,
          bio: 'Experienced nurse with 5 years in critical care.',
        },
      },
    },
  });

  const cand4User = await prisma.user.upsert({
    where: { email: 'anjali.desai@example.com' },
    update: {},
    create: {
      email: 'anjali.desai@example.com',
      passwordHash: candPassword,
      role: 'CANDIDATE',
      isEmailVerified: true,
      isActive: true,
      candidate: {
        create: {
          firstName: 'Anjali',
          lastName: 'Desai',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411007',
          isFresher: false,
          totalExperienceYrs: 3,
          openToWork: false,
          profileComplete: 60,
        },
      },
    },
  });

  const cand5User = await prisma.user.upsert({
    where: { email: 'vikram.more@example.com' },
    update: {},
    create: {
      email: 'vikram.more@example.com',
      passwordHash: candPassword,
      role: 'CANDIDATE',
      isEmailVerified: true,
      isActive: true,
      candidate: {
        create: {
          firstName: 'Vikram',
          lastName: 'More',
          city: 'Nashik',
          state: 'Maharashtra',
          pincode: '422001',
          isFresher: false,
          totalExperienceYrs: 1,
          openToWork: true,
          profileComplete: 75,
        },
      },
    },
  });

  console.log('Sample candidates created');

  // ─── Sample Applications ───────────────────────────────────────────────────
  const cand1 = await prisma.candidate.findUnique({ where: { userId: cand1User.id } });
  const cand2 = await prisma.candidate.findUnique({ where: { userId: cand2User.id } });

  if (cand1 && reactJob) {
    await prisma.application.upsert({
      where: { candidateId_jobId: { candidateId: cand1.id, jobId: reactJob.id } },
      update: {},
      create: {
        candidateId: cand1.id,
        jobId: reactJob.id,
        status: 'SHORTLISTED',
        coverNote: 'I have 2 years of React experience and I am very interested in this position.',
      },
    });
  }

  if (cand2 && salesJob) {
    await prisma.application.upsert({
      where: { candidateId_jobId: { candidateId: cand2.id, jobId: salesJob.id } },
      update: {},
      create: {
        candidateId: cand2.id,
        jobId: salesJob.id,
        status: 'APPLIED',
        coverNote: 'Eager to start my sales career at Pune Retail Hub.',
      },
    });
  }

  console.log('Sample applications created');

  // ─── Sample Subscriptions ──────────────────────────────────────────────────
  await prisma.subscription.createMany({
    data: [
      {
        userId: employer1User.id,
        employerId: employer1.id,
        planType: 'STANDARD',
        amount: 1499,
        currency: 'INR',
        status: 'paid',
        razorpayOrderId: 'order_demo_001',
        razorpayPaymentId: 'pay_demo_001',
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        userId: cand1User.id,
        candidateId: cand1.id,
        planType: 'PREMIUM',
        amount: 99,
        currency: 'INR',
        status: 'paid',
        razorpayOrderId: 'order_demo_002',
        razorpayPaymentId: 'pay_demo_002',
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    ],
    skipDuplicates: true,
  });

  console.log('Sample subscriptions created');
  console.log('\n✅ Seed complete!');
  console.log('Admin: admin@jobkatta.in / Admin@123!');
  console.log('Employer: hr@puneshop.in / Employer@123!');
  console.log('Candidate: rahul.sharma@example.com / Candidate@123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
