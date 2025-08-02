import { Request, Response, NextFunction } from 'express';
interface PerformanceMetrics {
    method: string;
    url: string;
    statusCode: number;
    responseTime: number;
    timestamp: number;
    userAgent?: string;
    ip?: string;
}
declare class PerformanceMonitor {
    private static instance;
    private metrics;
    private slowQueries;
    private errorQueries;
    static getInstance(): PerformanceMonitor;
    recordMetric(metric: PerformanceMetrics): void;
    getStats(): any;
    cleanup(): void;
}
export declare const performanceMonitor: (req: Request, res: Response, next: NextFunction) => void;
export declare const compressionMiddleware: any;
export declare const createRateLimiter: (windowMs?: number, max?: number) => any;
export declare const generalLimiter: any;
export declare const authLimiter: any;
export declare const searchLimiter: any;
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
export declare const memoryMonitor: (req: Request, res: Response, next: NextFunction) => void;
export declare const dbConnectionMonitor: (req: Request, res: Response, next: NextFunction) => void;
export declare const cacheMonitor: (req: Request, res: Response, next: NextFunction) => void;
export declare const getPerformanceStats: (req: Request, res: Response) => void;
export declare const cleanupPerformanceData: (req: Request, res: Response) => void;
export declare const performanceMonitorInstance: PerformanceMonitor;
export {};
//# sourceMappingURL=performance.d.ts.map