"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const Payment_1 = require("../models/Payment");
const Order_1 = require("../models/Order");
const User_1 = require("../models/User");
const sequelize_1 = require("../config/sequelize");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { orderId, paymentMethod, amount } = req.body;
        const userId = req.user.id;
        const order = await Order_1.Order.findOne({
            where: { id: orderId, userId },
            include: [{ model: User_1.User, as: 'user' }]
        });
        if (!order) {
            return res.status(404).json({ message: '订单不存在' });
        }
        if (order.status !== Order_1.OrderStatus.PENDING) {
            return res.status(400).json({ message: '订单状态不允许支付' });
        }
        if (order.paymentStatus === 'paid') {
            return res.status(400).json({ message: '订单已支付' });
        }
        const existingPayment = await Payment_1.Payment.findOne({
            where: { orderId, status: Payment_1.PaymentStatus.PENDING }
        });
        if (existingPayment) {
            return res.status(400).json({ message: '该订单已有待支付记录' });
        }
        const payment = await Payment_1.Payment.create({
            orderId,
            userId,
            paymentMethod,
            amount,
            status: Payment_1.PaymentStatus.PENDING
        });
        let paymentParams = {};
        switch (paymentMethod) {
            case Payment_1.PaymentMethod.WECHAT:
                paymentParams = await generateWechatPaymentParams(payment, order);
                break;
            case Payment_1.PaymentMethod.ALIPAY:
                paymentParams = await generateAlipayPaymentParams(payment, order);
                break;
            case Payment_1.PaymentMethod.BANK_CARD:
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
    }
    catch (error) {
        logger_1.logger.error('创建支付失败:', error);
        res.status(500).json({ message: '创建支付失败' });
    }
});
router.post('/callback/:paymentMethod', async (req, res) => {
    try {
        const { paymentMethod } = req.params;
        const callbackData = req.body;
        logger_1.logger.info(`${paymentMethod}支付回调:`, callbackData);
        const isValid = await verifyPaymentCallback(paymentMethod, callbackData);
        if (!isValid) {
            return res.status(400).json({ message: '回调验证失败' });
        }
        const { transactionId, status, amount } = parseCallbackData(paymentMethod, callbackData);
        const payment = await Payment_1.Payment.findOne({
            where: { transactionId },
            include: [{ model: Order_1.Order, as: 'order' }]
        });
        if (!payment) {
            return res.status(404).json({ message: '支付记录不存在' });
        }
        const transaction = await sequelize_1.sequelize.transaction();
        try {
            if (status === 'success') {
                await payment.update({
                    status: Payment_1.PaymentStatus.PAID,
                    paymentTime: new Date(),
                    callbackData
                }, { transaction });
                await payment.order.update({
                    status: Order_1.OrderStatus.PAID,
                    paymentStatus: 'paid',
                    paymentTime: new Date()
                }, { transaction });
                logger_1.logger.info(`支付成功: ${payment.id}`);
            }
            else {
                await payment.update({
                    status: Payment_1.PaymentStatus.FAILED,
                    callbackData
                }, { transaction });
                logger_1.logger.info(`支付失败: ${payment.id}`);
            }
            await transaction.commit();
            res.json({ message: '回调处理成功' });
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
    catch (error) {
        logger_1.logger.error('支付回调处理失败:', error);
        res.status(500).json({ message: '回调处理失败' });
    }
});
router.post('/refund', auth_1.authenticateToken, async (req, res) => {
    try {
        const { paymentId, refundAmount, refundReason } = req.body;
        const userId = req.user.id;
        const payment = await Payment_1.Payment.findOne({
            where: { id: paymentId, userId },
            include: [{ model: Order_1.Order, as: 'order' }]
        });
        if (!payment) {
            return res.status(404).json({ message: '支付记录不存在' });
        }
        if (payment.status !== Payment_1.PaymentStatus.PAID) {
            return res.status(400).json({ message: '支付记录状态不允许退款' });
        }
        if (refundAmount > payment.amount) {
            return res.status(400).json({ message: '退款金额不能大于支付金额' });
        }
        if (payment.refundAmount + refundAmount > payment.amount) {
            return res.status(400).json({ message: '退款金额超过可退款金额' });
        }
        const refundResult = await processRefund(payment, refundAmount, refundReason);
        if (refundResult.success) {
            await payment.update({
                refundAmount: payment.refundAmount + refundAmount,
                refundTime: new Date(),
                refundReason,
                status: refundAmount === payment.amount ? Payment_1.PaymentStatus.REFUNDED : Payment_1.PaymentStatus.PARTIAL_REFUNDED
            });
            if (refundAmount === payment.amount) {
                await payment.order.update({
                    status: Order_1.OrderStatus.REFUNDED
                });
            }
            res.json({
                message: '退款申请成功',
                data: { refundId: refundResult.refundId }
            });
        }
        else {
            res.status(400).json({ message: refundResult.message });
        }
    }
    catch (error) {
        logger_1.logger.error('申请退款失败:', error);
        res.status(500).json({ message: '申请退款失败' });
    }
});
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const payment = await Payment_1.Payment.findOne({
            where: { id, userId },
            include: [
                { model: Order_1.Order, as: 'order' },
                { model: User_1.User, as: 'user' }
            ]
        });
        if (!payment) {
            return res.status(404).json({ message: '支付记录不存在' });
        }
        res.json({
            message: '获取支付详情成功',
            data: payment
        });
    }
    catch (error) {
        logger_1.logger.error('获取支付详情失败:', error);
        res.status(500).json({ message: '获取支付详情失败' });
    }
});
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10, status } = req.query;
        const where = { userId };
        if (status) {
            where.status = status;
        }
        const { count, rows } = await Payment_1.Payment.findAndCountAll({
            where,
            include: [{ model: Order_1.Order, as: 'order' }],
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
    }
    catch (error) {
        logger_1.logger.error('获取支付记录失败:', error);
        res.status(500).json({ message: '获取支付记录失败' });
    }
});
async function generateWechatPaymentParams(payment, order) {
    return {
        appId: process.env.WECHAT_APP_ID,
        timeStamp: Math.floor(Date.now() / 1000).toString(),
        nonceStr: Math.random().toString(36).substr(2, 15),
        package: `prepay_id=${payment.id}`,
        signType: 'MD5',
        paySign: 'mock_signature'
    };
}
async function generateAlipayPaymentParams(payment, order) {
    return {
        orderString: `mock_alipay_order_string_${payment.id}`,
        orderId: payment.id
    };
}
async function generateBankCardPaymentParams(payment, order) {
    return {
        paymentUrl: `/payment/bank-card/${payment.id}`,
        orderId: payment.id
    };
}
async function verifyPaymentCallback(paymentMethod, callbackData) {
    switch (paymentMethod) {
        case 'wechat':
            return true;
        case 'alipay':
            return true;
        default:
            return false;
    }
}
function parseCallbackData(paymentMethod, callbackData) {
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
async function processRefund(payment, refundAmount, refundReason) {
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
            success: true,
            refundId: `refund_${Date.now()}`
        };
    }
    catch (error) {
        return {
            success: false,
            message: '退款处理失败'
        };
    }
}
exports.default = router;
//# sourceMappingURL=payments.js.map