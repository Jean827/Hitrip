import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { Payment, PaymentStatus, PaymentMethod } from '../models/Payment';
import { Order, OrderStatus } from '../models/Order';
import { User } from '../models/User';
import { sequelize } from '../config/sequelize';
import { logger } from '../utils/logger';

const router = express.Router();

// 创建支付
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { orderId, paymentMethod, amount } = req.body;
    const userId = req.user.id;

    // 验证订单
    const order = await Order.findOne({
      where: { id: orderId, userId },
      include: [{ model: User, as: 'user' }]
    });

    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }

    if (order.status !== OrderStatus.PENDING) {
      return res.status(400).json({ message: '订单状态不允许支付' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: '订单已支付' });
    }

    // 检查是否已有支付记录
    const existingPayment = await Payment.findOne({
      where: { orderId, status: PaymentStatus.PENDING }
    });

    if (existingPayment) {
      return res.status(400).json({ message: '该订单已有待支付记录' });
    }

    // 创建支付记录
    const payment = await Payment.create({
      orderId,
      userId,
      paymentMethod,
      amount,
      status: PaymentStatus.PENDING
    });

    // 根据支付方式生成支付参数
    let paymentParams = {};
    
    switch (paymentMethod) {
      case PaymentMethod.WECHAT:
        paymentParams = await generateWechatPaymentParams(payment, order);
        break;
      case PaymentMethod.ALIPAY:
        paymentParams = await generateAlipayPaymentParams(payment, order);
        break;
      case PaymentMethod.BANK_CARD:
        paymentParams = await generateBankCardPaymentParams(payment, order);
        break;
      default:
        return res.status(400).json({ message: '不支持的支付方式' });
    }

    res.json({
      message: '支付创建成功',
      data: {
        paymentId: payment.id,
        paymentParams
      }
    });

  } catch (error) {
    logger.error('创建支付失败:', error);
    res.status(500).json({ message: '创建支付失败' });
  }
});

// 支付回调处理
router.post('/callback/:paymentMethod', async (req, res) => {
  try {
    const { paymentMethod } = req.params;
    const callbackData = req.body;

    logger.info(`${paymentMethod}支付回调:`, callbackData);

    // 验证回调签名
    const isValid = await verifyPaymentCallback(paymentMethod, callbackData);
    if (!isValid) {
      return res.status(400).json({ message: '回调验证失败' });
    }

    // 解析回调数据
    const { transactionId, status, amount } = parseCallbackData(paymentMethod, callbackData);

    // 查找支付记录
    const payment = await Payment.findOne({
      where: { transactionId },
      include: [{ model: Order, as: 'order' }]
    });

    if (!payment) {
      return res.status(404).json({ message: '支付记录不存在' });
    }

    // 更新支付状态
    const transaction = await sequelize.transaction();
    
    try {
      if (status === 'success') {
        // 支付成功
        await payment.update({
          status: PaymentStatus.PAID,
          paymentTime: new Date(),
          callbackData
        }, { transaction });

        // 更新订单状态
        await payment.order.update({
          status: OrderStatus.PAID,
          paymentStatus: 'paid',
          paymentTime: new Date()
        }, { transaction });

        logger.info(`支付成功: ${payment.id}`);
      } else {
        // 支付失败
        await payment.update({
          status: PaymentStatus.FAILED,
          callbackData
        }, { transaction });

        logger.info(`支付失败: ${payment.id}`);
      }

      await transaction.commit();
      res.json({ message: '回调处理成功' });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    logger.error('支付回调处理失败:', error);
    res.status(500).json({ message: '回调处理失败' });
  }
});

// 申请退款
router.post('/refund', authenticateToken, async (req, res) => {
  try {
    const { paymentId, refundAmount, refundReason } = req.body;
    const userId = req.user.id;

    // 查找支付记录
    const payment = await Payment.findOne({
      where: { id: paymentId, userId },
      include: [{ model: Order, as: 'order' }]
    });

    if (!payment) {
      return res.status(404).json({ message: '支付记录不存在' });
    }

    if (payment.status !== PaymentStatus.PAID) {
      return res.status(400).json({ message: '支付记录状态不允许退款' });
    }

    if (refundAmount > payment.amount) {
      return res.status(400).json({ message: '退款金额不能大于支付金额' });
    }

    if (payment.refundAmount + refundAmount > payment.amount) {
      return res.status(400).json({ message: '退款金额超过可退款金额' });
    }

    // 发起退款
    const refundResult = await processRefund(payment, refundAmount, refundReason);

    if (refundResult.success) {
      // 更新支付记录
      await payment.update({
        refundAmount: payment.refundAmount + refundAmount,
        refundTime: new Date(),
        refundReason,
        status: refundAmount === payment.amount ? PaymentStatus.REFUNDED : PaymentStatus.PARTIAL_REFUNDED
      });

      // 更新订单状态
      if (refundAmount === payment.amount) {
        await payment.order.update({
          status: OrderStatus.REFUNDED
        });
      }

      res.json({
        message: '退款申请成功',
        data: { refundId: refundResult.refundId }
      });
    } else {
      res.status(400).json({ message: refundResult.message });
    }

  } catch (error) {
    logger.error('申请退款失败:', error);
    res.status(500).json({ message: '申请退款失败' });
  }
});

// 获取支付详情
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findOne({
      where: { id, userId },
      include: [
        { model: Order, as: 'order' },
        { model: User, as: 'user' }
      ]
    });

    if (!payment) {
      return res.status(404).json({ message: '支付记录不存在' });
    }

    res.json({
      message: '获取支付详情成功',
      data: payment
    });

  } catch (error) {
    logger.error('获取支付详情失败:', error);
    res.status(500).json({ message: '获取支付详情失败' });
  }
});

// 获取用户支付记录
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const { count, rows } = await Payment.findAndCountAll({
      where,
      include: [{ model: Order, as: 'order' }],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit)
    });

    res.json({
      message: '获取支付记录成功',
      data: {
        payments: rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count,
          pages: Math.ceil(count / Number(limit))
        }
      }
    });

  } catch (error) {
    logger.error('获取支付记录失败:', error);
    res.status(500).json({ message: '获取支付记录失败' });
  }
});

// 辅助函数

// 生成微信支付参数
async function generateWechatPaymentParams(payment: any, order: any) {
  // 这里应该调用微信支付SDK生成支付参数
  // 实际项目中需要配置微信支付的相关参数
  return {
    appId: process.env.WECHAT_APP_ID,
    timeStamp: Math.floor(Date.now() / 1000).toString(),
    nonceStr: Math.random().toString(36).substr(2, 15),
    package: `prepay_id=${payment.id}`,
    signType: 'MD5',
    paySign: 'mock_signature' // 实际应该是通过微信支付SDK生成的签名
  };
}

// 生成支付宝支付参数
async function generateAlipayPaymentParams(payment: any, order: any) {
  // 这里应该调用支付宝SDK生成支付参数
  return {
    orderString: `mock_alipay_order_string_${payment.id}`,
    orderId: payment.id
  };
}

// 生成银行卡支付参数
async function generateBankCardPaymentParams(payment: any, order: any) {
  return {
    paymentUrl: `/payment/bank-card/${payment.id}`,
    orderId: payment.id
  };
}

// 验证支付回调
async function verifyPaymentCallback(paymentMethod: string, callbackData: any) {
  // 实际项目中需要根据不同的支付方式验证回调签名
  switch (paymentMethod) {
    case 'wechat':
      // 验证微信支付回调签名
      return true;
    case 'alipay':
      // 验证支付宝回调签名
      return true;
    default:
      return false;
  }
}

// 解析回调数据
function parseCallbackData(paymentMethod: string, callbackData: any) {
  // 根据不同的支付方式解析回调数据
  switch (paymentMethod) {
    case 'wechat':
      return {
        transactionId: callbackData.transaction_id,
        status: callbackData.result_code === 'SUCCESS' ? 'success' : 'failed',
        amount: callbackData.total_fee / 100
      };
    case 'alipay':
      return {
        transactionId: callbackData.trade_no,
        status: callbackData.trade_status === 'TRADE_SUCCESS' ? 'success' : 'failed',
        amount: callbackData.total_amount
      };
    default:
      return {
        transactionId: callbackData.transactionId,
        status: callbackData.status,
        amount: callbackData.amount
      };
  }
}

// 处理退款
async function processRefund(payment: any, refundAmount: number, refundReason: string) {
  // 实际项目中需要调用第三方支付平台的退款API
  try {
    // 模拟退款处理
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      refundId: `refund_${Date.now()}`
    };
  } catch (error) {
    return {
      success: false,
      message: '退款处理失败'
    };
  }
}

export default router; 