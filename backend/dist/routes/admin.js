"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.use((0, auth_1.authorize)('admin'));
router.get('/users', [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
    (0, express_validator_1.query)('search').optional().isString().withMessage('搜索关键词必须是字符串'),
    (0, express_validator_1.query)('role').optional().isIn(['user', 'admin', 'moderator']).withMessage('角色无效'),
    (0, express_validator_1.query)('status').optional().isIn(['active', 'inactive']).withMessage('状态无效')
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search;
    const role = req.query.role;
    const status = req.query.status;
    const query = {};
    if (search) {
        query.$or = [
            { username: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { nickname: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } }
        ];
    }
    if (role) {
        query.role = role;
    }
    if (status) {
        query.isActive = status === 'active';
    }
    const users = await User_1.User.find(query)
        .select('-password -emailVerificationToken -passwordResetToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    const total = await User_1.User.countDocuments(query);
    res.json({
        success: true,
        data: {
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        }
    });
}));
router.get('/users/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const user = await User_1.User.findById(req.params.id)
        .select('-password -emailVerificationToken -passwordResetToken');
    if (!user) {
        return res.status(404).json({
            success: false,
            message: '用户不存在'
        });
    }
    res.json({
        success: true,
        data: { user }
    });
}));
router.put('/users/:id', [
    (0, express_validator_1.body)('role').optional().isIn(['user', 'admin', 'moderator']).withMessage('角色无效'),
    (0, express_validator_1.body)('isActive').optional().isBoolean().withMessage('状态必须是布尔值'),
    (0, express_validator_1.body)('points').optional().isInt({ min: 0 }).withMessage('积分必须是非负整数'),
    (0, express_validator_1.body)('level').optional().isInt({ min: 1 }).withMessage('等级必须是正整数'),
    (0, express_validator_1.body)('vipLevel').optional().isInt({ min: 0 }).withMessage('VIP等级必须是非负整数')
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    const { role, isActive, points, level, vipLevel } = req.body;
    const user = await User_1.User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: '用户不存在'
        });
    }
    if (user._id.toString() === req.user.id && role && role !== user.role) {
        return res.status(400).json({
            success: false,
            message: '不能修改自己的角色'
        });
    }
    if (role !== undefined)
        user.role = role;
    if (isActive !== undefined)
        user.isActive = isActive;
    if (points !== undefined)
        user.points = points;
    if (level !== undefined)
        user.level = level;
    if (vipLevel !== undefined)
        user.vipLevel = vipLevel;
    await user.save();
    logger_1.logger.info(`管理员更新用户信息: ${req.user.username} -> ${user.username}`);
    res.json({
        success: true,
        message: '用户信息更新成功',
        data: { user }
    });
}));
router.delete('/users/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const user = await User_1.User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: '用户不存在'
        });
    }
    if (user._id.toString() === req.user.id) {
        return res.status(400).json({
            success: false,
            message: '不能删除自己的账户'
        });
    }
    user.isActive = false;
    await user.save();
    logger_1.logger.info(`管理员删除用户: ${req.user.username} -> ${user.username}`);
    res.json({
        success: true,
        message: '用户删除成功'
    });
}));
router.post('/users/:id/reset-password', [
    (0, express_validator_1.body)('newPassword')
        .isLength({ min: 6 })
        .withMessage('新密码至少6位')
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    const { newPassword } = req.body;
    const user = await User_1.User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: '用户不存在'
        });
    }
    user.password = newPassword;
    await user.save();
    logger_1.logger.info(`管理员重置用户密码: ${req.user.username} -> ${user.username}`);
    res.json({
        success: true,
        message: '密码重置成功'
    });
}));
router.get('/users/stats', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const totalUsers = await User_1.User.countDocuments();
    const activeUsers = await User_1.User.countDocuments({ isActive: true });
    const verifiedUsers = await User_1.User.countDocuments({ isEmailVerified: true });
    const vipUsers = await User_1.User.countDocuments({ vipLevel: { $gt: 0 } });
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUsers = await User_1.User.countDocuments({
        createdAt: { $gte: sevenDaysAgo }
    });
    const roleStats = await User_1.User.aggregate([
        {
            $group: {
                _id: '$role',
                count: { $sum: 1 }
            }
        }
    ]);
    const levelStats = await User_1.User.aggregate([
        {
            $group: {
                _id: '$level',
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);
    res.json({
        success: true,
        data: {
            totalUsers,
            activeUsers,
            verifiedUsers,
            vipUsers,
            recentUsers,
            roleStats,
            levelStats
        }
    });
}));
router.post('/users/batch', [
    (0, express_validator_1.body)('action').isIn(['activate', 'deactivate', 'delete']).withMessage('操作类型无效'),
    (0, express_validator_1.body)('userIds').isArray({ min: 1 }).withMessage('用户ID列表不能为空')
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    const { action, userIds } = req.body;
    const filteredUserIds = userIds.filter((id) => id !== req.user.id);
    if (filteredUserIds.length === 0) {
        return res.status(400).json({
            success: false,
            message: '没有可操作的用户'
        });
    }
    let result;
    switch (action) {
        case 'activate':
            result = await User_1.User.updateMany({ _id: { $in: filteredUserIds } }, { $set: { isActive: true } });
            break;
        case 'deactivate':
            result = await User_1.User.updateMany({ _id: { $in: filteredUserIds } }, { $set: { isActive: false } });
            break;
        case 'delete':
            result = await User_1.User.updateMany({ _id: { $in: filteredUserIds } }, { $set: { isActive: false } });
            break;
    }
    logger_1.logger.info(`管理员批量操作用户: ${req.user.username} -> ${action} ${filteredUserIds.length}个用户`);
    res.json({
        success: true,
        message: `批量${action}操作成功`,
        data: {
            affectedCount: result.modifiedCount
        }
    });
}));
router.get('/users/export', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const users = await User_1.User.find()
        .select('-password -emailVerificationToken -passwordResetToken')
        .sort({ createdAt: -1 });
    const csvData = users.map(user => ({
        ID: user._id,
        用户名: user.username,
        邮箱: user.email,
        手机号: user.phone || '',
        昵称: user.nickname || '',
        真实姓名: user.realName || '',
        角色: user.role,
        状态: user.isActive ? '活跃' : '禁用',
        邮箱验证: user.isEmailVerified ? '是' : '否',
        手机验证: user.isPhoneVerified ? '是' : '否',
        积分: user.points,
        等级: user.level,
        VIP等级: user.vipLevel,
        注册时间: user.createdAt.toISOString(),
        最后登录: user.lastLoginAt ? user.lastLoginAt.toISOString() : ''
    }));
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
    const csv = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    res.send(csv);
}));
exports.default = router;
//# sourceMappingURL=admin.js.map