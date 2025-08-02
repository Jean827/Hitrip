"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = exports.initializeDatabases = exports.closeConnections = exports.testRedis = exports.redis = exports.testPostgreSQL = exports.pgPool = exports.connectMongoDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const pg_1 = require("pg");
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = require("../utils/logger");
const connectMongoDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hainan-tourism';
        await mongoose_1.default.connect(mongoUri, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        logger_1.logger.info('MongoDB连接成功');
        mongoose_1.default.connection.on('error', (error) => {
            logger_1.logger.error('MongoDB连接错误:', error);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            logger_1.logger.warn('MongoDB连接断开');
        });
        mongoose_1.default.connection.on('reconnected', () => {
            logger_1.logger.info('MongoDB重新连接成功');
        });
    }
    catch (error) {
        logger_1.logger.error('MongoDB连接失败:', error);
        process.exit(1);
    }
};
exports.connectMongoDB = connectMongoDB;
exports.pgPool = new pg_1.Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'hainan_tourism',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'password',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
const testPostgreSQL = async () => {
    try {
        const client = await exports.pgPool.connect();
        await client.query('SELECT NOW()');
        client.release();
        logger_1.logger.info('PostgreSQL连接成功');
    }
    catch (error) {
        logger_1.logger.error('PostgreSQL连接失败:', error);
    }
};
exports.testPostgreSQL = testPostgreSQL;
exports.redis = new ioredis_1.default({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
});
const testRedis = async () => {
    try {
        await exports.redis.ping();
        logger_1.logger.info('Redis连接成功');
    }
    catch (error) {
        logger_1.logger.error('Redis连接失败:', error);
    }
};
exports.testRedis = testRedis;
const closeConnections = async () => {
    try {
        await mongoose_1.default.connection.close();
        await exports.pgPool.end();
        await exports.redis.quit();
        logger_1.logger.info('所有数据库连接已关闭');
    }
    catch (error) {
        logger_1.logger.error('关闭数据库连接时出错:', error);
    }
};
exports.closeConnections = closeConnections;
const initializeDatabases = async () => {
    await (0, exports.connectMongoDB)();
    await (0, exports.testPostgreSQL)();
    await (0, exports.testRedis)();
};
exports.initializeDatabases = initializeDatabases;
const healthCheck = async () => {
    const status = {
        mongodb: false,
        postgresql: false,
        redis: false
    };
    try {
        if (mongoose_1.default.connection.readyState === 1) {
            status.mongodb = true;
        }
    }
    catch (error) {
        logger_1.logger.error('MongoDB健康检查失败:', error);
    }
    try {
        const client = await exports.pgPool.connect();
        await client.query('SELECT 1');
        client.release();
        status.postgresql = true;
    }
    catch (error) {
        logger_1.logger.error('PostgreSQL健康检查失败:', error);
    }
    try {
        await exports.redis.ping();
        status.redis = true;
    }
    catch (error) {
        logger_1.logger.error('Redis健康检查失败:', error);
    }
    return status;
};
exports.healthCheck = healthCheck;
//# sourceMappingURL=database.js.map