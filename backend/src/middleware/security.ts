import { Request, Response, NextFunction } from 'express';
import securityScanner from '../utils/securityScanner';
import logger from '../utils/logger';

/**
 * 安全中间件
 * 提供全面的安全防护功能
 */
export const securityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || '';
  const timestamp = new Date().toISOString();

  // 记录请求信息
  logger.info('Security check', {
    ip: clientIP,
    method: req.method,
    url: req.url,
    userAgent,
    timestamp
  });

  // 1. 检查请求大小
  if (!securityScanner.checkRequestSize(req)) {
    logger.warn('Request too large', { ip: clientIP, url: req.url });
    return res.status(413).json({
      error: 'Request too large',
      message: '请求数据过大',
      code: 'REQUEST_TOO_LARGE'
    });
  }

  // 2. 检查速率限制
  if (!securityScanner.checkRateLimit(clientIP)) {
    logger.warn('Rate limit exceeded', { ip: clientIP, url: req.url });
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: '请求过于频繁，请稍后再试',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }

  // 3. 检查CSRF攻击
  if (req.method !== 'GET' && !securityScanner.checkCSRF(req)) {
    logger.warn('CSRF attack detected', { ip: clientIP, url: req.url });
    return res.status(403).json({
      error: 'CSRF protection',
      message: '跨站请求伪造保护',
      code: 'CSRF_PROTECTION'
    });
  }

  // 4. 检查请求体中的恶意内容
  if (req.body) {
    const bodyString = JSON.stringify(req.body);
    if (securityScanner.checkSqlInjection(bodyString)) {
      logger.warn('SQL injection detected in body', { ip: clientIP, url: req.url });
      return res.status(400).json({
        error: 'SQL injection detected',
        message: '检测到SQL注入攻击',
        code: 'SQL_INJECTION_DETECTED'
      });
    }
    if (securityScanner.checkXSS(bodyString)) {
      logger.warn('XSS attack detected in body', { ip: clientIP, url: req.url });
      return res.status(400).json({
        error: 'XSS attack detected',
        message: '检测到XSS攻击',
        code: 'XSS_ATTACK_DETECTED'
      });
    }
  }

  // 5. 检查查询参数
  if (req.query) {
    const queryString = JSON.stringify(req.query);
    if (securityScanner.checkSqlInjection(queryString)) {
      logger.warn('SQL injection detected in query', { ip: clientIP, url: req.url });
      return res.status(400).json({
        error: 'SQL injection detected',
        message: '检测到SQL注入攻击',
        code: 'SQL_INJECTION_DETECTED'
      });
    }
    if (securityScanner.checkXSS(queryString)) {
      logger.warn('XSS attack detected in query', { ip: clientIP, url: req.url });
      return res.status(400).json({
        error: 'XSS attack detected',
        message: '检测到XSS攻击',
        code: 'XSS_ATTACK_DETECTED'
      });
    }
  }

  // 6. 检查路径参数
  if (req.params) {
    const paramsString = JSON.stringify(req.params);
    if (securityScanner.checkSqlInjection(paramsString)) {
      logger.warn('SQL injection detected in params', { ip: clientIP, url: req.url });
      return res.status(400).json({
        error: 'SQL injection detected',
        message: '检测到SQL注入攻击',
        code: 'SQL_INJECTION_DETECTED'
      });
    }
    if (securityScanner.checkXSS(paramsString)) {
      logger.warn('XSS attack detected in params', { ip: clientIP, url: req.url });
      return res.status(400).json({
        error: 'XSS attack detected',
        message: '检测到XSS攻击',
        code: 'XSS_ATTACK_DETECTED'
      });
    }
  }

  // 7. 检查恶意User-Agent
  const maliciousPatterns = [
    /sqlmap/i,
    /nmap/i,
    /nikto/i,
    /dirbuster/i,
    /burpsuite/i,
    /w3af/i,
    /acunetix/i,
    /nessus/i,
    /openvas/i
  ];

  if (maliciousPatterns.some(pattern => pattern.test(userAgent))) {
    logger.warn('Malicious User-Agent detected', { ip: clientIP, userAgent });
    return res.status(403).json({
      error: 'Access denied',
      message: '访问被拒绝',
      code: 'ACCESS_DENIED'
    });
  }

  // 8. 添加安全头
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  });

  next();
};

/**
 * 认证中间件
 * 验证用户身份和权限
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      error: 'Authentication required',
      message: '需要身份验证',
      code: 'AUTHENTICATION_REQUIRED'
    });
  }

  try {
    // 这里应该验证JWT token
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // req.user = decoded;
    next();
  } catch (error) {
    logger.warn('Invalid token', { token: token.substring(0, 10) + '...' });
    return res.status(401).json({
      error: 'Invalid token',
      message: '无效的身份验证令牌',
      code: 'INVALID_TOKEN'
    });
  }
};

/**
 * 权限中间件
 * 检查用户权限
 */
export const permissionMiddleware = (requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // 这里应该检查用户权限
    // const userPermissions = req.user?.permissions || [];
    // const hasPermission = requiredPermissions.every(permission => 
    //   userPermissions.includes(permission)
    // );

    // if (!hasPermission) {
    //   return res.status(403).json({
    //     error: 'Insufficient permissions',
    //     message: '权限不足',
    //     code: 'INSUFFICIENT_PERMISSIONS'
    //   });
    // }

    next();
  };
};

/**
 * 输入验证中间件
 * 清理和验证输入数据
 */
export const inputValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // 清理请求体
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = securityScanner.sanitizeInput(req.body[key]);
      }
    });
  }

  // 清理查询参数
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = securityScanner.sanitizeInput(req.query[key] as string);
      }
    });
  }

  // 清理路径参数
  if (req.params) {
    Object.keys(req.params).forEach(key => {
      if (typeof req.params[key] === 'string') {
        req.params[key] = securityScanner.sanitizeInput(req.params[key]);
      }
    });
  }

  next();
};

/**
 * 日志中间件
 * 记录安全相关事件
 */
export const securityLogMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';

    logger.info('Request completed', {
      ip: clientIP,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent')
    });

    // 记录安全事件
    if (res.statusCode >= 400) {
      securityScanner.logSecurityEvent('request_error', {
        ip: clientIP,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        userAgent: req.get('User-Agent')
      });
    }
  });

  next();
};

export default {
  securityMiddleware,
  authMiddleware,
  permissionMiddleware,
  inputValidationMiddleware,
  securityLogMiddleware
}; 