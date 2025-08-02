import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

interface SecurityConfig {
  maxRequestSize: number;
  allowedOrigins: string[];
  rateLimitWindow: number;
  rateLimitMax: number;
  sqlInjectionPatterns: RegExp[];
  xssPatterns: RegExp[];
  csrfEnabled: boolean;
}

class SecurityScanner {
  private config: SecurityConfig;
  private requestCounts: Map<string, { count: number; resetTime: number }>;

  constructor() {
    this.config = {
      maxRequestSize: 10 * 1024 * 1024, // 10MB
      allowedOrigins: ['http://localhost:3000', 'https://yourdomain.com'],
      rateLimitWindow: 15 * 60 * 1000, // 15 minutes
      rateLimitMax: 100, // 100 requests per window
      sqlInjectionPatterns: [
        /(\b(union|select|insert|update|delete|drop|create|alter)\b)/i,
        /(\b(or|and)\b\s+\d+\s*=\s*\d+)/i,
        /(\b(union|select|insert|update|delete|drop|create|alter)\b.*\b(union|select|insert|update|delete|drop|create|alter)\b)/i,
        /(\b(union|select|insert|update|delete|drop|create|alter)\b.*\b(from|into|where|set)\b)/i,
      ],
      xssPatterns: [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
        /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
      ],
      csrfEnabled: true,
    };
    this.requestCounts = new Map();
  }

  /**
   * 检查SQL注入攻击
   */
  public checkSqlInjection(input: string): boolean {
    return this.config.sqlInjectionPatterns.some(pattern => pattern.test(input));
  }

  /**
   * 检查XSS攻击
   */
  public checkXSS(input: string): boolean {
    return this.config.xssPatterns.some(pattern => pattern.test(input));
  }

  /**
   * 检查CSRF攻击
   */
  public checkCSRF(req: Request): boolean {
    if (!this.config.csrfEnabled) return true;

    const origin = req.get('Origin');
    const referer = req.get('Referer');

    // 检查Origin头
    if (origin && !this.config.allowedOrigins.includes(origin)) {
      return false;
    }

    // 检查Referer头
    if (referer) {
      const refererUrl = new URL(referer);
      if (!this.config.allowedOrigins.includes(refererUrl.origin)) {
        return false;
      }
    }

    return true;
  }

  /**
   * 检查请求大小
   */
  public checkRequestSize(req: Request): boolean {
    const contentLength = parseInt(req.get('Content-Length') || '0');
    return contentLength <= this.config.maxRequestSize;
  }

  /**
   * 检查速率限制
   */
  public checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const record = this.requestCounts.get(ip);

    if (!record || now > record.resetTime) {
      this.requestCounts.set(ip, { count: 1, resetTime: now + this.config.rateLimitWindow });
      return true;
    }

    if (record.count >= this.config.rateLimitMax) {
      return false;
    }

    record.count++;
    return true;
  }

  /**
   * 生成CSRF令牌
   */
  public generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * 验证CSRF令牌
   */
  public verifyCSRFToken(token: string, sessionToken: string): boolean {
    return token === sessionToken;
  }

  /**
   * 清理敏感数据
   */
  public sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // 移除尖括号
      .replace(/javascript:/gi, '') // 移除javascript协议
      .replace(/on\w+\s*=/gi, '') // 移除事件处理器
      .trim();
  }

  /**
   * 加密敏感数据
   */
  public encryptData(data: string, key: string): string {
    const cipher = crypto.createCipher('aes-256-cbc', key);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  /**
   * 解密数据
   */
  public decryptData(encryptedData: string, key: string): string {
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * 生成安全的随机字符串
   */
  public generateSecureRandom(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * 哈希密码
   */
  public hashPassword(password: string, salt?: string): { hash: string; salt: string } {
    const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, generatedSalt, 10000, 64, 'sha512').toString('hex');
    return { hash, salt: generatedSalt };
  }

  /**
   * 验证密码
   */
  public verifyPassword(password: string, hash: string, salt: string): boolean {
    const { hash: computedHash } = this.hashPassword(password, salt);
    return computedHash === hash;
  }

  /**
   * 安全检查中间件
   */
  public securityMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';

      // 检查请求大小
      if (!this.checkRequestSize(req)) {
        return res.status(413).json({
          error: 'Request too large',
          message: '请求数据过大'
        });
      }

      // 检查速率限制
      if (!this.checkRateLimit(clientIP)) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: '请求过于频繁，请稍后再试'
        });
      }

      // 检查CSRF
      if (req.method !== 'GET' && !this.checkCSRF(req)) {
        return res.status(403).json({
          error: 'CSRF protection',
          message: '跨站请求伪造保护'
        });
      }

      // 检查请求体中的恶意内容
      if (req.body) {
        const bodyString = JSON.stringify(req.body);
        if (this.checkSqlInjection(bodyString)) {
          return res.status(400).json({
            error: 'SQL injection detected',
            message: '检测到SQL注入攻击'
          });
        }
        if (this.checkXSS(bodyString)) {
          return res.status(400).json({
            error: 'XSS attack detected',
            message: '检测到XSS攻击'
          });
        }
      }

      // 检查查询参数
      if (req.query) {
        const queryString = JSON.stringify(req.query);
        if (this.checkSqlInjection(queryString)) {
          return res.status(400).json({
            error: 'SQL injection detected',
            message: '检测到SQL注入攻击'
          });
        }
        if (this.checkXSS(queryString)) {
          return res.status(400).json({
            error: 'XSS attack detected',
            message: '检测到XSS攻击'
          });
        }
      }

      next();
    };
  }

  /**
   * 记录安全事件
   */
  public logSecurityEvent(event: string, details: any): void {
    console.warn(`Security Event: ${event}`, {
      timestamp: new Date().toISOString(),
      details,
    });
  }

  /**
   * 获取安全报告
   */
  public getSecurityReport(): object {
    return {
      config: this.config,
      requestCounts: Object.fromEntries(this.requestCounts),
      patterns: {
        sqlInjection: this.config.sqlInjectionPatterns.length,
        xss: this.config.xssPatterns.length,
      },
    };
  }
}

// 创建全局安全检查器实例
const securityScanner = new SecurityScanner();

export default securityScanner; 