export const JOB_CATEGORIES = [
  'IT / Software', 'Sales & Marketing', 'Healthcare', 'Education & Training',
  'Manufacturing', 'Retail', 'Hospitality & Food', 'Finance & Accounts',
  'Administration', 'Logistics & Delivery', 'Construction', 'Automobile',
  'Security', 'Customer Support', 'Other',
];

export const EMPLOYMENT_TYPES = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'FREELANCE', label: 'Freelance' },
  { value: 'CONTRACT', label: 'Contract' },
];

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

export const APPLICATION_STATUS_COLORS: Record<string, string> = {
  APPLIED: 'status-applied',
  VIEWED: 'status-viewed',
  SHORTLISTED: 'status-shortlisted',
  INTERVIEWING: 'status-interviewing',
  HIRED: 'status-hired',
  REJECTED: 'status-rejected',
};

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  APPLIED: 'Applied', VIEWED: 'Viewed', SHORTLISTED: 'Shortlisted',
  INTERVIEWING: 'Interviewing', HIRED: 'Hired', REJECTED: 'Rejected',
};

export const SHIFT_TIMINGS = ['Morning', 'Evening', 'Night', 'Flexible'];

export const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'];

export const CANDIDATE_FREE_APP_LIMIT = 5;
