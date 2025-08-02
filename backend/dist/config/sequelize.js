"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeSequelizeConnection = exports.syncDatabase = exports.testSequelizeConnection = void 0;
const sequelize_1 = require("sequelize");
const logger_1 = require("../utils/logger");
const sequelize = new sequelize_1.Sequelize({
    dialect: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'hainan_tourism',
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'password',
    logging: (msg) => logger_1.logger.debug(msg),
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
const testSequelizeConnection = async () => {
    try {
        await sequelize.authenticate();
        logger_1.logger.info('Sequelize数据库连接成功');
    }
    catch (error) {
        logger_1.logger.error('Sequelize数据库连接失败:', error);
        throw error;
    }
};
exports.testSequelizeConnection = testSequelizeConnection;
const syncDatabase = async () => {
    try {
        await Promise.resolve().then(() => __importStar(require('../models/Category')));
        await Promise.resolve().then(() => __importStar(require('../models/Product')));
        await Promise.resolve().then(() => __importStar(require('../models/Inventory')));
        await Promise.resolve().then(() => __importStar(require('../models/User')));
        await Promise.resolve().then(() => __importStar(require('../models/Role')));
        await Promise.resolve().then(() => __importStar(require('../models/Permission')));
        await Promise.resolve().then(() => __importStar(require('../models/PointHistory')));
        await Promise.resolve().then(() => __importStar(require('../models/Order')));
        await Promise.resolve().then(() => __importStar(require('../models/OrderItem')));
        await sequelize.sync({ alter: true });
        logger_1.logger.info('数据库模型同步完成');
    }
    catch (error) {
        logger_1.logger.error('数据库模型同步失败:', error);
        throw error;
    }
};
exports.syncDatabase = syncDatabase;
const closeSequelizeConnection = async () => {
    try {
        await sequelize.close();
        logger_1.logger.info('Sequelize数据库连接已关闭');
    }
    catch (error) {
        logger_1.logger.error('关闭Sequelize连接时出错:', error);
    }
};
exports.closeSequelizeConnection = closeSequelizeConnection;
exports.default = sequelize;
//# sourceMappingURL=sequelize.js.map