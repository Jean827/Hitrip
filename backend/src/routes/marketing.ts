import express from 'express';
import { Op } from 'sequelize';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { MarketingCampaign } from '../models/MarketingCampaign';
import { Coupon } from '../models/Coupon';
import { PointProduct } from '../models/PointProduct';
import { UserPoints } from '../models/UserPoints';
import { auth } from '../middleware/auth';

const router = express.Router();

// ==================== 营销活动管理 ====================

// 获取活动列表
router.get('/campaigns', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const campaigns = await MarketingCampaign.findAndCountAll({
      where,
      limit: parseInt(limit as string),
      offset,
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'creator',
        attributes: ['username']
      }]
    });

    res.json({
      success: true,
      data: {
        campaigns: campaigns.rows,
        total: campaigns.count,
        page: parseInt(page as string),
        totalPages: Math.ceil(campaigns.count / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('获取活动列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取活动列表失败'
    });
  }
});

// 创建营销活动
router.post('/campaigns', auth, async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      startTime,
      endTime,
      rules,
      budget,
      targetAudience
    } = req.body;

    const campaign = await MarketingCampaign.create({
      name,
      description,
      type,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      rules,
      budget,
      targetAudience,
      createdBy: req.user.id,
      updatedBy: req.user.id
    });

    res.json({
      success: true,
      data: campaign
    });
  } catch (error) {
    console.error('创建营销活动失败:', error);
    res.status(500).json({
      success: false,
      message: '创建营销活动失败'
    });
  }
});

// 更新营销活动
router.put('/campaigns/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    updateData.updatedBy = req.user.id;

    const campaign = await MarketingCampaign.findByPk(id);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: '活动不存在'
      });
    }

    await campaign.update(updateData);

    res.json({
      success: true,
      data: campaign
    });
  } catch (error) {
    console.error('更新营销活动失败:', error);
    res.status(500).json({
      success: false,
      message: '更新营销活动失败'
    });
  }
});

// 删除营销活动
router.delete('/campaigns/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const campaign = await MarketingCampaign.findByPk(id);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: '活动不存在'
      });
    }

    await campaign.destroy();

    res.json({
      success: true,
      message: '活动删除成功'
    });
  } catch (error) {
    console.error('删除营销活动失败:', error);
    res.status(500).json({
      success: false,
      message: '删除营销活动失败'
    });
  }
});

// 获取活动统计
router.get('/campaigns/:id/stats', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { timeRange = '30' } = req.query;
    const days = parseInt(timeRange as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const campaign = await MarketingCampaign.findByPk(id);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: '活动不存在'
      });
    }

    // 这里可以根据活动类型计算相关统计
    const stats = {
      totalParticipants: 0,
      totalRevenue: 0,
      conversionRate: 0,
      costPerAcquisition: 0
    };

    res.json({
      success: true,
      data: {
        campaign,
        stats
      }
    });
  } catch (error) {
    console.error('获取活动统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取活动统计失败'
    });
  }
});

// ==================== 优惠券管理 ====================

// 获取优惠券列表
router.get('/coupons', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const coupons = await Coupon.findAndCountAll({
      where,
      limit: parseInt(limit as string),
      offset,
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'creator',
        attributes: ['username']
      }]
    });

    res.json({
      success: true,
      data: {
        coupons: coupons.rows,
        total: coupons.count,
        page: parseInt(page as string),
        totalPages: Math.ceil(coupons.count / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('获取优惠券列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取优惠券列表失败'
    });
  }
});

// 创建优惠券
router.post('/coupons', auth, async (req, res) => {
  try {
    const {
      code,
      name,
      type,
      discountValue,
      minAmount,
      maxDiscount,
      startTime,
      endTime,
      usageLimit,
      applicableProducts,
      applicableUsers
    } = req.body;

    const coupon = await Coupon.create({
      code,
      name,
      type,
      discountValue,
      minAmount,
      maxDiscount,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      usageLimit,
      applicableProducts,
      applicableUsers,
      createdBy: req.user.id,
      updatedBy: req.user.id
    });

    res.json({
      success: true,
      data: coupon
    });
  } catch (error) {
    console.error('创建优惠券失败:', error);
    res.status(500).json({
      success: false,
      message: '创建优惠券失败'
    });
  }
});

// 更新优惠券
router.put('/coupons/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    updateData.updatedBy = req.user.id;

    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: '优惠券不存在'
      });
    }

    await coupon.update(updateData);

    res.json({
      success: true,
      data: coupon
    });
  } catch (error) {
    console.error('更新优惠券失败:', error);
    res.status(500).json({
      success: false,
      message: '更新优惠券失败'
    });
  }
});

// 删除优惠券
router.delete('/coupons/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: '优惠券不存在'
      });
    }

    await coupon.destroy();

    res.json({
      success: true,
      message: '优惠券删除成功'
    });
  } catch (error) {
    console.error('删除优惠券失败:', error);
    res.status(500).json({
      success: false,
      message: '删除优惠券失败'
    });
  }
});

// 应用优惠券
router.post('/coupons/apply', auth, async (req, res) => {
  try {
    const { code, orderId, amount } = req.body;

    const coupon = await Coupon.findOne({
      where: { code, status: 'active' }
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: '优惠券不存在或已失效'
      });
    }

    // 检查优惠券是否过期
    const now = new Date();
    if (now < coupon.startTime || now > coupon.endTime) {
      return res.status(400).json({
        success: false,
        message: '优惠券不在有效期内'
      });
    }

    // 检查使用次数限制
    if (coupon.usageLimit !== -1 && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: '优惠券使用次数已达上限'
      });
    }

    // 检查最低消费金额
    if (amount < coupon.minAmount) {
      return res.status(400).json({
        success: false,
        message: `订单金额不足，最低消费${coupon.minAmount}元`
      });
    }

    // 计算优惠金额
    let discountAmount = 0;
    switch (coupon.type) {
      case 'discount':
        discountAmount = amount * (coupon.discountValue / 100);
        break;
      case 'full_reduction':
        discountAmount = coupon.discountValue;
        break;
      case 'free_shipping':
        discountAmount = 0; // 免邮费逻辑
        break;
      default:
        discountAmount = 0;
    }

    // 限制最大优惠金额
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }

    res.json({
      success: true,
      data: {
        coupon,
        discountAmount,
        finalAmount: amount - discountAmount
      }
    });
  } catch (error) {
    console.error('应用优惠券失败:', error);
    res.status(500).json({
      success: false,
      message: '应用优惠券失败'
    });
  }
});

// ==================== 积分商城管理 ====================

// 获取积分商品列表
router.get('/point-products', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = category;

    const products = await PointProduct.findAndCountAll({
      where,
      limit: parseInt(limit as string),
      offset,
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'creator',
        attributes: ['username']
      }]
    });

    res.json({
      success: true,
      data: {
        products: products.rows,
        total: products.count,
        page: parseInt(page as string),
        totalPages: Math.ceil(products.count / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('获取积分商品列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取积分商品列表失败'
    });
  }
});

// 创建积分商品
router.post('/point-products', auth, async (req, res) => {
  try {
    const {
      name,
      description,
      image,
      points,
      stock,
      category
    } = req.body;

    const product = await PointProduct.create({
      name,
      description,
      image,
      points,
      stock,
      category,
      createdBy: req.user.id,
      updatedBy: req.user.id
    });

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('创建积分商品失败:', error);
    res.status(500).json({
      success: false,
      message: '创建积分商品失败'
    });
  }
});

// 更新积分商品
router.put('/point-products/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    updateData.updatedBy = req.user.id;

    const product = await PointProduct.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '积分商品不存在'
      });
    }

    await product.update(updateData);

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('更新积分商品失败:', error);
    res.status(500).json({
      success: false,
      message: '更新积分商品失败'
    });
  }
});

// 删除积分商品
router.delete('/point-products/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await PointProduct.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '积分商品不存在'
      });
    }

    await product.destroy();

    res.json({
      success: true,
      message: '积分商品删除成功'
    });
  } catch (error) {
    console.error('删除积分商品失败:', error);
    res.status(500).json({
      success: false,
      message: '删除积分商品失败'
    });
  }
});

// 兑换积分商品
router.post('/point-products/exchange', auth, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await PointProduct.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '积分商品不存在'
      });
    }

    if (product.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: '积分商品不可兑换'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: '积分商品库存不足'
      });
    }

    // 获取用户积分
    let userPoints = await UserPoints.findOne({
      where: { userId: req.user.id }
    });

    if (!userPoints) {
      userPoints = await UserPoints.create({
        userId: req.user.id,
        totalPoints: 0,
        availablePoints: 0,
        usedPoints: 0,
        lastUpdated: new Date()
      });
    }

    const requiredPoints = product.points * quantity;
    if (userPoints.availablePoints < requiredPoints) {
      return res.status(400).json({
        success: false,
        message: '积分不足'
      });
    }

    // 扣除积分并更新库存
    await userPoints.update({
      availablePoints: userPoints.availablePoints - requiredPoints,
      usedPoints: userPoints.usedPoints + requiredPoints,
      lastUpdated: new Date()
    });

    await product.update({
      stock: product.stock - quantity,
      exchangeCount: product.exchangeCount + quantity,
      status: product.stock - quantity <= 0 ? 'out_of_stock' : product.status
    });

    res.json({
      success: true,
      message: '兑换成功',
      data: {
        product,
        usedPoints: requiredPoints,
        remainingPoints: userPoints.availablePoints - requiredPoints
      }
    });
  } catch (error) {
    console.error('兑换积分商品失败:', error);
    res.status(500).json({
      success: false,
      message: '兑换积分商品失败'
    });
  }
});

// ==================== 用户积分管理 ====================

// 获取用户积分信息
router.get('/user-points', auth, async (req, res) => {
  try {
    let userPoints = await UserPoints.findOne({
      where: { userId: req.user.id }
    });

    if (!userPoints) {
      userPoints = await UserPoints.create({
        userId: req.user.id,
        totalPoints: 0,
        availablePoints: 0,
        usedPoints: 0,
        lastUpdated: new Date()
      });
    }

    res.json({
      success: true,
      data: userPoints
    });
  } catch (error) {
    console.error('获取用户积分失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户积分失败'
    });
  }
});

// 赚取积分
router.post('/user-points/earn', auth, async (req, res) => {
  try {
    const { points, reason } = req.body;

    let userPoints = await UserPoints.findOne({
      where: { userId: req.user.id }
    });

    if (!userPoints) {
      userPoints = await UserPoints.create({
        userId: req.user.id,
        totalPoints: points,
        availablePoints: points,
        usedPoints: 0,
        lastUpdated: new Date()
      });
    } else {
      await userPoints.update({
        totalPoints: userPoints.totalPoints + points,
        availablePoints: userPoints.availablePoints + points,
        lastUpdated: new Date()
      });
    }

    res.json({
      success: true,
      message: '积分获取成功',
      data: userPoints
    });
  } catch (error) {
    console.error('赚取积分失败:', error);
    res.status(500).json({
      success: false,
      message: '赚取积分失败'
    });
  }
});

// 使用积分
router.post('/user-points/use', auth, async (req, res) => {
  try {
    const { points, reason } = req.body;

    const userPoints = await UserPoints.findOne({
      where: { userId: req.user.id }
    });

    if (!userPoints) {
      return res.status(404).json({
        success: false,
        message: '用户积分记录不存在'
      });
    }

    if (userPoints.availablePoints < points) {
      return res.status(400).json({
        success: false,
        message: '可用积分不足'
      });
    }

    await userPoints.update({
      availablePoints: userPoints.availablePoints - points,
      usedPoints: userPoints.usedPoints + points,
      lastUpdated: new Date()
    });

    res.json({
      success: true,
      message: '积分使用成功',
      data: userPoints
    });
  } catch (error) {
    console.error('使用积分失败:', error);
    res.status(500).json({
      success: false,
      message: '使用积分失败'
    });
  }
});

export default router; 