import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';

// 安全头配置
export const securityHeaders = helmet({
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

// CORS配置
export const corsOptions = cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://hainan-tourism.com',
      'https://www.hainan-tourism.com'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
});

// 输入验证中间件
export const inputValidation = (req: Request, res: Response, next: NextFunction): void => {
  // SQL注入防护
  const sqlInjectionPattern = /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script|javascript|vbscript|onload|onerror|onclick)\b)/i;
  
  // XSS防护
  const xssPattern = /<script|javascript:|vbscript:|onload|onerror|onclick/i;
  
  // 路径遍历防护
  const pathTraversalPattern = /\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e%5c/i;
  
  const checkInput = (input: string): boolean => {
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

  // 检查请求体
  if (req.body) {
    const bodyStr = JSON.stringify(req.body);
    if (!checkInput(bodyStr)) {
      return res.status(400).json({
        success: false,
        message: '输入包含非法字符'
      });
    }
  }

  // 检查查询参数
  if (req.query) {
    const queryStr = JSON.stringify(req.query);
    if (!checkInput(queryStr)) {
      return res.status(400).json({
        success: false,
        message: '查询参数包含非法字符'
      });
    }
  }

  // 检查URL参数
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

// 文件上传安全检查
export const fileUploadSecurity = (req: Request, res: Response, next: NextFunction): void => {
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
  const maxFileSize = 5 * 1024 * 1024; // 5MB

  const checkFile = (file: any): boolean => {
    // 检查文件大小
    if (file.size > maxFileSize) {
      return false;
    }

    // 检查MIME类型
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return false;
    }

    // 检查文件扩展名
    const extension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    if (!allowedExtensions.includes(extension)) {
      return false;
    }

    // 检查文件名
    const fileName = file.originalname.toLowerCase();
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      return false;
    }

    return true;
  };

  if (req.files) {
    // 多文件上传
    const files = Array.isArray(req.files) ? req.files : Object.values(req.files);
    for (const file of files) {
      if (!checkFile(file)) {
        return res.status(400).json({
          success: false,
          message: '文件类型或大小不符合要求'
        });
      }
    }
  } else if (req.file) {
    // 单文件上传
    if (!checkFile(req.file)) {
      return res.status(400).json({
        success: false,
        message: '文件类型或大小不符合要求'
      });
    }
  }

  next();
};

// 会话安全中间件
export const sessionSecurity = (req: Request, res: Response, next: NextFunction): void => {
  // 设置安全cookie
  res.cookie('sessionId', req.sessionID, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24小时
  });

  // 检查会话超时
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

// 权限检查中间件
export const permissionCheck = (requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '未授权访问'
      });
    }

    const userPermissions = req.user.permissions || [];
    const hasPermission = requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: '权限不足'
      });
    }

    next();
  };
};

// 安全日志中间件
export const securityLogger = (req: Request, res: Response, next: NextFunction): void => {
  const securityEvents = {
    timestamp: new Date().toISOString(),
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    userId: req.user?.id || 'anonymous'
  };

  // 记录可疑活动
  const suspiciousPatterns = [
    /union.*select/i,
    /<script/i,
    /javascript:/i,
    /\.\.\/\.\./i,
    /admin.*login/i
  ];

  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(req.url) || pattern.test(JSON.stringify(req.body))
  );

  if (isSuspicious) {
    console.warn('可疑活动检测:', securityEvents);
  }

  // 记录认证失败
  if (res.statusCode === 401 || res.statusCode === 403) {
    console.warn('认证失败:', securityEvents);
  }

  next();
};

// 安全限流器
export const securityRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100个请求
  message: {
    success: false,
    message: '请求过于频繁，请稍后再试'
  },
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  keyGenerator: (req) => {
    return req.ip; // 基于IP限流
  }
});

// 登录限流器
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 限制每个IP 15分钟内最多5次登录尝试
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

// 安全响应头
export const securityResponseHeaders = (req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

// 错误信息安全处理
export const secureErrorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  // 不暴露敏感信息
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

// 安全配置导出
export const securityConfig = {
  helmet: securityHeaders,
  cors: corsOptions,
  hpp: hpp(),
  xss: xss(),
  mongoSanitize: mongoSanitize(),
  inputValidation,
  fileUploadSecurity,
  sessionSecurity,
  securityLogger,
  securityResponseHeaders,
  secureErrorHandler
}; 