"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const Permission_1 = require("../models/Permission");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use((0, auth_1.authorize)('admin'));
router.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const permissions = await Permission_1.Permission.find();
    res.json({ success: true, data: { permissions } });
}));
router.post('/', [
    (0, express_validator_1.body)('name').notEmpty().withMessage('权限名不能为空'),
    (0, express_validator_1.body)('code').notEmpty().withMessage('权限编码不能为空'),
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { name, code, description } = req.body;
    const permission = new Permission_1.Permission({ name, code, description });
    await permission.save();
    res.status(201).json({ success: true, data: { permission } });
}));
router.put('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { name, code, description } = req.body;
    const permission = await Permission_1.Permission.findByIdAndUpdate(req.params.id, { name, code, description }, { new: true });
    if (!permission)
        return res.status(404).json({ success: false, message: '权限不存在' });
    res.json({ success: true, data: { permission } });
}));
router.delete('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const permission = await Permission_1.Permission.findByIdAndDelete(req.params.id);
    if (!permission)
        return res.status(404).json({ success: false, message: '权限不存在' });
    res.json({ success: true, message: '权限已删除' });
}));
exports.default = router;
//# sourceMappingURL=permission.js.map