import { Router } from 'express';
import { 
  metricsEndpoint, 
  healthCheck, 
  detailedHealthCheck,
  monitoringMiddleware 
} from '../middleware/monitoring';

const router = Router();

// 应用监控中间件
router.use(monitoringMiddleware);

// 指标导出端点
router.get('/metrics', metricsEndpoint);

// 健康检查端点
router.get('/health', healthCheck);

// 详细健康检查端点
router.get('/health/detailed', detailedHealthCheck);

// 系统状态端点
router.get('/status', (req, res) => {
  res.json({
    status: 'running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    version: process.version,
    platform: process.platform,
    arch: process.arch
  });
});

// 性能指标端点
router.get('/performance', (req, res) => {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  res.json({
    memory: {
      rss: memUsage.rss,
      heapTotal: memUsage.heapTotal,
      heapUsed: memUsage.heapUsed,
      external: memUsage.external,
      arrayBuffers: memUsage.arrayBuffers
    },
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system
    },
    uptime: process.uptime(),
    loadAverage: process.loadavg()
  });
});

// 告警端点
router.post('/alerts', (req, res) => {
  const { alerts } = req.body;
  
  // 处理告警信息
  console.log('收到告警:', alerts);
  
  // 这里可以添加告警处理逻辑
  // 比如发送邮件、短信等
  
  res.json({ status: 'received' });
});

// 日志端点
router.get('/logs', (req, res) => {
  // 返回最近的日志信息
  res.json({
    logs: [
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: '系统运行正常'
      }
    ]
  });
});

// 配置端点
router.get('/config', (req, res) => {
  res.json({
    environment: process.env['NODE_ENV'],
    port: process.env.PORT || 5000,
    database: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      name: process.env.DB_NAME
    },
    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT
    }
  });
});

export default router; 