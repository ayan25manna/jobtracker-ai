import mongoose, { Document, Schema } from 'mongoose';
import { ApplicationStatus } from '../types';

export interface IApplication extends Document {
  userId: mongoose.Types.ObjectId;
  company: string;
  role: string;
  jdLink: string;
  notes: string;
  dateApplied: Date;
  status: ApplicationStatus;
  salaryRange: string;
  location: string;
  seniority: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  resumeSuggestions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    jdLink: { type: String, default: '' },
    notes: { type: String, default: '' },
    dateApplied: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['Applied', 'Phone Screen', 'Interview', 'Offer', 'Rejected'],
      default: 'Applied',
    },
    salaryRange: { type: String, default: '' },
    location: { type: String, default: '' },
    seniority: { type: String, default: '' },
    requiredSkills: { type: [String], default: [] },
    niceToHaveSkills: { type: [String], default: [] },
    resumeSuggestions: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Application = mongoose.model<IApplication>(
  'Application',
  applicationSchema
);
