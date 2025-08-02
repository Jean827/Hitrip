import express from 'express';
import { body, validationResult } from 'express-validator';
import { PointHistory } from '../models/PointHistory';
import { User } from '../models/User';
import { asyncHandler } from '../middleware/errorHandler';
import { authMiddleware, authorize } from '../middleware/auth';

const router = express.Router();

// 获取当前用户积分历史
router.get('/history', authMiddleware, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const userId = req.user.id;
  const history = await PointHistory.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const total = await PointHistory.countDocuments({ user: userId });
  res.json({ success: true, data: { history, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
}));

// 管理员为用户增加/扣除积分
router.post('/admin/adjust', [
  body('userId').notEmpty(),
  body('type').isIn(['gain', 'consume']),
  body('amount').isInt({ min: 1 }),
  body('reason').notEmpty(),
], authorize('admin'), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  const { userId, type, amount, reason } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ success: false, message: '用户不存在' });
  if (type === 'gain') user.points += amount;
  else if (type === 'consume') user.points = Math.max(0, user.points - amount);
  await user.save();
  const record = await PointHistory.create({ user: userId, type, amount, reason });
  res.json({ success: true, data: { record, points: user.points } });
}));

export default router;