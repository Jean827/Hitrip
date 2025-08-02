import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { Merchant, MerchantStatus, VerificationStatus } from '../models/Merchant';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { sequelize } from '../config/sequelize';
import { logger } from '../utils/logger';

const router = express.Router();

// 商家入驻申请
router.post('/register', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      description,
      logo,
      banner,
      contactPhone,
      contactEmail,
      address,
      businessLicense,
      idCardFront,
      idCardBack,
      settlementAccount,
      settlementBank
    } = req.body;

    // 检查用户是否已经是商家
    const existingMerchant = await Merchant.findOne({
      where: { userId }
    });

    if (existingMerchant) {
      return res.status(400).json({ message: '您已经是商家，无需重复申请' });
    }

    // 创建商家记录
    const merchant = await Merchant.create({
      userId,
      name,
      description,
      logo,
      banner,
      contactPhone,
      contactEmail,
      address,
      businessLicense,
      idCardFront,
      idCardBack,
      settlementAccount,
      settlementBank,
      status: MerchantStatus.PENDING,
      verificationStatus: VerificationStatus.PENDING
    });

    // 更新用户角色
    await User.update(
      { role: 'merchant' },
      { where: { id: userId } }
    );

    res.json({
      message: '商家入驻申请提交成功，请等待审核',
      data: merchant
    });

  } catch (error) {
    logger.error('商家入驻申请失败:', error);
    res.status(500).json({ message: '商家入驻申请失败' });
  }
});

// 获取商家信息
router.get('/profile', authenticateToken, requireRole(['merchant', 'admin']), async (req, res) => {
  try {
    const userId = req.user.id;

    const merchant = await Merchant.findOne({
      where: { userId },
      include: [{ model: User, as: 'user' }]
    });

    if (!merchant) {
      return res.status(404).json({ message: '商家信息不存在' });
    }

    res.json({
      message: '获取商家信息成功',
      data: merchant
    });

  } catch (error) {
    logger.error('获取商家信息失败:', error);
    res.status(500).json({ message: '获取商家信息失败' });
  }
});

// 更新商家信息
router.put('/profile', authenticateToken, requireRole(['merchant']), async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      description,
      logo,
      banner,
      contactPhone,
      contactEmail,
      address
    } = req.body;

    const merchant = await Merchant.findOne({
      where: { userId }
    });

    if (!merchant) {
      return res.status(404).json({ message: '商家信息不存在' });
    }

    // 更新商家信息
    await merchant.update({
      name,
      description,
      logo,
      banner,
      contactPhone,
      contactEmail,
      address
    });

    res.json({
      message: '商家信息更新成功',
      data: merchant
    });

  } catch (error) {
    logger.error('更新商家信息失败:', error);
    res.status(500).json({ message: '更新商家信息失败' });
  }
});

// 获取商家统计数据
router.get('/stats', authenticateToken, requireRole(['merchant']), async (req, res) => {
  try {
    const userId = req.user.id;

    // 获取商品统计
    const productStats = await Product.findAll({
      where: { merchantId: userId },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalProducts'],
        [sequelize.fn('SUM', sequelize.col('salesCount')), 'totalSales'],
        [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']
      ]
    });

    // 获取订单统计
    const orderStats = await Order.findAll({
      include: [{
        model: Product,
        where: { merchantId: userId },
        attributes: []
      }],
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('Order.id')), 'totalOrders'],
        [sequelize.fn('SUM', sequelize.col('paymentAmount')), 'totalRevenue'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN Order.status = "completed" THEN 1 END')), 'completedOrders']
      ]
    });

    // 获取最近7天的销售数据
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyStats = await Order.findAll({
      include: [{
        model: Product,
        where: { merchantId: userId },
        attributes: []
      }],
      where: {
        createdAt: {
          [sequelize.Op.gte]: sevenDaysAgo
        }
      },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('Order.createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('Order.id')), 'orderCount'],
        [sequelize.fn('SUM', sequelize.col('paymentAmount')), 'revenue']
      ],
      group: [sequelize.fn('DATE', sequelize.col('Order.createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('Order.createdAt')), 'ASC']]
    });

    res.json({
      message: '获取商家统计数据成功',
      data: {
        productStats: productStats[0] || {},
        orderStats: orderStats[0] || {},
        dailyStats
      }
    });

  } catch (error) {
    logger.error('获取商家统计数据失败:', error);
    res.status(500).json({ message: '获取商家统计数据失败' });
  }
});

// 管理员：获取商家列表
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, verificationStatus } = req.query;

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (verificationStatus) {
      where.verificationStatus = verificationStatus;
    }

    const { count, rows } = await Merchant.findAndCountAll({
      where,
      include: [{ model: User, as: 'user' }],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit)
    });

    res.json({
      message: '获取商家列表成功',
      data: {
        merchants: rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count,
          pages: Math.ceil(count / Number(limit))
        }
      }
    });

  } catch (error) {
    logger.error('获取商家列表失败:', error);
    res.status(500).json({ message: '获取商家列表失败' });
  }
});

// 管理员：审核商家
router.put('/:id/verify', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, verificationStatus, verificationRemark } = req.body;

    const merchant = await Merchant.findByPk(id);

    if (!merchant) {
      return res.status(404).json({ message: '商家不存在' });
    }

    const transaction = await sequelize.transaction();

    try {
      // 更新商家状态
      await merchant.update({
        status,
        verificationStatus,
        verificationTime: new Date(),
        verificationRemark
      }, { transaction });

      // 如果审核通过，更新用户角色
      if (status === MerchantStatus.ACTIVE && verificationStatus === VerificationStatus.VERIFIED) {
        await User.update(
          { role: 'merchant' },
          { where: { id: merchant.userId }, transaction }
        );
      }

      await transaction.commit();

      res.json({
        message: '商家审核完成',
        data: merchant
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    logger.error('商家审核失败:', error);
    res.status(500).json({ message: '商家审核失败' });
  }
});

// 管理员：获取商家详情
router.get('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const merchant = await Merchant.findByPk(id, {
      include: [
        { model: User, as: 'user' },
        { model: Product, as: 'products' }
      ]
    });

    if (!merchant) {
      return res.status(404).json({ message: '商家不存在' });
    }

    res.json({
      message: '获取商家详情成功',
      data: merchant
    });

  } catch (error) {
    logger.error('获取商家详情失败:', error);
    res.status(500).json({ message: '获取商家详情失败' });
  }
});

// 管理员：更新商家状态
router.patch('/:id/status', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const merchant = await Merchant.findByPk(id);

    if (!merchant) {
      return res.status(404).json({ message: '商家不存在' });
    }

    await merchant.update({ status });

    res.json({
      message: '商家状态更新成功',
      data: merchant
    });

  } catch (error) {
    logger.error('更新商家状态失败:', error);
    res.status(500).json({ message: '更新商家状态失败' });
  }
});

// 商家：获取我的商品
router.get('/products', authenticateToken, requireRole(['merchant']), async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const where: any = { merchantId: userId };
    if (status) {
      where.status = status;
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit)
    });

    res.json({
      message: '获取我的商品成功',
      data: {
        products: rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count,
          pages: Math.ceil(count / Number(limit))
        }
      }
    });

  } catch (error) {
    logger.error('获取我的商品失败:', error);
    res.status(500).json({ message: '获取我的商品失败' });
  }
});

// 商家：获取我的订单
router.get('/orders', authenticateToken, requireRole(['merchant']), async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [{
        model: Product,
        where: { merchantId: userId },
        attributes: ['id', 'name', 'image']
      }],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit)
    });

    res.json({
      message: '获取我的订单成功',
      data: {
        orders: rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count,
          pages: Math.ceil(count / Number(limit))
        }
      }
    });

  } catch (error) {
    logger.error('获取我的订单失败:', error);
    res.status(500).json({ message: '获取我的订单失败' });
  }
});

export default router; 