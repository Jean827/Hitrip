import { Request, Response, NextFunction } from 'express';
import { Counter, Histogram, Gauge } from 'prom-client';
declare const userRegistrations: any;
declare const userLogins: any;
declare const ordersCreated: any;
declare const revenueTotal: any;
declare const activeUsers: any;
declare const orderValue: any;
export declare const monitoringMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export declare const metricsEndpoint: (req: Request, res: Response) => Promise<void>;
export declare const healthCheck: (req: Request, res: Response) => Promise<void>;
export declare const detailedHealthCheck: (req: Request, res: Response) => Promise<void>;
export declare const monitorDatabaseQuery: (queryType: string) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare const monitorRedisOperation: (operationType: string) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare const trackBusinessMetric: (metric: Counter | Gauge | Histogram, value?: number) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare const performanceMonitoringMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export declare const memoryMonitoring: () => {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
};
export declare const detectMemoryLeak: () => number;
export { userRegistrations, userLogins, ordersCreated, revenueTotal, activeUsers, orderValue };
//# sourceMappingURL=monitoring.d.ts.map