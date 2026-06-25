export type Role = 'CANDIDATE' | 'EMPLOYER' | 'ADMIN';
export type PlanType = 'FREE' | 'PREMIUM' | 'BASIC' | 'STANDARD' | 'ANNUAL';
export type JobStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'EXPIRED' | 'REJECTED' | 'CLOSED';
export type ApplicationStatus = 'APPLIED' | 'VIEWED' | 'SHORTLISTED' | 'INTERVIEWING' | 'HIRED' | 'REJECTED';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'FREELANCE' | 'CONTRACT';

export interface User {
  id: string;
  email?: string;
  mobile?: string;
  role: Role;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  isActive: boolean;
  createdAt: string;
  candidate?: CandidateSummary;
  employer?: EmployerSummary;
}

export interface CandidateSummary {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  city: string;
  state: string;
  profileComplete: number;
  openToWork: boolean;
  planType: PlanType;
  planExpiresAt?: string;
}

export interface Candidate extends CandidateSummary {
  gender?: string;
  dob?: string;
  mobile?: string;
  email?: string;
  addressLine1?: string;
  pincode?: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  bio?: string;
  isFresher: boolean;
  totalExperienceYrs: number;
  preferredRoles?: string;
  preferredIndustries?: string;
  preferredCities?: string;
  preferredEmpType?: string;
  expectedSalaryMin?: number;
  expectedSalaryMax?: number;
  appCountThisMonth: number;
  educations: Education[];
  experiences: Experience[];
  skills: CandidateSkill[];
  createdAt: string;
  updatedAt: string;
}

export interface Education {
  id: string;
  degree: string;
  fieldOfStudy?: string;
  institution: string;
  board?: string;
  percentage?: number;
  startYear: number;
  endYear?: number;
  isCurrently: boolean;
}

export interface Experience {
  id: string;
  jobTitle: string;
  companyName: string;
  city?: string;
  employmentType?: EmploymentType;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
}

export interface CandidateSkill {
  skillId: string;
  skill: Skill;
}

export interface Skill {
  id: string;
  name: string;
  category?: string;
}

export interface EmployerSummary {
  id: string;
  companyName: string;
  logoUrl?: string;
  city: string;
  state: string;
  isVerified: boolean;
  planType: PlanType;
  planExpiresAt?: string;
  activeJobLimit: number;
}

export interface Employer extends EmployerSummary {
  companyEmail?: string;
  contactNumber?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  foundedYear?: number;
  description?: string;
  addressLine1?: string;
  pincode?: string;
  gstNumber?: string;
  cinNumber?: string;
  hrName?: string;
  hrDesignation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  employerId: string;
  employer: EmployerSummary;
  title: string;
  description: string;
  requirements?: string;
  hiringProcess?: string;
  category: string;
  employmentType: EmploymentType;
  salaryMin?: number;
  salaryMax?: number;
  isSalaryNegotiable: boolean;
  hideSalary: boolean;
  openings: number;
  experienceMin: number;
  experienceMax?: number;
  qualification?: string;
  shiftTiming?: string;
  city: string;
  state: string;
  pincode?: string;
  isRemote: boolean;
  applicationDeadline?: string;
  status: JobStatus;
  isFeatured: boolean;
  isPriority: boolean;
  viewCount: number;
  applicationCount: number;
  expiresAt?: string;
  skills: JobSkill[];
  createdAt: string;
  updatedAt: string;
}

export interface JobSkill {
  skillId: string;
  skill: Skill;
}

export interface Application {
  id: string;
  candidateId: string;
  jobId: string;
  candidate?: Partial<Candidate>;
  job?: Partial<Job>;
  status: ApplicationStatus;
  coverNote?: string;
  resumeUrl?: string;
  internalNote?: string;
  followUpDate?: string;
  contactUnlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planType: PlanType;
  amount: number;
  currency: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  status: string;
  startsAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface EmailAlert {
  id: string;
  candidateId: string;
  keywords: string;
  city: string;
  jobType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  errors?: { field: string; message: string }[];
}

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: TicketStatus;
  adminReply?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicEmployerSummary {
  id: string;
  companyName: string;
  logoUrl?: string;
  city: string;
  state: string;
  industry?: string;
  companySize?: string;
  website?: string;
  description?: string;
  isVerified: boolean;
  foundedYear?: number;
  activeJobCount: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: Pick<User, 'id' | 'email' | 'role' | 'isEmailVerified'> & { mobile?: string };
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}
