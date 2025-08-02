declare class CacheService {
    private static instance;
    private memoryCache;
    private redis;
    private strategy;
    private constructor();
    static getInstance(): CacheService;
    private initEventListeners;
    get(key: string): Promise<any>;
    set(key: string, value: any, ttl?: number): Promise<void>;
    delete(key: string): Promise<void>;
    mget(keys: string[]): Promise<any[]>;
    mset(keyValuePairs: {
        key: string;
        value: any;
        ttl?: number;
    }[]): Promise<void>;
    warmupCache(): Promise<void>;
    private getHotProducts;
    private getPopularSearches;
    private getCategories;
    getStats(): Promise<any>;
    cleanup(): Promise<void>;
    healthCheck(): Promise<boolean>;
}
export declare const cacheService: CacheService;
export declare function Cacheable(ttl?: number): (target: any, propertyName: string, descriptor: PropertyDescriptor) => void;
export {};
//# sourceMappingURL=cacheService.d.ts.map