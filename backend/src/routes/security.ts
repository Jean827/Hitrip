import { Router, Request, Response } from 'express';
import { securityScanner } from '../utils/securityScanner';
import { securityConfig } from '../middleware/security';

const router = Router();

// 安全扫描API
router.get('/scan', async (req: Request, res: Response) => {
  try {
    const securityCheck = securityScanner.performSecurityCheck(req);
    const securityReport = securityScanner.generateSecurityReport();
    
    res.json({
      success: true,
      data: {
        securityCheck,
        securityReport,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '安全扫描失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 获取安全事件
router.get('/events', async (req: Request, res: Response) => {
  try {
    const events = securityScanner.getSecurityEvents();
    
    res.json({
      success: true,
      data: {
        events,
        total: events.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取安全事件失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 清理安全事件
router.delete('/events', async (req: Request, res: Response) => {
  try {
    securityScanner.clearSecurityEvents();
    
    res.json({
      success: true,
      message: '安全事件清理完成'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '清理安全事件失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 获取被阻止的IP列表
router.get('/blocked-ips', async (req: Request, res: Response) => {
  try {
    const blockedIPs = securityScanner.getBlockedIPs();
    
    res.json({
      success: true,
      data: {
        blockedIPs,
        total: blockedIPs.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取被阻止IP列表失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 阻止IP
router.post('/block-ip', async (req: Request, res: Response) => {
  try {
    const { ip } = req.body;
    
    if (!ip) {
      return res.status(400).json({
        success: false,
        message: 'IP地址不能为空'
      });
    }

    securityScanner.blockIP(ip);
    
    res.json({
      success: true,
      message: `IP ${ip} 已被阻止`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '阻止IP失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 解除IP阻止
router.post('/unblock-ip', async (req: Request, res: Response) => {
  try {
    const { ip } = req.body;
    
    if (!ip) {
      return res.status(400).json({
        success: false,
        message: 'IP地址不能为空'
      });
    }

    securityScanner.unblockIP(ip);
    
    res.json({
      success: true,
      message: `IP ${ip} 已被解除阻止`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '解除IP阻止失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 密码强度检查
router.post('/check-password', async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: '密码不能为空'
      });
    }

    const result = securityScanner.checkPasswordStrength(password);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '密码强度检查失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 生成安全令牌
router.post('/generate-token', async (req: Request, res: Response) => {
  try {
    const token = securityScanner.generateSecureToken();
    const csrfToken = securityScanner.generateCSRFToken();
    
    res.json({
      success: true,
      data: {
        token,
        csrfToken,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '生成安全令牌失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 密码哈希
router.post('/hash-password', async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: '密码不能为空'
      });
    }

    const hash = await securityScanner.hashPassword(password);
    
    res.json({
      success: true,
      data: {
        hash,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '密码哈希失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 验证密码
router.post('/verify-password', async (req: Request, res: Response) => {
  try {
    const { password, hash } = req.body;
    
    if (!password || !hash) {
      return res.status(400).json({
        success: false,
        message: '密码和哈希值不能为空'
      });
    }

    const isValid = await securityScanner.verifyPassword(password, hash);
    
    res.json({
      success: true,
      data: {
        isValid,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '密码验证失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 输入清理测试
router.post('/sanitize-input', async (req: Request, res: Response) => {
  try {
    const { input } = req.body;
    
    if (!input) {
      return res.status(400).json({
        success: false,
        message: '输入不能为空'
      });
    }

    const sanitized = securityScanner.sanitizeInput(input);
    
    res.json({
      success: true,
      data: {
        original: input,
        sanitized,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '输入清理失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 安全配置信息
router.get('/config', async (req: Request, res: Response) => {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取安全配置失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 安全健康检查
router.get('/health', async (req: Request, res: Response) => {
  try {
    const healthCheck = {
      securityScanner: true,
      securityMiddleware: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      securityEvents: securityScanner.getSecurityEvents().length,
      blockedIPs: securityScanner.getBlockedIPs().length
    };
    
    res.json({
      success: true,
      data: healthCheck
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '安全健康检查失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

export default router; 