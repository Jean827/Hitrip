"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityConfig = exports.secureErrorHandler = exports.securityResponseHeaders = exports.loginRateLimit = exports.securityRateLimit = exports.securityLogger = exports.permissionCheck = exports.sessionSecurity = exports.fileUploadSecurity = exports.inputValidation = exports.corsOptions = exports.securityHeaders = void 0;
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const hpp_1 = __importDefault(require("hpp"));
const xss_clean_1 = __importDefault(require("xss-clean"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.securityHeaders = (0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            connectSrc: ["'self'", "https://api.example.com"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: []
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
});
exports.corsOptions = (0, cors_1.default)({
    origin: (origin, callback) => {
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5173',
            'https://hainan-tourism.com',
            'https://www.hainan-tourism.com'
        ];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('CORS policy violation'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
});
const inputValidation = (req, res, next) => {
    const sqlInjectionPattern = /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script|javascript|vbscript|onload|onerror|onclick)\b)/i;
    const xssPattern = /<script|javascript:|vbscript:|onload|onerror|onclick/i;
    const pathTraversalPattern = /\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e%5c/i;
    const checkInput = (input) => {
        if (sqlInjectionPattern.test(input)) {
            return false;
        }
        if (xssPattern.test(input)) {
            return false;
        }
        if (pathTraversalPattern.test(input)) {
            return false;
        }
        return true;
    };
    if (req.body) {
        const bodyStr = JSON.stringify(req.body);
        if (!checkInput(bodyStr)) {
            return res.status(400).json({
                success: false,
                message: '输入包含非法字符'
            });
        }
    }
    if (req.query) {
        const queryStr = JSON.stringify(req.query);
        if (!checkInput(queryStr)) {
            return res.status(400).json({
                success: false,
                message: '查询参数包含非法字符'
            });
        }
    }
    if (req.params) {
        const paramsStr = JSON.stringify(req.params);
        if (!checkInput(paramsStr)) {
            return res.status(400).json({
                success: false,
                message: 'URL参数包含非法字符'
            });
        }
    }
    next();
};
exports.inputValidation = inputValidation;
const fileUploadSecurity = (req, res, next) => {
    if (!req.files && !req.file) {
        return next();
    }
    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain'
    ];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.txt'];
    const maxFileSize = 5 * 1024 * 1024;
    const checkFile = (file) => {
        if (file.size > maxFileSize) {
            return false;
        }
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return false;
        }
        const extension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
        if (!allowedExtensions.includes(extension)) {
            return false;
        }
        const fileName = file.originalname.toLowerCase();
        if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
            return false;
        }
        return true;
    };
    if (req.files) {
        const files = Array.isArray(req.files) ? req.files : Object.values(req.files);
        for (const file of files) {
            if (!checkFile(file)) {
                return res.status(400).json({
                    success: false,
                    message: '文件类型或大小不符合要求'
                });
            }
        }
    }
    else if (req.file) {
        if (!checkFile(req.file)) {
            return res.status(400).json({
                success: false,
                message: '文件类型或大小不符合要求'
            });
        }
    }
    next();
};
exports.fileUploadSecurity = fileUploadSecurity;
const sessionSecurity = (req, res, next) => {
    res.cookie('sessionId', req.sessionID, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
    });
    if (req.session && req.session.cookie) {
        const sessionAge = Date.now() - req.session.cookie.expires;
        if (sessionAge > 24 * 60 * 60 * 1000) {
            req.session.destroy((err) => {
                if (err) {
                    console.error('会话销毁错误:', err);
                }
            });
            return res.status(401).json({
                success: false,
                message: '会话已过期，请重新登录'
            });
        }
    }
    next();
};
exports.sessionSecurity = sessionSecurity;
const permissionCheck = (requiredPermissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: '未授权访问'
            });
        }
        const userPermissions = req.user.permissions || [];
        const hasPermission = requiredPermissions.every(permission => userPermissions.includes(permission));
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: '权限不足'
            });
        }
        next();
    };
};
exports.permissionCheck = permissionCheck;
const securityLogger = (req, res, next) => {
    const securityEvents = {
        timestamp: new Date().toISOString(),
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        userId: req.user?.id || 'anonymous'
    };
    const suspiciousPatterns = [
        /union.*select/i,
        /<script/i,
        /javascript:/i,
        /\.\.\/\.\./i,
        /admin.*login/i
    ];
    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(req.url) || pattern.test(JSON.stringify(req.body)));
    if (isSuspicious) {
        console.warn('可疑活动检测:', securityEvents);
    }
    if (res.statusCode === 401 || res.statusCode === 403) {
        console.warn('认证失败:', securityEvents);
    }
    next();
};
exports.securityLogger = securityLogger;
exports.securityRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: '请求过于频繁，请稍后再试'
    },
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    keyGenerator: (req) => {
        return req.ip;
    }
});
exports.loginRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: '登录尝试过于频繁，请稍后再试'
    },
    skipSuccessfulRequests: true,
    skipFailedRequests: false,
    keyGenerator: (req) => {
        return req.ip;
    }
});
const securityResponseHeaders = (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
};
exports.securityResponseHeaders = securityResponseHeaders;
const secureErrorHandler = (err, req, res, next) => {
    const errorMessage = process.env.NODE_ENV === 'production'
        ? '服务器内部错误'
        : err.message;
    const errorResponse = {
        success: false,
        message: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    };
    res.status(err.status || 500).json(errorResponse);
};
exports.secureErrorHandler = secureErrorHandler;
exports.securityConfig = {
    helmet: exports.securityHeaders,
    cors: exports.corsOptions,
    hpp: (0, hpp_1.default)(),
    xss: (0, xss_clean_1.default)(),
    mongoSanitize: (0, express_mongo_sanitize_1.default)(),
    inputValidation: exports.inputValidation,
    fileUploadSecurity: exports.fileUploadSecurity,
    sessionSecurity: exports.sessionSecurity,
    securityLogger: exports.securityLogger,
    securityResponseHeaders: exports.securityResponseHeaders,
    secureErrorHandler: exports.secureErrorHandler
};
//# sourceMappingURL=security.js.map