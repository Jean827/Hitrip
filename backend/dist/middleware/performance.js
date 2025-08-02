"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceMonitorInstance = exports.cleanupPerformanceData = exports.getPerformanceStats = exports.cacheMonitor = exports.dbConnectionMonitor = exports.memoryMonitor = exports.asyncHandler = exports.searchLimiter = exports.authLimiter = exports.generalLimiter = exports.createRateLimiter = exports.compressionMiddleware = exports.performanceMonitor = void 0;
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
class PerformanceMonitor {
    constructor() {
        this.metrics = [];
        this.slowQueries = [];
        this.errorQueries = [];
    }
    static getInstance() {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }
    recordMetric(metric) {
        this.metrics.push(metric);
        if (metric.responseTime > 1000) {
            this.slowQueries.push(metric);
        }
        if (metric.statusCode >= 400) {
            this.errorQueries.push(metric);
        }
        if (this.metrics.length > 1000) {
            this.metrics = this.metrics.slice(-500);
        }
    }
    getStats() {
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
            errorRate: Math.round(errorRate * 100 * 100) / 100,
            slowQueryRate: Math.round(slowQueryRate * 100 * 100) / 100,
            slowQueries: this.slowQueries.length,
            errorQueries: this.errorQueries.length
        };
    }
    cleanup() {
        const oneHourAgo = Date.now() - 3600000;
        this.metrics = this.metrics.filter(m => m.timestamp > oneHourAgo);
        this.slowQueries = this.slowQueries.filter(m => m.timestamp > oneHourAgo);
        this.errorQueries = this.errorQueries.filter(m => m.timestamp > oneHourAgo);
    }
}
const performanceMonitor = (req, res, next) => {
    const start = Date.now();
    const monitor = PerformanceMonitor.getInstance();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const metric = {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            responseTime: duration,
            timestamp: Date.now(),
            userAgent: req.get('User-Agent'),
            ip: req.ip
        };
        monitor.recordMetric(metric);
        if (duration > 1000) {
            console.warn(`慢请求: ${req.method} ${req.url} - ${duration}ms`);
        }
    });
    next();
};
exports.performanceMonitor = performanceMonitor;
exports.compressionMiddleware = (0, compression_1.default)({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression_1.default.filter(req, res);
    }
});
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
    return (0, express_rate_limit_1.default)({
        windowMs,
        max,
        message: {
            success: false,
            message: '请求过于频繁，请稍后再试'
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            res.status(429).json({
                success: false,
                message: '请求过于频繁，请稍后再试',
                retryAfter: Math.ceil(windowMs / 1000)
            });
        }
    });
};
exports.createRateLimiter = createRateLimiter;
exports.generalLimiter = (0, exports.createRateLimiter)(15 * 60 * 1000, 100);
exports.authLimiter = (0, exports.createRateLimiter)(15 * 60 * 1000, 5);
exports.searchLimiter = (0, exports.createRateLimiter)(1 * 60 * 1000, 30);
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.asyncHandler = asyncHandler;
const memoryMonitor = (req, res, next) => {
    const memUsage = process.memoryUsage();
    const memoryUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    if (memoryUsagePercent > 80) {
        console.warn(`内存使用率过高: ${memoryUsagePercent.toFixed(2)}%`);
    }
    next();
};
exports.memoryMonitor = memoryMonitor;
const dbConnectionMonitor = (req, res, next) => {
    next();
};
exports.dbConnectionMonitor = dbConnectionMonitor;
const cacheMonitor = (req, res, next) => {
    next();
};
exports.cacheMonitor = cacheMonitor;
const getPerformanceStats = (req, res) => {
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
exports.getPerformanceStats = getPerformanceStats;
const cleanupPerformanceData = (req, res) => {
    const monitor = PerformanceMonitor.getInstance();
    monitor.cleanup();
    res.json({
        success: true,
        message: '性能数据清理完成'
    });
};
exports.cleanupPerformanceData = cleanupPerformanceData;
exports.performanceMonitorInstance = PerformanceMonitor.getInstance();
//# sourceMappingURL=performance.js.map