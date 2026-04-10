import mongoose from 'mongoose';
import { Application, IApplication } from '../models/Application';
import { createError } from '../middleware/errorHandler';
import { ApplicationStatus } from '../types';

export interface CreateApplicationDto {
  company: string;
  role: string;
  jdLink?: string;
  notes?: string;
  dateApplied?: string;
  status?: ApplicationStatus;
  salaryRange?: string;
  location?: string;
  seniority?: string;
  requiredSkills?: string[];
  niceToHaveSkills?: string[];
  resumeSuggestions?: string[];
}

export async function getAllApplications(userId: string): Promise<IApplication[]> {
  return Application.find({ userId }).sort({ createdAt: -1 });
}

export async function createApplication(
  userId: string,
  dto: CreateApplicationDto
): Promise<IApplication> {
  return Application.create({ ...dto, userId });
}

export async function updateApplication(
  id: string,
  userId: string,
  dto: Partial<CreateApplicationDto>
): Promise<IApplication> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError('Invalid application ID. Nice try though. 🎲', 400);
  }

  const app = await Application.findOneAndUpdate(
    { _id: id, userId },
    { $set: dto },
    { new: true, runValidators: true }
  );

  if (!app) throw createError('Application not found or not yours. 🔍', 404);
  return app;
}

export async function deleteApplication(
  id: string,
  userId: string
): Promise<void> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError('Invalid application ID.', 400);
  }

  const result = await Application.findOneAndDelete({ _id: id, userId });
  if (!result) throw createError('Application not found. Already deleted? 👻', 404);
}
