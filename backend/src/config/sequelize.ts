import { Sequelize } from 'sequelize';
import { logger } from '../utils/logger';

// 创建Sequelize实例
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'hainan_tourism',
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password',
  logging: (msg) => logger.debug(msg),
  pool: {
    max: 20,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
  },
});

// 测试数据库连接
export const testSequelizeConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('Sequelize数据库连接成功');
  } catch (error) {
    logger.error('Sequelize数据库连接失败:', error);
    throw error;
  }
};

// 同步数据库模型
export const syncDatabase = async (): Promise<void> => {
  try {
    // 导入所有模型以确保它们被注册
    await import('../models/Category');
    await import('../models/Product');
    await import('../models/Inventory');
    await import('../models/User');
    await import('../models/Role');
    await import('../models/Permission');
    await import('../models/PointHistory');
    await import('../models/Order');
    await import('../models/OrderItem');

    // 同步数据库结构
    await sequelize.sync({ alter: true });
    logger.info('数据库模型同步完成');
  } catch (error) {
    logger.error('数据库模型同步失败:', error);
    throw error;
  }
};

// 关闭数据库连接
export const closeSequelizeConnection = async (): Promise<void> => {
  try {
    await sequelize.close();
    logger.info('Sequelize数据库连接已关闭');
  } catch (error) {
    logger.error('关闭Sequelize连接时出错:', error);
  }
};

export default sequelize; 