"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const monitoring_1 = require("../middleware/monitoring");
const router = (0, express_1.Router)();
router.use(monitoring_1.monitoringMiddleware);
router.get('/metrics', monitoring_1.metricsEndpoint);
router.get('/health', monitoring_1.healthCheck);
router.get('/health/detailed', monitoring_1.detailedHealthCheck);
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
router.post('/alerts', (req, res) => {
    const { alerts } = req.body;
    console.log('收到告警:', alerts);
    res.json({ status: 'received' });
});
router.get('/logs', (req, res) => {
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
exports.default = router;
//# sourceMappingURL=monitoring.js.map