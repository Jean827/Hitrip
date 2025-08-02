import mongoose from 'mongoose';
import { Pool } from 'pg';
import Redis from 'ioredis';
import { logger } from '../utils/logger';

// MongoDB连接
export const connectMongoDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hainan-tourism';
    
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info('MongoDB连接成功');
    
    // 监听连接事件
    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB连接错误:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB连接断开');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB重新连接成功');
    });

  } catch (error) {
    logger.error('MongoDB连接失败:', error);
    process.exit(1);
  }
};

// PostgreSQL连接池
export const pgPool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'hainan_tourism',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// PostgreSQL连接测试
export const testPostgreSQL = async (): Promise<void> => {
  try {
    const client = await pgPool.connect();
    await client.query('SELECT NOW()');
    client.release();
    logger.info('PostgreSQL连接成功');
  } catch (error) {
    logger.error('PostgreSQL连接失败:', error);
  }
};

// Redis连接
export const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

// Redis连接测试
export const testRedis = async (): Promise<void> => {
  try {
    await redis.ping();
    logger.info('Redis连接成功');
  } catch (error) {
    logger.error('Redis连接失败:', error);
  }
};

// 关闭所有数据库连接
export const closeConnections = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    await pgPool.end();
    await redis.quit();
    logger.info('所有数据库连接已关闭');
  } catch (error) {
    logger.error('关闭数据库连接时出错:', error);
  }
};

// 初始化所有数据库连接
export const initializeDatabases = async (): Promise<void> => {
  await connectMongoDB();
  await testPostgreSQL();
  await testRedis();
};

// 数据库健康检查
export const healthCheck = async (): Promise<{
  mongodb: boolean;
  postgresql: boolean;
  redis: boolean;
}> => {
  const status = {
    mongodb: false,
    postgresql: false,
    redis: false
  };

  try {
    // MongoDB健康检查
    if (mongoose.connection.readyState === 1) {
      status.mongodb = true;
    }
  } catch (error) {
    logger.error('MongoDB健康检查失败:', error);
  }

  try {
    // PostgreSQL健康检查
    const client = await pgPool.connect();
    await client.query('SELECT 1');
    client.release();
    status.postgresql = true;
  } catch (error) {
    logger.error('PostgreSQL健康检查失败:', error);
  }

  try {
    // Redis健康检查
    await redis.ping();
    status.redis = true;
  } catch (error) {
    logger.error('Redis健康检查失败:', error);
  }

  return status;
}; 