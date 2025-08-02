"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const Merchant_1 = require("../models/Merchant");
const User_1 = require("../models/User");
const Product_1 = require("../models/Product");
const Order_1 = require("../models/Order");
const sequelize_1 = require("../config/sequelize");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.post('/register', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, description, logo, banner, contactPhone, contactEmail, address, businessLicense, idCardFront, idCardBack, settlementAccount, settlementBank } = req.body;
        const existingMerchant = await Merchant_1.Merchant.findOne({
            where: { userId }
        });
        if (existingMerchant) {
            return res.status(400).json({ message: '您已经是商家，无需重复申请' });
        }
        const merchant = await Merchant_1.Merchant.create({
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
            status: Merchant_1.MerchantStatus.PENDING,
            verificationStatus: Merchant_1.VerificationStatus.PENDING
        });
        await User_1.User.update({ role: 'merchant' }, { where: { id: userId } });
        res.json({
            message: '商家入驻申请提交成功，请等待审核',
            data: merchant
        });
    }
    catch (error) {
        logger_1.logger.error('商家入驻申请失败:', error);
        res.status(500).json({ message: '商家入驻申请失败' });
    }
});
router.get('/profile', auth_1.authenticateToken, (0, auth_1.requireRole)(['merchant', 'admin']), async (req, res) => {
    try {
        const userId = req.user.id;
        const merchant = await Merchant_1.Merchant.findOne({
            where: { userId },
            include: [{ model: User_1.User, as: 'user' }]
        });
        if (!merchant) {
            return res.status(404).json({ message: '商家信息不存在' });
        }
        res.json({
            message: '获取商家信息成功',
            data: merchant
        });
    }
    catch (error) {
        logger_1.logger.error('获取商家信息失败:', error);
        res.status(500).json({ message: '获取商家信息失败' });
    }
});
router.put('/profile', auth_1.authenticateToken, (0, auth_1.requireRole)(['merchant']), async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, description, logo, banner, contactPhone, contactEmail, address } = req.body;
        const merchant = await Merchant_1.Merchant.findOne({
            where: { userId }
        });
        if (!merchant) {
            return res.status(404).json({ message: '商家信息不存在' });
        }
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
    }
    catch (error) {
        logger_1.logger.error('更新商家信息失败:', error);
        res.status(500).json({ message: '更新商家信息失败' });
    }
});
router.get('/stats', auth_1.authenticateToken, (0, auth_1.requireRole)(['merchant']), async (req, res) => {
    try {
        const userId = req.user.id;
        const productStats = await Product_1.Product.findAll({
            where: { merchantId: userId },
            attributes: [
                [sequelize_1.sequelize.fn('COUNT', sequelize_1.sequelize.col('id')), 'totalProducts'],
                [sequelize_1.sequelize.fn('SUM', sequelize_1.sequelize.col('salesCount')), 'totalSales'],
                [sequelize_1.sequelize.fn('AVG', sequelize_1.sequelize.col('rating')), 'avgRating']
            ]
        });
        const orderStats = await Order_1.Order.findAll({
            include: [{
                    model: Product_1.Product,
                    where: { merchantId: userId },
                    attributes: []
                }],
            attributes: [
                [sequelize_1.sequelize.fn('COUNT', sequelize_1.sequelize.col('Order.id')), 'totalOrders'],
                [sequelize_1.sequelize.fn('SUM', sequelize_1.sequelize.col('paymentAmount')), 'totalRevenue'],
                [sequelize_1.sequelize.fn('COUNT', sequelize_1.sequelize.literal('CASE WHEN Order.status = "completed" THEN 1 END')), 'completedOrders']
            ]
        });
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const dailyStats = await Order_1.Order.findAll({
            include: [{
                    model: Product_1.Product,
                    where: { merchantId: userId },
                    attributes: []
                }],
            where: {
                createdAt: {
                    [sequelize_1.sequelize.Op.gte]: sevenDaysAgo
                }
            },
            attributes: [
                [sequelize_1.sequelize.fn('DATE', sequelize_1.sequelize.col('Order.createdAt')), 'date'],
                [sequelize_1.sequelize.fn('COUNT', sequelize_1.sequelize.col('Order.id')), 'orderCount'],
                [sequelize_1.sequelize.fn('SUM', sequelize_1.sequelize.col('paymentAmount')), 'revenue']
            ],
            group: [sequelize_1.sequelize.fn('DATE', sequelize_1.sequelize.col('Order.createdAt'))],
            order: [[sequelize_1.sequelize.fn('DATE', sequelize_1.sequelize.col('Order.createdAt')), 'ASC']]
        });
        res.json({
            message: '获取商家统计数据成功',
            data: {
                productStats: productStats[0] || {},
                orderStats: orderStats[0] || {},
                dailyStats
            }
        });
    }
    catch (error) {
        logger_1.logger.error('获取商家统计数据失败:', error);
        res.status(500).json({ message: '获取商家统计数据失败' });
    }
});
router.get('/', auth_1.authenticateToken, (0, auth_1.requireRole)(['admin']), async (req, res) => {
    try {
        const { page = 1, limit = 10, status, verificationStatus } = req.query;
        const where = {};
        if (status) {
            where.status = status;
        }
        if (verificationStatus) {
            where.verificationStatus = verificationStatus;
        }
        const { count, rows } = await Merchant_1.Merchant.findAndCountAll({
            where,
            include: [{ model: User_1.User, as: 'user' }],
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
    }
    catch (error) {
        logger_1.logger.error('获取商家列表失败:', error);
        res.status(500).json({ message: '获取商家列表失败' });
    }
});
router.put('/:id/verify', auth_1.authenticateToken, (0, auth_1.requireRole)(['admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { status, verificationStatus, verificationRemark } = req.body;
        const merchant = await Merchant_1.Merchant.findByPk(id);
        if (!merchant) {
            return res.status(404).json({ message: '商家不存在' });
        }
        const transaction = await sequelize_1.sequelize.transaction();
        try {
            await merchant.update({
                status,
                verificationStatus,
                verificationTime: new Date(),
                verificationRemark
            }, { transaction });
            if (status === Merchant_1.MerchantStatus.ACTIVE && verificationStatus === Merchant_1.VerificationStatus.VERIFIED) {
                await User_1.User.update({ role: 'merchant' }, { where: { id: merchant.userId }, transaction });
            }
            await transaction.commit();
            res.json({
                message: '商家审核完成',
                data: merchant
            });
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
    catch (error) {
        logger_1.logger.error('商家审核失败:', error);
        res.status(500).json({ message: '商家审核失败' });
    }
});
router.get('/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const merchant = await Merchant_1.Merchant.findByPk(id, {
            include: [
                { model: User_1.User, as: 'user' },
                { model: Product_1.Product, as: 'products' }
            ]
        });
        if (!merchant) {
            return res.status(404).json({ message: '商家不存在' });
        }
        res.json({
            message: '获取商家详情成功',
            data: merchant
        });
    }
    catch (error) {
        logger_1.logger.error('获取商家详情失败:', error);
        res.status(500).json({ message: '获取商家详情失败' });
    }
});
router.patch('/:id/status', auth_1.authenticateToken, (0, auth_1.requireRole)(['admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const merchant = await Merchant_1.Merchant.findByPk(id);
        if (!merchant) {
            return res.status(404).json({ message: '商家不存在' });
        }
        await merchant.update({ status });
        res.json({
            message: '商家状态更新成功',
            data: merchant
        });
    }
    catch (error) {
        logger_1.logger.error('更新商家状态失败:', error);
        res.status(500).json({ message: '更新商家状态失败' });
    }
});
router.get('/products', auth_1.authenticateToken, (0, auth_1.requireRole)(['merchant']), async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10, status } = req.query;
        const where = { merchantId: userId };
        if (status) {
            where.status = status;
        }
        const { count, rows } = await Product_1.Product.findAndCountAll({
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
    }
    catch (error) {
        logger_1.logger.error('获取我的商品失败:', error);
        res.status(500).json({ message: '获取我的商品失败' });
    }
});
router.get('/orders', auth_1.authenticateToken, (0, auth_1.requireRole)(['merchant']), async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10, status } = req.query;
        const where = {};
        if (status) {
            where.status = status;
        }
        const { count, rows } = await Order_1.Order.findAndCountAll({
            where,
            include: [{
                    model: Product_1.Product,
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
    }
    catch (error) {
        logger_1.logger.error('获取我的订单失败:', error);
        res.status(500).json({ message: '获取我的订单失败' });
    }
});
exports.default = router;
//# sourceMappingURL=merchants.js.map