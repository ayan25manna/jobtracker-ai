import { api } from './axios';
import {
  Application,
  CreateApplicationInput,
  ParsedJob,
  AuthUser,
} from '@/types';

// ── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (email: string, password: string) =>
    api.post<{ token: string; user: AuthUser }>('/auth/register', { email, password }),
  login: (email: string, password: string) =>
    api.post<{ token: string; user: AuthUser }>('/auth/login', { email, password }),
  me: () => api.get<{ user: AuthUser }>('/auth/me'),
};

// ── Applications ────────────────────────────────────────────────────────────
export const applicationsApi = {
  getAll: () => api.get<Application[]>('/applications'),
  create: (data: CreateApplicationInput) =>
    api.post<Application>('/applications', data),
  update: (id: string, data: Partial<CreateApplicationInput>) =>
    api.patch<Application>(`/applications/${id}`, data),
  delete: (id: string) => api.delete(`/applications/${id}`),
};

// ── AI ──────────────────────────────────────────────────────────────────────
export const aiApi = {
  parse: (jobDescription: string) =>
    api.post<ParsedJob>('/ai/parse', { jobDescription }),
  suggest: (parsedJob: ParsedJob) =>
    api.post<{ bullets: string[] }>('/ai/suggest', parsedJob),
};
