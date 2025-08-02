"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Analytics_1 = require("../models/Analytics");
const sequelize_1 = require("sequelize");
const csv_writer_1 = require("csv-writer");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
router.get('/user-profile', async (req, res) => {
    try {
        const { userId, startDate, endDate } = req.query;
        const where = {};
        if (startDate && endDate) {
            where.timestamp = {
                [sequelize_1.Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }
        if (userId) {
            where.userId = userId;
        }
        const behaviorPreferences = await Analytics_1.UserBehavior.findAll({
            attributes: [
                'eventType',
                'pageUrl',
                [sequelize_1.sequelize.fn('COUNT', sequelize_1.sequelize.col('id')), 'frequency']
            ],
            where: {
                ...where,
                userId: { [sequelize_1.Op.ne]: null }
            },
            group: ['eventType', 'pageUrl'],
            order: [[sequelize_1.sequelize.fn('COUNT', sequelize_1.sequelize.col('id')), 'DESC']],
            limit: 20
        });
        const activeTimeAnalysis = await Analytics_1.UserBehavior.findAll({
            attributes: [
                [sequelize_1.sequelize.fn('HOUR', sequelize_1.sequelize.col('timestamp')), 'hour'],
                [sequelize_1.sequelize.fn('COUNT', sequelize_1.sequelize.col('id')), 'activityCount']
            ],
            where: {
                ...where,
                userId: { [sequelize_1.Op.ne]: null }
            },
            group: [sequelize_1.sequelize.fn('HOUR', sequelize_1.sequelize.col('timestamp'))],
            order: [[sequelize_1.sequelize.fn('HOUR', sequelize_1.sequelize.col('timestamp')), 'ASC']]
        });
        const locationAnalysis = await Analytics_1.UserBehavior.findAll({
            attributes: [
                'ipAddress',
                [sequelize_1.sequelize.fn('COUNT', sequelize_1.sequelize.col('id')), 'userCount']
            ],
            where: {
                ...where,
                userId: { [sequelize_1.Op.ne]: null }
            },
            group: ['ipAddress'],
            order: [[sequelize_1.sequelize.fn('COUNT', sequelize_1.sequelize.col('id')), 'DESC']],
            limit: 10
        });
        const deviceAnalysis = await Analytics_1.UserBehavior.findAll({
            attributes: [
                'userAgent',
                [sequelize_1.sequelize.fn('COUNT', sequelize_1.sequelize.col('id')), 'userCount']
            ],
            where: {
                ...where,
                userId: { [sequelize_1.Op.ne]: null }
            },
            group: ['userAgent'],
            order: [[sequelize_1.sequelize.fn('COUNT', sequelize_1.sequelize.col('id')), 'DESC']],
            limit: 10
        });
        res.json({
            success: true,
            data: {
                behaviorPreferences,
                activeTimeAnalysis,
                locationAnalysis,
                deviceAnalysis
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '获取用户画像分析失败',
            error: error.message
        });
    }
});
router.get('/product-trends', async (req, res) => {
    try {
        const { startDate, endDate, categoryId, productId } = req.query;
        const where = {};
        if (startDate && endDate) {
            where.orderDate = {
                [sequelize_1.Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }
        if (categoryId) {
            where.categoryId = categoryId;
        }
        if (productId) {
            where.productId = productId;
        }
        const salesTrend = await Analytics_1.SalesData.findAll({
            attributes: [
                [sequelize_1.sequelize.fn('DATE', sequelize_1.sequelize.col('orderDate')), 'date'],
                'productId',
                [sequelize_1.sequelize.fn('SUM', sequelize_1.sequelize.col('quantity')), 'totalQuantity'],
                [sequelize_1.sequelize.fn('SUM', sequelize_1.sequelize.col('finalPrice')), 'totalAmount'],
                [sequelize_1.sequelize.fn('COUNT', sequelize_1.sequelize.col('orderId')), 'orderCount']
            ],
            where,
            group: [sequelize_1.sequelize.fn('DATE', sequelize_1.sequelize.col('orderDate')), 'productId'],
            order: [[sequelize_1.sequelize.fn('DATE', sequelize_1.sequelize.col('orderDate')), 'ASC']],
            limit: 100
        });
        const categorySales = await Analytics_1.SalesData.findAll({
            attributes: [
                'categoryId',
                [sequelize_1.sequelize.fn('SUM', sequelize_1.sequelize.col('quantity')), 'totalQuantity'],
                [sequelize_1.sequelize.fn('SUM', sequelize_1.sequelize.col('finalPrice')), 'totalAmount'],
                [sequelize_1.sequelize.fn('COUNT', sequelize_1.sequelize.col('orderId')), 'orderCount']
            ],
            where,
            group: ['categoryId'],
            order: [[sequelize_1.sequelize.fn('SUM', sequelize_1.sequelize.col('finalPrice')), 'DESC']]
        });
        const topProducts = await Analytics_1.SalesData.findAll({
            attributes: [
                'productId',
                [sequelize_1.sequelize.fn('SUM', sequelize_1.sequelize.col('quantity')), 'totalQuantity'],
                [sequelize_1.sequelize.fn('SUM', sequelize_1.sequelize.col('finalPrice')), 'totalAmount'],
                [sequelize_1.sequelize.fn('COUNT', sequelize_1.sequelize.col('orderId')), 'orderCount']
            ],
            where,
            group: ['productId'],
            order: [[sequelize_1.sequelize.fn('SUM', sequelize_1.sequelize.col('finalPrice')), 'DESC']],
            limit: 20
        });
        res.json({
            success: true,
            data: {
                salesTrend,
                categorySales,
                topProducts
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '获取商品销售趋势分析失败',
            error: error.message
        });
    }
});
router.get('/geographic-analysis', async (req, res) => {
    try {
        const { startDate, endDate, region } = req.query;
        const where = {};
        if (startDate && endDate) {
            where.orderDate = {
                [sequelize_1.Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }
        if (region) {
            where.region = region;
        }
        const regionSales = await Analytics_1.SalesData.findAll({
            attributes: [
                'region',
                [sequelize_1.sequelize.fn('SUM', sequelize_1.sequelize.col('finalPrice')), 'totalAmount'],
                [sequelize_1.sequelize.fn('COUNT', sequelize_1.sequelize.col('orderId')), 'orderCount'],
                [sequelize_1.sequelize.fn('AVG', sequelize_1.sequelize.col('finalPrice')), 'avgOrderValue']
            ],
            where,
            group: ['region'],
            order: [[sequelize_1.sequelize.fn('SUM', sequelize_1.sequelize.col('finalPrice')), 'DESC']]
        });
        const regionActivity = await Analytics_1.UserBehavior.findAll({
            attributes: [
                'ipAddress',
                [sequelize_1.sequelize.fn('COUNT', sequelize_1.sequelize.col('id')), 'activityCount'],
                [sequelize_1.sequelize.fn('COUNT', sequelize_1.sequelize.fn('DISTINCT', sequelize_1.sequelize.col('userId'))), 'uniqueUsers']
            ],
            where: {
                ...where,
                userId: { [sequelize_1.Op.ne]: null }
            },
            group: ['ipAddress'],
            order: [[sequelize_1.sequelize.fn('COUNT', sequelize_1.sequelize.col('id')), 'DESC']],
            limit: 20
        });
        res.json({
            success: true,
            data: {
                regionSales,
                regionActivity
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '获取地域分布分析失败',
            error: error.message
        });
    }
});
router.get('/time-series', async (req, res) => {
    try {
        const { startDate, endDate, interval = 'day', metric = 'sales' } = req.query;
        const where = {};
        if (startDate && endDate) {
            where.orderDate = {
                [sequelize_1.Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }
        let timeFormat, groupBy;
        switch (interval) {
            case 'hour':
                timeFormat = sequelize_1.sequelize.fn('DATE_FORMAT', sequelize_1.sequelize.col('orderDate'), '%Y-%m-%d %H:00:00');
                groupBy = sequelize_1.sequelize.fn('DATE_FORMAT', sequelize_1.sequelize.col('orderDate'), '%Y-%m-%d %H:00:00');
                break;
            case 'day':
                timeFormat = sequelize_1.sequelize.fn('DATE', sequelize_1.sequelize.col('orderDate'));
                groupBy = sequelize_1.sequelize.fn('DATE', sequelize_1.sequelize.col('orderDate'));
                break;
            case 'week':
                timeFormat = sequelize_1.sequelize.fn('YEARWEEK', sequelize_1.sequelize.col('orderDate'));
                groupBy = sequelize_1.sequelize.fn('YEARWEEK', sequelize_1.sequelize.col('orderDate'));
                break;
            case 'month':
                timeFormat = sequelize_1.sequelize.fn('DATE_FORMAT', sequelize_1.sequelize.col('orderDate'), '%Y-%m');
                groupBy = sequelize_1.sequelize.fn('DATE_FORMAT', sequelize_1.sequelize.col('orderDate'), '%Y-%m');
                break;
            default:
                timeFormat = sequelize_1.sequelize.fn('DATE', sequelize_1.sequelize.col('orderDate'));
                groupBy = sequelize_1.sequelize.fn('DATE', sequelize_1.sequelize.col('orderDate'));
        }
        let metricField;
        switch (metric) {
            case 'sales':
                metricField = sequelize_1.sequelize.fn('SUM', sequelize_1.sequelize.col('finalPrice'));
                break;
            case 'orders':
                metricField = sequelize_1.sequelize.fn('COUNT', sequelize_1.sequelize.col('orderId'));
                break;
            case 'quantity':
                metricField = sequelize_1.sequelize.fn('SUM', sequelize_1.sequelize.col('quantity'));
                break;
            default:
                metricField = sequelize_1.sequelize.fn('SUM', sequelize_1.sequelize.col('finalPrice'));
        }
        const timeSeriesData = await Analytics_1.SalesData.findAll({
            attributes: [
                [timeFormat, 'timePeriod'],
                [metricField, 'value']
            ],
            where,
            group: [groupBy],
            order: [[timeFormat, 'ASC']],
            limit: 100
        });
        res.json({
            success: true,
            data: {
                timeSeriesData,
                interval,
                metric
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '获取时间序列分析失败',
            error: error.message
        });
    }
});
router.get('/conversion-analysis', async (req, res) => {
    try {
        const { startDate, endDate, funnel = ['page_view', 'add_to_cart', 'purchase'] } = req.query;
        const where = {};
        if (startDate && endDate) {
            where.timestamp = {
                [sequelize_1.Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }
        const funnelSteps = Array.isArray(funnel) ? funnel : [funnel];
        const conversionData = [];
        for (let i = 0; i < funnelSteps.length; i++) {
            const step = funnelSteps[i];
            const count = await Analytics_1.UserBehavior.count({
                where: {
                    ...where,
                    eventType: step
                }
            });
            const conversionRate = i === 0 ? 100 :
                conversionData.length > 0 ?
                    (count / conversionData[conversionData.length - 1].count * 100).toFixed(2) : 0;
            conversionData.push({
                step,
                count,
                conversionRate: parseFloat(conversionRate)
            });
        }
        const totalConversionRate = conversionData.length > 1 ?
            (conversionData[conversionData.length - 1].count / conversionData[0].count * 100).toFixed(2) : 0;
        res.json({
            success: true,
            data: {
                conversionData,
                totalConversionRate: parseFloat(totalConversionRate),
                funnelSteps
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '获取转化率分析失败',
            error: error.message
        });
    }
});
router.get('/retention-analysis', async (req, res) => {
    try {
        const { startDate, endDate, days = 30 } = req.query;
        const where = {};
        if (startDate && endDate) {
            where.timestamp = {
                [sequelize_1.Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }
        const firstVisits = await Analytics_1.UserBehavior.findAll({
            attributes: [
                'userId',
                [sequelize_1.sequelize.fn('MIN', sequelize_1.sequelize.col('timestamp')), 'firstVisit']
            ],
            where: {
                ...where,
                userId: { [sequelize_1.Op.ne]: null }
            },
            group: ['userId']
        });
        const retentionData = [];
        const dayCount = Number(days);
        for (let day = 1; day <= dayCount; day++) {
            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() - day);
            const retainedUsers = await Analytics_1.UserBehavior.count({
                where: {
                    ...where,
                    userId: { [sequelize_1.Op.ne]: null },
                    timestamp: {
                        [sequelize_1.Op.gte]: targetDate
                    }
                },
                distinct: true,
                col: 'userId'
            });
            const totalUsers = firstVisits.length;
            const retentionRate = totalUsers > 0 ? (retainedUsers / totalUsers * 100).toFixed(2) : 0;
            retentionData.push({
                day,
                retainedUsers,
                totalUsers,
                retentionRate: parseFloat(retentionRate)
            });
        }
        res.json({
            success: true,
            data: {
                retentionData,
                totalUsers: firstVisits.length
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '获取留存率分析失败',
            error: error.message
        });
    }
});
router.get('/export/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const { format = 'csv', startDate, endDate } = req.query;
        const where = {};
        if (startDate && endDate) {
            where.timestamp = {
                [sequelize_1.Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }
        let data, headers;
        switch (type) {
            case 'user-behavior':
                data = await Analytics_1.UserBehavior.findAll({ where });
                headers = [
                    { id: 'id', title: 'ID' },
                    { id: 'userId', title: '用户ID' },
                    { id: 'eventType', title: '事件类型' },
                    { id: 'pageUrl', title: '页面URL' },
                    { id: 'timestamp', title: '时间戳' },
                    { id: 'ipAddress', title: 'IP地址' },
                    { id: 'userAgent', title: '用户代理' }
                ];
                break;
            case 'sales-data':
                data = await Analytics_1.SalesData.findAll({ where });
                headers = [
                    { id: 'id', title: 'ID' },
                    { id: 'orderId', title: '订单ID' },
                    { id: 'productId', title: '商品ID' },
                    { id: 'quantity', title: '数量' },
                    { id: 'finalPrice', title: '最终价格' },
                    { id: 'orderDate', title: '订单日期' },
                    { id: 'region', title: '地区' }
                ];
                break;
            case 'system-metrics':
                data = await Analytics_1.SystemMetrics.findAll({ where });
                headers = [
                    { id: 'id', title: 'ID' },
                    { id: 'metricName', title: '指标名称' },
                    { id: 'metricValue', title: '指标值' },
                    { id: 'metricUnit', title: '单位' },
                    { id: 'timestamp', title: '时间戳' },
                    { id: 'serverId', title: '服务器ID' }
                ];
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: '不支持的数据类型'
                });
        }
        if (format === 'csv') {
            const exportDir = path_1.default.join(__dirname, '../../exports');
            if (!fs_1.default.existsSync(exportDir)) {
                fs_1.default.mkdirSync(exportDir, { recursive: true });
            }
            const fileName = `${type}_${Date.now()}.csv`;
            const filePath = path_1.default.join(exportDir, fileName);
            const csvWriter = (0, csv_writer_1.createObjectCsvWriter)({
                path: filePath,
                header: headers
            });
            await csvWriter.writeRecords(data);
            res.download(filePath, fileName, (err) => {
                if (err) {
                    console.error('文件下载失败:', err);
                }
                fs_1.default.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error('删除临时文件失败:', unlinkErr);
                    }
                });
            });
        }
        else if (format === 'json') {
            res.json({
                success: true,
                data: data,
                count: data.length
            });
        }
        else {
            res.status(400).json({
                success: false,
                message: '不支持的导出格式'
            });
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '数据导出失败',
            error: error.message
        });
    }
});
router.post('/filter', async (req, res) => {
    try {
        const { dataType, filters, sortBy, sortOrder = 'DESC', limit = 100, offset = 0 } = req.body;
        let where = {};
        if (filters) {
            Object.keys(filters).forEach(key => {
                if (filters[key] !== null && filters[key] !== undefined) {
                    if (Array.isArray(filters[key])) {
                        where[key] = { [sequelize_1.Op.in]: filters[key] };
                    }
                    else if (typeof filters[key] === 'object') {
                        where[key] = filters[key];
                    }
                    else {
                        where[key] = filters[key];
                    }
                }
            });
        }
        let data;
        let order = [];
        if (sortBy) {
            order.push([sortBy, sortOrder]);
        }
        switch (dataType) {
            case 'user-behavior':
                data = await Analytics_1.UserBehavior.findAll({
                    where,
                    order,
                    limit: Number(limit),
                    offset: Number(offset)
                });
                break;
            case 'sales-data':
                data = await Analytics_1.SalesData.findAll({
                    where,
                    order,
                    limit: Number(limit),
                    offset: Number(offset)
                });
                break;
            case 'system-metrics':
                data = await Analytics_1.SystemMetrics.findAll({
                    where,
                    order,
                    limit: Number(limit),
                    offset: Number(offset)
                });
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: '不支持的数据类型'
                });
        }
        const total = await (dataType === 'user-behavior' ? Analytics_1.UserBehavior :
            dataType === 'sales-data' ? Analytics_1.SalesData : Analytics_1.SystemMetrics).count({ where });
        res.json({
            success: true,
            data: {
                records: data,
                total,
                limit: Number(limit),
                offset: Number(offset),
                hasMore: Number(offset) + data.length < total
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '数据筛选失败',
            error: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=analyticsEnhanced.js.map