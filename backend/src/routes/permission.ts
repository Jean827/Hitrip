import express from 'express';
import { body, validationResult } from 'express-validator';
import { Permission } from '../models/Permission';
import { asyncHandler } from '../middleware/errorHandler';
import { authorize } from '../middleware/auth';

const router = express.Router();

// 仅管理员可用
router.use(authorize('admin'));

// 获取所有权限
router.get('/', asyncHandler(async (req, res) => {
  const permissions = await Permission.find();
  res.json({ success: true, data: { permissions } });
}));

// 创建权限
router.post('/', [
  body('name').notEmpty().withMessage('权限名不能为空'),
  body('code').notEmpty().withMessage('权限编码不能为空'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  const { name, code, description } = req.body;
  const permission = new Permission({ name, code, description });
  await permission.save();
  res.status(201).json({ success: true, data: { permission } });
}));

// 更新权限
router.put('/:id', asyncHandler(async (req, res) => {
  const { name, code, description } = req.body;
  const permission = await Permission.findByIdAndUpdate(req.params.id, { name, code, description }, { new: true });
  if (!permission) return res.status(404).json({ success: false, message: '权限不存在' });
  res.json({ success: true, data: { permission } });
}));

// 删除权限
router.delete('/:id', asyncHandler(async (req, res) => {
  const permission = await Permission.findByIdAndDelete(req.params.id);
  if (!permission) return res.status(404).json({ success: false, message: '权限不存在' });
  res.json({ success: true, message: '权限已删除' });
}));

export default router;