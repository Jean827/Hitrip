import express from 'express';
import { Op } from 'sequelize';
import Category from '../models/Category';
import Product from '../models/Product';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// 获取分类列表
router.get('/', async (req, res) => {
  try {
    const { level, parentId, isActive } = req.query;
    const where: any = {};

    // 层级筛选
    if (level) {
      where.level = Number(level);
    }

    // 父分类筛选
    if (parentId) {
      where.parentId = parentId;
    }

    // 状态筛选
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const categories = await Category.findAll({
      where,
      include: [
        {
          model: Category,
          as: 'children',
          attributes: ['id', 'name', 'level'],
          where: { isActive: true },
          required: false,
        },
        {
          model: Category,
          as: 'parent',
          attributes: ['id', 'name', 'level'],
          required: false,
        },
      ],
      order: [
        ['sortOrder', 'ASC'],
        ['name', 'ASC'],
      ],
    });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取分类列表失败',
      error: error.message,
    });
  }
});

// 获取分类树结构
router.get('/tree', async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { isActive: true },
      include: [
        {
          model: Category,
          as: 'children',
          attributes: ['id', 'name', 'level', 'icon'],
          where: { isActive: true },
          required: false,
        },
      ],
      order: [
        ['sortOrder', 'ASC'],
        ['name', 'ASC'],
      ],
    });

    // 构建树结构
    const buildTree = (items: any[], parentId: string | null = null) => {
      return items
        .filter(item => item.parentId === parentId)
        .map(item => ({
          ...item.toJSON(),
          children: buildTree(items, item.id),
        }));
    };

    const tree = buildTree(categories);

    res.json({
      success: true,
      data: tree,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取分类树失败',
      error: error.message,
    });
  }
});

// 获取分类详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'children',
          attributes: ['id', 'name', 'level'],
          where: { isActive: true },
          required: false,
        },
        {
          model: Category,
          as: 'parent',
          attributes: ['id', 'name', 'level'],
          required: false,
        },
      ],
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: '分类不存在',
      });
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取分类详情失败',
      error: error.message,
    });
  }
});

// 创建分类 (需要管理员权限)
router.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const {
      name,
      description,
      parentId,
      sortOrder,
      icon,
      image,
    } = req.body;

    // 验证必填字段
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: '缺少必填字段',
      });
    }

    // 计算层级
    let level = 1;
    if (parentId) {
      const parent = await Category.findByPk(parentId);
      if (!parent) {
        return res.status(400).json({
          success: false,
          message: '父分类不存在',
        });
      }
      level = parent.level + 1;
    }

    // 创建分类
    const category = await Category.create({
      name,
      description,
      parentId,
      level,
      sortOrder: sortOrder || 0,
      icon,
      image,
    });

    res.status(201).json({
      success: true,
      message: '分类创建成功',
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建分类失败',
      error: error.message,
    });
  }
});

// 更新分类 (需要管理员权限)
router.put('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: '分类不存在',
      });
    }

    // 如果更新了父分类，需要重新计算层级
    if (updateData.parentId && updateData.parentId !== category.parentId) {
      const parent = await Category.findByPk(updateData.parentId);
      if (!parent) {
        return res.status(400).json({
          success: false,
          message: '父分类不存在',
        });
      }
      updateData.level = parent.level + 1;
    }

    // 更新分类
    await category.update(updateData);

    res.json({
      success: true,
      message: '分类更新成功',
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新分类失败',
      error: error.message,
    });
  }
});

// 删除分类 (需要管理员权限)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: '分类不存在',
      });
    }

    // 检查是否有子分类
    const childrenCount = await Category.count({ where: { parentId: id } });
    if (childrenCount > 0) {
      return res.status(400).json({
        success: false,
        message: '该分类下有子分类，无法删除',
      });
    }

    // 检查是否有商品使用此分类
    const productsCount = await Product.count({ where: { categoryId: id } });
    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        message: '该分类下有商品，无法删除',
      });
    }

    // 删除分类
    await category.destroy();

    res.json({
      success: true,
      message: '分类删除成功',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除分类失败',
      error: error.message,
    });
  }
});

// 获取分类下的商品
router.get('/:id/products', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    // 获取所有子分类ID
    const getAllChildIds = async (categoryId: string): Promise<string[]> => {
      const children = await Category.findAll({ where: { parentId: categoryId } });
      const childIds = children.map(child => child.id);
      const grandChildIds = await Promise.all(
        children.map(child => getAllChildIds(child.id))
      );
      return [categoryId, ...childIds, ...grandChildIds.flat()];
    };

    const categoryIds = await getAllChildIds(id);

    const { count, rows } = await Product.findAndCountAll({
      where: {
        categoryId: { [Op.in]: categoryIds },
        isActive: true,
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
      ],
      order: [[sortBy as string, sortOrder as string]],
      limit: Number(limit),
      offset,
    });

    res.json({
      success: true,
      data: {
        products: rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count,
          totalPages: Math.ceil(count / Number(limit)),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取分类商品失败',
      error: error.message,
    });
  }
});

// 分类上下架
router.patch('/:id/toggle-status', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: '分类不存在',
      });
    }

    // 切换状态
    await category.update({ isActive: !category.isActive });

    res.json({
      success: true,
      message: `分类已${category.isActive ? '启用' : '禁用'}`,
      data: { isActive: category.isActive },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '操作失败',
      error: error.message,
    });
  }
});

export default router; 