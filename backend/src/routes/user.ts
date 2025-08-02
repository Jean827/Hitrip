import express from 'express';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import sharp from 'sharp';
import { User } from '../models/User';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { uploadToCloud } from '../utils/upload';
import { redis } from '../config/database';

const router = express.Router();

// 配置multer用于文件上传
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  },
});

// 获取当前用户信息
router.get('/profile', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
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

// 更新用户资料
router.put('/profile', [
  body('nickname')
    .optional()
    .isLength({ max: 20 })
    .withMessage('昵称最多20个字符'),
  body('realName')
    .optional()
    .isLength({ max: 20 })
    .withMessage('真实姓名最多20个字符'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('性别只能是male、female或other'),
  body('birthday')
    .optional()
    .isISO8601()
    .withMessage('生日格式无效'),
  body('address')
    .optional()
    .isLength({ max: 200 })
    .withMessage('地址最多200个字符')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { nickname, realName, gender, birthday, address } = req.body;

  const user = await User.findById(req.user.id);
  
  // 更新用户信息
  if (nickname !== undefined) user.nickname = nickname;
  if (realName !== undefined) user.realName = realName;
  if (gender !== undefined) user.gender = gender;
  if (birthday !== undefined) user.birthday = new Date(birthday);
  if (address !== undefined) user.address = address;

  await user.save();

  logger.info(`用户资料更新: ${user.username}`);

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

// 上传头像
router.post('/avatar', upload.single('avatar'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: '请选择要上传的图片'
    });
  }

  try {
    // 处理图片
    const processedImage = await sharp(req.file.buffer)
      .resize(200, 200, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    // 上传到云存储
    const fileName = `avatars/${req.user.id}-${Date.now()}.jpg`;
    const uploadResult = await uploadToCloud(processedImage, fileName);

    // 更新用户头像
    const user = await User.findById(req.user.id);
    user.avatar = uploadResult.url;
    await user.save();

    logger.info(`头像上传成功: ${user.username}`);

    res.json({
      success: true,
      message: '头像上传成功',
      data: {
        avatar: uploadResult.url
      }
    });
  } catch (error) {
    logger.error('头像上传失败:', error);
    res.status(500).json({
      success: false,
      message: '头像上传失败'
    });
  }
}));

// 更新用户偏好设置
router.put('/preferences', [
  body('language')
    .optional()
    .isIn(['zh-CN', 'en-US'])
    .withMessage('语言只能是zh-CN或en-US'),
  body('theme')
    .optional()
    .isIn(['light', 'dark'])
    .withMessage('主题只能是light或dark'),
  body('notifications.email')
    .optional()
    .isBoolean()
    .withMessage('邮件通知必须是布尔值'),
  body('notifications.sms')
    .optional()
    .isBoolean()
    .withMessage('短信通知必须是布尔值'),
  body('notifications.push')
    .optional()
    .isBoolean()
    .withMessage('推送通知必须是布尔值')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { language, theme, notifications } = req.body;

  const user = await User.findById(req.user.id);
  
  // 更新偏好设置
  if (language !== undefined) user.preferences.language = language;
  if (theme !== undefined) user.preferences.theme = theme;
  if (notifications) {
    if (notifications.email !== undefined) user.preferences.notifications.email = notifications.email;
    if (notifications.sms !== undefined) user.preferences.notifications.sms = notifications.sms;
    if (notifications.push !== undefined) user.preferences.notifications.push = notifications.push;
  }

  await user.save();

  logger.info(`用户偏好设置更新: ${user.username}`);

  res.json({
    success: true,
    message: '偏好设置更新成功',
    data: {
      preferences: user.preferences
    }
  });
}));

// 修改密码
router.put('/password', [
  body('currentPassword')
    .notEmpty()
    .withMessage('当前密码不能为空'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('新密码至少6位')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');
  
  // 验证当前密码
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      message: '当前密码错误'
    });
  }

  // 更新密码
  user.password = newPassword;
  await user.save();

  logger.info(`密码修改成功: ${user.username}`);

  res.json({
    success: true,
    message: '密码修改成功'
  });
}));

// 绑定手机号
router.post('/bind-phone', [
  body('phone')
    .matches(/^1[3-9]\d{9}$/)
    .withMessage('请输入有效的手机号'),
  body('code')
    .isLength({ min: 4, max: 6 })
    .withMessage('验证码长度错误')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { phone, code } = req.body;

  // 验证短信验证码
  const storedCode = await redis.get(`sms_code:${phone}`);
  if (!storedCode || storedCode !== code) {
    return res.status(400).json({
      success: false,
      message: '验证码错误或已过期'
    });
  }

  // 检查手机号是否已被其他用户绑定
  const existingUser = await User.findOne({ phone });
  if (existingUser && existingUser._id.toString() !== req.user.id) {
    return res.status(400).json({
      success: false,
      message: '该手机号已被其他用户绑定'
    });
  }

  // 绑定手机号
  const user = await User.findById(req.user.id);
  user.phone = phone;
  user.isPhoneVerified = true;
  await user.save();

  // 删除验证码
  await redis.del(`sms_code:${phone}`);

  logger.info(`手机号绑定成功: ${user.username} -> ${phone}`);

  res.json({
    success: true,
    message: '手机号绑定成功',
    data: {
      phone: user.phone,
      isPhoneVerified: user.isPhoneVerified
    }
  });
}));

// 发送短信验证码
router.post('/send-sms', [
  body('phone')
    .matches(/^1[3-9]\d{9}$/)
    .withMessage('请输入有效的手机号')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { phone } = req.body;

  // 检查发送频率限制
  const lastSendTime = await redis.get(`sms_last_send:${phone}`);
  if (lastSendTime && Date.now() - parseInt(lastSendTime) < 60000) {
    return res.status(429).json({
      success: false,
      message: '发送过于频繁，请稍后再试'
    });
  }

  // 生成验证码
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // 发送短信
  try {
    await sendSMS(phone, `您的验证码是：${code}，5分钟内有效。`);
    
    // 存储验证码（5分钟有效期）
    await redis.setex(`sms_code:${phone}`, 300, code);
    await redis.setex(`sms_last_send:${phone}`, 60, Date.now().toString());

    res.json({
      success: true,
      message: '验证码发送成功'
    });
  } catch (error) {
    logger.error('短信发送失败:', error);
    res.status(500).json({
      success: false,
      message: '验证码发送失败'
    });
  }
}));

// 获取用户积分历史
router.get('/points/history', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  // 这里应该从积分历史表中查询，暂时返回空数组
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

// 删除账户
router.delete('/account', [
  body('password')
    .notEmpty()
    .withMessage('密码不能为空')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { password } = req.body;

  const user = await User.findById(req.user.id).select('+password');
  
  // 验证密码
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(400).json({
      success: false,
      message: '密码错误'
    });
  }

  // 软删除用户（标记为禁用）
  user.isActive = false;
  await user.save();

  // 清除所有刷新token
  await redis.del(`refresh_token:${user._id}`);

  logger.info(`账户删除: ${user.username}`);

  res.json({
    success: true,
    message: '账户删除成功'
  });
}));

export default router; 