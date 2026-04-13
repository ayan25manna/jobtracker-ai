import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes';
import applicationRoutes from './routes/application.routes';
import aiRoutes from './routes/ai.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isVercel = origin.endsWith('.vercel.app');
    const isLocal  = origin.startsWith('http://localhost');
    if (isVercel || isLocal) callback(null, true);
    else callback(null, false);
  },
  credentials: true,
}));

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

// ── DB connection (cached for serverless) ───────────────────────────────────
let isConnected = false;

async function connectDB(): Promise<void> {
  if (isConnected) return;
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('MONGODB_URI is not set');
  await mongoose.connect(mongoUri);
  isConnected = true;
  console.log('🍃 MongoDB connected');
}

// ── For local dev: start server normally ────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT ?? 5000;
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  }).catch(console.error);
} else {
  connectDB().catch(console.error);
}

export default app;