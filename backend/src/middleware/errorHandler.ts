import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// 自定义错误类
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 错误处理中间件
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // 记录错误日志
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Mongoose 重复键错误
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    const message = '数据已存在';
    error = new AppError(message, 400);
  }

  // Mongoose 验证错误
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors).map((val: any) => val.message).join(', ');
    error = new AppError(message, 400);
  }

  // Mongoose 无效ID错误
  if (err.name === 'CastError') {
    const message = '无效的ID格式';
    error = new AppError(message, 400);
  }

  // JWT 错误
  if (err.name === 'JsonWebTokenError') {
    const message = '无效的token';
    error = new AppError(message, 401);
  }

  // JWT 过期错误
  if (err.name === 'TokenExpiredError') {
    const message = 'token已过期';
    error = new AppError(message, 401);
  }

  // 默认错误
  const statusCode = (error as AppError).statusCode || 500;
  const message = error.message || '服务器内部错误';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

// 异步错误处理包装器
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404错误处理
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`路径 ${req.originalUrl} 不存在`, 404);
  next(error);
}; 