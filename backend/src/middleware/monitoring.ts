import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { performance } from 'perf_hooks';

// 监控指标接口
interface MonitoringMetrics {
  requestCount: number;
  errorCount: number;
  responseTime: number[];
  activeConnections: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
}

// 全局监控指标
const metrics: MonitoringMetrics = {
  requestCount: 0,
  errorCount: 0,
  responseTime: [],
  activeConnections: 0,
  memoryUsage: process.memoryUsage(),
  cpuUsage: process.cpuUsage()
};

// 告警阈值配置
const ALERT_THRESHOLDS = {
  ERROR_RATE: 0.05, // 5%错误率
  RESPONSE_TIME: 2000, // 2秒响应时间
  MEMORY_USAGE: 0.8, // 80%内存使用率
  CPU_USAGE: 0.7 // 70%CPU使用率
};

// 告警状态
let alertStatus = {
  highErrorRate: false,
  slowResponse: false,
  highMemoryUsage: false,
  highCpuUsage: false
};

// 性能监控中间件
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const startTime = performance.now();
  const startCpu = process.cpuUsage();
  
  // 增加活跃连接数
  metrics.activeConnections++;
  
  // 记录请求开始
  logger.info('Request started', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // 监听响应结束
  res.on('finish', () => {
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    const endCpu = process.cpuUsage();
    
    // 更新指标
    metrics.requestCount++;
    metrics.responseTime.push(responseTime);
    metrics.activeConnections--;
    metrics.memoryUsage = process.memoryUsage();
    metrics.cpuUsage = endCpu;
    
    // 保持最近1000个响应时间记录
    if (metrics.responseTime.length > 1000) {
      metrics.responseTime.shift();
    }
    
    // 记录响应信息
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime.toFixed(2)}ms`,
      contentLength: res.get('Content-Length') || 0,
      timestamp: new Date().toISOString()
    });
    
    // 检查性能告警
    checkPerformanceAlerts(responseTime);
  });

  // 监听错误
  res.on('error', (error) => {
    metrics.errorCount++;
    logger.error('Response error', {
      method: req.method,
      url: req.url,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    // 检查错误率告警
    checkErrorRateAlert();
  });

  next();
};

// 错误监控中间件
export const errorMonitor = (error: Error, req: Request, res: Response, next: NextFunction) => {
  metrics.errorCount++;
  
  logger.error('Application error', {
    method: req.method,
    url: req.url,
    error: error.message,
    stack: error.stack,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  // 检查错误率告警
  checkErrorRateAlert();
  
  // 发送错误响应
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
};

// 业务指标监控
export const businessMetricsMonitor = (req: Request, res: Response, next: NextFunction) => {
  // 记录业务指标
  const businessMetrics = {
    endpoint: req.path,
    method: req.method,
    userId: req.user?.id || 'anonymous',
    timestamp: new Date().toISOString(),
    userAgent: req.get('User-Agent'),
    ip: req.ip
  };
  
  logger.info('Business metrics', businessMetrics);
  
  next();
};

// 检查性能告警
function checkPerformanceAlerts(responseTime: number) {
  if (responseTime > ALERT_THRESHOLDS.RESPONSE_TIME && !alertStatus.slowResponse) {
    alertStatus.slowResponse = true;
    logger.warn('Performance alert: Slow response time', {
      responseTime: `${responseTime.toFixed(2)}ms`,
      threshold: `${ALERT_THRESHOLDS.RESPONSE_TIME}ms`,
      timestamp: new Date().toISOString()
    });
  } else if (responseTime <= ALERT_THRESHOLDS.RESPONSE_TIME && alertStatus.slowResponse) {
    alertStatus.slowResponse = false;
    logger.info('Performance alert resolved: Response time back to normal', {
      responseTime: `${responseTime.toFixed(2)}ms`,
      timestamp: new Date().toISOString()
    });
  }
}

// 检查错误率告警
function checkErrorRateAlert() {
  const errorRate = metrics.requestCount > 0 ? metrics.errorCount / metrics.requestCount : 0;
  
  if (errorRate > ALERT_THRESHOLDS.ERROR_RATE && !alertStatus.highErrorRate) {
    alertStatus.highErrorRate = true;
    logger.warn('Error rate alert: High error rate detected', {
      errorRate: `${(errorRate * 100).toFixed(2)}%`,
      threshold: `${(ALERT_THRESHOLDS.ERROR_RATE * 100).toFixed(2)}%`,
      errorCount: metrics.errorCount,
      totalRequests: metrics.requestCount,
      timestamp: new Date().toISOString()
    });
  } else if (errorRate <= ALERT_THRESHOLDS.ERROR_RATE && alertStatus.highErrorRate) {
    alertStatus.highErrorRate = false;
    logger.info('Error rate alert resolved: Error rate back to normal', {
      errorRate: `${(errorRate * 100).toFixed(2)}%`,
      timestamp: new Date().toISOString()
    });
  }
}

// 检查系统资源告警
export function checkSystemResourceAlerts() {
  const memoryUsage = process.memoryUsage();
  const memoryUsagePercent = memoryUsage.heapUsed / memoryUsage.heapTotal;
  
  if (memoryUsagePercent > ALERT_THRESHOLDS.MEMORY_USAGE && !alertStatus.highMemoryUsage) {
    alertStatus.highMemoryUsage = true;
    logger.warn('System alert: High memory usage', {
      memoryUsage: `${(memoryUsagePercent * 100).toFixed(2)}%`,
      threshold: `${(ALERT_THRESHOLDS.MEMORY_USAGE * 100).toFixed(2)}%`,
      heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
      heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
      timestamp: new Date().toISOString()
    });
  } else if (memoryUsagePercent <= ALERT_THRESHOLDS.MEMORY_USAGE && alertStatus.highMemoryUsage) {
    alertStatus.highMemoryUsage = false;
    logger.info('System alert resolved: Memory usage back to normal', {
      memoryUsage: `${(memoryUsagePercent * 100).toFixed(2)}%`,
      timestamp: new Date().toISOString()
    });
  }
}

// 获取监控指标
export function getMonitoringMetrics() {
  const avgResponseTime = metrics.responseTime.length > 0 
    ? metrics.responseTime.reduce((a, b) => a + b, 0) / metrics.responseTime.length 
    : 0;
  
  const errorRate = metrics.requestCount > 0 
    ? metrics.errorCount / metrics.requestCount 
    : 0;
  
  return {
    ...metrics,
    avgResponseTime: avgResponseTime.toFixed(2),
    errorRate: `${(errorRate * 100).toFixed(2)}%`,
    alertStatus,
    timestamp: new Date().toISOString()
  };
}

// 重置监控指标
export function resetMonitoringMetrics() {
  metrics.requestCount = 0;
  metrics.errorCount = 0;
  metrics.responseTime = [];
  metrics.activeConnections = 0;
  alertStatus = {
    highErrorRate: false,
    slowResponse: false,
    highMemoryUsage: false,
    highCpuUsage: false
  };
  
  logger.info('Monitoring metrics reset');
}

// 定期检查系统资源
setInterval(() => {
  checkSystemResourceAlerts();
}, 60000); // 每分钟检查一次

export default {
  performanceMonitor,
  errorMonitor,
  businessMetricsMonitor,
  getMonitoringMetrics,
  resetMonitoringMetrics,
  checkSystemResourceAlerts
}; 