"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const collaborativeFiltering_1 = __importDefault(require("../utils/collaborativeFiltering"));
const UserBehavior_1 = __importDefault(require("../models/UserBehavior"));
const Recommendation_1 = __importDefault(require("../models/Recommendation"));
const Product_1 = __importDefault(require("../models/Product"));
const sequelize_1 = require("sequelize");
const router = express_1.default.Router();
router.get('/personalized', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { type = 'hybrid', limit = 10 } = req.query;
        let recommendations;
        switch (type) {
            case 'user-based':
                recommendations = await collaborativeFiltering_1.default.getUserBasedRecommendations(userId, Number(limit));
                break;
            case 'item-based':
                recommendations = await collaborativeFiltering_1.default.getItemBasedRecommendations(userId, Number(limit));
                break;
            case 'hybrid':
            default:
                recommendations = await collaborativeFiltering_1.default.getHybridRecommendations(userId, Number(limit));
                break;
        }
        const productIds = recommendations.map(r => r.productId);
        const products = await Product_1.default.findAll({
            where: { id: { [sequelize_1.Op.in]: productIds } },
            include: [
                {
                    model: require('../models/Category').default,
                    as: 'category',
                    attributes: ['id', 'name'],
                },
            ],
        });
        const result = recommendations.map(rec => {
            const product = products.find(p => p.id === rec.productId);
            return {
                ...rec,
                product: product ? {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    category: product.category,
                } : null,
            };
        }).filter(item => item.product !== null);
        await Promise.all(result.map(rec => Recommendation_1.default.upsert({
            userId,
            productId: rec.productId,
            score: rec.score,
            recommendationType: type,
            reason: rec.reason,
            isDisplayed: true,
        })));
        res.json({
            success: true,
            data: result,
            type,
            count: result.length,
        });
    }
    catch (error) {
        console.error('获取个性化推荐失败:', error);
        res.status(500).json({
            success: false,
            message: '获取推荐失败',
            error: error instanceof Error ? error.message : '未知错误',
        });
    }
});
router.get('/popular', async (req, res) => {
    try {
        const { limit = 10, categoryId } = req.query;
        let whereClause = {
            behaviorType: 'purchase',
        };
        if (categoryId) {
            whereClause.categoryId = categoryId;
        }
        const popularProducts = await UserBehavior_1.default.findAll({
            where: whereClause,
            attributes: [
                'productId',
                [require('sequelize').fn('COUNT', require('sequelize').col('productId')), 'purchaseCount'],
            ],
            group: ['productId'],
            order: [[require('sequelize').fn('COUNT', require('sequelize').col('productId')), 'DESC']],
            limit: Number(limit),
        });
        const productIds = popularProducts.map((p) => p.productId);
        const products = await Product_1.default.findAll({
            where: { id: { [sequelize_1.Op.in]: productIds } },
            include: [
                {
                    model: require('../models/Category').default,
                    as: 'category',
                    attributes: ['id', 'name'],
                },
            ],
        });
        const result = popularProducts.map((popular) => {
            const product = products.find(p => p.id === popular.productId);
            return {
                productId: popular.productId,
                score: 0.5,
                reason: `热门商品，已购买${popular.dataValues.purchaseCount}次`,
                product: product ? {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    category: product.category,
                } : null,
            };
        }).filter(item => item.product !== null);
        res.json({
            success: true,
            data: result,
            count: result.length,
        });
    }
    catch (error) {
        console.error('获取热门推荐失败:', error);
        res.status(500).json({
            success: false,
            message: '获取热门推荐失败',
            error: error instanceof Error ? error.message : '未知错误',
        });
    }
});
router.get('/similar/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const { limit = 10 } = req.query;
        const similarItems = await require('../models/ItemSimilarity').default.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { productId1: productId },
                    { productId2: productId },
                ],
                similarity: { [sequelize_1.Op.gt]: 0.1 },
            },
            order: [['similarity', 'DESC']],
            limit: Number(limit),
        });
        const similarProductIds = similarItems.map(item => item.productId1 === parseInt(productId) ? item.productId2 : item.productId1);
        const products = await Product_1.default.findAll({
            where: { id: { [sequelize_1.Op.in]: similarProductIds } },
            include: [
                {
                    model: require('../models/Category').default,
                    as: 'category',
                    attributes: ['id', 'name'],
                },
            ],
        });
        const result = similarItems.map(item => {
            const similarProductId = item.productId1 === parseInt(productId) ? item.productId2 : item.productId1;
            const product = products.find(p => p.id === similarProductId);
            return {
                productId: similarProductId,
                score: item.similarity,
                reason: `与当前商品相似度${(item.similarity * 100).toFixed(1)}%`,
                product: product ? {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    category: product.category,
                } : null,
            };
        }).filter(item => item.product !== null);
        res.json({
            success: true,
            data: result,
            count: result.length,
        });
    }
    catch (error) {
        console.error('获取相似商品推荐失败:', error);
        res.status(500).json({
            success: false,
            message: '获取相似商品推荐失败',
            error: error instanceof Error ? error.message : '未知错误',
        });
    }
});
router.post('/behavior', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, behaviorType, behaviorData, sessionId, userAgent, ipAddress, referrer } = req.body;
        if (!productId || !behaviorType) {
            return res.status(400).json({
                success: false,
                message: '缺少必要参数',
            });
        }
        const product = await Product_1.default.findByPk(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: '商品不存在',
            });
        }
        await UserBehavior_1.default.create({
            userId,
            productId,
            categoryId: product.categoryId,
            behaviorType,
            behaviorData,
            sessionId,
            userAgent,
            ipAddress,
            referrer,
            timestamp: new Date(),
        });
        res.json({
            success: true,
            message: '行为记录成功',
        });
    }
    catch (error) {
        console.error('记录用户行为失败:', error);
        res.status(500).json({
            success: false,
            message: '记录行为失败',
            error: error instanceof Error ? error.message : '未知错误',
        });
    }
});
router.post('/click', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, recommendationType } = req.body;
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: '缺少商品ID',
            });
        }
        await Recommendation_1.default.update({ isClicked: true }, {
            where: {
                userId,
                productId,
                recommendationType: recommendationType || 'hybrid',
            },
        });
        res.json({
            success: true,
            message: '点击记录成功',
        });
    }
    catch (error) {
        console.error('记录推荐点击失败:', error);
        res.status(500).json({
            success: false,
            message: '记录点击失败',
            error: error instanceof Error ? error.message : '未知错误',
        });
    }
});
router.post('/purchase', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, recommendationType } = req.body;
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: '缺少商品ID',
            });
        }
        await Recommendation_1.default.update({ isPurchased: true }, {
            where: {
                userId,
                productId,
                recommendationType: recommendationType || 'hybrid',
            },
        });
        res.json({
            success: true,
            message: '购买记录成功',
        });
    }
    catch (error) {
        console.error('记录推荐购买失败:', error);
        res.status(500).json({
            success: false,
            message: '记录购买失败',
            error: error instanceof Error ? error.message : '未知错误',
        });
    }
});
router.get('/stats', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { startDate, endDate } = req.query;
        let whereClause = { userId };
        if (startDate && endDate) {
            whereClause.createdAt = {
                [sequelize_1.Op.between]: [new Date(startDate), new Date(endDate)],
            };
        }
        const recommendations = await Recommendation_1.default.findAll({
            where: whereClause,
            attributes: [
                'recommendationType',
                'isDisplayed',
                'isClicked',
                'isPurchased',
                [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total'],
            ],
            group: ['recommendationType', 'isDisplayed', 'isClicked', 'isPurchased'],
        });
        const stats = {
            total: 0,
            displayed: 0,
            clicked: 0,
            purchased: 0,
            clickRate: 0,
            purchaseRate: 0,
            byType: {},
        };
        recommendations.forEach((rec) => {
            const count = parseInt(rec.dataValues.total);
            const type = rec.recommendationType;
            const isDisplayed = rec.isDisplayed;
            const isClicked = rec.isClicked;
            const isPurchased = rec.isPurchased;
            stats.total += count;
            if (isDisplayed)
                stats.displayed += count;
            if (isClicked)
                stats.clicked += count;
            if (isPurchased)
                stats.purchased += count;
            if (!stats.byType[type]) {
                stats.byType[type] = { total: 0, displayed: 0, clicked: 0, purchased: 0 };
            }
            stats.byType[type].total += count;
            if (isDisplayed)
                stats.byType[type].displayed += count;
            if (isClicked)
                stats.byType[type].clicked += count;
            if (isPurchased)
                stats.byType[type].purchased += count;
        });
        if (stats.displayed > 0) {
            stats.clickRate = (stats.clicked / stats.displayed) * 100;
            stats.purchaseRate = (stats.purchased / stats.displayed) * 100;
        }
        Object.keys(stats.byType).forEach(type => {
            const typeStats = stats.byType[type];
            if (typeStats.displayed > 0) {
                typeStats.clickRate = (typeStats.clicked / typeStats.displayed) * 100;
                typeStats.purchaseRate = (typeStats.purchased / typeStats.displayed) * 100;
            }
        });
        res.json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        console.error('获取推荐统计失败:', error);
        res.status(500).json({
            success: false,
            message: '获取统计失败',
            error: error instanceof Error ? error.message : '未知错误',
        });
    }
});
router.get('/evaluation', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { startDate, endDate, metrics = ['click_rate', 'purchase_rate', 'diversity', 'novelty'] } = req.query;
        let whereClause = { userId };
        if (startDate && endDate) {
            whereClause.createdAt = {
                [sequelize_1.Op.between]: [new Date(startDate), new Date(endDate)],
            };
        }
        const recommendations = await Recommendation_1.default.findAll({
            where: whereClause,
            include: [
                {
                    model: Product_1.default,
                    as: 'product',
                    attributes: ['id', 'name', 'categoryId', 'price']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        const evaluation = {
            accuracy: 0,
            diversity: 0,
            novelty: 0,
            coverage: 0,
            serendipity: 0,
            metrics: {}
        };
        const totalDisplayed = recommendations.filter(r => r.isDisplayed).length;
        const totalClicked = recommendations.filter(r => r.isClicked).length;
        const totalPurchased = recommendations.filter(r => r.isPurchased).length;
        if (totalDisplayed > 0) {
            evaluation.accuracy = ((totalClicked + totalPurchased) / totalDisplayed) * 100;
        }
        const recommendedProducts = recommendations.filter(r => r.isDisplayed);
        const categoryCounts = new Map();
        recommendedProducts.forEach(rec => {
            if (rec.product && rec.product.categoryId) {
                const categoryId = rec.product.categoryId;
                categoryCounts.set(categoryId, (categoryCounts.get(categoryId) || 0) + 1);
            }
        });
        const uniqueCategories = categoryCounts.size;
        const totalRecommendations = recommendedProducts.length;
        evaluation.diversity = totalRecommendations > 0 ? (uniqueCategories / totalRecommendations) * 100 : 0;
        const productIds = recommendedProducts.map(r => r.productId);
        const popularProducts = await UserBehavior_1.default.findAll({
            where: {
                productId: { [sequelize_1.Op.in]: productIds },
                behaviorType: 'purchase'
            },
            attributes: [
                'productId',
                [require('sequelize').fn('COUNT', require('sequelize').col('productId')), 'purchaseCount']
            ],
            group: ['productId'],
            order: [[require('sequelize').fn('COUNT', require('sequelize').col('productId')), 'DESC']]
        });
        const popularProductIds = new Set(popularProducts.slice(0, 10).map(p => p.productId));
        const novelRecommendations = recommendedProducts.filter(r => !popularProductIds.has(r.productId));
        evaluation.novelty = totalRecommendations > 0 ? (novelRecommendations.length / totalRecommendations) * 100 : 0;
        const totalProducts = await Product_1.default.count();
        const recommendedProductIds = new Set(recommendedProducts.map(r => r.productId));
        evaluation.coverage = totalProducts > 0 ? (recommendedProductIds.size / totalProducts) * 100 : 0;
        const userBehaviors = await UserBehavior_1.default.findAll({
            where: { userId },
            attributes: ['productId']
        });
        const userProductIds = new Set(userBehaviors.map(b => b.productId));
        const serendipitousRecommendations = recommendedProducts.filter(r => !userProductIds.has(r.productId));
        evaluation.serendipity = totalRecommendations > 0 ? (serendipitousRecommendations.length / totalRecommendations) * 100 : 0;
        const metricsArray = Array.isArray(metrics) ? metrics : [metrics];
        metricsArray.forEach(metric => {
            switch (metric) {
                case 'click_rate':
                    evaluation.metrics.clickRate = totalDisplayed > 0 ? (totalClicked / totalDisplayed) * 100 : 0;
                    break;
                case 'purchase_rate':
                    evaluation.metrics.purchaseRate = totalDisplayed > 0 ? (totalPurchased / totalDisplayed) * 100 : 0;
                    break;
                case 'diversity':
                    evaluation.metrics.diversity = evaluation.diversity;
                    break;
                case 'novelty':
                    evaluation.metrics.novelty = evaluation.novelty;
                    break;
                case 'coverage':
                    evaluation.metrics.coverage = evaluation.coverage;
                    break;
                case 'serendipity':
                    evaluation.metrics.serendipity = evaluation.serendipity;
                    break;
            }
        });
        res.json({
            success: true,
            data: evaluation,
        });
    }
    catch (error) {
        console.error('获取推荐效果评估失败:', error);
        res.status(500).json({
            success: false,
            message: '获取评估失败',
            error: error instanceof Error ? error.message : '未知错误',
        });
    }
});
router.post('/ab-test', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { testName, variant, recommendationType, productIds } = req.body;
        if (!testName || !variant || !recommendationType || !productIds) {
            return res.status(400).json({
                success: false,
                message: '缺少必要参数',
            });
        }
        const testRecord = await require('../models/ABTest').default.create({
            userId,
            testName,
            variant,
            recommendationType,
            productIds: JSON.stringify(productIds),
            timestamp: new Date()
        });
        res.json({
            success: true,
            data: testRecord,
        });
    }
    catch (error) {
        console.error('记录A/B测试失败:', error);
        res.status(500).json({
            success: false,
            message: '记录A/B测试失败',
            error: error instanceof Error ? error.message : '未知错误',
        });
    }
});
router.get('/ab-test-results', auth_1.authenticateToken, async (req, res) => {
    try {
        const { testName, startDate, endDate } = req.query;
        let whereClause = {};
        if (testName) {
            whereClause.testName = testName;
        }
        if (startDate && endDate) {
            whereClause.timestamp = {
                [sequelize_1.Op.between]: [new Date(startDate), new Date(endDate)],
            };
        }
        const testResults = await require('../models/ABTest').default.findAll({
            where: whereClause,
            attributes: [
                'testName',
                'variant',
                'recommendationType',
                [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'impressions'],
                [require('sequelize').fn('COUNT', require('sequelize').col('clicks')), 'clicks'],
                [require('sequelize').fn('COUNT', require('sequelize').col('purchases')), 'purchases']
            ],
            group: ['testName', 'variant', 'recommendationType']
        });
        const results = testResults.map((result) => {
            const impressions = parseInt(result.dataValues.impressions);
            const clicks = parseInt(result.dataValues.clicks);
            const purchases = parseInt(result.dataValues.purchases);
            return {
                testName: result.testName,
                variant: result.variant,
                recommendationType: result.recommendationType,
                impressions,
                clicks,
                purchases,
                clickRate: impressions > 0 ? (clicks / impressions) * 100 : 0,
                purchaseRate: impressions > 0 ? (purchases / impressions) * 100 : 0,
                conversionRate: clicks > 0 ? (purchases / clicks) * 100 : 0
            };
        });
        res.json({
            success: true,
            data: results,
        });
    }
    catch (error) {
        console.error('获取A/B测试结果失败:', error);
        res.status(500).json({
            success: false,
            message: '获取A/B测试结果失败',
            error: error instanceof Error ? error.message : '未知错误',
        });
    }
});
router.post('/ab-click', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { testName, variant, productId } = req.body;
        if (!testName || !variant || !productId) {
            return res.status(400).json({
                success: false,
                message: '缺少必要参数',
            });
        }
        await require('../models/ABTest').default.update({ clicks: true }, {
            where: {
                userId,
                testName,
                variant,
                productIds: { [sequelize_1.Op.like]: `%${productId}%` }
            }
        });
        res.json({
            success: true,
            message: '点击记录成功',
        });
    }
    catch (error) {
        console.error('记录A/B测试点击失败:', error);
        res.status(500).json({
            success: false,
            message: '记录点击失败',
            error: error instanceof Error ? error.message : '未知错误',
        });
    }
});
router.post('/ab-purchase', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { testName, variant, productId } = req.body;
        if (!testName || !variant || !productId) {
            return res.status(400).json({
                success: false,
                message: '缺少必要参数',
            });
        }
        await require('../models/ABTest').default.update({ purchases: true }, {
            where: {
                userId,
                testName,
                variant,
                productIds: { [sequelize_1.Op.like]: `%${productId}%` }
            }
        });
        res.json({
            success: true,
            message: '购买记录成功',
        });
    }
    catch (error) {
        console.error('记录A/B测试购买失败:', error);
        res.status(500).json({
            success: false,
            message: '记录购买失败',
            error: error instanceof Error ? error.message : '未知错误',
        });
    }
});
router.post('/calculate-similarity', auth_1.authenticateToken, async (req, res) => {
    try {
        const { userId1, userId2 } = req.body;
        if (!userId1 || !userId2) {
            return res.status(400).json({
                success: false,
                message: '缺少用户ID',
            });
        }
        const similarity = await collaborativeFiltering_1.default.calculateUserSimilarity(userId1, userId2);
        res.json({
            success: true,
            data: {
                userId1,
                userId2,
                similarity,
            },
        });
    }
    catch (error) {
        console.error('计算用户相似度失败:', error);
        res.status(500).json({
            success: false,
            message: '计算相似度失败',
            error: error instanceof Error ? error.message : '未知错误',
        });
    }
});
router.post('/calculate-item-similarity', auth_1.authenticateToken, async (req, res) => {
    try {
        const { productId1, productId2 } = req.body;
        if (!productId1 || !productId2) {
            return res.status(400).json({
                success: false,
                message: '缺少商品ID',
            });
        }
        const similarity = await collaborativeFiltering_1.default.calculateItemSimilarity(productId1, productId2);
        res.json({
            success: true,
            data: {
                productId1,
                productId2,
                similarity,
            },
        });
    }
    catch (error) {
        console.error('计算商品相似度失败:', error);
        res.status(500).json({
            success: false,
            message: '计算相似度失败',
            error: error instanceof Error ? error.message : '未知错误',
        });
    }
});
exports.default = router;
//# sourceMappingURL=recommendations.js.map