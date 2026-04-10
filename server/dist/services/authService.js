"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const errorHandler_1 = require("../middleware/errorHandler");
function signToken(payload) {
    // 1. Ensure the secret is never undefined
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    // 2. Cast the options as jwt.SignOptions to satisfy the compiler
    return jsonwebtoken_1.default.sign(payload, secret, {
        expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    });
}
async function registerUser(email, password) {
    const existing = await User_1.User.findOne({ email });
    if (existing) {
        throw (0, errorHandler_1.createError)('That email is already taken. Great minds apply alike! 🧠', 409);
    }
    const user = await User_1.User.create({ email, password });
    const payload = { userId: user.id, email: user.email };
    const token = signToken(payload);
    return { token, user: { id: user.id, email: user.email } };
}
async function loginUser(email, password) {
    const user = await User_1.User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
        throw (0, errorHandler_1.createError)('Wrong credentials. Did you forget, or are you a robot? 🤖', 401);
    }
    const payload = { userId: user.id, email: user.email };
    const token = signToken(payload);
    return { token, user: { id: user.id, email: user.email } };
}
