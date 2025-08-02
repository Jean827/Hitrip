import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { User } from '../models/User';
import { authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = express.Router();

// 所有管理员路由都需要admin权限
router.use(authorize('admin'));

// 获取用户列表
router.get('/users', [
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
  query('search').optional().isString().withMessage('搜索关键词必须是字符串'),
  query('role').optional().isIn(['user', 'admin', 'moderator']).withMessage('角色无效'),
  query('status').optional().isIn(['active', 'inactive']).withMessage('状态无效')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const search = req.query.search as string;
  const role = req.query.role as string;
  const status = req.query.status as string;

  // 构建查询条件
  const query: any = {};
  
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

  // 查询用户
  const users = await User.find(query)
    .select('-password -emailVerificationToken -passwordResetToken')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(query);

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

// 获取用户详情
router.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
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

// 更新用户信息
router.put('/users/:id', [
  body('role').optional().isIn(['user', 'admin', 'moderator']).withMessage('角色无效'),
  body('isActive').optional().isBoolean().withMessage('状态必须是布尔值'),
  body('points').optional().isInt({ min: 0 }).withMessage('积分必须是非负整数'),
  body('level').optional().isInt({ min: 1 }).withMessage('等级必须是正整数'),
  body('vipLevel').optional().isInt({ min: 0 }).withMessage('VIP等级必须是非负整数')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { role, isActive, points, level, vipLevel } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: '用户不存在'
    });
  }

  // 不能修改自己的角色
  if (user._id.toString() === req.user.id && role && role !== user.role) {
    return res.status(400).json({
      success: false,
      message: '不能修改自己的角色'
    });
  }

  // 更新用户信息
  if (role !== undefined) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  if (points !== undefined) user.points = points;
  if (level !== undefined) user.level = level;
  if (vipLevel !== undefined) user.vipLevel = vipLevel;

  await user.save();

  logger.info(`管理员更新用户信息: ${req.user.username} -> ${user.username}`);

  res.json({
    success: true,
    message: '用户信息更新成功',
    data: { user }
  });
}));

// 删除用户
router.delete('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: '用户不存在'
    });
  }

  // 不能删除自己
  if (user._id.toString() === req.user.id) {
    return res.status(400).json({
      success: false,
      message: '不能删除自己的账户'
    });
  }

  // 软删除用户
  user.isActive = false;
  await user.save();

  logger.info(`管理员删除用户: ${req.user.username} -> ${user.username}`);

  res.json({
    success: true,
    message: '用户删除成功'
  });
}));

// 重置用户密码
router.post('/users/:id/reset-password', [
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

  const { newPassword } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: '用户不存在'
    });
  }

  // 重置密码
  user.password = newPassword;
  await user.save();

  logger.info(`管理员重置用户密码: ${req.user.username} -> ${user.username}`);

  res.json({
    success: true,
    message: '密码重置成功'
  });
}));

// 获取用户统计信息
router.get('/users/stats', asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
  const vipUsers = await User.countDocuments({ vipLevel: { $gt: 0 } });

  // 最近7天注册用户数
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentUsers = await User.countDocuments({
    createdAt: { $gte: sevenDaysAgo }
  });

  // 用户角色分布
  const roleStats = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);

  // 用户等级分布
  const levelStats = await User.aggregate([
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

// 批量操作用户
router.post('/users/batch', [
  body('action').isIn(['activate', 'deactivate', 'delete']).withMessage('操作类型无效'),
  body('userIds').isArray({ min: 1 }).withMessage('用户ID列表不能为空')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { action, userIds } = req.body;

  // 过滤掉当前管理员自己的ID
  const filteredUserIds = userIds.filter((id: string) => id !== req.user.id);

  if (filteredUserIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: '没有可操作的用户'
    });
  }

  let result;
  switch (action) {
    case 'activate':
      result = await User.updateMany(
        { _id: { $in: filteredUserIds } },
        { $set: { isActive: true } }
      );
      break;
    case 'deactivate':
      result = await User.updateMany(
        { _id: { $in: filteredUserIds } },
        { $set: { isActive: false } }
      );
      break;
    case 'delete':
      result = await User.updateMany(
        { _id: { $in: filteredUserIds } },
        { $set: { isActive: false } }
      );
      break;
  }

  logger.info(`管理员批量操作用户: ${req.user.username} -> ${action} ${filteredUserIds.length}个用户`);

  res.json({
    success: true,
    message: `批量${action}操作成功`,
    data: {
      affectedCount: result.modifiedCount
    }
  });
}));

// 导出用户数据
router.get('/users/export', asyncHandler(async (req, res) => {
  const users = await User.find()
    .select('-password -emailVerificationToken -passwordResetToken')
    .sort({ createdAt: -1 });

  // 转换为CSV格式
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
  
  // 简单的CSV转换
  const csv = [
    Object.keys(csvData[0]).join(','),
    ...csvData.map(row => Object.values(row).join(','))
  ].join('\n');

  res.send(csv);
}));

export default router; 