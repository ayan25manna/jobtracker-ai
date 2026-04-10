"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.createError = createError;
function errorHandler(err, _req, res, _next) {
    const status = err.statusCode ?? 500;
    const message = status === 500
        ? 'Something exploded on our end. Our hamsters are working on it. 🐹'
        : err.message;
    console.error(`[ERROR ${status}]`, err.message);
    res.status(status).json({ message });
}
function createError(message, statusCode) {
    const err = new Error(message);
    err.statusCode = statusCode;
    return err;
}
