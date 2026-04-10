"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllApplications = getAllApplications;
exports.createApplication = createApplication;
exports.updateApplication = updateApplication;
exports.deleteApplication = deleteApplication;
const mongoose_1 = __importDefault(require("mongoose"));
const Application_1 = require("../models/Application");
const errorHandler_1 = require("../middleware/errorHandler");
async function getAllApplications(userId) {
    return Application_1.Application.find({ userId }).sort({ createdAt: -1 });
}
async function createApplication(userId, dto) {
    return Application_1.Application.create({ ...dto, userId });
}
async function updateApplication(id, userId, dto) {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw (0, errorHandler_1.createError)('Invalid application ID. Nice try though. 🎲', 400);
    }
    const app = await Application_1.Application.findOneAndUpdate({ _id: id, userId }, { $set: dto }, { new: true, runValidators: true });
    if (!app)
        throw (0, errorHandler_1.createError)('Application not found or not yours. 🔍', 404);
    return app;
}
async function deleteApplication(id, userId) {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw (0, errorHandler_1.createError)('Invalid application ID.', 400);
    }
    const result = await Application_1.Application.findOneAndDelete({ _id: id, userId });
    if (!result)
        throw (0, errorHandler_1.createError)('Application not found. Already deleted? 👻', 404);
}
