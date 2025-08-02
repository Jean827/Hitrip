import { Request, Response, NextFunction } from 'express';
import { register, Counter, Histogram, Gauge } from 'prom-client';
import { performance } from 'perf_hooks';

// 定义监控指标
const httpRequestDurationMicroseconds = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const httpRequestSize = new Histogram({
  name: 'http_request_size_bytes',
  help: 'Size of HTTP requests in bytes',
  labelNames: ['method', 'route'],
  buckets: [100, 1000, 5000, 10000, 50000]
});

const httpResponseSize = new Histogram({
  name: 'http_response_size_bytes',
  help: 'Size of HTTP responses in bytes',
  labelNames: ['method', 'route'],
  buckets: [100, 1000, 5000, 10000, 50000, 100000]
});

const activeConnections = new Gauge({
  name: 'http_active_connections',
  help: 'Number of active HTTP connections'
});

const databaseConnections = new Gauge({
  name: 'database_connections',
  help: 'Number of active database connections'
});

const redisConnections = new Gauge({
  name: 'redis_connections',
  help: 'Number of active Redis connections'
});

const errorCounter = new Counter({
  name: 'application_errors_total',
  help: 'Total number of application errors',
  labelNames: ['type', 'route']
});

const logErrorsTotal = new Counter({
  name: 'log_errors_total',
  help: 'Total number of error logs'
});

// 原有的Prometheus指标定义保持不变

const databaseQueryDuration = new Histogram({
  name: 'database_query_duration_seconds',
  help: '数据库查询持续时间',
  labelNames: ['query_type'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
});

const redisOperationDuration = new Histogram({
  name: 'redis_operation_duration_seconds',
  help: 'Redis操作持续时间',
  labelNames: ['operation_type'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1]
});

// 业务指标
const userRegistrations = new Counter({
  name: 'user_registrations_total',
  help: '用户注册总数'
});

const userLogins = new Counter({
  name: 'user_logins_total',
  help: '用户登录总数'
});

const ordersCreated = new Counter({
  name: 'orders_created_total',
  help: '订单创建总数'
});

const revenueTotal = new Counter({
  name: 'revenue_total',
  help: '总收入'
});

const activeUsers = new Gauge({
  name: 'active_users',
  help: '当前活跃用户数'
});

const orderValue = new Histogram({
  name: 'order_value',
  help: '订单金额分布',
  buckets: [10, 50, 100, 200, 500, 1000, 2000, 5000]
});

// 监控中间件
export const monitoringMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // 记录请求开始
  activeConnections.inc();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    
    // 记录请求指标
    httpRequestDurationMicroseconds
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration);
    
    httpRequestsTotal
      .labels(req.method, route, res.statusCode.toString())
      .inc();
    
    // 减少活跃连接数
    activeConnections.dec();
  });
  
  next();
};

// 指标导出端点
export const metricsEndpoint = async (req: Request, res: Response) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end(error);
  }
};

// 健康检查端点
export const healthCheck = async (req: Request, res: Response) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
    environment: process.env['NODE_ENV']
  };
  
  res.json(health);
};

// 详细健康检查端点
export const detailedHealthCheck = async (req: Request, res: Response) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
    environment: process.env['NODE_ENV'],
    checks: {
      database: 'healthy',
      redis: 'healthy',
      disk: 'healthy'
    }
  };
  
  // 检查数据库连接
  try {
    // 这里应该检查实际的数据库连接
    health.checks.database = 'healthy';
  } catch (error) {
    health.checks.database = 'unhealthy';
    health.status = 'unhealthy';
  }
  
  // 检查Redis连接
  try {
    // 这里应该检查实际的Redis连接
    health.checks.redis = 'healthy';
  } catch (error) {
    health.checks.redis = 'unhealthy';
    health.status = 'unhealthy';
  }
  
  // 检查磁盘空间
  try {
    // 这里应该检查实际的磁盘空间
    health.checks.disk = 'healthy';
  } catch (error) {
    health.checks.disk = 'unhealthy';
    health.status = 'unhealthy';
  }
  
  res.json(health);
};

// 数据库监控装饰器
export const monitorDatabaseQuery = (queryType: string) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args: any[]) {
      const start = Date.now();
      
      try {
        const result = await originalMethod.apply(this, args);
        const duration = (Date.now() - start) / 1000;
        
        databaseQueryDuration
          .labels(queryType)
          .observe(duration);
        
        return result;
      } catch (error) {
        const duration = (Date.now() - start) / 1000;
        
        databaseQueryDuration
          .labels(queryType)
          .observe(duration);
        
        throw error;
      }
    };
    
    return descriptor;
  };
};

// Redis监控装饰器
export const monitorRedisOperation = (operationType: string) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args: any[]) {
      const start = Date.now();
      
      try {
        const result = await originalMethod.apply(this, args);
        const duration = (Date.now() - start) / 1000;
        
        redisOperationDuration
          .labels(operationType)
          .observe(duration);
        
        return result;
      } catch (error) {
        const duration = (Date.now() - start) / 1000;
        
        redisOperationDuration
          .labels(operationType)
          .observe(duration);
        
        throw error;
      }
    };
    
    return descriptor;
  };
};

// 业务监控装饰器
export const trackBusinessMetric = (metric: Counter | Gauge | Histogram, value?: number) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args: any[]) {
      const result = await originalMethod.apply(this, args);
      
      if (metric instanceof Counter) {
        metric.inc();
      } else if (metric instanceof Gauge) {
        if (value !== undefined) {
          metric.set(value);
        } else {
          metric.inc();
        }
      } else if (metric instanceof Histogram) {
        if (value !== undefined) {
          metric.observe(value);
        }
      }
      
      return result;
    };
    
    return descriptor;
  };
};

// 性能监控中间件
export const performanceMonitoringMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = performance.now();
  
  res.on('finish', () => {
    const duration = performance.now() - start;
    
    // 记录性能指标
    if (duration > 1000) { // 超过1秒的请求
      console.warn(`慢请求: ${req.method} ${req.path} - ${duration.toFixed(2)}ms`);
    }
  });
  
  next();
};

// 内存监控
export const memoryMonitoring = () => {
  const memUsage = process.memoryUsage();
  
  return {
    rss: memUsage.rss,
    heapTotal: memUsage.heapTotal,
    heapUsed: memUsage.heapUsed,
    external: memUsage.external,
    arrayBuffers: memUsage.arrayBuffers
  };
};

// 内存泄漏检测
export const detectMemoryLeak = () => {
  const memUsage = memoryMonitoring();
  const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
  
  if (heapUsedMB > 500) { // 500MB阈值
    console.warn('内存使用过高:', heapUsedMB.toFixed(2), 'MB');
  }
  
  return heapUsedMB;
};

// 导出业务指标
export {
  userRegistrations,
  userLogins,
  ordersCreated,
  revenueTotal,
  activeUsers,
  orderValue
}; 