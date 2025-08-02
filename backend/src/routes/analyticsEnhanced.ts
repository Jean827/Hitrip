import express from 'express';
import { UserBehavior, SalesData, SystemMetrics, BusinessMetrics } from '../models/Analytics';
import { Op, sequelize } from 'sequelize';
import moment from 'moment';
import { createObjectCsvWriter } from 'csv-writer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// 用户画像分析
router.get('/user-profile', async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;
    
    const where: any = {};
    
    if (startDate && endDate) {
      where.timestamp = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }
    
    if (userId) {
      where.userId = userId;
    }
    
    // 用户行为偏好分析
    const behaviorPreferences = await UserBehavior.findAll({
      attributes: [
        'eventType',
        'pageUrl',
        [sequelize.fn('COUNT', sequelize.col('id')), 'frequency']
      ],
      where: {
        ...where,
        userId: { [Op.ne]: null }
      },
      group: ['eventType', 'pageUrl'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: 20
    });
    
    // 用户活跃时间分析
    const activeTimeAnalysis = await UserBehavior.findAll({
      attributes: [
        [sequelize.fn('HOUR', sequelize.col('timestamp')), 'hour'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'activityCount']
      ],
      where: {
        ...where,
        userId: { [Op.ne]: null }
      },
      group: [sequelize.fn('HOUR', sequelize.col('timestamp'))],
      order: [[sequelize.fn('HOUR', sequelize.col('timestamp')), 'ASC']]
    });
    
    // 用户地域分布分析
    const locationAnalysis = await UserBehavior.findAll({
      attributes: [
        'ipAddress',
        [sequelize.fn('COUNT', sequelize.col('id')), 'userCount']
      ],
      where: {
        ...where,
        userId: { [Op.ne]: null }
      },
      group: ['ipAddress'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: 10
    });
    
    // 用户设备分析
    const deviceAnalysis = await UserBehavior.findAll({
      attributes: [
        'userAgent',
        [sequelize.fn('COUNT', sequelize.col('id')), 'userCount']
      ],
      where: {
        ...where,
        userId: { [Op.ne]: null }
      },
      group: ['userAgent'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取用户画像分析失败',
      error: error.message
    });
  }
});

// 商品销售趋势分析
router.get('/product-trends', async (req, res) => {
  try {
    const { startDate, endDate, categoryId, productId } = req.query;
    
    const where: any = {};
    
    if (startDate && endDate) {
      where.orderDate = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    if (productId) {
      where.productId = productId;
    }
    
    // 商品销量趋势
    const salesTrend = await SalesData.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('orderDate')), 'date'],
        'productId',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
        [sequelize.fn('SUM', sequelize.col('finalPrice')), 'totalAmount'],
        [sequelize.fn('COUNT', sequelize.col('orderId')), 'orderCount']
      ],
      where,
      group: [sequelize.fn('DATE', sequelize.col('orderDate')), 'productId'],
      order: [[sequelize.fn('DATE', sequelize.col('orderDate')), 'ASC']],
      limit: 100
    });
    
    // 商品分类销售统计
    const categorySales = await SalesData.findAll({
      attributes: [
        'categoryId',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
        [sequelize.fn('SUM', sequelize.col('finalPrice')), 'totalAmount'],
        [sequelize.fn('COUNT', sequelize.col('orderId')), 'orderCount']
      ],
      where,
      group: ['categoryId'],
      order: [[sequelize.fn('SUM', sequelize.col('finalPrice')), 'DESC']]
    });
    
    // 热销商品排行
    const topProducts = await SalesData.findAll({
      attributes: [
        'productId',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
        [sequelize.fn('SUM', sequelize.col('finalPrice')), 'totalAmount'],
        [sequelize.fn('COUNT', sequelize.col('orderId')), 'orderCount']
      ],
      where,
      group: ['productId'],
      order: [[sequelize.fn('SUM', sequelize.col('finalPrice')), 'DESC']],
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取商品销售趋势分析失败',
      error: error.message
    });
  }
});

// 地域分布分析
router.get('/geographic-analysis', async (req, res) => {
  try {
    const { startDate, endDate, region } = req.query;
    
    const where: any = {};
    
    if (startDate && endDate) {
      where.orderDate = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }
    
    if (region) {
      where.region = region;
    }
    
    // 地域销售统计
    const regionSales = await SalesData.findAll({
      attributes: [
        'region',
        [sequelize.fn('SUM', sequelize.col('finalPrice')), 'totalAmount'],
        [sequelize.fn('COUNT', sequelize.col('orderId')), 'orderCount'],
        [sequelize.fn('AVG', sequelize.col('finalPrice')), 'avgOrderValue']
      ],
      where,
      group: ['region'],
      order: [[sequelize.fn('SUM', sequelize.col('finalPrice')), 'DESC']]
    });
    
    // 地域用户活跃度
    const regionActivity = await UserBehavior.findAll({
      attributes: [
        'ipAddress',
        [sequelize.fn('COUNT', sequelize.col('id')), 'activityCount'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('userId'))), 'uniqueUsers']
      ],
      where: {
        ...where,
        userId: { [Op.ne]: null }
      },
      group: ['ipAddress'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: 20
    });
    
    res.json({
      success: true,
      data: {
        regionSales,
        regionActivity
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取地域分布分析失败',
      error: error.message
    });
  }
});

// 时间序列分析
router.get('/time-series', async (req, res) => {
  try {
    const { startDate, endDate, interval = 'day', metric = 'sales' } = req.query;
    
    const where: any = {};
    
    if (startDate && endDate) {
      where.orderDate = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }
    
    let timeFormat, groupBy;
    switch (interval) {
      case 'hour':
        timeFormat = sequelize.fn('DATE_FORMAT', sequelize.col('orderDate'), '%Y-%m-%d %H:00:00');
        groupBy = sequelize.fn('DATE_FORMAT', sequelize.col('orderDate'), '%Y-%m-%d %H:00:00');
        break;
      case 'day':
        timeFormat = sequelize.fn('DATE', sequelize.col('orderDate'));
        groupBy = sequelize.fn('DATE', sequelize.col('orderDate'));
        break;
      case 'week':
        timeFormat = sequelize.fn('YEARWEEK', sequelize.col('orderDate'));
        groupBy = sequelize.fn('YEARWEEK', sequelize.col('orderDate'));
        break;
      case 'month':
        timeFormat = sequelize.fn('DATE_FORMAT', sequelize.col('orderDate'), '%Y-%m');
        groupBy = sequelize.fn('DATE_FORMAT', sequelize.col('orderDate'), '%Y-%m');
        break;
      default:
        timeFormat = sequelize.fn('DATE', sequelize.col('orderDate'));
        groupBy = sequelize.fn('DATE', sequelize.col('orderDate'));
    }
    
    let metricField;
    switch (metric) {
      case 'sales':
        metricField = sequelize.fn('SUM', sequelize.col('finalPrice'));
        break;
      case 'orders':
        metricField = sequelize.fn('COUNT', sequelize.col('orderId'));
        break;
      case 'quantity':
        metricField = sequelize.fn('SUM', sequelize.col('quantity'));
        break;
      default:
        metricField = sequelize.fn('SUM', sequelize.col('finalPrice'));
    }
    
    const timeSeriesData = await SalesData.findAll({
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取时间序列分析失败',
      error: error.message
    });
  }
});

// 转化率分析
router.get('/conversion-analysis', async (req, res) => {
  try {
    const { startDate, endDate, funnel = ['page_view', 'add_to_cart', 'purchase'] } = req.query;
    
    const where: any = {};
    
    if (startDate && endDate) {
      where.timestamp = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }
    
    const funnelSteps = Array.isArray(funnel) ? funnel : [funnel as string];
    const conversionData = [];
    
    for (let i = 0; i < funnelSteps.length; i++) {
      const step = funnelSteps[i];
      const count = await UserBehavior.count({
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
        conversionRate: parseFloat(conversionRate as string)
      });
    }
    
    // 计算总体转化率
    const totalConversionRate = conversionData.length > 1 ? 
      (conversionData[conversionData.length - 1].count / conversionData[0].count * 100).toFixed(2) : 0;
    
    res.json({
      success: true,
      data: {
        conversionData,
        totalConversionRate: parseFloat(totalConversionRate as string),
        funnelSteps
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取转化率分析失败',
      error: error.message
    });
  }
});

// 留存率分析
router.get('/retention-analysis', async (req, res) => {
  try {
    const { startDate, endDate, days = 30 } = req.query;
    
    const where: any = {};
    
    if (startDate && endDate) {
      where.timestamp = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }
    
    // 获取用户首次访问时间
    const firstVisits = await UserBehavior.findAll({
      attributes: [
        'userId',
        [sequelize.fn('MIN', sequelize.col('timestamp')), 'firstVisit']
      ],
      where: {
        ...where,
        userId: { [Op.ne]: null }
      },
      group: ['userId']
    });
    
    // 计算留存率
    const retentionData = [];
    const dayCount = Number(days);
    
    for (let day = 1; day <= dayCount; day++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - day);
      
      const retainedUsers = await UserBehavior.count({
        where: {
          ...where,
          userId: { [Op.ne]: null },
          timestamp: {
            [Op.gte]: targetDate
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
        retentionRate: parseFloat(retentionRate as string)
      });
    }
    
    res.json({
      success: true,
      data: {
        retentionData,
        totalUsers: firstVisits.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取留存率分析失败',
      error: error.message
    });
  }
});

// 数据导出功能
router.get('/export/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { format = 'csv', startDate, endDate } = req.query;
    
    const where: any = {};
    
    if (startDate && endDate) {
      where.timestamp = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }
    
    let data, headers;
    
    switch (type) {
      case 'user-behavior':
        data = await UserBehavior.findAll({ where });
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
        data = await SalesData.findAll({ where });
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
        data = await SystemMetrics.findAll({ where });
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
      // 创建CSV文件
      const exportDir = path.join(__dirname, '../../exports');
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }
      
      const fileName = `${type}_${Date.now()}.csv`;
      const filePath = path.join(exportDir, fileName);
      
      const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: headers
      });
      
      await csvWriter.writeRecords(data);
      
      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error('文件下载失败:', err);
        }
        // 下载完成后删除文件
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error('删除临时文件失败:', unlinkErr);
          }
        });
      });
    } else if (format === 'json') {
      res.json({
        success: true,
        data: data,
        count: data.length
      });
    } else {
      res.status(400).json({
        success: false,
        message: '不支持的导出格式'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '数据导出失败',
      error: error.message
    });
  }
});

// 数据筛选功能
router.post('/filter', async (req, res) => {
  try {
    const { 
      dataType, 
      filters, 
      sortBy, 
      sortOrder = 'DESC', 
      limit = 100, 
      offset = 0 
    } = req.body;
    
    let where: any = {};
    
    // 应用筛选条件
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined) {
          if (Array.isArray(filters[key])) {
            where[key] = { [Op.in]: filters[key] };
          } else if (typeof filters[key] === 'object') {
            where[key] = filters[key];
          } else {
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
        data = await UserBehavior.findAll({
          where,
          order,
          limit: Number(limit),
          offset: Number(offset)
        });
        break;
        
      case 'sales-data':
        data = await SalesData.findAll({
          where,
          order,
          limit: Number(limit),
          offset: Number(offset)
        });
        break;
        
      case 'system-metrics':
        data = await SystemMetrics.findAll({
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
    
    // 获取总数
    const total = await (dataType === 'user-behavior' ? UserBehavior : 
                        dataType === 'sales-data' ? SalesData : SystemMetrics).count({ where });
    
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '数据筛选失败',
      error: error.message
    });
  }
});

export default router; 