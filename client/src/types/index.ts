export type ApplicationStatus =
  | 'Applied'
  | 'Phone Screen'
  | 'Interview'
  | 'Offer'
  | 'Rejected';

export interface Application {
  _id: string;
  userId: string;
  company: string;
  role: string;
  jdLink: string;
  notes: string;
  dateApplied: string;
  status: ApplicationStatus;
  salaryRange: string;
  location: string;
  seniority: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  resumeSuggestions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ParsedJob {
  company: string;
  role: string;
  seniority: string;
  location: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  salaryRange: string;
}

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

export const COLUMNS: ApplicationStatus[] = [
  'Applied',
  'Phone Screen',
  'Interview',
  'Offer',
  'Rejected',
];

export const STATUS_META: Record<
  ApplicationStatus,
  { emoji: string; color: string; bg: string; border: string; darkBg: string }
> = {
  Applied:       { emoji: '📤', color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200',   darkBg: 'dark:bg-blue-900/20' },
  'Phone Screen':{ emoji: '📞', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', darkBg: 'dark:bg-purple-900/20' },
  Interview:     { emoji: '🎤', color: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200',  darkBg: 'dark:bg-amber-900/20' },
  Offer:         { emoji: '🎉', color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200',  darkBg: 'dark:bg-green-900/20' },
  Rejected:      { emoji: '💔', color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200',    darkBg: 'dark:bg-red-900/20' },
};

export type CreateApplicationInput = Omit<
  Application,
  '_id' | 'userId' | 'createdAt' | 'updatedAt'
>;
