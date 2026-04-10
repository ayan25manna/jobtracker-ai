import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { createError } from '../middleware/errorHandler';
import { JwtPayload } from '../types';

function signToken(payload: JwtPayload): string {
  // 1. Ensure the secret is never undefined
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  // 2. Cast the options as jwt.SignOptions to satisfy the compiler
  return jwt.sign(payload, secret, {
    expiresIn: (process.env.JWT_EXPIRES_IN as string) ?? '7d',
  } as jwt.SignOptions);
}

export async function registerUser(
  email: string,
  password: string
): Promise<{ token: string; user: { id: string; email: string } }> {
  const existing = await User.findOne({ email });
  if (existing) {
    throw createError(
      'That email is already taken. Great minds apply alike! 🧠',
      409
    );
  }

  const user = await User.create({ email, password });
  const payload: JwtPayload = { userId: user.id as string, email: user.email };
  const token = signToken(payload);

  return { token, user: { id: user.id as string, email: user.email } };
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ token: string; user: { id: string; email: string } }> {
  const user = await User.findOne({ email });

  if (!user || !(await user.comparePassword(password))) {
    throw createError(
      'Wrong credentials. Did you forget, or are you a robot? 🤖',
      401
    );
  }

  const payload: JwtPayload = { userId: user.id as string, email: user.email };
  const token = signToken(payload);

  return { token, user: { id: user.id as string, email: user.email } };
}
