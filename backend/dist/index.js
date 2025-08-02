"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
dotenv_1.default.config();
const database_1 = require("./config/database");
const sequelize_1 = require("./config/sequelize");
const seedData_1 = require("./utils/seedData");
const auth_1 = __importDefault(require("./routes/auth"));
const user_1 = __importDefault(require("./routes/user"));
const admin_1 = __importDefault(require("./routes/admin"));
const role_1 = __importDefault(require("./routes/role"));
const permission_1 = __importDefault(require("./routes/permission"));
const points_1 = __importDefault(require("./routes/points"));
const products_1 = __importDefault(require("./routes/products"));
const categories_1 = __importDefault(require("./routes/categories"));
const orders_1 = __importDefault(require("./routes/orders"));
const payments_1 = __importDefault(require("./routes/payments"));
const cart_1 = __importDefault(require("./routes/cart"));
const merchants_1 = __importDefault(require("./routes/merchants"));
const recommendations_1 = __importDefault(require("./routes/recommendations"));
const userProfiles_1 = __importDefault(require("./routes/userProfiles"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const analyticsEnhanced_1 = __importDefault(require("./routes/analyticsEnhanced"));
const marketing_1 = __importDefault(require("./routes/marketing"));
const customerService_1 = __importDefault(require("./routes/customerService"));
const monitoring_1 = __importDefault(require("./routes/monitoring"));
const search_1 = __importDefault(require("./routes/search"));
const errorHandler_1 = require("./middleware/errorHandler");
const auth_2 = require("./middleware/auth");
const logger_1 = require("./utils/logger");
const monitoring_2 = require("./middleware/monitoring");
const app = (0, express_1.default)();
exports.app = app;
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});
exports.io = io;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, morgan_1.default)('combined', {
    stream: {
        write: (message) => logger_1.logger.info(message.trim())
    }
}));
app.use(monitoring_2.performanceMonitor);
app.use(monitoring_2.businessMetricsMonitor);
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: '请求过于频繁，请稍后再试'
});
app.use('/api/', limiter);
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
app.use('/api/auth', auth_1.default);
app.use('/api/user', auth_2.authMiddleware, user_1.default);
app.use('/api/admin', auth_2.authMiddleware, admin_1.default);
app.use('/api/role', role_1.default);
app.use('/api/permission', permission_1.default);
app.use('/api/points', points_1.default);
app.use('/api/products', products_1.default);
app.use('/api/categories', categories_1.default);
app.use('/api/orders', orders_1.default);
app.use('/api/payments', payments_1.default);
app.use('/api/cart', cart_1.default);
app.use('/api/merchants', merchants_1.default);
app.use('/api/recommendations', recommendations_1.default);
app.use('/api/user-profiles', userProfiles_1.default);
app.use('/api/analytics', analytics_1.default);
app.use('/api/analytics-enhanced', analyticsEnhanced_1.default);
app.use('/api/marketing', marketing_1.default);
app.use('/api/customer-service', customerService_1.default);
app.use('/api/monitoring', monitoring_1.default);
app.use('/api/search', search_1.default);
const swaggerSpec = (0, swagger_jsdoc_1.default)({
    definition: {
        openapi: '3.0.0',
        info: { title: '海南文旅API', version: '1.0.0' },
    },
    apis: ['./src/routes/*.ts', './src/models/*.ts'],
});
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
app.use('*', (req, res) => {
    res.status(404).json({ message: '接口不存在' });
});
app.use(monitoring_2.errorMonitor);
app.use(errorHandler_1.errorHandler);
io.on('connection', (socket) => {
    logger_1.logger.info(`用户连接: ${socket.id}`);
    socket.on('disconnect', () => {
        logger_1.logger.info(`用户断开连接: ${socket.id}`);
    });
});
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        await (0, database_1.initializeDatabases)();
        await (0, sequelize_1.testSequelizeConnection)();
        await (0, sequelize_1.syncDatabase)();
        await (0, seedData_1.seedAllData)();
        server.listen(PORT, () => {
            logger_1.logger.info(`服务器运行在端口 ${PORT}`);
            logger_1.logger.info(`环境: ${process.env.NODE_ENV || 'development'}`);
        });
    }
    catch (error) {
        logger_1.logger.error('服务器启动失败:', error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=index.js.map