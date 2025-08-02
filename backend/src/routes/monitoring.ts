import { Router, Request, Response } from 'express';
import { performanceMonitor, getMonitoringMetrics, resetMonitoringMetrics } from '../middleware/monitoring';
import { alertManager, AlertType, AlertLevel } from '../utils/alertSystem';
import { logger } from '../utils/logger';
import { auth } from '../middleware/auth';

const router = Router();

// 获取系统监控指标
router.get('/metrics', auth, async (req: Request, res: Response) => {
  try {
    const metrics = getMonitoringMetrics();
    
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get monitoring metrics', {
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to get monitoring metrics',
      timestamp: new Date().toISOString()
    });
  }
});

// 获取告警列表
router.get('/alerts', auth, async (req: Request, res: Response) => {
  try {
    const { type, level, resolved, limit = 50, offset = 0 } = req.query;
    
    let alerts = alertManager.getAllAlerts();
    
    // 按类型过滤
    if (type && Object.values(AlertType).includes(type as AlertType)) {
      alerts = alerts.filter(alert => alert.type === type);
    }
    
    // 按级别过滤
    if (level && Object.values(AlertLevel).includes(level as AlertLevel)) {
      alerts = alerts.filter(alert => alert.level === level);
    }
    
    // 按解决状态过滤
    if (resolved !== undefined) {
      const isResolved = resolved === 'true';
      alerts = alerts.filter(alert => alert.resolved === isResolved);
    }
    
    // 分页
    const paginatedAlerts = alerts.slice(Number(offset), Number(offset) + Number(limit));
    
    res.json({
      success: true,
      data: {
        alerts: paginatedAlerts,
        total: alerts.length,
        limit: Number(limit),
        offset: Number(offset)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get alerts', {
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to get alerts',
      timestamp: new Date().toISOString()
    });
  }
});

// 获取活跃告警
router.get('/alerts/active', auth, async (req: Request, res: Response) => {
  try {
    const activeAlerts = alertManager.getActiveAlerts();
    
    res.json({
      success: true,
      data: activeAlerts,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get active alerts', {
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to get active alerts',
      timestamp: new Date().toISOString()
    });
  }
});

// 解决告警
router.put('/alerts/:alertId/resolve', auth, async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    const { resolvedBy } = req.body;
    
    const success = alertManager.resolveAlert(alertId, resolvedBy || req.user?.id);
    
    if (success) {
      res.json({
        success: true,
        message: 'Alert resolved successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Alert not found or already resolved',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    logger.error('Failed to resolve alert', {
      alertId: req.params.alertId,
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to resolve alert',
      timestamp: new Date().toISOString()
    });
  }
});

// 创建告警
router.post('/alerts', auth, async (req: Request, res: Response) => {
  try {
    const { type, level, title, message, details } = req.body;
    
    // 验证必需字段
    if (!type || !level || !title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type, level, title, message',
        timestamp: new Date().toISOString()
      });
    }
    
    // 验证类型和级别
    if (!Object.values(AlertType).includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid alert type',
        timestamp: new Date().toISOString()
      });
    }
    
    if (!Object.values(AlertLevel).includes(level)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid alert level',
        timestamp: new Date().toISOString()
      });
    }
    
    const alert = await alertManager.createAlert(type, level, title, message, details);
    
    res.status(201).json({
      success: true,
      data: alert,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to create alert', {
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to create alert',
      timestamp: new Date().toISOString()
    });
  }
});

// 获取告警统计
router.get('/alerts/statistics', auth, async (req: Request, res: Response) => {
  try {
    const statistics = alertManager.getAlertStatistics();
    
    res.json({
      success: true,
      data: statistics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get alert statistics', {
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to get alert statistics',
      timestamp: new Date().toISOString()
    });
  }
});

// 清理已解决的告警
router.delete('/alerts/cleanup', auth, async (req: Request, res: Response) => {
  try {
    const { olderThanDays = 7 } = req.query;
    
    const cleanedCount = alertManager.cleanupResolvedAlerts(Number(olderThanDays));
    
    res.json({
      success: true,
      data: {
        cleanedCount,
        olderThanDays: Number(olderThanDays)
      },
      message: `Cleaned up ${cleanedCount} resolved alerts`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to cleanup alerts', {
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup alerts',
      timestamp: new Date().toISOString()
    });
  }
});

// 重置监控指标
router.post('/metrics/reset', auth, async (req: Request, res: Response) => {
  try {
    resetMonitoringMetrics();
    
    res.json({
      success: true,
      message: 'Monitoring metrics reset successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to reset monitoring metrics', {
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to reset monitoring metrics',
      timestamp: new Date().toISOString()
    });
  }
});

// 获取系统状态
router.get('/status', auth, async (req: Request, res: Response) => {
  try {
    const metrics = getMonitoringMetrics();
    const alertStats = alertManager.getAlertStatistics();
    
    // 计算系统健康状态
    const healthStatus = calculateHealthStatus(metrics, alertStats);
    
    res.json({
      success: true,
      data: {
        status: healthStatus.status,
        score: healthStatus.score,
        metrics: {
          responseTime: metrics.avgResponseTime,
          errorRate: metrics.errorRate,
          activeConnections: metrics.activeConnections,
          memoryUsage: `${(metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal * 100).toFixed(2)}%`
        },
        alerts: {
          total: alertStats.total,
          active: alertStats.active,
          critical: alertStats.byLevel.critical || 0
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Failed to get system status', {
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to get system status',
      timestamp: new Date().toISOString()
    });
  }
});

// 计算系统健康状态
function calculateHealthStatus(metrics: any, alertStats: any) {
  let score = 100;
  let status = 'healthy';
  
  // 响应时间评分
  const avgResponseTime = parseFloat(metrics.avgResponseTime);
  if (avgResponseTime > 2000) {
    score -= 20;
    status = 'degraded';
  } else if (avgResponseTime > 1000) {
    score -= 10;
  }
  
  // 错误率评分
  const errorRate = parseFloat(metrics.errorRate);
  if (errorRate > 0.1) {
    score -= 30;
    status = 'critical';
  } else if (errorRate > 0.05) {
    score -= 15;
    status = 'degraded';
  }
  
  // 活跃告警评分
  if (alertStats.active > 10) {
    score -= 25;
    status = 'critical';
  } else if (alertStats.active > 5) {
    score -= 15;
    status = 'degraded';
  }
  
  // 严重告警评分
  if (alertStats.byLevel.critical > 0) {
    score -= 20;
    status = 'critical';
  }
  
  // 内存使用评分
  const memoryUsage = parseFloat(metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal * 100);
  if (memoryUsage > 90) {
    score -= 20;
    status = 'critical';
  } else if (memoryUsage > 80) {
    score -= 10;
    status = 'degraded';
  }
  
  return {
    status: score < 50 ? 'critical' : score < 80 ? 'degraded' : 'healthy',
    score: Math.max(0, score)
  };
}

// 获取实时监控数据
router.get('/realtime', auth, async (req: Request, res: Response) => {
  try {
    const metrics = getMonitoringMetrics();
    const activeAlerts = alertManager.getActiveAlerts();
    
    res.json({
      success: true,
      data: {
        metrics: {
          requestCount: metrics.requestCount,
          errorCount: metrics.errorCount,
          avgResponseTime: metrics.avgResponseTime,
          activeConnections: metrics.activeConnections,
          memoryUsage: {
            heapUsed: `${(metrics.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
            heapTotal: `${(metrics.memoryUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
            percentage: `${(metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal * 100).toFixed(2)}%`
          }
        },
        alerts: {
          total: activeAlerts.length,
          byLevel: activeAlerts.reduce((acc, alert) => {
            acc[alert.level] = (acc[alert.level] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Failed to get realtime data', {
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to get realtime data',
      timestamp: new Date().toISOString()
    });
  }
});

export default router; 