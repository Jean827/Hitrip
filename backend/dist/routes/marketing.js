"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = require("../models/User");
const MarketingCampaign_1 = require("../models/MarketingCampaign");
const Coupon_1 = require("../models/Coupon");
const PointProduct_1 = require("../models/PointProduct");
const UserPoints_1 = require("../models/UserPoints");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/campaigns', auth_1.auth, async (req, res) => {
    try {
        const { page = 1, limit = 10, status, type } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const where = {};
        if (status)
            where.status = status;
        if (type)
            where.type = type;
        const campaigns = await MarketingCampaign_1.MarketingCampaign.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [['createdAt', 'DESC']],
            include: [{
                    model: User_1.User,
                    as: 'creator',
                    attributes: ['username']
                }]
        });
        res.json({
            success: true,
            data: {
                campaigns: campaigns.rows,
                total: campaigns.count,
                page: parseInt(page),
                totalPages: Math.ceil(campaigns.count / parseInt(limit))
            }
        });
    }
    catch (error) {
        console.error('获取活动列表失败:', error);
        res.status(500).json({
            success: false,
            message: '获取活动列表失败'
        });
    }
});
router.post('/campaigns', auth_1.auth, async (req, res) => {
    try {
        const { name, description, type, startTime, endTime, rules, budget, targetAudience } = req.body;
        const campaign = await MarketingCampaign_1.MarketingCampaign.create({
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
    }
    catch (error) {
        console.error('创建营销活动失败:', error);
        res.status(500).json({
            success: false,
            message: '创建营销活动失败'
        });
    }
});
router.put('/campaigns/:id', auth_1.auth, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        updateData.updatedBy = req.user.id;
        const campaign = await MarketingCampaign_1.MarketingCampaign.findByPk(id);
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
    }
    catch (error) {
        console.error('更新营销活动失败:', error);
        res.status(500).json({
            success: false,
            message: '更新营销活动失败'
        });
    }
});
router.delete('/campaigns/:id', auth_1.auth, async (req, res) => {
    try {
        const { id } = req.params;
        const campaign = await MarketingCampaign_1.MarketingCampaign.findByPk(id);
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
    }
    catch (error) {
        console.error('删除营销活动失败:', error);
        res.status(500).json({
            success: false,
            message: '删除营销活动失败'
        });
    }
});
router.get('/campaigns/:id/stats', auth_1.auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { timeRange = '30' } = req.query;
        const days = parseInt(timeRange);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const campaign = await MarketingCampaign_1.MarketingCampaign.findByPk(id);
        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: '活动不存在'
            });
        }
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
    }
    catch (error) {
        console.error('获取活动统计失败:', error);
        res.status(500).json({
            success: false,
            message: '获取活动统计失败'
        });
    }
});
router.get('/coupons', auth_1.auth, async (req, res) => {
    try {
        const { page = 1, limit = 10, status, type } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const where = {};
        if (status)
            where.status = status;
        if (type)
            where.type = type;
        const coupons = await Coupon_1.Coupon.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [['createdAt', 'DESC']],
            include: [{
                    model: User_1.User,
                    as: 'creator',
                    attributes: ['username']
                }]
        });
        res.json({
            success: true,
            data: {
                coupons: coupons.rows,
                total: coupons.count,
                page: parseInt(page),
                totalPages: Math.ceil(coupons.count / parseInt(limit))
            }
        });
    }
    catch (error) {
        console.error('获取优惠券列表失败:', error);
        res.status(500).json({
            success: false,
            message: '获取优惠券列表失败'
        });
    }
});
router.post('/coupons', auth_1.auth, async (req, res) => {
    try {
        const { code, name, type, discountValue, minAmount, maxDiscount, startTime, endTime, usageLimit, applicableProducts, applicableUsers } = req.body;
        const coupon = await Coupon_1.Coupon.create({
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
    }
    catch (error) {
        console.error('创建优惠券失败:', error);
        res.status(500).json({
            success: false,
            message: '创建优惠券失败'
        });
    }
});
router.put('/coupons/:id', auth_1.auth, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        updateData.updatedBy = req.user.id;
        const coupon = await Coupon_1.Coupon.findByPk(id);
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
    }
    catch (error) {
        console.error('更新优惠券失败:', error);
        res.status(500).json({
            success: false,
            message: '更新优惠券失败'
        });
    }
});
router.delete('/coupons/:id', auth_1.auth, async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await Coupon_1.Coupon.findByPk(id);
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
    }
    catch (error) {
        console.error('删除优惠券失败:', error);
        res.status(500).json({
            success: false,
            message: '删除优惠券失败'
        });
    }
});
router.post('/coupons/apply', auth_1.auth, async (req, res) => {
    try {
        const { code, orderId, amount } = req.body;
        const coupon = await Coupon_1.Coupon.findOne({
            where: { code, status: 'active' }
        });
        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: '优惠券不存在或已失效'
            });
        }
        const now = new Date();
        if (now < coupon.startTime || now > coupon.endTime) {
            return res.status(400).json({
                success: false,
                message: '优惠券不在有效期内'
            });
        }
        if (coupon.usageLimit !== -1 && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({
                success: false,
                message: '优惠券使用次数已达上限'
            });
        }
        if (amount < coupon.minAmount) {
            return res.status(400).json({
                success: false,
                message: `订单金额不足，最低消费${coupon.minAmount}元`
            });
        }
        let discountAmount = 0;
        switch (coupon.type) {
            case 'discount':
                discountAmount = amount * (coupon.discountValue / 100);
                break;
            case 'full_reduction':
                discountAmount = coupon.discountValue;
                break;
            case 'free_shipping':
                discountAmount = 0;
                break;
            default:
                discountAmount = 0;
        }
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
    }
    catch (error) {
        console.error('应用优惠券失败:', error);
        res.status(500).json({
            success: false,
            message: '应用优惠券失败'
        });
    }
});
router.get('/point-products', auth_1.auth, async (req, res) => {
    try {
        const { page = 1, limit = 10, status, category } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const where = {};
        if (status)
            where.status = status;
        if (category)
            where.category = category;
        const products = await PointProduct_1.PointProduct.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [['createdAt', 'DESC']],
            include: [{
                    model: User_1.User,
                    as: 'creator',
                    attributes: ['username']
                }]
        });
        res.json({
            success: true,
            data: {
                products: products.rows,
                total: products.count,
                page: parseInt(page),
                totalPages: Math.ceil(products.count / parseInt(limit))
            }
        });
    }
    catch (error) {
        console.error('获取积分商品列表失败:', error);
        res.status(500).json({
            success: false,
            message: '获取积分商品列表失败'
        });
    }
});
router.post('/point-products', auth_1.auth, async (req, res) => {
    try {
        const { name, description, image, points, stock, category } = req.body;
        const product = await PointProduct_1.PointProduct.create({
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
    }
    catch (error) {
        console.error('创建积分商品失败:', error);
        res.status(500).json({
            success: false,
            message: '创建积分商品失败'
        });
    }
});
router.put('/point-products/:id', auth_1.auth, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        updateData.updatedBy = req.user.id;
        const product = await PointProduct_1.PointProduct.findByPk(id);
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
    }
    catch (error) {
        console.error('更新积分商品失败:', error);
        res.status(500).json({
            success: false,
            message: '更新积分商品失败'
        });
    }
});
router.delete('/point-products/:id', auth_1.auth, async (req, res) => {
    try {
        const { id } = req.params;
        const product = await PointProduct_1.PointProduct.findByPk(id);
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
    }
    catch (error) {
        console.error('删除积分商品失败:', error);
        res.status(500).json({
            success: false,
            message: '删除积分商品失败'
        });
    }
});
router.post('/point-products/exchange', auth_1.auth, async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const product = await PointProduct_1.PointProduct.findByPk(productId);
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
        let userPoints = await UserPoints_1.UserPoints.findOne({
            where: { userId: req.user.id }
        });
        if (!userPoints) {
            userPoints = await UserPoints_1.UserPoints.create({
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
    }
    catch (error) {
        console.error('兑换积分商品失败:', error);
        res.status(500).json({
            success: false,
            message: '兑换积分商品失败'
        });
    }
});
router.get('/user-points', auth_1.auth, async (req, res) => {
    try {
        let userPoints = await UserPoints_1.UserPoints.findOne({
            where: { userId: req.user.id }
        });
        if (!userPoints) {
            userPoints = await UserPoints_1.UserPoints.create({
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
    }
    catch (error) {
        console.error('获取用户积分失败:', error);
        res.status(500).json({
            success: false,
            message: '获取用户积分失败'
        });
    }
});
router.post('/user-points/earn', auth_1.auth, async (req, res) => {
    try {
        const { points, reason } = req.body;
        let userPoints = await UserPoints_1.UserPoints.findOne({
            where: { userId: req.user.id }
        });
        if (!userPoints) {
            userPoints = await UserPoints_1.UserPoints.create({
                userId: req.user.id,
                totalPoints: points,
                availablePoints: points,
                usedPoints: 0,
                lastUpdated: new Date()
            });
        }
        else {
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
    }
    catch (error) {
        console.error('赚取积分失败:', error);
        res.status(500).json({
            success: false,
            message: '赚取积分失败'
        });
    }
});
router.post('/user-points/use', auth_1.auth, async (req, res) => {
    try {
        const { points, reason } = req.body;
        const userPoints = await UserPoints_1.UserPoints.findOne({
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
    }
    catch (error) {
        console.error('使用积分失败:', error);
        res.status(500).json({
            success: false,
            message: '使用积分失败'
        });
    }
});
exports.default = router;
//# sourceMappingURL=marketing.js.map