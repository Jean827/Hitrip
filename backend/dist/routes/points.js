"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const PointHistory_1 = require("../models/PointHistory");
const User_1 = require("../models/User");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/history', auth_1.authMiddleware, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const userId = req.user.id;
    const history = await PointHistory_1.PointHistory.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    const total = await PointHistory_1.PointHistory.countDocuments({ user: userId });
    res.json({ success: true, data: { history, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
}));
router.post('/admin/adjust', [
    (0, express_validator_1.body)('userId').notEmpty(),
    (0, express_validator_1.body)('type').isIn(['gain', 'consume']),
    (0, express_validator_1.body)('amount').isInt({ min: 1 }),
    (0, express_validator_1.body)('reason').notEmpty(),
], (0, auth_1.authorize)('admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { userId, type, amount, reason } = req.body;
    const user = await User_1.User.findById(userId);
    if (!user)
        return res.status(404).json({ success: false, message: '用户不存在' });
    if (type === 'gain')
        user.points += amount;
    else if (type === 'consume')
        user.points = Math.max(0, user.points - amount);
    await user.save();
    const record = await PointHistory_1.PointHistory.create({ user: userId, type, amount, reason });
    res.json({ success: true, data: { record, points: user.points } });
}));
exports.default = router;
//# sourceMappingURL=points.js.map