import crypto from 'crypto';
import { Request } from 'express';

// 安全扫描器类
class SecurityScanner {
  private static instance: SecurityScanner;
  private securityEvents: any[] = [];
  private blockedIPs: Set<string> = new Set();
  private rateLimitMap: Map<string, { count: number; resetTime: number }> = new Map();

  static getInstance(): SecurityScanner {
    if (!SecurityScanner.instance) {
      SecurityScanner.instance = new SecurityScanner();
    }
    return SecurityScanner.instance;
  }

  // SQL注入检测
  checkSqlInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/i,
      /(\b(script|javascript|vbscript|onload|onerror|onclick)\b)/i,
      /(\b(admin|root|system|master)\b)/i,
      /(\b(1=1|1'='1|1"='1)\b)/i,
      /(\b(or|and)\s+\d+\s*=\s*\d+)/i,
      /(\b(union\s+select|select\s+union)\b)/i
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
  }

  // XSS攻击检测
  checkXSS(input: string): boolean {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /onload\s*=/gi,
      /onerror\s*=/gi,
      /onclick\s*=/gi,
      /onmouseover\s*=/gi,
      /onfocus\s*=/gi,
      /onblur\s*=/gi,
      /<iframe[^>]*>/gi,
      /<object[^>]*>/gi,
      /<embed[^>]*>/gi
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }

  // 路径遍历攻击检测
  checkPathTraversal(input: string): boolean {
    const pathPatterns = [
      /\.\.\/\.\./g,
      /\.\.\\\.\./g,
      /%2e%2e%2f/g,
      /%2e%2e%5c/g,
      /\.\.%2f/g,
      /\.\.%5c/g
    ];

    return pathPatterns.some(pattern => pattern.test(input));
  }

  // 命令注入检测
  checkCommandInjection(input: string): boolean {
    const commandPatterns = [
      /(\b(cmd|command|exec|system|shell|bash|sh|powershell)\b)/i,
      /(\b(ping|nslookup|traceroute|netstat|whoami|id)\b)/i,
      /(\b(rm|del|format|fdisk|mkfs)\b)/i,
      /(\b(cat|type|more|less|head|tail)\b)/i,
      /(\b(wget|curl|ftp|telnet|ssh)\b)/i
    ];

    return commandPatterns.some(pattern => pattern.test(input));
  }

  // 恶意User-Agent检测
  checkMaliciousUserAgent(userAgent: string): boolean {
    const maliciousPatterns = [
      /sqlmap/i,
      /nmap/i,
      /nikto/i,
      /dirbuster/i,
      /burpsuite/i,
      /w3af/i,
      /acunetix/i,
      /nessus/i,
      /openvas/i,
      /metasploit/i,
      /hydra/i,
      /john/i,
      /hashcat/i
    ];

    return maliciousPatterns.some(pattern => pattern.test(userAgent));
  }

  // 请求大小检查
  checkRequestSize(req: Request): boolean {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const contentLength = parseInt(req.get('Content-Length') || '0');
    
    return contentLength <= maxSize;
  }

  // 速率限制检查
  checkRateLimit(ip: string): boolean {
    const windowMs = 15 * 60 * 1000; // 15分钟
    const maxRequests = 100; // 最大请求数
    const now = Date.now();

    const current = this.rateLimitMap.get(ip);
    
    if (!current || now > current.resetTime) {
      this.rateLimitMap.set(ip, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }

    if (current.count >= maxRequests) {
      return false;
    }

    current.count++;
    return true;
  }

  // CSRF检查
  checkCSRF(req: Request): boolean {
    const token = req.headers['x-csrf-token'] || req.headers['csrf-token'];
    const sessionToken = req.session?.csrfToken;
    
    if (!token || !sessionToken) {
      return false;
    }

    return token === sessionToken;
  }

  // 输入清理
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // 移除尖括号
      .replace(/javascript:/gi, '') // 移除javascript:
      .replace(/vbscript:/gi, '') // 移除vbscript:
      .replace(/on\w+\s*=/gi, '') // 移除事件处理器
      .trim();
  }

  // 密码强度检查
  checkPasswordStrength(password: string): { isValid: boolean; score: number; suggestions: string[] } {
    const suggestions: string[] = [];
    let score = 0;

    // 长度检查
    if (password.length >= 8) {
      score += 1;
    } else {
      suggestions.push('密码长度至少8位');
    }

    // 包含小写字母
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      suggestions.push('包含小写字母');
    }

    // 包含大写字母
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      suggestions.push('包含大写字母');
    }

    // 包含数字
    if (/\d/.test(password)) {
      score += 1;
    } else {
      suggestions.push('包含数字');
    }

    // 包含特殊字符
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 1;
    } else {
      suggestions.push('包含特殊字符');
    }

    // 检查常见弱密码
    const weakPasswords = [
      'password', '123456', 'qwerty', 'admin', 'root',
      '123456789', 'password123', 'admin123', 'root123'
    ];

    if (weakPasswords.includes(password.toLowerCase())) {
      score = 0;
      suggestions.push('避免使用常见弱密码');
    }

    return {
      isValid: score >= 4,
      score,
      suggestions
    };
  }

  // 生成安全令牌
  generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // 生成CSRF令牌
  generateCSRFToken(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  // 密码哈希
  hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const salt = crypto.randomBytes(16).toString('hex');
      crypto.scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) {
          reject(err);
        } else {
          resolve(salt + ':' + derivedKey.toString('hex'));
        }
      });
    });
  }

  // 验证密码
  verifyPassword(password: string, hash: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const [salt, key] = hash.split(':');
      crypto.scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) {
          reject(err);
        } else {
          resolve(crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey));
        }
      });
    });
  }

  // 记录安全事件
  logSecurityEvent(type: string, data: any): void {
    const event = {
      type,
      data,
      timestamp: new Date().toISOString(),
      id: crypto.randomBytes(8).toString('hex')
    };

    this.securityEvents.push(event);
    console.warn('安全事件:', event);

    // 限制事件数量
    if (this.securityEvents.length > 1000) {
      this.securityEvents = this.securityEvents.slice(-500);
    }
  }

  // 获取安全事件
  getSecurityEvents(): any[] {
    return [...this.securityEvents];
  }

  // 清理安全事件
  clearSecurityEvents(): void {
    this.securityEvents = [];
  }

  // 检查IP是否被阻止
  isIPBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  // 阻止IP
  blockIP(ip: string): void {
    this.blockedIPs.add(ip);
    this.logSecurityEvent('ip_blocked', { ip });
  }

  // 解除IP阻止
  unblockIP(ip: string): void {
    this.blockedIPs.delete(ip);
    this.logSecurityEvent('ip_unblocked', { ip });
  }

  // 获取被阻止的IP列表
  getBlockedIPs(): string[] {
    return Array.from(this.blockedIPs);
  }

  // 综合安全检查
  performSecurityCheck(req: Request): {
    isSafe: boolean;
    threats: string[];
    recommendations: string[];
  } {
    const threats: string[] = [];
    const recommendations: string[] = [];

    // 检查请求大小
    if (!this.checkRequestSize(req)) {
      threats.push('请求数据过大');
      recommendations.push('限制请求大小');
    }

    // 检查速率限制
    if (!this.checkRateLimit(req.ip)) {
      threats.push('请求频率过高');
      recommendations.push('实施速率限制');
    }

    // 检查恶意User-Agent
    const userAgent = req.get('User-Agent') || '';
    if (this.checkMaliciousUserAgent(userAgent)) {
      threats.push('检测到恶意User-Agent');
      recommendations.push('阻止恶意工具访问');
    }

    // 检查请求体
    if (req.body) {
      const bodyStr = JSON.stringify(req.body);
      if (this.checkSqlInjection(bodyStr)) {
        threats.push('检测到SQL注入尝试');
        recommendations.push('加强输入验证');
      }
      if (this.checkXSS(bodyStr)) {
        threats.push('检测到XSS攻击尝试');
        recommendations.push('实施输出编码');
      }
    }

    // 检查查询参数
    if (req.query) {
      const queryStr = JSON.stringify(req.query);
      if (this.checkSqlInjection(queryStr)) {
        threats.push('检测到SQL注入尝试');
        recommendations.push('加强输入验证');
      }
      if (this.checkXSS(queryStr)) {
        threats.push('检测到XSS攻击尝试');
        recommendations.push('实施输出编码');
      }
    }

    // 检查路径参数
    if (req.params) {
      const paramsStr = JSON.stringify(req.params);
      if (this.checkPathTraversal(paramsStr)) {
        threats.push('检测到路径遍历尝试');
        recommendations.push('验证文件路径');
      }
    }

    return {
      isSafe: threats.length === 0,
      threats,
      recommendations
    };
  }

  // 生成安全报告
  generateSecurityReport(): any {
    return {
      timestamp: new Date().toISOString(),
      blockedIPs: this.getBlockedIPs().length,
      securityEvents: this.securityEvents.length,
      rateLimitMap: this.rateLimitMap.size,
      recommendations: [
        '定期更新安全补丁',
        '实施强密码策略',
        '启用双因素认证',
        '监控异常活动',
        '定期备份数据'
      ]
    };
  }
}

// 导出单例实例
export const securityScanner = SecurityScanner.getInstance(); 