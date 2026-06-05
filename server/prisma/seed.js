import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  const adminHash = await bcrypt.hash('Admin@123!', 10);
  await db.user.upsert({
    where: { email: 'admin@jobkatta.in' },
    update: {},
    create: {
      email: 'admin@jobkatta.in', passwordHash: adminHash, role: 'ADMIN',
      isEmailVerified: true, isActive: true,
      admin: { create: { name: 'Super Admin' } },
    },
  });
  console.log('Admin seeded');

  const skills = [
    { name: 'MS Office', category: 'Technical' }, { name: 'Tally', category: 'Technical' },
    { name: 'React', category: 'Technical' }, { name: 'Node.js', category: 'Technical' },
    { name: 'Java', category: 'Technical' }, { name: 'Python', category: 'Technical' },
    { name: 'PHP', category: 'Technical' }, { name: 'MySQL', category: 'Technical' },
    { name: 'SEO', category: 'Technical' }, { name: 'Graphic Design', category: 'Technical' },
    { name: 'Data Entry', category: 'Technical' }, { name: 'AutoCAD', category: 'Technical' },
    { name: 'Communication', category: 'Soft Skills' }, { name: 'Leadership', category: 'Soft Skills' },
    { name: 'Teamwork', category: 'Soft Skills' }, { name: 'Problem Solving', category: 'Soft Skills' },
    { name: 'Time Management', category: 'Soft Skills' },
    { name: 'Sales', category: 'Sales' }, { name: 'Telecalling', category: 'Sales' },
    { name: 'Customer Service', category: 'Sales' }, { name: 'Business Development', category: 'Sales' },
    { name: 'Nursing', category: 'Healthcare' }, { name: 'Billing', category: 'Healthcare' },
    { name: 'Patient Care', category: 'Healthcare' },
    { name: 'Teaching', category: 'Teaching' }, { name: 'Curriculum Development', category: 'Teaching' },
    { name: 'Machine Operation', category: 'Manufacturing' }, { name: 'Quality Control', category: 'Manufacturing' },
    { name: 'Cooking', category: 'Hospitality' },
    { name: 'Driving', category: 'Logistics' },
    { name: 'Accounting', category: 'Finance' }, { name: 'GST Filing', category: 'Finance' },
  ];
  for (const s of skills) await db.skill.upsert({ where: { name: s.name }, update: {}, create: s });
  console.log(`${skills.length} skills seeded`);

  const empHash = await bcrypt.hash('Employer@123!', 10);
  const emp1 = await db.user.upsert({ where: { email: 'hr@puneshop.in' }, update: {}, create: { email: 'hr@puneshop.in', passwordHash: empHash, role: 'EMPLOYER', isEmailVerified: true, isActive: true, employer: { create: { companyName: 'Pune Retail Hub', companyEmail: 'hr@puneshop.in', contactNumber: '9876543210', industry: 'Retail', companySize: '11-50', city: 'Pune', state: 'Maharashtra', pincode: '411001', isVerified: true, planType: 'STANDARD', planExpiresAt: new Date(Date.now()+30*24*60*60*1000), activeJobLimit: 5 } } } });
  const emp2 = await db.user.upsert({ where: { email: 'careers@nagpurhospital.in' }, update: {}, create: { email: 'careers@nagpurhospital.in', passwordHash: empHash, role: 'EMPLOYER', isEmailVerified: true, isActive: true, employer: { create: { companyName: 'Nagpur City Hospital', companyEmail: 'careers@nagpurhospital.in', contactNumber: '9123456789', industry: 'Healthcare', companySize: '51-200', city: 'Nagpur', state: 'Maharashtra', pincode: '440001', isVerified: true, planType: 'BASIC', planExpiresAt: new Date(Date.now()+30*24*60*60*1000), activeJobLimit: 1 } } } });
  const emp3 = await db.user.upsert({ where: { email: 'jobs@nashikit.in' }, update: {}, create: { email: 'jobs@nashikit.in', passwordHash: empHash, role: 'EMPLOYER', isEmailVerified: true, isActive: true, employer: { create: { companyName: 'Nashik IT Solutions', companyEmail: 'jobs@nashikit.in', contactNumber: '9988776655', industry: 'IT / Software', companySize: '11-50', city: 'Nashik', state: 'Maharashtra', pincode: '422001', isVerified: true, planType: 'ANNUAL', planExpiresAt: new Date(Date.now()+365*24*60*60*1000), activeJobLimit: 10 } } } });
  console.log('Sample employers seeded');

  const employer1 = await db.employer.findUnique({ where: { userId: emp1.id } });
  const employer2 = await db.employer.findUnique({ where: { userId: emp2.id } });
  const employer3 = await db.employer.findUnique({ where: { userId: emp3.id } });

  await db.job.createMany({
    skipDuplicates: true,
    data: [
      { employerId: employer3.id, title: 'React Developer', description: 'We are looking for a skilled React developer to join our growing team in Nashik. You will be responsible for building modern web applications using React.js and related technologies. Minimum 1 year of experience required. Work from our Nashik office with flexible hours.', category: 'IT / Software', employmentType: 'FULL_TIME', salaryMin: 25000, salaryMax: 50000, openings: 2, experienceMin: 1, experienceMax: 3, city: 'Nashik', state: 'Maharashtra', status: 'ACTIVE', approvedAt: new Date(), isFeatured: true, isPriority: true, expiresAt: new Date(Date.now()+30*24*60*60*1000) },
      { employerId: employer3.id, title: 'Node.js Backend Developer', description: 'Join our backend team to build scalable REST APIs using Node.js and Express. Experience with MySQL and Prisma ORM preferred. We offer competitive salary and a collaborative work environment in Nashik.', category: 'IT / Software', employmentType: 'FULL_TIME', salaryMin: 30000, salaryMax: 60000, openings: 1, experienceMin: 1, experienceMax: 4, city: 'Nashik', state: 'Maharashtra', status: 'ACTIVE', approvedAt: new Date(), isPriority: true, expiresAt: new Date(Date.now()+30*24*60*60*1000) },
      { employerId: employer1.id, title: 'Sales Executive', description: 'Exciting opportunity for a motivated sales executive at Pune Retail Hub. You will be responsible for customer acquisition, relationship management, and achieving monthly sales targets.', category: 'Sales & Marketing', employmentType: 'FULL_TIME', salaryMin: 15000, salaryMax: 25000, openings: 3, experienceMin: 0, city: 'Pune', state: 'Maharashtra', status: 'ACTIVE', approvedAt: new Date(), expiresAt: new Date(Date.now()+30*24*60*60*1000) },
      { employerId: employer1.id, title: 'Store Manager', description: 'We are hiring an experienced Store Manager for our flagship Pune outlet. You will oversee day-to-day operations, manage staff, ensure customer satisfaction, and handle inventory management.', category: 'Retail', employmentType: 'FULL_TIME', salaryMin: 20000, salaryMax: 35000, openings: 1, experienceMin: 2, experienceMax: 5, city: 'Pune', state: 'Maharashtra', status: 'ACTIVE', approvedAt: new Date(), expiresAt: new Date(Date.now()+30*24*60*60*1000) },
      { employerId: employer2.id, title: 'Staff Nurse', description: 'Nagpur City Hospital is seeking qualified Staff Nurses for our general ward. Candidates must hold a valid nursing degree (B.Sc. Nursing or GNM) and have at least 1 year of clinical experience.', category: 'Healthcare', employmentType: 'FULL_TIME', salaryMin: 18000, salaryMax: 28000, openings: 4, experienceMin: 1, city: 'Nagpur', state: 'Maharashtra', status: 'ACTIVE', approvedAt: new Date(), expiresAt: new Date(Date.now()+30*24*60*60*1000) },
      { employerId: employer2.id, title: 'Medical Billing Executive', description: 'Looking for a detail-oriented Medical Billing Executive to manage patient billing, insurance claims, and accounts receivable.', category: 'Finance & Accounts', employmentType: 'FULL_TIME', salaryMin: 14000, salaryMax: 22000, openings: 2, experienceMin: 0, city: 'Nagpur', state: 'Maharashtra', status: 'ACTIVE', approvedAt: new Date(), expiresAt: new Date(Date.now()+30*24*60*60*1000) },
    ],
  });
  console.log('Sample jobs seeded');

  const candHash = await bcrypt.hash('Candidate@123!', 10);
  const cand1 = await db.user.upsert({ where: { email: 'rahul.sharma@example.com' }, update: {}, create: { email: 'rahul.sharma@example.com', passwordHash: candHash, role: 'CANDIDATE', isEmailVerified: true, isActive: true, candidate: { create: { firstName: 'Rahul', lastName: 'Sharma', city: 'Nashik', state: 'Maharashtra', pincode: '422005', isFresher: false, totalExperienceYrs: 2, openToWork: true, profileComplete: 85, bio: 'Passionate React developer with 2 years of experience.', planType: 'PREMIUM', planExpiresAt: new Date(Date.now()+30*24*60*60*1000) } } } });
  const cand2 = await db.user.upsert({ where: { email: 'priya.patil@example.com' }, update: {}, create: { email: 'priya.patil@example.com', passwordHash: candHash, role: 'CANDIDATE', isEmailVerified: true, isActive: true, candidate: { create: { firstName: 'Priya', lastName: 'Patil', city: 'Pune', state: 'Maharashtra', isFresher: true, openToWork: true, profileComplete: 70 } } } });
  await db.user.upsert({ where: { email: 'suresh.nagre@example.com' }, update: {}, create: { email: 'suresh.nagre@example.com', passwordHash: candHash, role: 'CANDIDATE', isEmailVerified: true, isActive: true, candidate: { create: { firstName: 'Suresh', lastName: 'Nagre', city: 'Nagpur', state: 'Maharashtra', isFresher: false, totalExperienceYrs: 5, openToWork: true, profileComplete: 100 } } } });
  await db.user.upsert({ where: { email: 'anjali.desai@example.com' }, update: {}, create: { email: 'anjali.desai@example.com', passwordHash: candHash, role: 'CANDIDATE', isEmailVerified: true, isActive: true, candidate: { create: { firstName: 'Anjali', lastName: 'Desai', city: 'Pune', state: 'Maharashtra', isFresher: false, totalExperienceYrs: 3, openToWork: false, profileComplete: 60 } } } });
  await db.user.upsert({ where: { email: 'vikram.more@example.com' }, update: {}, create: { email: 'vikram.more@example.com', passwordHash: candHash, role: 'CANDIDATE', isEmailVerified: true, isActive: true, candidate: { create: { firstName: 'Vikram', lastName: 'More', city: 'Nashik', state: 'Maharashtra', isFresher: false, totalExperienceYrs: 1, openToWork: true, profileComplete: 75 } } } });
  console.log('Sample candidates seeded');

  const candidate1 = await db.candidate.findUnique({ where: { userId: cand1.id } });
  const candidate2 = await db.candidate.findUnique({ where: { userId: cand2.id } });
  const reactJob = await db.job.findFirst({ where: { title: 'React Developer', employerId: employer3.id } });
  const salesJob = await db.job.findFirst({ where: { title: 'Sales Executive', employerId: employer1.id } });

  if (candidate1 && reactJob) {
    await db.application.upsert({ where: { candidateId_jobId: { candidateId: candidate1.id, jobId: reactJob.id } }, update: {}, create: { candidateId: candidate1.id, jobId: reactJob.id, status: 'SHORTLISTED', coverNote: 'I have 2 years of React experience.' } });
  }
  if (candidate2 && salesJob) {
    await db.application.upsert({ where: { candidateId_jobId: { candidateId: candidate2.id, jobId: salesJob.id } }, update: {}, create: { candidateId: candidate2.id, jobId: salesJob.id, status: 'APPLIED', coverNote: 'Eager to start my sales career.' } });
  }
  console.log('Applications seeded');

  await db.subscription.createMany({
    skipDuplicates: true,
    data: [
      { userId: emp1.id, employerId: employer1.id, planType: 'STANDARD', amount: 1499, currency: 'INR', status: 'paid', razorpayOrderId: 'order_demo_001', razorpayPaymentId: 'pay_demo_001', startsAt: new Date(), expiresAt: new Date(Date.now()+30*24*60*60*1000) },
      { userId: cand1.id, candidateId: candidate1.id, planType: 'PREMIUM', amount: 99, currency: 'INR', status: 'paid', razorpayOrderId: 'order_demo_002', razorpayPaymentId: 'pay_demo_002', startsAt: new Date(), expiresAt: new Date(Date.now()+30*24*60*60*1000) },
    ],
  });
  console.log('Subscriptions seeded');

  console.log('\nSeed complete!');
  console.log('Admin:     admin@jobkatta.in     / Admin@123!');
  console.log('Employer:  hr@puneshop.in        / Employer@123!');
  console.log('Candidate: rahul.sharma@example.com / Candidate@123!');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
