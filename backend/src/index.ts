import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

// 加载环境变量
dotenv.config();

// 导入数据库连接
import { initializeDatabases } from './config/database';
import { testSequelizeConnection, syncDatabase } from './config/sequelize';
import { seedAllData } from './utils/seedData';

// 导入路由
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import adminRoutes from './routes/admin';
import roleRoutes from './routes/role';
import permissionRoutes from './routes/permission';
import pointsRoutes from './routes/points';
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import orderRoutes from './routes/orders';
import paymentRoutes from './routes/payments';
import cartRoutes from './routes/cart';
import merchantRoutes from './routes/merchants';
import recommendationRoutes from './routes/recommendations';
import userProfileRoutes from './routes/userProfiles';
import analyticsRoutes from './routes/analytics';
import analyticsEnhancedRoutes from './routes/analyticsEnhanced';
import marketingRoutes from './routes/marketing';
import customerServiceRoutes from './routes/customerService';
import monitoringRoutes from './routes/monitoring';
import searchRoutes from './routes/search';

// 导入中间件
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import { logger } from './utils/logger';
import { performanceMonitor, errorMonitor, businessMetricsMonitor } from './middleware/monitoring';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// 基础中间件
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 日志中间件
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}));

// 监控中间件
app.use(performanceMonitor);
app.use(businessMetricsMonitor);

// 限流中间件
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100个请求
  message: '请求过于频繁，请稍后再试'
});
app.use('/api/', limiter);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/user', authMiddleware, userRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);
app.use('/api/role', roleRoutes);
app.use('/api/permission', permissionRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/merchants', merchantRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/user-profiles', userProfileRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/analytics-enhanced', analyticsEnhancedRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/customer-service', customerServiceRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/search', searchRoutes);

// Swagger API文档路由
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: { title: '海南文旅API', version: '1.0.0' },
  },
  apis: ['./src/routes/*.ts', './src/models/*.ts'],
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ message: '接口不存在' });
});

// 错误处理中间件
app.use(errorMonitor);
app.use(errorHandler);

// Socket.io连接处理
io.on('connection', (socket) => {
  logger.info(`用户连接: ${socket.id}`);
  
  socket.on('disconnect', () => {
    logger.info(`用户断开连接: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

// 启动服务器
const startServer = async () => {
  try {
    // 初始化数据库连接
    await initializeDatabases();
    
    // 初始化Sequelize连接和同步模型
    await testSequelizeConnection();
    await syncDatabase();
    
    // 初始化商城数据
    await seedAllData();
    
    server.listen(PORT, () => {
      logger.info(`服务器运行在端口 ${PORT}`);
      logger.info(`环境: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();

export { app, io }; 