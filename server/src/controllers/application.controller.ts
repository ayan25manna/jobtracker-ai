import { Request, Response, NextFunction } from 'express';
import * as svc from '../services/applicationService';

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const apps = await svc.getAllApplications(req.user!.userId);
    res.json(apps);
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const app = await svc.createApplication(req.user!.userId, req.body as svc.CreateApplicationDto);
    res.status(201).json(app);
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const app = await svc.updateApplication(req.params.id, req.user!.userId, req.body as Partial<svc.CreateApplicationDto>);
    res.json(app);
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await svc.deleteApplication(req.params.id, req.user!.userId);
    res.json({ message: 'Application deleted. Onward! 💨' });
  } catch (err) { next(err); }
}
