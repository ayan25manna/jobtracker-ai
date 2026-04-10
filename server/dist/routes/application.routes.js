"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const application_controller_1 = require("../controllers/application.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All application routes are protected
router.use(auth_1.verifyJWT);
router.get('/', application_controller_1.getAll);
router.post('/', application_controller_1.create);
router.patch('/:id', application_controller_1.update);
router.delete('/:id', application_controller_1.remove);
exports.default = router;
