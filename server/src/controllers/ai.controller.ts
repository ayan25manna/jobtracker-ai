import { Request, Response, NextFunction } from 'express';
import { parseJobDescription, generateResumeSuggestions } from '../services/aiService';
import { createError } from '../middleware/errorHandler';
import { ParsedJob } from '../types';

export async function parse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { jobDescription } = req.body as { jobDescription?: string };
    if (!jobDescription?.trim()) {
      throw createError('Paste a job description first. We can\'t parse vibes. ✨', 400);
    }
    const result = await parseJobDescription(jobDescription);
    res.json(result);
  } catch (err) { next(err); }
}

export async function suggest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsedJob = req.body as ParsedJob;
    if (!parsedJob?.role) {
      throw createError('Need at least a role to generate suggestions.', 400);
    }
    const result = await generateResumeSuggestions(parsedJob);
    res.json(result);
  } catch (err) { next(err); }
}
