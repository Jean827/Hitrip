import express from 'express';
import { UserBehavior, SalesData, SystemMetrics, BusinessMetrics } from '../models/Analytics';
import { Op, sequelize } from 'sequelize';
import moment from 'moment';

const router = express.Router();

// 用户行为分析
router.get('/user-behavior', async (req, res) => {
  try {
    const { startDate, endDate, eventType, userId } = req.query;
    
    const where: any = {};
    
    if (startDate && endDate) {
      where.timestamp = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }
    
    if (eventType) {
      where.eventType = eventType;
    }
    
    if (userId) {
      where.userId = userId;
    }
    
    // 获取事件统计
    const eventStats = await UserBehavior.findAll({
      attributes: [
        'eventType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where,
      group: ['eventType'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
    });
    
    // 获取页面访问统计
    const pageStats = await UserBehavior.findAll({
      attributes: [
        'pageUrl',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        ...where,
        eventType: 'page_view'
      },
      group: ['pageUrl'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: 10
    });
    
    // 获取用户活跃度
    const activeUsers = await UserBehavior.findAll({
      attributes: [
        'userId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'eventCount'],
        [sequelize.fn('MAX', sequelize.col('timestamp')), 'lastActivity']
      ],
      where: {
        ...where,
        userId: { [Op.ne]: null }
      },
      group: ['userId'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: 20
    });
    
    // 获取时间趋势
    const timeTrend = await UserBehavior.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('timestamp')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where,
      group: [sequelize.fn('DATE', sequelize.col('timestamp'))],
      order: [[sequelize.fn('DATE', sequelize.col('timestamp')), 'ASC']],
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取用户行为分析失败',
      error: error.message
    });
  }
});

// 销售数据分析
router.get('/sales-analysis', async (req, res) => {
  try {
    const { startDate, endDate, region, channel, status } = req.query;
    
    const where: any = {};
    
    if (startDate && endDate) {
      where.orderDate = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
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
    
    // 销售总额
    const totalSales = await SalesData.sum('finalPrice', { where });
    
    // 订单数量
    const orderCount = await SalesData.count({
      where,
      distinct: true,
      col: 'orderId'
    });
    
    // 平均订单金额
    const avgOrderValue = totalSales / orderCount;
    
    // 按状态统计
    const statusStats = await SalesData.findAll({
      attributes: [
        'orderStatus',
        [sequelize.fn('COUNT', sequelize.col('orderId')), 'count'],
        [sequelize.fn('SUM', sequelize.col('finalPrice')), 'totalAmount']
      ],
      where,
      group: ['orderStatus']
    });
    
    // 按地区统计
    const regionStats = await SalesData.findAll({
      attributes: [
        'region',
        [sequelize.fn('COUNT', sequelize.col('orderId')), 'count'],
        [sequelize.fn('SUM', sequelize.col('finalPrice')), 'totalAmount']
      ],
      where,
      group: ['region'],
      order: [[sequelize.fn('SUM', sequelize.col('finalPrice')), 'DESC']]
    });
    
    // 按渠道统计
    const channelStats = await SalesData.findAll({
      attributes: [
        'channel',
        [sequelize.fn('COUNT', sequelize.col('orderId')), 'count'],
        [sequelize.fn('SUM', sequelize.col('finalPrice')), 'totalAmount']
      ],
      where,
      group: ['channel'],
      order: [[sequelize.fn('SUM', sequelize.col('finalPrice')), 'DESC']]
    });
    
    // 时间趋势
    const timeTrend = await SalesData.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('orderDate')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('orderId')), 'orderCount'],
        [sequelize.fn('SUM', sequelize.col('finalPrice')), 'totalAmount']
      ],
      where,
      group: [sequelize.fn('DATE', sequelize.col('orderDate'))],
      order: [[sequelize.fn('DATE', sequelize.col('orderDate')), 'ASC']],
      limit: 30
    });
    
    // 热销商品
    const topProducts = await SalesData.findAll({
      attributes: [
        'productId',
        [sequelize.fn('COUNT', sequelize.col('orderId')), 'orderCount'],
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
        [sequelize.fn('SUM', sequelize.col('finalPrice')), 'totalAmount']
      ],
      where,
      group: ['productId'],
      order: [[sequelize.fn('SUM', sequelize.col('finalPrice')), 'DESC']],
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取销售数据分析失败',
      error: error.message
    });
  }
});

// 实时数据监控
router.get('/real-time', async (req, res) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // 最近一小时的用户行为
    const recentBehaviors = await UserBehavior.count({
      where: {
        timestamp: {
          [Op.gte]: oneHourAgo
        }
      }
    });
    
    // 最近一小时的销售数据
    const recentSales = await SalesData.sum('finalPrice', {
      where: {
        orderDate: {
          [Op.gte]: oneHourAgo
        }
      }
    });
    
    // 最近一小时的订单数量
    const recentOrders = await SalesData.count({
      where: {
        orderDate: {
          [Op.gte]: oneHourAgo
        }
      },
      distinct: true,
      col: 'orderId'
    });
    
    // 系统性能指标
    const systemMetrics = await SystemMetrics.findAll({
      where: {
        timestamp: {
          [Op.gte]: oneHourAgo
        }
      },
      order: [['timestamp', 'DESC']],
      limit: 10
    });
    
    // 活跃用户数
    const activeUsers = await UserBehavior.count({
      where: {
        timestamp: {
          [Op.gte]: oneHourAgo
        },
        userId: { [Op.ne]: null }
      },
      distinct: true,
      col: 'userId'
    });
    
    // 页面访问量
    const pageViews = await UserBehavior.count({
      where: {
        timestamp: {
          [Op.gte]: oneHourAgo
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取实时数据失败',
      error: error.message
    });
  }
});

// 业务指标统计
router.get('/business-metrics', async (req, res) => {
  try {
    const { period = 'daily', startDate, endDate, category } = req.query;
    
    const where: any = {};
    
    if (startDate && endDate) {
      where.startTime = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }
    
    if (category) {
      where.category = category;
    }
    
    if (period) {
      where.period = period;
    }
    
    const metrics = await BusinessMetrics.findAll({
      where,
      order: [['startTime', 'ASC']]
    });
    
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取业务指标失败',
      error: error.message
    });
  }
});

// 用户路径分析
router.get('/user-path', async (req, res) => {
  try {
    const { userId, sessionId, limit = 10 } = req.query;
    
    const where: any = {};
    
    if (userId) {
      where.userId = userId;
    }
    
    if (sessionId) {
      where.sessionId = sessionId;
    }
    
    const userPaths = await UserBehavior.findAll({
      where,
      attributes: ['sessionId', 'eventType', 'pageUrl', 'timestamp'],
      order: [['sessionId', 'ASC'], ['timestamp', 'ASC']],
      limit: Number(limit)
    });
    
    // 按会话分组
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
    }, {} as any);
    
    res.json({
      success: true,
      data: pathsBySession
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取用户路径分析失败',
      error: error.message
    });
  }
});

// 漏斗分析
router.get('/funnel', async (req, res) => {
  try {
    const { startDate, endDate, steps = ['page_view', 'add_to_cart', 'purchase'] } = req.query;
    
    const where: any = {};
    
    if (startDate && endDate) {
      where.timestamp = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }
    
    const stepStats = [];
    const stepsArray = Array.isArray(steps) ? steps : [steps as string];
    
    for (const step of stepsArray) {
      const count = await UserBehavior.count({
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取漏斗分析失败',
      error: error.message
    });
  }
});

// 记录用户行为
router.post('/track', async (req, res) => {
  try {
    const {
      userId,
      sessionId,
      eventType,
      eventName,
      pageUrl,
      referrer,
      userAgent,
      ipAddress,
      metadata
    } = req.body;
    
    const behavior = await UserBehavior.create({
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '记录用户行为失败',
      error: error.message
    });
  }
});

// 记录系统指标
router.post('/system-metrics', async (req, res) => {
  try {
    const {
      metricName,
      metricValue,
      metricUnit,
      serverId,
      component,
      metadata
    } = req.body;
    
    const metric = await SystemMetrics.create({
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '记录系统指标失败',
      error: error.message
    });
  }
});

// 记录业务指标
router.post('/business-metrics', async (req, res) => {
  try {
    const {
      metricName,
      metricValue,
      metricUnit,
      period,
      startTime,
      endTime,
      category,
      metadata
    } = req.body;
    
    const metric = await BusinessMetrics.create({
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '记录业务指标失败',
      error: error.message
    });
  }
});

export default router; 