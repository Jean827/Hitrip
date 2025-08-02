import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';
import { User } from '../models/User';

// 扩展Request接口以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// JWT认证中间件
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token;

    // 从请求头获取token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // 从cookie获取token
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(new AppError('请先登录', 401));
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // 查找用户
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return next(new AppError('用户不存在', 401));
    }

    // 检查用户是否被禁用
    if (!user.isActive) {
      return next(new AppError('账户已被禁用', 401));
    }

    // 将用户信息添加到请求对象
    req.user = user;
    next();
  } catch (error) {
    return next(new AppError('认证失败', 401));
  }
};

// 角色权限中间件
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('请先登录', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('权限不足', 403));
    }

    next();
  };
};

// 可选认证中间件（不强制要求登录）
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // 可选认证失败不影响请求继续
    next();
  }
};

// 生成JWT token
export const generateToken = (userId: string): string => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// 生成刷新token
export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { id: userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
}; 