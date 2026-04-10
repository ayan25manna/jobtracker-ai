"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const application_routes_1 = __importDefault(require("./routes/application.routes"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
const PORT = process.env.PORT ?? 5000;
// ── Middleware ──────────────────────────────────────────────────────────────
app.use((0, cors_1.default)({ origin: process.env.CLIENT_URL ?? 'http://localhost:5173', credentials: true }));
app.use(express_1.default.json({ limit: '1mb' }));
// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', auth_routes_1.default);
app.use('/api/applications', application_routes_1.default);
app.use('/api/ai', ai_routes_1.default);
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', message: 'Server is alive and caffeinated ☕' });
});
// 404 fallback
app.use((_req, res) => {
    res.status(404).json({ message: 'Route not found. Wrong turn? 🗺️' });
});
// ── Global error handler ────────────────────────────────────────────────────
app.use(errorHandler_1.errorHandler);
// ── DB + Listen ─────────────────────────────────────────────────────────────
async function bootstrap() {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri)
        throw new Error('MONGODB_URI is not set in .env');
    await mongoose_1.default.connect(mongoUri);
    console.log('🍃 MongoDB connected');
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}
bootstrap().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
