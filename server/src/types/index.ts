export type ApplicationStatus =
  | 'Applied'
  | 'Phone Screen'
  | 'Interview'
  | 'Offer'
  | 'Rejected';

export interface ParsedJob {
  company: string;
  role: string;
  seniority: string;
  location: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  salaryRange: string;
}

export interface ResumeSuggestionsResult {
  bullets: string[];
}

export interface JwtPayload {
  userId: string;
  email: string;
}

// Extend Express Request to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
