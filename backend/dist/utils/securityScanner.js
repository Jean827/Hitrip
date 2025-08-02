"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityScanner = void 0;
const crypto_1 = __importDefault(require("crypto"));
class SecurityScanner {
    constructor() {
        this.securityEvents = [];
        this.blockedIPs = new Set();
        this.rateLimitMap = new Map();
    }
    static getInstance() {
        if (!SecurityScanner.instance) {
            SecurityScanner.instance = new SecurityScanner();
        }
        return SecurityScanner.instance;
    }
    checkSqlInjection(input) {
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
    checkXSS(input) {
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
    checkPathTraversal(input) {
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
    checkCommandInjection(input) {
        const commandPatterns = [
            /(\b(cmd|command|exec|system|shell|bash|sh|powershell)\b)/i,
            /(\b(ping|nslookup|traceroute|netstat|whoami|id)\b)/i,
            /(\b(rm|del|format|fdisk|mkfs)\b)/i,
            /(\b(cat|type|more|less|head|tail)\b)/i,
            /(\b(wget|curl|ftp|telnet|ssh)\b)/i
        ];
        return commandPatterns.some(pattern => pattern.test(input));
    }
    checkMaliciousUserAgent(userAgent) {
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
    checkRequestSize(req) {
        const maxSize = 10 * 1024 * 1024;
        const contentLength = parseInt(req.get('Content-Length') || '0');
        return contentLength <= maxSize;
    }
    checkRateLimit(ip) {
        const windowMs = 15 * 60 * 1000;
        const maxRequests = 100;
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
    checkCSRF(req) {
        const token = req.headers['x-csrf-token'] || req.headers['csrf-token'];
        const sessionToken = req.session?.csrfToken;
        if (!token || !sessionToken) {
            return false;
        }
        return token === sessionToken;
    }
    sanitizeInput(input) {
        return input
            .replace(/[<>]/g, '')
            .replace(/javascript:/gi, '')
            .replace(/vbscript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .trim();
    }
    checkPasswordStrength(password) {
        const suggestions = [];
        let score = 0;
        if (password.length >= 8) {
            score += 1;
        }
        else {
            suggestions.push('密码长度至少8位');
        }
        if (/[a-z]/.test(password)) {
            score += 1;
        }
        else {
            suggestions.push('包含小写字母');
        }
        if (/[A-Z]/.test(password)) {
            score += 1;
        }
        else {
            suggestions.push('包含大写字母');
        }
        if (/\d/.test(password)) {
            score += 1;
        }
        else {
            suggestions.push('包含数字');
        }
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            score += 1;
        }
        else {
            suggestions.push('包含特殊字符');
        }
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
    generateSecureToken() {
        return crypto_1.default.randomBytes(32).toString('hex');
    }
    generateCSRFToken() {
        return crypto_1.default.randomBytes(16).toString('hex');
    }
    hashPassword(password) {
        return new Promise((resolve, reject) => {
            const salt = crypto_1.default.randomBytes(16).toString('hex');
            crypto_1.default.scrypt(password, salt, 64, (err, derivedKey) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(salt + ':' + derivedKey.toString('hex'));
                }
            });
        });
    }
    verifyPassword(password, hash) {
        return new Promise((resolve, reject) => {
            const [salt, key] = hash.split(':');
            crypto_1.default.scrypt(password, salt, 64, (err, derivedKey) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(crypto_1.default.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey));
                }
            });
        });
    }
    logSecurityEvent(type, data) {
        const event = {
            type,
            data,
            timestamp: new Date().toISOString(),
            id: crypto_1.default.randomBytes(8).toString('hex')
        };
        this.securityEvents.push(event);
        console.warn('安全事件:', event);
        if (this.securityEvents.length > 1000) {
            this.securityEvents = this.securityEvents.slice(-500);
        }
    }
    getSecurityEvents() {
        return [...this.securityEvents];
    }
    clearSecurityEvents() {
        this.securityEvents = [];
    }
    isIPBlocked(ip) {
        return this.blockedIPs.has(ip);
    }
    blockIP(ip) {
        this.blockedIPs.add(ip);
        this.logSecurityEvent('ip_blocked', { ip });
    }
    unblockIP(ip) {
        this.blockedIPs.delete(ip);
        this.logSecurityEvent('ip_unblocked', { ip });
    }
    getBlockedIPs() {
        return Array.from(this.blockedIPs);
    }
    performSecurityCheck(req) {
        const threats = [];
        const recommendations = [];
        if (!this.checkRequestSize(req)) {
            threats.push('请求数据过大');
            recommendations.push('限制请求大小');
        }
        if (!this.checkRateLimit(req.ip)) {
            threats.push('请求频率过高');
            recommendations.push('实施速率限制');
        }
        const userAgent = req.get('User-Agent') || '';
        if (this.checkMaliciousUserAgent(userAgent)) {
            threats.push('检测到恶意User-Agent');
            recommendations.push('阻止恶意工具访问');
        }
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
    generateSecurityReport() {
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
exports.securityScanner = SecurityScanner.getInstance();
//# sourceMappingURL=securityScanner.js.map