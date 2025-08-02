import express from 'express';
import { Order, OrderStatus, PaymentStatus, PaymentMethod } from '../models/Order';
import { OrderItem } from '../models/OrderItem';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Inventory } from '../models/Inventory';
import { auth } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();

// 生成订单号
function generateOrderNumber(): string {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD${timestamp}${random}`;
}

// 获取用户订单列表
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = { userId };
    if (status) {
      whereClause.status = status;
    }

    const orders = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          include: [
            {
              model: Product,
              as: 'product',
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset,
    });

    res.json({
      success: true,
      data: {
        orders: orders.rows,
        total: orders.count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(orders.count / Number(limit)),
      },
    });
  } catch (error) {
    logger.error('获取订单列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取订单列表失败',
    });
  }
});

// 获取订单详情
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({
      where: { id, userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'phone'],
        },
        {
          model: OrderItem,
          as: 'orderItems',
          include: [
            {
              model: Product,
              as: 'product',
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    logger.error('获取订单详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取订单详情失败',
    });
  }
});

// 创建订单
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      items,
      shippingAddress,
      paymentMethod,
      remark,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: '订单商品不能为空',
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: '收货地址不能为空',
      });
    }

    // 验证商品库存
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `商品 ${item.productId} 不存在`,
        });
      }

      const inventory = await Inventory.findOne({
        where: { productId: item.productId },
      });

      if (!inventory || inventory.availableQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `商品 ${product.name} 库存不足`,
        });
      }
    }

    // 计算订单金额
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      const unitPrice = product.discountPrice || product.price;
      const totalPrice = unitPrice * item.quantity;
      totalAmount += totalPrice;

      orderItems.push({
        productId: item.productId,
        productName: product.name,
        productImage: product.images[0] || '',
        productSku: product.sku,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        specifications: item.specifications,
      });
    }

    // 计算运费（这里简化处理，实际应该根据地址计算）
    const shippingFee = totalAmount >= 99 ? 0 : 10;
    const paymentAmount = totalAmount + shippingFee;

    // 创建订单
    const order = await Order.create({
      userId,
      orderNumber: generateOrderNumber(),
      status: OrderStatus.PENDING,
      totalAmount,
      paymentAmount,
      discountAmount: 0,
      shippingFee,
      shippingAddress,
      paymentMethod,
      paymentStatus: PaymentStatus.PENDING,
      remark,
    });

    // 创建订单项
    for (const item of orderItems) {
      await OrderItem.create({
        orderId: order.id,
        ...item,
      });
    }

    // 扣减库存
    for (const item of items) {
      await Inventory.decrement('availableQuantity', {
        by: item.quantity,
        where: { productId: item.productId },
      });
    }

    // 获取完整的订单信息
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          include: [
            {
              model: Product,
              as: 'product',
            },
          ],
        },
      ],
    });

    res.json({
      success: true,
      data: completeOrder,
      message: '订单创建成功',
    });
  } catch (error) {
    logger.error('创建订单失败:', error);
    res.status(500).json({
      success: false,
      message: '创建订单失败',
    });
  }
});

// 更新订单状态
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, cancelReason } = req.body;
    const userId = req.user.id;

    const order = await Order.findOne({
      where: { id, userId },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在',
      });
    }

    // 状态流转验证
    const validTransitions = {
      [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
      [OrderStatus.PAID]: [OrderStatus.SHIPPED, OrderStatus.REFUNDED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [OrderStatus.COMPLETED],
    };

    const allowedTransitions = validTransitions[order.status] || [];
    if (!allowedTransitions.includes(status)) {
      return res.status(400).json({
        success: false,
        message: '订单状态变更无效',
      });
    }

    // 更新订单状态
    const updateData: any = { status };
    
    if (status === OrderStatus.CANCELLED) {
      updateData.cancelledTime = new Date();
      updateData.cancelReason = cancelReason;
      
      // 恢复库存
      const orderItems = await OrderItem.findAll({
        where: { orderId: id },
      });
      
      for (const item of orderItems) {
        await Inventory.increment('availableQuantity', {
          by: item.quantity,
          where: { productId: item.productId },
        });
      }
    } else if (status === OrderStatus.PAID) {
      updateData.paymentTime = new Date();
      updateData.paymentStatus = PaymentStatus.PAID;
    } else if (status === OrderStatus.SHIPPED) {
      updateData.shippedTime = new Date();
    } else if (status === OrderStatus.DELIVERED) {
      updateData.deliveredTime = new Date();
    } else if (status === OrderStatus.COMPLETED) {
      updateData.completedTime = new Date();
    }

    await order.update(updateData);

    res.json({
      success: true,
      data: order,
      message: '订单状态更新成功',
    });
  } catch (error) {
    logger.error('更新订单状态失败:', error);
    res.status(500).json({
      success: false,
      message: '更新订单状态失败',
    });
  }
});

// 取消订单
router.post('/:id/cancel', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { cancelReason } = req.body;
    const userId = req.user.id;

    const order = await Order.findOne({
      where: { id, userId },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在',
      });
    }

    if (order.status !== OrderStatus.PENDING) {
      return res.status(400).json({
        success: false,
        message: '只能取消待支付的订单',
      });
    }

    await order.update({
      status: OrderStatus.CANCELLED,
      cancelledTime: new Date(),
      cancelReason,
    });

    // 恢复库存
    const orderItems = await OrderItem.findAll({
      where: { orderId: id },
    });

    for (const item of orderItems) {
      await Inventory.increment('availableQuantity', {
        by: item.quantity,
        where: { productId: item.productId },
      });
    }

    res.json({
      success: true,
      message: '订单取消成功',
    });
  } catch (error) {
    logger.error('取消订单失败:', error);
    res.status(500).json({
      success: false,
      message: '取消订单失败',
    });
  }
});

// 确认收货
router.post('/:id/confirm', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({
      where: { id, userId },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在',
      });
    }

    if (order.status !== OrderStatus.DELIVERED) {
      return res.status(400).json({
        success: false,
        message: '订单状态不正确',
      });
    }

    await order.update({
      status: OrderStatus.COMPLETED,
      completedTime: new Date(),
    });

    res.json({
      success: true,
      message: '确认收货成功',
    });
  } catch (error) {
    logger.error('确认收货失败:', error);
    res.status(500).json({
      success: false,
      message: '确认收货失败',
    });
  }
});

// 获取订单统计
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Order.findAll({
      where: { userId },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('paymentAmount')), 'totalAmount'],
      ],
      group: ['status'],
    });

    const totalOrders = await Order.count({ where: { userId } });
    const totalAmount = await Order.sum('paymentAmount', { where: { userId } });

    res.json({
      success: true,
      data: {
        stats,
        totalOrders,
        totalAmount: totalAmount || 0,
      },
    });
  } catch (error) {
    logger.error('获取订单统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取订单统计失败',
    });
  }
});

export default router; 