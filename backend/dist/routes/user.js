"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
const User_1 = require("../models/User");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../utils/logger");
const upload_1 = require("../utils/upload");
const database_1 = require("../config/database");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('只允许上传图片文件'));
        }
    },
});
router.get('/profile', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const user = await User_1.User.findById(req.user.id);
    res.json({
        success: true,
        data: {
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                nickname: user.nickname,
                realName: user.realName,
                gender: user.gender,
                birthday: user.birthday,
                address: user.address,
                avatar: user.avatar,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
                isPhoneVerified: user.isPhoneVerified,
                points: user.points,
                level: user.level,
                vipLevel: user.vipLevel,
                vipExpiresAt: user.vipExpiresAt,
                preferences: user.preferences,
                socialAccounts: user.socialAccounts,
                createdAt: user.createdAt,
                lastLoginAt: user.lastLoginAt
            }
        }
    });
}));
router.put('/profile', [
    (0, express_validator_1.body)('nickname')
        .optional()
        .isLength({ max: 20 })
        .withMessage('昵称最多20个字符'),
    (0, express_validator_1.body)('realName')
        .optional()
        .isLength({ max: 20 })
        .withMessage('真实姓名最多20个字符'),
    (0, express_validator_1.body)('gender')
        .optional()
        .isIn(['male', 'female', 'other'])
        .withMessage('性别只能是male、female或other'),
    (0, express_validator_1.body)('birthday')
        .optional()
        .isISO8601()
        .withMessage('生日格式无效'),
    (0, express_validator_1.body)('address')
        .optional()
        .isLength({ max: 200 })
        .withMessage('地址最多200个字符')
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    const { nickname, realName, gender, birthday, address } = req.body;
    const user = await User_1.User.findById(req.user.id);
    if (nickname !== undefined)
        user.nickname = nickname;
    if (realName !== undefined)
        user.realName = realName;
    if (gender !== undefined)
        user.gender = gender;
    if (birthday !== undefined)
        user.birthday = new Date(birthday);
    if (address !== undefined)
        user.address = address;
    await user.save();
    logger_1.logger.info(`用户资料更新: ${user.username}`);
    res.json({
        success: true,
        message: '资料更新成功',
        data: {
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                nickname: user.nickname,
                realName: user.realName,
                gender: user.gender,
                birthday: user.birthday,
                address: user.address,
                avatar: user.avatar,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
                isPhoneVerified: user.isPhoneVerified,
                points: user.points,
                level: user.level,
                vipLevel: user.vipLevel,
                vipExpiresAt: user.vipExpiresAt,
                preferences: user.preferences,
                socialAccounts: user.socialAccounts,
                createdAt: user.createdAt,
                lastLoginAt: user.lastLoginAt
            }
        }
    });
}));
router.post('/avatar', upload.single('avatar'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: '请选择要上传的图片'
        });
    }
    try {
        const processedImage = await (0, sharp_1.default)(req.file.buffer)
            .resize(200, 200, {
            fit: 'cover',
            position: 'center'
        })
            .jpeg({ quality: 80 })
            .toBuffer();
        const fileName = `avatars/${req.user.id}-${Date.now()}.jpg`;
        const uploadResult = await (0, upload_1.uploadToCloud)(processedImage, fileName);
        const user = await User_1.User.findById(req.user.id);
        user.avatar = uploadResult.url;
        await user.save();
        logger_1.logger.info(`头像上传成功: ${user.username}`);
        res.json({
            success: true,
            message: '头像上传成功',
            data: {
                avatar: uploadResult.url
            }
        });
    }
    catch (error) {
        logger_1.logger.error('头像上传失败:', error);
        res.status(500).json({
            success: false,
            message: '头像上传失败'
        });
    }
}));
router.put('/preferences', [
    (0, express_validator_1.body)('language')
        .optional()
        .isIn(['zh-CN', 'en-US'])
        .withMessage('语言只能是zh-CN或en-US'),
    (0, express_validator_1.body)('theme')
        .optional()
        .isIn(['light', 'dark'])
        .withMessage('主题只能是light或dark'),
    (0, express_validator_1.body)('notifications.email')
        .optional()
        .isBoolean()
        .withMessage('邮件通知必须是布尔值'),
    (0, express_validator_1.body)('notifications.sms')
        .optional()
        .isBoolean()
        .withMessage('短信通知必须是布尔值'),
    (0, express_validator_1.body)('notifications.push')
        .optional()
        .isBoolean()
        .withMessage('推送通知必须是布尔值')
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    const { language, theme, notifications } = req.body;
    const user = await User_1.User.findById(req.user.id);
    if (language !== undefined)
        user.preferences.language = language;
    if (theme !== undefined)
        user.preferences.theme = theme;
    if (notifications) {
        if (notifications.email !== undefined)
            user.preferences.notifications.email = notifications.email;
        if (notifications.sms !== undefined)
            user.preferences.notifications.sms = notifications.sms;
        if (notifications.push !== undefined)
            user.preferences.notifications.push = notifications.push;
    }
    await user.save();
    logger_1.logger.info(`用户偏好设置更新: ${user.username}`);
    res.json({
        success: true,
        message: '偏好设置更新成功',
        data: {
            preferences: user.preferences
        }
    });
}));
router.put('/password', [
    (0, express_validator_1.body)('currentPassword')
        .notEmpty()
        .withMessage('当前密码不能为空'),
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
    const { currentPassword, newPassword } = req.body;
    const user = await User_1.User.findById(req.user.id).select('+password');
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
        return res.status(400).json({
            success: false,
            message: '当前密码错误'
        });
    }
    user.password = newPassword;
    await user.save();
    logger_1.logger.info(`密码修改成功: ${user.username}`);
    res.json({
        success: true,
        message: '密码修改成功'
    });
}));
router.post('/bind-phone', [
    (0, express_validator_1.body)('phone')
        .matches(/^1[3-9]\d{9}$/)
        .withMessage('请输入有效的手机号'),
    (0, express_validator_1.body)('code')
        .isLength({ min: 4, max: 6 })
        .withMessage('验证码长度错误')
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    const { phone, code } = req.body;
    const storedCode = await database_1.redis.get(`sms_code:${phone}`);
    if (!storedCode || storedCode !== code) {
        return res.status(400).json({
            success: false,
            message: '验证码错误或已过期'
        });
    }
    const existingUser = await User_1.User.findOne({ phone });
    if (existingUser && existingUser._id.toString() !== req.user.id) {
        return res.status(400).json({
            success: false,
            message: '该手机号已被其他用户绑定'
        });
    }
    const user = await User_1.User.findById(req.user.id);
    user.phone = phone;
    user.isPhoneVerified = true;
    await user.save();
    await database_1.redis.del(`sms_code:${phone}`);
    logger_1.logger.info(`手机号绑定成功: ${user.username} -> ${phone}`);
    res.json({
        success: true,
        message: '手机号绑定成功',
        data: {
            phone: user.phone,
            isPhoneVerified: user.isPhoneVerified
        }
    });
}));
router.post('/send-sms', [
    (0, express_validator_1.body)('phone')
        .matches(/^1[3-9]\d{9}$/)
        .withMessage('请输入有效的手机号')
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    const { phone } = req.body;
    const lastSendTime = await database_1.redis.get(`sms_last_send:${phone}`);
    if (lastSendTime && Date.now() - parseInt(lastSendTime) < 60000) {
        return res.status(429).json({
            success: false,
            message: '发送过于频繁，请稍后再试'
        });
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    try {
        await sendSMS(phone, `您的验证码是：${code}，5分钟内有效。`);
        await database_1.redis.setex(`sms_code:${phone}`, 300, code);
        await database_1.redis.setex(`sms_last_send:${phone}`, 60, Date.now().toString());
        res.json({
            success: true,
            message: '验证码发送成功'
        });
    }
    catch (error) {
        logger_1.logger.error('短信发送失败:', error);
        res.status(500).json({
            success: false,
            message: '验证码发送失败'
        });
    }
}));
router.get('/points/history', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const history = [];
    const total = 0;
    res.json({
        success: true,
        data: {
            history,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        }
    });
}));
router.delete('/account', [
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('密码不能为空')
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    const { password } = req.body;
    const user = await User_1.User.findById(req.user.id).select('+password');
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        return res.status(400).json({
            success: false,
            message: '密码错误'
        });
    }
    user.isActive = false;
    await user.save();
    await database_1.redis.del(`refresh_token:${user._id}`);
    logger_1.logger.info(`账户删除: ${user.username}`);
    res.json({
        success: true,
        message: '账户删除成功'
    });
}));
exports.default = router;
//# sourceMappingURL=user.js.map