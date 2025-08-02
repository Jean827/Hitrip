"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Analytics_1 = require("../models/Analytics");
const sequelize_1 = require("sequelize");
const router = express_1.default.Router();
router.get('/user-behavior', async (req, res) => {
    try {
        const { startDate, endDate, eventType, userId } = req.query;
        const where = {};
        if (startDate && endDate) {
            where.timestamp = {
                [sequelize_1.Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }
        if (eventType) {
            where.eventType = eventType;
        }
        if (userId) {
            where.userId = userId;
        }
        const eventStats = await Analytics_1.UserBehavior.findAll({
            attributes: [
                'eventType',
                [sequelize_1.sequelize.fn('COUNT', sequelize_1.sequelize.col('id')), 'count']
            ],
            where,
            group: ['eventType'],
            order: [[sequelize_1.sequelize.fn('COUNT', sequelize_1.sequelize.col('id')), 'DESC']]
        });
        const pageStats = await Analytics_1.UserBehavior.findAll({
            attributes: [
                'pageUrl',
                [sequelize_1.sequelize.fn('COUNT', sequelize_1.sequelize.col('id')), 'count']
            ],
            where: {
                ...where,
                eventType: 'page_view'
            },
            group: ['pageUrl'],
            order: [[sequelize_1.sequelize.fn('COUNT', sequelize_1.sequelize.col('id')), 'DESC']],
            limit: 10
        });
        const activeUsers = await Analytics_1.UserBehavior.findAll({
            attributes: [
                'userId',
                [sequelize_1.sequelize.fn('COUNT', sequelize_1.sequelize.col('id')), 'eventCount'],
                [sequelize_1.sequelize.fn('MAX', sequelize_1.sequelize.col('timestamp')), 'lastActivity']
            ],
            where: {
                ...where,
                userId: { [sequelize_1.Op.ne]: null }
            },
            group: ['userId'],
            order: [[sequelize_1.sequelize.fn('COUNT', sequelize_1.sequelize.col('id')), 'DESC']],
            limit: 20
        });
        const timeTrend = await Analytics_1.UserBehavior.findAll({
            attributes: [
                [sequelize_1.sequelize.fn('DATE', sequelize_1.sequelize.col('timestamp')), 'date'],
                [sequelize_1.sequelize.fn('COUNT', sequelize_1.sequelize.col('id')), 'count']
            ],
            where,
            group: [sequelize_1.sequelize.fn('DATE', sequelize_1.sequelize.col('timestamp'))],
            order: [[sequelize_1.sequelize.fn('DATE', sequelize_1.sequelize.col('timestamp')), 'ASC']],
            limit: 30
        });
        res.json({
            success: true,
            data: {
                eventStats,
                pageStats,
                activeUsers,
                timeTrend
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '获取用户行为分析失败',
            error: error.message
        });
    }
});
router.get('/sales-analysis', async (req, res) => {
    try {
        const { startDate, endDate, region, channel, status } = req.query;
        const where = {};
        if (startDate && endDate) {
            where.orderDate = {
                [sequelize_1.Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }
        if (region) {
            where.region = region;
        }
        if (channel) {
            where.channel = channel;
        }
        if (status) {
            where.orderStatus = status;
        }
        const totalSales = await Analytics_1.SalesData.sum('finalPrice', { where });
        const orderCount = await Analytics_1.SalesData.count({
            where,
            distinct: true,
            col: 'orderId'
        });
        const avgOrderValue = totalSales / orderCount;
        const statusStats = await Analytics_1.SalesData.findAll({
            attributes: [
                'orderStatus',
                [sequelize_1.sequelize.fn('COUNT', sequelize_1.sequelize.col('orderId')), 'count'],
                [sequelize_1.sequelize.fn('SUM', sequelize_1.sequelize.col('finalPrice')), 'totalAmount']
            ],
            where,
            group: ['orderStatus']
        });
        const regionStats = await Analytics_1.SalesData.findAll({
            attributes: [
                'region',
                [sequelize_1.sequelize.fn('COUNT', sequelize_1.sequelize.col('orderId')), 'count'],
                [sequelize_1.sequelize.fn('SUM', sequelize_1.sequelize.col('finalPrice')), 'totalAmount']
            ],
            where,
            group: ['region'],
            order: [[sequelize_1.sequelize.fn('SUM', sequelize_1.sequelize.col('finalPrice')), 'DESC']]
        });
        const channelStats = await Analytics_1.SalesData.findAll({
            attributes: [
                'channel',
                [sequelize_1.sequelize.fn('COUNT', sequelize_1.sequelize.col('orderId')), 'count'],
                [sequelize_1.sequelize.fn('SUM', sequelize_1.sequelize.col('finalPrice')), 'totalAmount']
            ],
            where,
            group: ['channel'],
            order: [[sequelize_1.sequelize.fn('SUM', sequelize_1.sequelize.col('finalPrice')), 'DESC']]
        });
        const timeTrend = await Analytics_1.SalesData.findAll({
            attributes: [
                [sequelize_1.sequelize.fn('DATE', sequelize_1.sequelize.col('orderDate')), 'date'],
                [sequelize_1.sequelize.fn('COUNT', sequelize_1.sequelize.col('orderId')), 'orderCount'],
                [sequelize_1.sequelize.fn('SUM', sequelize_1.sequelize.col('finalPrice')), 'totalAmount']
            ],
            where,
            group: [sequelize_1.sequelize.fn('DATE', sequelize_1.sequelize.col('orderDate'))],
            order: [[sequelize_1.sequelize.fn('DATE', sequelize_1.sequelize.col('orderDate')), 'ASC']],
            limit: 30
        });
        const topProducts = await Analytics_1.SalesData.findAll({
            attributes: [
                'productId',
                [sequelize_1.sequelize.fn('COUNT', sequelize_1.sequelize.col('orderId')), 'orderCount'],
                [sequelize_1.sequelize.fn('SUM', sequelize_1.sequelize.col('quantity')), 'totalQuantity'],
                [sequelize_1.sequelize.fn('SUM', sequelize_1.sequelize.col('finalPrice')), 'totalAmount']
            ],
            where,
            group: ['productId'],
            order: [[sequelize_1.sequelize.fn('SUM', sequelize_1.sequelize.col('finalPrice')), 'DESC']],
            limit: 10
        });
        res.json({
            success: true,
            data: {
                summary: {
                    totalSales,
                    orderCount,
                    avgOrderValue
                },
                statusStats,
                regionStats,
                channelStats,
                timeTrend,
                topProducts
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '获取销售数据分析失败',
            error: error.message
        });
    }
});
router.get('/real-time', async (req, res) => {
    try {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const recentBehaviors = await Analytics_1.UserBehavior.count({
            where: {
                timestamp: {
                    [sequelize_1.Op.gte]: oneHourAgo
                }
            }
        });
        const recentSales = await Analytics_1.SalesData.sum('finalPrice', {
            where: {
                orderDate: {
                    [sequelize_1.Op.gte]: oneHourAgo
                }
            }
        });
        const recentOrders = await Analytics_1.SalesData.count({
            where: {
                orderDate: {
                    [sequelize_1.Op.gte]: oneHourAgo
                }
            },
            distinct: true,
            col: 'orderId'
        });
        const systemMetrics = await Analytics_1.SystemMetrics.findAll({
            where: {
                timestamp: {
                    [sequelize_1.Op.gte]: oneHourAgo
                }
            },
            order: [['timestamp', 'DESC']],
            limit: 10
        });
        const activeUsers = await Analytics_1.UserBehavior.count({
            where: {
                timestamp: {
                    [sequelize_1.Op.gte]: oneHourAgo
                },
                userId: { [sequelize_1.Op.ne]: null }
            },
            distinct: true,
            col: 'userId'
        });
        const pageViews = await Analytics_1.UserBehavior.count({
            where: {
                timestamp: {
                    [sequelize_1.Op.gte]: oneHourAgo
                },
                eventType: 'page_view'
            }
        });
        res.json({
            success: true,
            data: {
                recentBehaviors,
                recentSales: recentSales || 0,
                recentOrders,
                activeUsers,
                pageViews,
                systemMetrics
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '获取实时数据失败',
            error: error.message
        });
    }
});
router.get('/business-metrics', async (req, res) => {
    try {
        const { period = 'daily', startDate, endDate, category } = req.query;
        const where = {};
        if (startDate && endDate) {
            where.startTime = {
                [sequelize_1.Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }
        if (category) {
            where.category = category;
        }
        if (period) {
            where.period = period;
        }
        const metrics = await Analytics_1.BusinessMetrics.findAll({
            where,
            order: [['startTime', 'ASC']]
        });
        res.json({
            success: true,
            data: metrics
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '获取业务指标失败',
            error: error.message
        });
    }
});
router.get('/user-path', async (req, res) => {
    try {
        const { userId, sessionId, limit = 10 } = req.query;
        const where = {};
        if (userId) {
            where.userId = userId;
        }
        if (sessionId) {
            where.sessionId = sessionId;
        }
        const userPaths = await Analytics_1.UserBehavior.findAll({
            where,
            attributes: ['sessionId', 'eventType', 'pageUrl', 'timestamp'],
            order: [['sessionId', 'ASC'], ['timestamp', 'ASC']],
            limit: Number(limit)
        });
        const pathsBySession = userPaths.reduce((acc, behavior) => {
            if (!acc[behavior.sessionId]) {
                acc[behavior.sessionId] = [];
            }
            acc[behavior.sessionId].push({
                eventType: behavior.eventType,
                pageUrl: behavior.pageUrl,
                timestamp: behavior.timestamp
            });
            return acc;
        }, {});
        res.json({
            success: true,
            data: pathsBySession
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '获取用户路径分析失败',
            error: error.message
        });
    }
});
router.get('/funnel', async (req, res) => {
    try {
        const { startDate, endDate, steps = ['page_view', 'add_to_cart', 'purchase'] } = req.query;
        const where = {};
        if (startDate && endDate) {
            where.timestamp = {
                [sequelize_1.Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }
        const stepStats = [];
        const stepsArray = Array.isArray(steps) ? steps : [steps];
        for (const step of stepsArray) {
            const count = await Analytics_1.UserBehavior.count({
                where: {
                    ...where,
                    eventType: step
                }
            });
            stepStats.push({
                step,
                count,
                conversionRate: stepStats.length > 0 ? (count / stepStats[stepStats.length - 1].count * 100).toFixed(2) : '100.00'
            });
        }
        res.json({
            success: true,
            data: stepStats
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '获取漏斗分析失败',
            error: error.message
        });
    }
});
router.post('/track', async (req, res) => {
    try {
        const { userId, sessionId, eventType, eventName, pageUrl, referrer, userAgent, ipAddress, metadata } = req.body;
        const behavior = await Analytics_1.UserBehavior.create({
            userId,
            sessionId,
            eventType,
            eventName,
            pageUrl,
            referrer,
            userAgent,
            ipAddress,
            timestamp: new Date(),
            metadata
        });
        res.json({
            success: true,
            data: behavior
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '记录用户行为失败',
            error: error.message
        });
    }
});
router.post('/system-metrics', async (req, res) => {
    try {
        const { metricName, metricValue, metricUnit, serverId, component, metadata } = req.body;
        const metric = await Analytics_1.SystemMetrics.create({
            metricName,
            metricValue,
            metricUnit,
            timestamp: new Date(),
            serverId,
            component,
            metadata
        });
        res.json({
            success: true,
            data: metric
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '记录系统指标失败',
            error: error.message
        });
    }
});
router.post('/business-metrics', async (req, res) => {
    try {
        const { metricName, metricValue, metricUnit, period, startTime, endTime, category, metadata } = req.body;
        const metric = await Analytics_1.BusinessMetrics.create({
            metricName,
            metricValue,
            metricUnit,
            period,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            category,
            metadata
        });
        res.json({
            success: true,
            data: metric
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '记录业务指标失败',
            error: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=analytics.js.map