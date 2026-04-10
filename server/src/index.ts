import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes';
import applicationRoutes from './routes/application.routes';
import aiRoutes from './routes/ai.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT ?? 5000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '1mb' }));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Server is alive and caffeinated ☕' });
});

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found. Wrong turn? 🗺️' });
});

// ── Global error handler ────────────────────────────────────────────────────
app.use(errorHandler);

// ── DB + Listen ─────────────────────────────────────────────────────────────
async function bootstrap(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('MONGODB_URI is not set in .env');

  await mongoose.connect(mongoUri);
  console.log('🍃 MongoDB connected');

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
