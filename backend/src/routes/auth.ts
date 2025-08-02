import express from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User';
import { generateToken, generateRefreshToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { redis } from '../config/database';
import { sendEmail } from '../utils/email';
import { sendSMS } from '../utils/sms';
import { authMiddleware } from '../middleware/auth';
import jwt from 'jsonwebtoken';

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: 用户注册
 *     tags: [认证]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: 用户名
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 邮箱地址
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: 密码
 *               nickname:
 *                 type: string
 *                 description: 昵称
 *               phone:
 *                 type: string
 *                 description: 手机号
 *     responses:
 *       201:
 *         description: 注册成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       400:
 *         description: 请求参数错误
 *       409:
 *         description: 用户已存在
 */
router.post('/register', [
  body('username').isLength({ min: 3, max: 20 }).withMessage('用户名长度必须在3-20个字符之间'),
  body('email').isEmail().withMessage('请输入有效的邮箱地址'),
  body('password').isLength({ min: 6 }).withMessage('密码长度至少6个字符'),
  body('nickname').optional().isLength({ max: 50 }).withMessage('昵称长度不能超过50个字符'),
  body('phone').optional().matches(/^1[3-9]\d{9}$/).withMessage('请输入有效的手机号'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: '请求参数错误',
      errors: errors.array()
    });
  }

  const { username, email, password, nickname, phone } = req.body;

  // 检查用户是否已存在
  const existingUser = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: '用户名或邮箱已存在'
    });
  }

  // 创建新用户
  const user = new User({
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

  // 生成邮箱验证token
  const emailToken = user.generateEmailVerificationToken();
  
  // 发送验证邮件
  try {
    await sendEmail({
      to: email,
      subject: '欢迎注册海南文旅 - 请验证您的邮箱',
      template: 'email-verification',
      data: {
        username,
        verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${emailToken}`
      }
    });
  } catch (error) {
    logger.error('发送验证邮件失败:', error);
  }

  // 生成JWT token
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // 存储refresh token到Redis
  await redis.setex(`refresh_token:${user._id}`, 30 * 24 * 60 * 60, refreshToken);

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

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 用户登录
 *     tags: [认证]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: 用户名或邮箱
 *               password:
 *                 type: string
 *                 description: 密码
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 用户名或密码错误
 *       423:
 *         description: 账户被锁定
 */
router.post('/login', [
  body('identifier').notEmpty().withMessage('请输入用户名或邮箱'),
  body('password').notEmpty().withMessage('请输入密码'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: '请求参数错误',
      errors: errors.array()
    });
  }

  const { identifier, password } = req.body;

  // 查找用户
  const user = await User.findOne({
    $or: [{ username: identifier }, { email: identifier }]
  });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: '用户名或密码错误'
    });
  }

  // 检查账户状态
  if (user.status !== 'active') {
    return res.status(423).json({
      success: false,
      message: '账户已被禁用'
    });
  }

  // 检查登录尝试次数
  if (user.loginAttempts >= 5 && user.lockUntil > new Date()) {
    return res.status(423).json({
      success: false,
      message: '账户已被锁定，请稍后再试'
    });
  }

  // 验证密码
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    await user.incrementLoginAttempts();
    return res.status(401).json({
      success: false,
      message: '用户名或密码错误'
    });
  }

  // 重置登录尝试次数
  await user.resetLoginAttempts();

  // 更新最后登录时间
  user.lastLoginAt = new Date();
  await user.save();

  // 生成JWT token
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // 存储refresh token到Redis
  await redis.setex(`refresh_token:${user._id}`, 30 * 24 * 60 * 60, refreshToken);

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

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: 刷新访问令牌
 *     tags: [认证]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: 刷新令牌
 *     responses:
 *       200:
 *         description: 刷新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       401:
 *         description: 刷新令牌无效
 */
router.post('/refresh', [
  body('refreshToken').notEmpty().withMessage('刷新令牌不能为空'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: '请求参数错误',
      errors: errors.array()
    });
  }

  const { refreshToken } = req.body;

  try {
    // 验证refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
    
    // 检查Redis中是否存在
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);
    if (!storedToken || storedToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: '刷新令牌无效'
      });
    }

    // 生成新的token
    const newToken = generateToken(decoded.userId);
    const newRefreshToken = generateRefreshToken(decoded.userId);

    // 更新Redis中的refresh token
    await redis.setex(`refresh_token:${decoded.userId}`, 30 * 24 * 60 * 60, newRefreshToken);

    res.json({
      success: true,
      message: '刷新成功',
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: '刷新令牌无效'
    });
  }
}));

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: 用户登出
 *     tags: [认证]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 登出成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post('/logout', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // 从Redis中删除refresh token
  await redis.del(`refresh_token:${userId}`);

  res.json({
    success: true,
    message: '登出成功'
  });
}));

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: 验证邮箱
 *     tags: [认证]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: 邮箱验证令牌
 *     responses:
 *       200:
 *         description: 验证成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: 令牌无效或已过期
 */
router.post('/verify-email', [
  body('token').notEmpty().withMessage('验证令牌不能为空'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: '请求参数错误',
      errors: errors.array()
    });
  }

  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const user = await User.findById(decoded.userId);
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
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: '验证令牌无效或已过期'
    });
  }
}));

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: 重新发送验证邮件
 *     tags: [认证]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 邮箱地址
 *     responses:
 *       200:
 *         description: 发送成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: 用户不存在
 */
router.post('/resend-verification', [
  body('email').isEmail().withMessage('请输入有效的邮箱地址'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: '请求参数错误',
      errors: errors.array()
    });
  }

  const { email } = req.body;

  const user = await User.findOne({ email });
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

  // 生成新的验证token
  const emailToken = user.generateEmailVerificationToken();
  
  // 发送验证邮件
  try {
    await sendEmail({
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
  } catch (error) {
    logger.error('发送验证邮件失败:', error);
    res.status(500).json({
      success: false,
      message: '发送验证邮件失败'
    });
  }
}));

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: 忘记密码
 *     tags: [认证]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 邮箱地址
 *     responses:
 *       200:
 *         description: 重置邮件发送成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: 用户不存在
 */
router.post('/forgot-password', [
  body('email').isEmail().withMessage('请输入有效的邮箱地址'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: '请求参数错误',
      errors: errors.array()
    });
  }

  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: '用户不存在'
    });
  }

  // 生成密码重置token
  const resetToken = user.generatePasswordResetToken();
  
  // 发送重置邮件
  try {
    await sendEmail({
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
  } catch (error) {
    logger.error('发送重置邮件失败:', error);
    res.status(500).json({
      success: false,
      message: '发送重置邮件失败'
    });
  }
}));

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: 重置密码
 *     tags: [认证]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 description: 密码重置令牌
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: 新密码
 *     responses:
 *       200:
 *         description: 密码重置成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: 令牌无效或已过期
 */
router.post('/reset-password', [
  body('token').notEmpty().withMessage('重置令牌不能为空'),
  body('password').isLength({ min: 6 }).withMessage('密码长度至少6个字符'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: '请求参数错误',
      errors: errors.array()
    });
  }

  const { token, password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const user = await User.findById(decoded.userId);
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
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: '重置令牌无效或已过期'
    });
  }
}));

export default router; 