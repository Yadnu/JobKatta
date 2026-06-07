import { z } from 'zod';

const indianMobile = z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number');

export const registerSchema = z.object({
  role: z.enum(['CANDIDATE', 'EMPLOYER']),
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Min 8 characters').regex(/[A-Z]/, 'At least one uppercase letter').regex(/[0-9]/, 'At least one digit'),
  firstName: z.string().min(2, 'Min 2 characters').max(50).optional(),
  lastName: z.string().min(1, 'Required').max(50).optional(),
  companyName: z.string().min(2, 'Min 2 characters').max(100).optional(),
  city: z.string().min(2, 'Required'),
  state: z.string().min(2, 'Required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password required'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const otpSchema = z.object({
  mobile: indianMobile,
});
export type OtpInput = z.infer<typeof otpSchema>;

export const verifyOtpSchema = z.object({
  mobile: indianMobile,
  otp: z.string().length(6, '6-digit OTP required'),
});
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Valid email required'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export const profileStep1Schema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(1).max(50),
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']).optional(),
  mobile: indianMobile.optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().length(6).regex(/^\d+$/).optional().or(z.literal('')),
  addressLine1: z.string().max(200).optional(),
  dob: z.string().optional(),
});

export const educationSchema = z.object({
  degree: z.string().min(2),
  institution: z.string().min(2),
  fieldOfStudy: z.string().optional(),
  board: z.string().optional(),
  percentage: z.number().min(0).max(100).optional(),
  startYear: z.number().int().min(1980).max(new Date().getFullYear()),
  endYear: z.number().int().min(1980).optional(),
  isCurrently: z.boolean(),
});
export type EducationInput = z.infer<typeof educationSchema>;

export const experienceSchema = z.object({
  jobTitle: z.string().min(2),
  companyName: z.string().min(2),
  city: z.string().optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'FREELANCE', 'CONTRACT']).optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  isCurrent: z.boolean(),
  description: z.string().max(1000).optional(),
});
export type ExperienceInput = z.infer<typeof experienceSchema>;

export const preferencesSchema = z.object({
  preferredRoles: z.string().max(200).optional(),
  preferredCities: z.string().max(200).optional(),
  preferredEmpType: z.string().optional(),
  expectedSalaryMin: z.number().min(0).optional(),
  expectedSalaryMax: z.number().min(0).optional(),
  openToWork: z.boolean(),
});
export type PreferencesInput = z.infer<typeof preferencesSchema>;

export const jobPostSchema = z.object({
  title: z.string().min(5, 'Min 5 characters').max(100),
  category: z.string().min(1, 'Category required'),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'FREELANCE', 'CONTRACT']),
  description: z.string().min(100, 'Min 100 characters'),
  requirements: z.string().optional(),
  hiringProcess: z.string().optional(),
  salaryMin: z.number().positive().optional(),
  salaryMax: z.number().positive().optional(),
  hideSalary: z.boolean().default(false),
  isSalaryNegotiable: z.boolean().default(false),
  openings: z.number().int().min(1).default(1),
  experienceMin: z.number().int().min(0).default(0),
  experienceMax: z.number().int().optional(),
  qualification: z.string().optional(),
  shiftTiming: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().optional(),
  isRemote: z.boolean().default(false),
  applicationDeadline: z.string().optional(),
  skills: z.array(z.string()).min(1, 'Select at least 1 skill'),
});

export type JobPostInput = z.infer<typeof jobPostSchema>;
