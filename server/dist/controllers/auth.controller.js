"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.getMe = getMe;
const authService_1 = require("../services/authService");
const errorHandler_1 = require("../middleware/errorHandler");
async function register(req, res, next) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw (0, errorHandler_1.createError)('Email and password are required. Both. Please. 🙏', 400);
        }
        const result = await (0, authService_1.registerUser)(email.trim(), password);
        res.status(201).json({ message: 'Account created! Go get those offers. 🚀', ...result });
    }
    catch (err) {
        next(err);
    }
}
async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw (0, errorHandler_1.createError)('Need both email and password. We\'re not that easy. 😏', 400);
        }
        const result = await (0, authService_1.loginUser)(email.trim(), password);
        res.status(200).json({ message: 'Welcome back, job hunter! 🎯', ...result });
    }
    catch (err) {
        next(err);
    }
}
function getMe(req, res) {
    res.json({ user: req.user });
}
