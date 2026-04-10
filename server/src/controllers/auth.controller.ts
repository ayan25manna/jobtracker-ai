import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser } from '../services/authService';
import { createError } from '../middleware/errorHandler';

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      throw createError('Email and password are required. Both. Please. 🙏', 400);
    }

    const result = await registerUser(email.trim(), password);
    res.status(201).json({ message: 'Account created! Go get those offers. 🚀', ...result });
  } catch (err) {
    next(err);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      throw createError('Need both email and password. We\'re not that easy. 😏', 400);
    }

    const result = await loginUser(email.trim(), password);
    res.status(200).json({ message: 'Welcome back, job hunter! 🎯', ...result });
  } catch (err) {
    next(err);
  }
}

export function getMe(req: Request, res: Response): void {
  res.json({ user: req.user });
}
