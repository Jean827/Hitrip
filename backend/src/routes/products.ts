import express from 'express';
import { Op } from 'sequelize';
import Product from '../models/Product';
import Category from '../models/Category';
import Inventory from '../models/Inventory';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/errorHandler';

const router = express.Router();

// 获取商品列表
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      categoryId,
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      isActive,
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const where: any = {};

    // 分类筛选
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // 搜索功能
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { tags: { [Op.contains]: [search] } },
      ];
    }

    // 价格筛选
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = Number(minPrice);
      if (maxPrice) where.price[Op.lte] = Number(maxPrice);
    }

    // 状态筛选
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
        {
          model: Inventory,
          as: 'inventory',
          attributes: ['availableQuantity'],
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
      message: '获取商品列表失败',
      error: error.message,
    });
  }
});

// 获取商品详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'description'],
        },
        {
          model: Inventory,
          as: 'inventory',
          attributes: ['availableQuantity', 'lowStockThreshold'],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: '商品不存在',
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取商品详情失败',
      error: error.message,
    });
  }
});

// 创建商品 (需要管理员权限)
router.post('/', authenticateToken, requireRole(['admin', 'merchant']), async (req, res) => {
  try {
    const {
      name,
      description,
      categoryId,
      price,
      originalPrice,
      discountPrice,
      memberPrice,
      images,
      tags,
      stock,
      weight,
      dimensions,
      brand,
      model,
      warranty,
    } = req.body;

    // 验证必填字段
    if (!name || !description || !categoryId || !price || !originalPrice) {
      return res.status(400).json({
        success: false,
        message: '缺少必填字段',
      });
    }

    // 验证分类是否存在
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: '分类不存在',
      });
    }

    // 创建商品
    const product = await Product.create({
      name,
      description,
      categoryId,
      price: Number(price),
      originalPrice: Number(originalPrice),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      memberPrice: memberPrice ? Number(memberPrice) : undefined,
      images: images || [],
      tags: tags || [],
      stock: Number(stock) || 0,
      weight: weight ? Number(weight) : undefined,
      dimensions,
      brand,
      model,
      warranty,
      merchantId: req.user.role === 'merchant' ? req.user.id : undefined,
    });

    // 创建库存记录
    await Inventory.create({
      productId: product.id,
      quantity: Number(stock) || 0,
      availableQuantity: Number(stock) || 0,
      lowStockThreshold: 10,
      maxStock: 1000,
    });

    res.status(201).json({
      success: true,
      message: '商品创建成功',
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建商品失败',
      error: error.message,
    });
  }
});

// 更新商品 (需要管理员权限或商品所有者)
router.put('/:id', authenticateToken, requireRole(['admin', 'merchant']), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '商品不存在',
      });
    }

    // 检查权限：商家只能修改自己的商品
    if (req.user.role === 'merchant' && product.merchantId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '无权限修改此商品',
      });
    }

    // 更新商品
    await product.update(updateData);

    // 如果更新了库存，同步更新库存记录
    if (updateData.stock !== undefined) {
      const inventory = await Inventory.findOne({ where: { productId: id } });
      if (inventory) {
        await inventory.update({
          quantity: Number(updateData.stock),
          availableQuantity: Number(updateData.stock),
        });
      }
    }

    res.json({
      success: true,
      message: '商品更新成功',
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新商品失败',
      error: error.message,
    });
  }
});

// 删除商品 (需要管理员权限或商品所有者)
router.delete('/:id', authenticateToken, requireRole(['admin', 'merchant']), async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '商品不存在',
      });
    }

    // 检查权限：商家只能删除自己的商品
    if (req.user.role === 'merchant' && product.merchantId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '无权限删除此商品',
      });
    }

    // 删除商品和库存记录
    await Inventory.destroy({ where: { productId: id } });
    await product.destroy();

    res.json({
      success: true,
      message: '商品删除成功',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除商品失败',
      error: error.message,
    });
  }
});

// 商品上下架
router.patch('/:id/toggle-status', authenticateToken, requireRole(['admin', 'merchant']), async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '商品不存在',
      });
    }

    // 检查权限
    if (req.user.role === 'merchant' && product.merchantId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '无权限操作此商品',
      });
    }

    // 切换状态
    await product.update({ isActive: !product.isActive });

    res.json({
      success: true,
      message: `商品已${product.isActive ? '上架' : '下架'}`,
      data: { isActive: product.isActive },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '操作失败',
      error: error.message,
    });
  }
});

// 获取热门商品
router.get('/featured/hot', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const products = await Product.findAll({
      where: { isActive: true },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
      ],
      order: [['salesCount', 'DESC']],
      limit: Number(limit),
    });

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取热门商品失败',
      error: error.message,
    });
  }
});

// 获取推荐商品
router.get('/featured/recommended', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const products = await Product.findAll({
      where: { isActive: true },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
      ],
      order: [['rating', 'DESC']],
      limit: Number(limit),
    });

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取推荐商品失败',
      error: error.message,
    });
  }
});

export default router; 