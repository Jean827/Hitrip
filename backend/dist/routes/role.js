"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const Role_1 = require("../models/Role");
const Permission_1 = require("../models/Permission");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use((0, auth_1.authorize)('admin'));
router.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const roles = await Role_1.Role.find();
    res.json({ success: true, data: { roles } });
}));
router.post('/', [
    (0, express_validator_1.body)('name').notEmpty().withMessage('角色名不能为空'),
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { name, description, permissions, menus } = req.body;
    const role = new Role_1.Role({ name, description, permissions, menus });
    await role.save();
    res.status(201).json({ success: true, data: { role } });
}));
router.put('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { name, description, permissions, menus } = req.body;
    const role = await Role_1.Role.findByIdAndUpdate(req.params.id, { name, description, permissions, menus }, { new: true });
    if (!role)
        return res.status(404).json({ success: false, message: '角色不存在' });
    res.json({ success: true, data: { role } });
}));
router.delete('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const role = await Role_1.Role.findByIdAndDelete(req.params.id);
    if (!role)
        return res.status(404).json({ success: false, message: '角色不存在' });
    res.json({ success: true, message: '角色已删除' });
}));
router.get('/permissions/all', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const permissions = await Permission_1.Permission.find();
    res.json({ success: true, data: { permissions } });
}));
exports.default = router;
//# sourceMappingURL=role.js.map