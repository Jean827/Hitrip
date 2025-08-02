"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Order_1 = require("../models/Order");
const OrderItem_1 = require("../models/OrderItem");
const User_1 = require("../models/User");
const Product_1 = require("../models/Product");
const Inventory_1 = require("../models/Inventory");
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
function generateOrderNumber() {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD${timestamp}${random}`;
}
router.get('/', auth_1.auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10, status } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const whereClause = { userId };
        if (status) {
            whereClause.status = status;
        }
        const orders = await Order_1.Order.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: OrderItem_1.OrderItem,
                    as: 'orderItems',
                    include: [
                        {
                            model: Product_1.Product,
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
    }
    catch (error) {
        logger_1.logger.error('获取订单列表失败:', error);
        res.status(500).json({
            success: false,
            message: '获取订单列表失败',
        });
    }
});
router.get('/:id', auth_1.auth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const order = await Order_1.Order.findOne({
            where: { id, userId },
            include: [
                {
                    model: User_1.User,
                    as: 'user',
                    attributes: ['id', 'username', 'email', 'phone'],
                },
                {
                    model: OrderItem_1.OrderItem,
                    as: 'orderItems',
                    include: [
                        {
                            model: Product_1.Product,
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
    }
    catch (error) {
        logger_1.logger.error('获取订单详情失败:', error);
        res.status(500).json({
            success: false,
            message: '获取订单详情失败',
        });
    }
});
router.post('/', auth_1.auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { items, shippingAddress, paymentMethod, remark, } = req.body;
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
        for (const item of items) {
            const product = await Product_1.Product.findByPk(item.productId);
            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: `商品 ${item.productId} 不存在`,
                });
            }
            const inventory = await Inventory_1.Inventory.findOne({
                where: { productId: item.productId },
            });
            if (!inventory || inventory.availableQuantity < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `商品 ${product.name} 库存不足`,
                });
            }
        }
        let totalAmount = 0;
        const orderItems = [];
        for (const item of items) {
            const product = await Product_1.Product.findByPk(item.productId);
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
        const shippingFee = totalAmount >= 99 ? 0 : 10;
        const paymentAmount = totalAmount + shippingFee;
        const order = await Order_1.Order.create({
            userId,
            orderNumber: generateOrderNumber(),
            status: Order_1.OrderStatus.PENDING,
            totalAmount,
            paymentAmount,
            discountAmount: 0,
            shippingFee,
            shippingAddress,
            paymentMethod,
            paymentStatus: Order_1.PaymentStatus.PENDING,
            remark,
        });
        for (const item of orderItems) {
            await OrderItem_1.OrderItem.create({
                orderId: order.id,
                ...item,
            });
        }
        for (const item of items) {
            await Inventory_1.Inventory.decrement('availableQuantity', {
                by: item.quantity,
                where: { productId: item.productId },
            });
        }
        const completeOrder = await Order_1.Order.findByPk(order.id, {
            include: [
                {
                    model: OrderItem_1.OrderItem,
                    as: 'orderItems',
                    include: [
                        {
                            model: Product_1.Product,
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
    }
    catch (error) {
        logger_1.logger.error('创建订单失败:', error);
        res.status(500).json({
            success: false,
            message: '创建订单失败',
        });
    }
});
router.put('/:id/status', auth_1.auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, cancelReason } = req.body;
        const userId = req.user.id;
        const order = await Order_1.Order.findOne({
            where: { id, userId },
        });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: '订单不存在',
            });
        }
        const validTransitions = {
            [Order_1.OrderStatus.PENDING]: [Order_1.OrderStatus.PAID, Order_1.OrderStatus.CANCELLED],
            [Order_1.OrderStatus.PAID]: [Order_1.OrderStatus.SHIPPED, Order_1.OrderStatus.REFUNDED],
            [Order_1.OrderStatus.SHIPPED]: [Order_1.OrderStatus.DELIVERED],
            [Order_1.OrderStatus.DELIVERED]: [Order_1.OrderStatus.COMPLETED],
        };
        const allowedTransitions = validTransitions[order.status] || [];
        if (!allowedTransitions.includes(status)) {
            return res.status(400).json({
                success: false,
                message: '订单状态变更无效',
            });
        }
        const updateData = { status };
        if (status === Order_1.OrderStatus.CANCELLED) {
            updateData.cancelledTime = new Date();
            updateData.cancelReason = cancelReason;
            const orderItems = await OrderItem_1.OrderItem.findAll({
                where: { orderId: id },
            });
            for (const item of orderItems) {
                await Inventory_1.Inventory.increment('availableQuantity', {
                    by: item.quantity,
                    where: { productId: item.productId },
                });
            }
        }
        else if (status === Order_1.OrderStatus.PAID) {
            updateData.paymentTime = new Date();
            updateData.paymentStatus = Order_1.PaymentStatus.PAID;
        }
        else if (status === Order_1.OrderStatus.SHIPPED) {
            updateData.shippedTime = new Date();
        }
        else if (status === Order_1.OrderStatus.DELIVERED) {
            updateData.deliveredTime = new Date();
        }
        else if (status === Order_1.OrderStatus.COMPLETED) {
            updateData.completedTime = new Date();
        }
        await order.update(updateData);
        res.json({
            success: true,
            data: order,
            message: '订单状态更新成功',
        });
    }
    catch (error) {
        logger_1.logger.error('更新订单状态失败:', error);
        res.status(500).json({
            success: false,
            message: '更新订单状态失败',
        });
    }
});
router.post('/:id/cancel', auth_1.auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { cancelReason } = req.body;
        const userId = req.user.id;
        const order = await Order_1.Order.findOne({
            where: { id, userId },
        });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: '订单不存在',
            });
        }
        if (order.status !== Order_1.OrderStatus.PENDING) {
            return res.status(400).json({
                success: false,
                message: '只能取消待支付的订单',
            });
        }
        await order.update({
            status: Order_1.OrderStatus.CANCELLED,
            cancelledTime: new Date(),
            cancelReason,
        });
        const orderItems = await OrderItem_1.OrderItem.findAll({
            where: { orderId: id },
        });
        for (const item of orderItems) {
            await Inventory_1.Inventory.increment('availableQuantity', {
                by: item.quantity,
                where: { productId: item.productId },
            });
        }
        res.json({
            success: true,
            message: '订单取消成功',
        });
    }
    catch (error) {
        logger_1.logger.error('取消订单失败:', error);
        res.status(500).json({
            success: false,
            message: '取消订单失败',
        });
    }
});
router.post('/:id/confirm', auth_1.auth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const order = await Order_1.Order.findOne({
            where: { id, userId },
        });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: '订单不存在',
            });
        }
        if (order.status !== Order_1.OrderStatus.DELIVERED) {
            return res.status(400).json({
                success: false,
                message: '订单状态不正确',
            });
        }
        await order.update({
            status: Order_1.OrderStatus.COMPLETED,
            completedTime: new Date(),
        });
        res.json({
            success: true,
            message: '确认收货成功',
        });
    }
    catch (error) {
        logger_1.logger.error('确认收货失败:', error);
        res.status(500).json({
            success: false,
            message: '确认收货失败',
        });
    }
});
router.get('/stats/overview', auth_1.auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const stats = await Order_1.Order.findAll({
            where: { userId },
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                [sequelize.fn('SUM', sequelize.col('paymentAmount')), 'totalAmount'],
            ],
            group: ['status'],
        });
        const totalOrders = await Order_1.Order.count({ where: { userId } });
        const totalAmount = await Order_1.Order.sum('paymentAmount', { where: { userId } });
        res.json({
            success: true,
            data: {
                stats,
                totalOrders,
                totalAmount: totalAmount || 0,
            },
        });
    }
    catch (error) {
        logger_1.logger.error('获取订单统计失败:', error);
        res.status(500).json({
            success: false,
            message: '获取订单统计失败',
        });
    }
});
exports.default = router;
//# sourceMappingURL=orders.js.map