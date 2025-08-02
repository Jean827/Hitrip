"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const securityScanner_1 = require("../utils/securityScanner");
const router = (0, express_1.Router)();
router.get('/scan', async (req, res) => {
    try {
        const securityCheck = securityScanner_1.securityScanner.performSecurityCheck(req);
        const securityReport = securityScanner_1.securityScanner.generateSecurityReport();
        res.json({
            success: true,
            data: {
                securityCheck,
                securityReport,
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '安全扫描失败',
            error: error instanceof Error ? error.message : '未知错误'
        });
    }
});
router.get('/events', async (req, res) => {
    try {
        const events = securityScanner_1.securityScanner.getSecurityEvents();
        res.json({
            success: true,
            data: {
                events,
                total: events.length,
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '获取安全事件失败',
            error: error instanceof Error ? error.message : '未知错误'
        });
    }
});
router.delete('/events', async (req, res) => {
    try {
        securityScanner_1.securityScanner.clearSecurityEvents();
        res.json({
            success: true,
            message: '安全事件清理完成'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '清理安全事件失败',
            error: error instanceof Error ? error.message : '未知错误'
        });
    }
});
router.get('/blocked-ips', async (req, res) => {
    try {
        const blockedIPs = securityScanner_1.securityScanner.getBlockedIPs();
        res.json({
            success: true,
            data: {
                blockedIPs,
                total: blockedIPs.length,
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '获取被阻止IP列表失败',
            error: error instanceof Error ? error.message : '未知错误'
        });
    }
});
router.post('/block-ip', async (req, res) => {
    try {
        const { ip } = req.body;
        if (!ip) {
            return res.status(400).json({
                success: false,
                message: 'IP地址不能为空'
            });
        }
        securityScanner_1.securityScanner.blockIP(ip);
        res.json({
            success: true,
            message: `IP ${ip} 已被阻止`
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '阻止IP失败',
            error: error instanceof Error ? error.message : '未知错误'
        });
    }
});
router.post('/unblock-ip', async (req, res) => {
    try {
        const { ip } = req.body;
        if (!ip) {
            return res.status(400).json({
                success: false,
                message: 'IP地址不能为空'
            });
        }
        securityScanner_1.securityScanner.unblockIP(ip);
        res.json({
            success: true,
            message: `IP ${ip} 已被解除阻止`
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '解除IP阻止失败',
            error: error instanceof Error ? error.message : '未知错误'
        });
    }
});
router.post('/check-password', async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({
                success: false,
                message: '密码不能为空'
            });
        }
        const result = securityScanner_1.securityScanner.checkPasswordStrength(password);
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '密码强度检查失败',
            error: error instanceof Error ? error.message : '未知错误'
        });
    }
});
router.post('/generate-token', async (req, res) => {
    try {
        const token = securityScanner_1.securityScanner.generateSecureToken();
        const csrfToken = securityScanner_1.securityScanner.generateCSRFToken();
        res.json({
            success: true,
            data: {
                token,
                csrfToken,
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '生成安全令牌失败',
            error: error instanceof Error ? error.message : '未知错误'
        });
    }
});
router.post('/hash-password', async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({
                success: false,
                message: '密码不能为空'
            });
        }
        const hash = await securityScanner_1.securityScanner.hashPassword(password);
        res.json({
            success: true,
            data: {
                hash,
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '密码哈希失败',
            error: error instanceof Error ? error.message : '未知错误'
        });
    }
});
router.post('/verify-password', async (req, res) => {
    try {
        const { password, hash } = req.body;
        if (!password || !hash) {
            return res.status(400).json({
                success: false,
                message: '密码和哈希值不能为空'
            });
        }
        const isValid = await securityScanner_1.securityScanner.verifyPassword(password, hash);
        res.json({
            success: true,
            data: {
                isValid,
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '密码验证失败',
            error: error instanceof Error ? error.message : '未知错误'
        });
    }
});
router.post('/sanitize-input', async (req, res) => {
    try {
        const { input } = req.body;
        if (!input) {
            return res.status(400).json({
                success: false,
                message: '输入不能为空'
            });
        }
        const sanitized = securityScanner_1.securityScanner.sanitizeInput(input);
        res.json({
            success: true,
            data: {
                original: input,
                sanitized,
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '输入清理失败',
            error: error instanceof Error ? error.message : '未知错误'
        });
    }
});
router.get('/config', async (req, res) => {
    try {
        const config = {
            securityHeaders: {
                contentSecurityPolicy: true,
                hsts: true,
                noSniff: true,
                referrerPolicy: true
            },
            cors: {
                allowedOrigins: [
                    'http://localhost:3000',
                    'http://localhost:5173',
                    'https://hainan-tourism.com'
                ],
                credentials: true
            },
            rateLimit: {
                windowMs: 15 * 60 * 1000,
                max: 100
            },
            fileUpload: {
                maxSize: 5 * 1024 * 1024,
                allowedTypes: [
                    'image/jpeg',
                    'image/png',
                    'image/gif',
                    'image/webp',
                    'application/pdf',
                    'text/plain'
                ]
            }
        };
        res.json({
            success: true,
            data: {
                config,
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '获取安全配置失败',
            error: error instanceof Error ? error.message : '未知错误'
        });
    }
});
router.get('/health', async (req, res) => {
    try {
        const healthCheck = {
            securityScanner: true,
            securityMiddleware: true,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            securityEvents: securityScanner_1.securityScanner.getSecurityEvents().length,
            blockedIPs: securityScanner_1.securityScanner.getBlockedIPs().length
        };
        res.json({
            success: true,
            data: healthCheck
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '安全健康检查失败',
            error: error instanceof Error ? error.message : '未知错误'
        });
    }
});
exports.default = router;
//# sourceMappingURL=security.js.map