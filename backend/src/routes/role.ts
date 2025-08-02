import express from 'express';
import { body, validationResult } from 'express-validator';
import { Role } from '../models/Role';
import { Permission } from '../models/Permission';
import { asyncHandler } from '../middleware/errorHandler';
import { authorize } from '../middleware/auth';

const router = express.Router();

// 仅管理员可用
router.use(authorize('admin'));

// 获取所有角色
router.get('/', asyncHandler(async (req, res) => {
  const roles = await Role.find();
  res.json({ success: true, data: { roles } });
}));

// 创建角色
router.post('/', [
  body('name').notEmpty().withMessage('角色名不能为空'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  const { name, description, permissions, menus } = req.body;
  const role = new Role({ name, description, permissions, menus });
  await role.save();
  res.status(201).json({ success: true, data: { role } });
}));

// 更新角色
router.put('/:id', asyncHandler(async (req, res) => {
  const { name, description, permissions, menus } = req.body;
  const role = await Role.findByIdAndUpdate(req.params.id, { name, description, permissions, menus }, { new: true });
  if (!role) return res.status(404).json({ success: false, message: '角色不存在' });
  res.json({ success: true, data: { role } });
}));

// 删除角色
router.delete('/:id', asyncHandler(async (req, res) => {
  const role = await Role.findByIdAndDelete(req.params.id);
  if (!role) return res.status(404).json({ success: false, message: '角色不存在' });
  res.json({ success: true, message: '角色已删除' });
}));

// 获取所有权限
router.get('/permissions/all', asyncHandler(async (req, res) => {
  const permissions = await Permission.find();
  res.json({ success: true, data: { permissions } });
}));

export default router;