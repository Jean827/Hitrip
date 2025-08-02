import { Request, Response, NextFunction } from 'express';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

// 性能监控数据
interface PerformanceMetrics {
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  timestamp: number;
  userAgent?: string;
  ip?: string;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private slowQueries: PerformanceMetrics[] = [];
  private errorQueries: PerformanceMetrics[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // 记录性能指标
  recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // 记录慢查询
    if (metric.responseTime > 1000) {
      this.slowQueries.push(metric);
    }
    
    // 记录错误查询
    if (metric.statusCode >= 400) {
      this.errorQueries.push(metric);
    }
    
    // 限制数组大小
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500);
    }
  }

  // 获取性能统计
  getStats(): any {
    const totalRequests = this.metrics.length;
    const avgResponseTime = totalRequests > 0 
      ? this.metrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests 
      : 0;
    
    const errorRate = totalRequests > 0 
      ? this.errorQueries.length / totalRequests 
      : 0;
    
    const slowQueryRate = totalRequests > 0 
      ? this.slowQueries.length / totalRequests 
      : 0;

    return {
      totalRequests,
      avgResponseTime: Math.round(avgResponseTime),
      errorRate: Math.round(errorRate * 100 * 100) / 100, // 保留两位小数
      slowQueryRate: Math.round(slowQueryRate * 100 * 100) / 100,
      slowQueries: this.slowQueries.length,
      errorQueries: this.errorQueries.length
    };
  }

  // 清理旧数据
  cleanup(): void {
    const oneHourAgo = Date.now() - 3600000;
    this.metrics = this.metrics.filter(m => m.timestamp > oneHourAgo);
    this.slowQueries = this.slowQueries.filter(m => m.timestamp > oneHourAgo);
    this.errorQueries = this.errorQueries.filter(m => m.timestamp > oneHourAgo);
  }
}

// 性能监控中间件
export const performanceMonitor = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  const monitor = PerformanceMonitor.getInstance();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const metric: PerformanceMetrics = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: duration,
      timestamp: Date.now(),
      userAgent: req.get('User-Agent'),
      ip: req.ip
    };

    monitor.recordMetric(metric);

    // 记录慢请求
    if (duration > 1000) {
      console.warn(`慢请求: ${req.method} ${req.url} - ${duration}ms`);
    }
  });

  next();
};

// 压缩中间件
export const compressionMiddleware = compression({
  level: 6,
  threshold: 1024,
  filter: (req: Request, res: Response) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
});

// 限流中间件
export const createRateLimiter = (windowMs: number = 15 * 60 * 1000, max: number = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: '请求过于频繁，请稍后再试'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        message: '请求过于频繁，请稍后再试',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// 通用限流器
export const generalLimiter = createRateLimiter(15 * 60 * 1000, 100); // 15分钟100次
export const authLimiter = createRateLimiter(15 * 60 * 1000, 5); // 15分钟5次登录
export const searchLimiter = createRateLimiter(1 * 60 * 1000, 30); // 1分钟30次搜索

// 异步错误处理
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 内存使用监控
export const memoryMonitor = (req: Request, res: Response, next: NextFunction): void => {
  const memUsage = process.memoryUsage();
  const memoryUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
  
  if (memoryUsagePercent > 80) {
    console.warn(`内存使用率过高: ${memoryUsagePercent.toFixed(2)}%`);
  }
  
  next();
};

// 数据库连接监控
export const dbConnectionMonitor = (req: Request, res: Response, next: NextFunction): void => {
  // 这里可以添加数据库连接池监控
  next();
};

// 缓存监控
export const cacheMonitor = (req: Request, res: Response, next: NextFunction): void => {
  // 这里可以添加缓存命中率监控
  next();
};

// 获取性能统计API
export const getPerformanceStats = (req: Request, res: Response): void => {
  const monitor = PerformanceMonitor.getInstance();
  const stats = monitor.getStats();
  
  res.json({
    success: true,
    data: {
      ...stats,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    }
  });
};

// 清理性能数据
export const cleanupPerformanceData = (req: Request, res: Response): void => {
  const monitor = PerformanceMonitor.getInstance();
  monitor.cleanup();
  
  res.json({
    success: true,
    message: '性能数据清理完成'
  });
};

// 导出监控实例
export const performanceMonitorInstance = PerformanceMonitor.getInstance(); 