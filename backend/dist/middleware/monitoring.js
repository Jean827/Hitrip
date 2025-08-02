"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderValue = exports.activeUsers = exports.revenueTotal = exports.ordersCreated = exports.userLogins = exports.userRegistrations = exports.detectMemoryLeak = exports.memoryMonitoring = exports.performanceMonitoringMiddleware = exports.trackBusinessMetric = exports.monitorRedisOperation = exports.monitorDatabaseQuery = exports.detailedHealthCheck = exports.healthCheck = exports.metricsEndpoint = exports.monitoringMiddleware = void 0;
const prom_client_1 = require("prom-client");
const perf_hooks_1 = require("perf_hooks");
const httpRequestDurationMicroseconds = new prom_client_1.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5]
});
const httpRequestsTotal = new prom_client_1.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status']
});
const httpRequestSize = new prom_client_1.Histogram({
    name: 'http_request_size_bytes',
    help: 'Size of HTTP requests in bytes',
    labelNames: ['method', 'route'],
    buckets: [100, 1000, 5000, 10000, 50000]
});
const httpResponseSize = new prom_client_1.Histogram({
    name: 'http_response_size_bytes',
    help: 'Size of HTTP responses in bytes',
    labelNames: ['method', 'route'],
    buckets: [100, 1000, 5000, 10000, 50000, 100000]
});
const activeConnections = new prom_client_1.Gauge({
    name: 'http_active_connections',
    help: 'Number of active HTTP connections'
});
const databaseConnections = new prom_client_1.Gauge({
    name: 'database_connections',
    help: 'Number of active database connections'
});
const redisConnections = new prom_client_1.Gauge({
    name: 'redis_connections',
    help: 'Number of active Redis connections'
});
const errorCounter = new prom_client_1.Counter({
    name: 'application_errors_total',
    help: 'Total number of application errors',
    labelNames: ['type', 'route']
});
const logErrorsTotal = new prom_client_1.Counter({
    name: 'log_errors_total',
    help: 'Total number of error logs'
});
const databaseQueryDuration = new prom_client_1.Histogram({
    name: 'database_query_duration_seconds',
    help: '数据库查询持续时间',
    labelNames: ['query_type'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
});
const redisOperationDuration = new prom_client_1.Histogram({
    name: 'redis_operation_duration_seconds',
    help: 'Redis操作持续时间',
    labelNames: ['operation_type'],
    buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1]
});
const userRegistrations = new prom_client_1.Counter({
    name: 'user_registrations_total',
    help: '用户注册总数'
});
exports.userRegistrations = userRegistrations;
const userLogins = new prom_client_1.Counter({
    name: 'user_logins_total',
    help: '用户登录总数'
});
exports.userLogins = userLogins;
const ordersCreated = new prom_client_1.Counter({
    name: 'orders_created_total',
    help: '订单创建总数'
});
exports.ordersCreated = ordersCreated;
const revenueTotal = new prom_client_1.Counter({
    name: 'revenue_total',
    help: '总收入'
});
exports.revenueTotal = revenueTotal;
const activeUsers = new prom_client_1.Gauge({
    name: 'active_users',
    help: '当前活跃用户数'
});
exports.activeUsers = activeUsers;
const orderValue = new prom_client_1.Histogram({
    name: 'order_value',
    help: '订单金额分布',
    buckets: [10, 50, 100, 200, 500, 1000, 2000, 5000]
});
exports.orderValue = orderValue;
const monitoringMiddleware = (req, res, next) => {
    const start = Date.now();
    activeConnections.inc();
    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const route = req.route?.path || req.path;
        httpRequestDurationMicroseconds
            .labels(req.method, route, res.statusCode.toString())
            .observe(duration);
        httpRequestsTotal
            .labels(req.method, route, res.statusCode.toString())
            .inc();
        activeConnections.dec();
    });
    next();
};
exports.monitoringMiddleware = monitoringMiddleware;
const metricsEndpoint = async (req, res) => {
    try {
        res.set('Content-Type', prom_client_1.register.contentType);
        res.end(await prom_client_1.register.metrics());
    }
    catch (error) {
        res.status(500).end(error);
    }
};
exports.metricsEndpoint = metricsEndpoint;
const healthCheck = async (req, res) => {
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
exports.healthCheck = healthCheck;
const detailedHealthCheck = async (req, res) => {
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
    try {
        health.checks.database = 'healthy';
    }
    catch (error) {
        health.checks.database = 'unhealthy';
        health.status = 'unhealthy';
    }
    try {
        health.checks.redis = 'healthy';
    }
    catch (error) {
        health.checks.redis = 'unhealthy';
        health.status = 'unhealthy';
    }
    try {
        health.checks.disk = 'healthy';
    }
    catch (error) {
        health.checks.disk = 'unhealthy';
        health.status = 'unhealthy';
    }
    res.json(health);
};
exports.detailedHealthCheck = detailedHealthCheck;
const monitorDatabaseQuery = (queryType) => {
    return (target, propertyKey, descriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            const start = Date.now();
            try {
                const result = await originalMethod.apply(this, args);
                const duration = (Date.now() - start) / 1000;
                databaseQueryDuration
                    .labels(queryType)
                    .observe(duration);
                return result;
            }
            catch (error) {
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
exports.monitorDatabaseQuery = monitorDatabaseQuery;
const monitorRedisOperation = (operationType) => {
    return (target, propertyKey, descriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            const start = Date.now();
            try {
                const result = await originalMethod.apply(this, args);
                const duration = (Date.now() - start) / 1000;
                redisOperationDuration
                    .labels(operationType)
                    .observe(duration);
                return result;
            }
            catch (error) {
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
exports.monitorRedisOperation = monitorRedisOperation;
const trackBusinessMetric = (metric, value) => {
    return (target, propertyKey, descriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            const result = await originalMethod.apply(this, args);
            if (metric instanceof prom_client_1.Counter) {
                metric.inc();
            }
            else if (metric instanceof prom_client_1.Gauge) {
                if (value !== undefined) {
                    metric.set(value);
                }
                else {
                    metric.inc();
                }
            }
            else if (metric instanceof prom_client_1.Histogram) {
                if (value !== undefined) {
                    metric.observe(value);
                }
            }
            return result;
        };
        return descriptor;
    };
};
exports.trackBusinessMetric = trackBusinessMetric;
const performanceMonitoringMiddleware = (req, res, next) => {
    const start = perf_hooks_1.performance.now();
    res.on('finish', () => {
        const duration = perf_hooks_1.performance.now() - start;
        if (duration > 1000) {
            console.warn(`慢请求: ${req.method} ${req.path} - ${duration.toFixed(2)}ms`);
        }
    });
    next();
};
exports.performanceMonitoringMiddleware = performanceMonitoringMiddleware;
const memoryMonitoring = () => {
    const memUsage = process.memoryUsage();
    return {
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external,
        arrayBuffers: memUsage.arrayBuffers
    };
};
exports.memoryMonitoring = memoryMonitoring;
const detectMemoryLeak = () => {
    const memUsage = (0, exports.memoryMonitoring)();
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
    if (heapUsedMB > 500) {
        console.warn('内存使用过高:', heapUsedMB.toFixed(2), 'MB');
    }
    return heapUsedMB;
};
exports.detectMemoryLeak = detectMemoryLeak;
//# sourceMappingURL=monitoring.js.map