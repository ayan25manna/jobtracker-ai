"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = parse;
exports.suggest = suggest;
const aiService_1 = require("../services/aiService");
const errorHandler_1 = require("../middleware/errorHandler");
async function parse(req, res, next) {
    try {
        const { jobDescription } = req.body;
        if (!jobDescription?.trim()) {
            throw (0, errorHandler_1.createError)('Paste a job description first. We can\'t parse vibes. ✨', 400);
        }
        const result = await (0, aiService_1.parseJobDescription)(jobDescription);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
}
async function suggest(req, res, next) {
    try {
        const parsedJob = req.body;
        if (!parsedJob?.role) {
            throw (0, errorHandler_1.createError)('Need at least a role to generate suggestions.', 400);
        }
        const result = await (0, aiService_1.generateResumeSuggestions)(parsedJob);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
}
