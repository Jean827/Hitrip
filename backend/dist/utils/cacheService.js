"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = void 0;
exports.Cacheable = Cacheable;
const ioredis_1 = __importDefault(require("ioredis"));
const node_cache_1 = __importDefault(require("node-cache"));
class CacheService {
    constructor() {
        this.memoryCache = new node_cache_1.default({
            stdTTL: 300,
            checkperiod: 120,
            maxKeys: 1000
        });
        this.redis = new ioredis_1.default({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD,
            db: 0,
            retryDelayOnFailover: 100,
            maxRetriesPerRequest: 3,
            lazyConnect: true
        });
        this.strategy = {
            L1: { ttl: 300, maxSize: 1000, checkperiod: 120 },
            L2: { ttl: 3600, maxSize: 10000, checkperiod: 600 },
            L3: { ttl: 86400, maxSize: 100000, checkperiod: 3600 }
        };
        this.initEventListeners();
    }
    static getInstance() {
        if (!CacheService.instance) {
            CacheService.instance = new CacheService();
        }
        return CacheService.instance;
    }
    initEventListeners() {
        this.redis.on('connect', () => {
            console.log('Redis连接成功');
        });
        this.redis.on('error', (error) => {
            console.error('Redis连接错误:', error);
        });
        this.memoryCache.on('expired', (key, value) => {
            console.log(`内存缓存过期: ${key}`);
        });
    }
    async get(key) {
        try {
            const l1Value = this.memoryCache.get(key);
            if (l1Value !== undefined) {
                console.log(`L1缓存命中: ${key}`);
                return l1Value;
            }
            const l2Value = await this.redis.get(key);
            if (l2Value) {
                const parsedValue = JSON.parse(l2Value);
                this.memoryCache.set(key, parsedValue, this.strategy.L1.ttl);
                console.log(`L2缓存命中: ${key}`);
                return parsedValue;
            }
            console.log(`缓存未命中: ${key}`);
            return null;
        }
        catch (error) {
            console.error('缓存获取错误:', error);
            return null;
        }
    }
    async set(key, value, ttl) {
        try {
            const serializedValue = JSON.stringify(value);
            const cacheTTL = ttl || this.strategy.L2.ttl;
            this.memoryCache.set(key, value, this.strategy.L1.ttl);
            await this.redis.setex(key, cacheTTL, serializedValue);
            console.log(`缓存设置成功: ${key}`);
        }
        catch (error) {
            console.error('缓存设置错误:', error);
        }
    }
    async delete(key) {
        try {
            this.memoryCache.del(key);
            await this.redis.del(key);
            console.log(`缓存删除成功: ${key}`);
        }
        catch (error) {
            console.error('缓存删除错误:', error);
        }
    }
    async mget(keys) {
        try {
            const results = await Promise.all(keys.map(key => this.get(key)));
            return results;
        }
        catch (error) {
            console.error('批量获取缓存错误:', error);
            return keys.map(() => null);
        }
    }
    async mset(keyValuePairs) {
        try {
            await Promise.all(keyValuePairs.map(({ key, value, ttl }) => this.set(key, value, ttl)));
            console.log(`批量缓存设置成功: ${keyValuePairs.length}个`);
        }
        catch (error) {
            console.error('批量设置缓存错误:', error);
        }
    }
    async warmupCache() {
        console.log('开始缓存预热...');
        try {
            const hotProducts = await this.getHotProducts();
            if (hotProducts) {
                await this.mset(hotProducts.map(product => ({
                    key: `product:${product.id}`,
                    value: product,
                    ttl: 3600
                })));
            }
            const popularSearches = await this.getPopularSearches();
            if (popularSearches) {
                await this.set('popular_searches', popularSearches, 1800);
            }
            const categories = await this.getCategories();
            if (categories) {
                await this.set('categories', categories, 7200);
            }
            console.log('缓存预热完成');
        }
        catch (error) {
            console.error('缓存预热错误:', error);
        }
    }
    async getHotProducts() {
        return [
            { id: 1, name: '海南特产1', price: 100 },
            { id: 2, name: '海南特产2', price: 200 }
        ];
    }
    async getPopularSearches() {
        return [
            { query: '海南旅游', count: 100 },
            { query: '三亚景点', count: 80 },
            { query: '海南特产', count: 60 }
        ];
    }
    async getCategories() {
        return [
            { id: 1, name: '旅游产品' },
            { id: 2, name: '特产食品' },
            { id: 3, name: '工艺品' }
        ];
    }
    async getStats() {
        try {
            const memoryStats = this.memoryCache.getStats();
            const redisInfo = await this.redis.info();
            return {
                memory: {
                    keys: memoryStats.keys,
                    hits: memoryStats.hits,
                    misses: memoryStats.misses,
                    hitRate: memoryStats.hits / (memoryStats.hits + memoryStats.misses)
                },
                redis: {
                    connected: this.redis.status === 'ready',
                    info: redisInfo
                }
            };
        }
        catch (error) {
            console.error('获取缓存统计错误:', error);
            return null;
        }
    }
    async cleanup() {
        try {
            this.memoryCache.flushAll();
            console.log('内存缓存清理完成');
        }
        catch (error) {
            console.error('缓存清理错误:', error);
        }
    }
    async healthCheck() {
        try {
            await this.redis.ping();
            return true;
        }
        catch (error) {
            console.error('缓存健康检查失败:', error);
            return false;
        }
    }
}
exports.cacheService = CacheService.getInstance();
function Cacheable(ttl = 3600) {
    return function (target, propertyName, descriptor) {
        const method = descriptor.value;
        descriptor.value = async function (...args) {
            const cacheKey = `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;
            const cachedValue = await exports.cacheService.get(cacheKey);
            if (cachedValue !== null) {
                return cachedValue;
            }
            const result = await method.apply(this, args);
            await exports.cacheService.set(cacheKey, result, ttl);
            return result;
        };
    };
}
//# sourceMappingURL=cacheService.js.map