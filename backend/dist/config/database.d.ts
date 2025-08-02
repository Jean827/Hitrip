export declare const connectMongoDB: () => Promise<void>;
export declare const pgPool: any;
export declare const testPostgreSQL: () => Promise<void>;
export declare const redis: any;
export declare const testRedis: () => Promise<void>;
export declare const closeConnections: () => Promise<void>;
export declare const initializeDatabases: () => Promise<void>;
export declare const healthCheck: () => Promise<{
    mongodb: boolean;
    postgresql: boolean;
    redis: boolean;
}>;
//# sourceMappingURL=database.d.ts.map