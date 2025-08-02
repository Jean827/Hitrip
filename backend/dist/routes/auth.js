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
const database_1 = require("../config/database");
const email_1 = require("../utils/email");
const auth_2 = require("../middleware/auth");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = express_1.default.Router();
router.post('/register', [
    (0, express_validator_1.body)('username').isLength({ min: 3, max: 20 }).withMessage('用户名长度必须在3-20个字符之间'),
    (0, express_validator_1.body)('email').isEmail().withMessage('请输入有效的邮箱地址'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('密码长度至少6个字符'),
    (0, express_validator_1.body)('nickname').optional().isLength({ max: 50 }).withMessage('昵称长度不能超过50个字符'),
    (0, express_validator_1.body)('phone').optional().matches(/^1[3-9]\d{9}$/).withMessage('请输入有效的手机号'),
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: '请求参数错误',
            errors: errors.array()
        });
    }
    const { username, email, password, nickname, phone } = req.body;
    const existingUser = await User_1.User.findOne({
        $or: [{ username }, { email }]
    });
    if (existingUser) {
        return res.status(409).json({
            success: false,
            message: '用户名或邮箱已存在'
        });
    }
    const user = new User_1.User({
        username,
        email,
        password,
        nickname,
        phone,
        isEmailVerified: false,
        isPhoneVerified: false,
        role: 'user',
        status: 'active',
        points: 0,
        level: 1,
        vipLevel: 0
    });
    await user.save();
    const emailToken = user.generateEmailVerificationToken();
    try {
        await (0, email_1.sendEmail)({
            to: email,
            subject: '欢迎注册海南文旅 - 请验证您的邮箱',
            template: 'email-verification',
            data: {
                username,
                verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${emailToken}`
            }
        });
    }
    catch (error) {
        logger_1.logger.error('发送验证邮件失败:', error);
    }
    const token = (0, auth_1.generateToken)(user._id);
    const refreshToken = (0, auth_1.generateRefreshToken)(user._id);
    await database_1.redis.setex(`refresh_token:${user._id}`, 30 * 24 * 60 * 60, refreshToken);
    res.status(201).json({
        success: true,
        message: '注册成功，请查收验证邮件',
        data: {
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                nickname: user.nickname,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
                isPhoneVerified: user.isPhoneVerified
            },
            token,
            refreshToken
        }
    });
}));
router.post('/login', [
    (0, express_validator_1.body)('identifier').notEmpty().withMessage('请输入用户名或邮箱'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('请输入密码'),
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: '请求参数错误',
            errors: errors.array()
        });
    }
    const { identifier, password } = req.body;
    const user = await User_1.User.findOne({
        $or: [{ username: identifier }, { email: identifier }]
    });
    if (!user) {
        return res.status(401).json({
            success: false,
            message: '用户名或密码错误'
        });
    }
    if (user.status !== 'active') {
        return res.status(423).json({
            success: false,
            message: '账户已被禁用'
        });
    }
    if (user.loginAttempts >= 5 && user.lockUntil > new Date()) {
        return res.status(423).json({
            success: false,
            message: '账户已被锁定，请稍后再试'
        });
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        await user.incrementLoginAttempts();
        return res.status(401).json({
            success: false,
            message: '用户名或密码错误'
        });
    }
    await user.resetLoginAttempts();
    user.lastLoginAt = new Date();
    await user.save();
    const token = (0, auth_1.generateToken)(user._id);
    const refreshToken = (0, auth_1.generateRefreshToken)(user._id);
    await database_1.redis.setex(`refresh_token:${user._id}`, 30 * 24 * 60 * 60, refreshToken);
    res.json({
        success: true,
        message: '登录成功',
        data: {
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                nickname: user.nickname,
                avatar: user.avatar,
                role: user.role,
                points: user.points,
                level: user.level,
                vipLevel: user.vipLevel,
                isEmailVerified: user.isEmailVerified,
                isPhoneVerified: user.isPhoneVerified
            },
            token,
            refreshToken
        }
    });
}));
router.post('/refresh', [
    (0, express_validator_1.body)('refreshToken').notEmpty().withMessage('刷新令牌不能为空'),
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: '请求参数错误',
            errors: errors.array()
        });
    }
    const { refreshToken } = req.body;
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const storedToken = await database_1.redis.get(`refresh_token:${decoded.userId}`);
        if (!storedToken || storedToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: '刷新令牌无效'
            });
        }
        const newToken = (0, auth_1.generateToken)(decoded.userId);
        const newRefreshToken = (0, auth_1.generateRefreshToken)(decoded.userId);
        await database_1.redis.setex(`refresh_token:${decoded.userId}`, 30 * 24 * 60 * 60, newRefreshToken);
        res.json({
            success: true,
            message: '刷新成功',
            data: {
                token: newToken,
                refreshToken: newRefreshToken
            }
        });
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: '刷新令牌无效'
        });
    }
}));
router.post('/logout', auth_2.authMiddleware, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user._id;
    await database_1.redis.del(`refresh_token:${userId}`);
    res.json({
        success: true,
        message: '登出成功'
    });
}));
router.post('/verify-email', [
    (0, express_validator_1.body)('token').notEmpty().withMessage('验证令牌不能为空'),
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: '请求参数错误',
            errors: errors.array()
        });
    }
    const { token } = req.body;
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await User_1.User.findById(decoded.userId);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: '用户不存在'
            });
        }
        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: '邮箱已验证'
            });
        }
        user.isEmailVerified = true;
        await user.save();
        res.json({
            success: true,
            message: '邮箱验证成功'
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: '验证令牌无效或已过期'
        });
    }
}));
router.post('/resend-verification', [
    (0, express_validator_1.body)('email').isEmail().withMessage('请输入有效的邮箱地址'),
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: '请求参数错误',
            errors: errors.array()
        });
    }
    const { email } = req.body;
    const user = await User_1.User.findOne({ email });
    if (!user) {
        return res.status(404).json({
            success: false,
            message: '用户不存在'
        });
    }
    if (user.isEmailVerified) {
        return res.status(400).json({
            success: false,
            message: '邮箱已验证'
        });
    }
    const emailToken = user.generateEmailVerificationToken();
    try {
        await (0, email_1.sendEmail)({
            to: email,
            subject: '海南文旅 - 重新发送邮箱验证',
            template: 'email-verification',
            data: {
                username: user.username,
                verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${emailToken}`
            }
        });
        res.json({
            success: true,
            message: '验证邮件已发送'
        });
    }
    catch (error) {
        logger_1.logger.error('发送验证邮件失败:', error);
        res.status(500).json({
            success: false,
            message: '发送验证邮件失败'
        });
    }
}));
router.post('/forgot-password', [
    (0, express_validator_1.body)('email').isEmail().withMessage('请输入有效的邮箱地址'),
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: '请求参数错误',
            errors: errors.array()
        });
    }
    const { email } = req.body;
    const user = await User_1.User.findOne({ email });
    if (!user) {
        return res.status(404).json({
            success: false,
            message: '用户不存在'
        });
    }
    const resetToken = user.generatePasswordResetToken();
    try {
        await (0, email_1.sendEmail)({
            to: email,
            subject: '海南文旅 - 重置密码',
            template: 'password-reset',
            data: {
                username: user.username,
                resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
            }
        });
        res.json({
            success: true,
            message: '密码重置邮件已发送'
        });
    }
    catch (error) {
        logger_1.logger.error('发送重置邮件失败:', error);
        res.status(500).json({
            success: false,
            message: '发送重置邮件失败'
        });
    }
}));
router.post('/reset-password', [
    (0, express_validator_1.body)('token').notEmpty().withMessage('重置令牌不能为空'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('密码长度至少6个字符'),
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: '请求参数错误',
            errors: errors.array()
        });
    }
    const { token, password } = req.body;
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await User_1.User.findById(decoded.userId);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: '用户不存在'
            });
        }
        user.password = password;
        await user.save();
        res.json({
            success: true,
            message: '密码重置成功'
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: '重置令牌无效或已过期'
        });
    }
}));
exports.default = router;
//# sourceMappingURL=auth.js.map