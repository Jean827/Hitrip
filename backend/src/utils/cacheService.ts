import Redis from 'ioredis';
import NodeCache from 'node-cache';

// 缓存配置
interface CacheConfig {
  ttl: number;
  maxSize: number;
  checkperiod: number;
}

interface CacheStrategy {
  L1: CacheConfig; // 内存缓存
  L2: CacheConfig; // Redis缓存
  L3: CacheConfig; // 数据库缓存
}

class CacheService {
  private static instance: CacheService;
  private memoryCache: NodeCache;
  private redis: Redis;
  private strategy: CacheStrategy;

  private constructor() {
    // 内存缓存配置
    this.memoryCache = new NodeCache({
      stdTTL: 300, // 5分钟
      checkperiod: 120, // 2分钟检查一次
      maxKeys: 1000
    });

    // Redis配置
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: 0,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    });

    // 缓存策略
    this.strategy = {
      L1: { ttl: 300, maxSize: 1000, checkperiod: 120 }, // 5分钟
      L2: { ttl: 3600, maxSize: 10000, checkperiod: 600 }, // 1小时
      L3: { ttl: 86400, maxSize: 100000, checkperiod: 3600 } // 24小时
    };

    this.initEventListeners();
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  // 初始化事件监听
  private initEventListeners(): void {
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

  // 多级缓存获取
  async get(key: string): Promise<any> {
    try {
      // L1缓存（内存）
      const l1Value = this.memoryCache.get(key);
      if (l1Value !== undefined) {
        console.log(`L1缓存命中: ${key}`);
        return l1Value;
      }

      // L2缓存（Redis）
      const l2Value = await this.redis.get(key);
      if (l2Value) {
        const parsedValue = JSON.parse(l2Value);
        // 回填到L1缓存
        this.memoryCache.set(key, parsedValue, this.strategy.L1.ttl);
        console.log(`L2缓存命中: ${key}`);
        return parsedValue;
      }

      console.log(`缓存未命中: ${key}`);
      return null;
    } catch (error) {
      console.error('缓存获取错误:', error);
      return null;
    }
  }

  // 多级缓存设置
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      const cacheTTL = ttl || this.strategy.L2.ttl;

      // 设置L1缓存
      this.memoryCache.set(key, value, this.strategy.L1.ttl);

      // 设置L2缓存
      await this.redis.setex(key, cacheTTL, serializedValue);

      console.log(`缓存设置成功: ${key}`);
    } catch (error) {
      console.error('缓存设置错误:', error);
    }
  }

  // 删除缓存
  async delete(key: string): Promise<void> {
    try {
      this.memoryCache.del(key);
      await this.redis.del(key);
      console.log(`缓存删除成功: ${key}`);
    } catch (error) {
      console.error('缓存删除错误:', error);
    }
  }

  // 批量获取
  async mget(keys: string[]): Promise<any[]> {
    try {
      const results = await Promise.all(
        keys.map(key => this.get(key))
      );
      return results;
    } catch (error) {
      console.error('批量获取缓存错误:', error);
      return keys.map(() => null);
    }
  }

  // 批量设置
  async mset(keyValuePairs: { key: string; value: any; ttl?: number }[]): Promise<void> {
    try {
      await Promise.all(
        keyValuePairs.map(({ key, value, ttl }) => this.set(key, value, ttl))
      );
      console.log(`批量缓存设置成功: ${keyValuePairs.length}个`);
    } catch (error) {
      console.error('批量设置缓存错误:', error);
    }
  }

  // 缓存预热
  async warmupCache(): Promise<void> {
    console.log('开始缓存预热...');
    
    try {
      // 预热热门产品
      const hotProducts = await this.getHotProducts();
      if (hotProducts) {
        await this.mset(
          hotProducts.map(product => ({
            key: `product:${product.id}`,
            value: product,
            ttl: 3600
          }))
        );
      }

      // 预热搜索建议
      const popularSearches = await this.getPopularSearches();
      if (popularSearches) {
        await this.set('popular_searches', popularSearches, 1800);
      }

      // 预热分类数据
      const categories = await this.getCategories();
      if (categories) {
        await this.set('categories', categories, 7200);
      }

      console.log('缓存预热完成');
    } catch (error) {
      console.error('缓存预热错误:', error);
    }
  }

  // 获取热门产品（模拟）
  private async getHotProducts(): Promise<any[]> {
    // 这里应该从数据库获取热门产品
    return [
      { id: 1, name: '海南特产1', price: 100 },
      { id: 2, name: '海南特产2', price: 200 }
    ];
  }

  // 获取热门搜索（模拟）
  private async getPopularSearches(): Promise<any[]> {
    // 这里应该从数据库获取热门搜索
    return [
      { query: '海南旅游', count: 100 },
      { query: '三亚景点', count: 80 },
      { query: '海南特产', count: 60 }
    ];
  }

  // 获取分类数据（模拟）
  private async getCategories(): Promise<any[]> {
    // 这里应该从数据库获取分类
    return [
      { id: 1, name: '旅游产品' },
      { id: 2, name: '特产食品' },
      { id: 3, name: '工艺品' }
    ];
  }

  // 获取缓存统计
  async getStats(): Promise<any> {
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
    } catch (error) {
      console.error('获取缓存统计错误:', error);
      return null;
    }
  }

  // 清理过期缓存
  async cleanup(): Promise<void> {
    try {
      this.memoryCache.flushAll();
      console.log('内存缓存清理完成');
    } catch (error) {
      console.error('缓存清理错误:', error);
    }
  }

  // 健康检查
  async healthCheck(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      console.error('缓存健康检查失败:', error);
      return false;
    }
  }
}

// 导出单例实例
export const cacheService = CacheService.getInstance();

// 缓存装饰器
export function Cacheable(ttl: number = 3600) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;
      
      // 尝试从缓存获取
      const cachedValue = await cacheService.get(cacheKey);
      if (cachedValue !== null) {
        return cachedValue;
      }
      
      // 执行原方法
      const result = await method.apply(this, args);
      
      // 缓存结果
      await cacheService.set(cacheKey, result, ttl);
      
      return result;
    };
  };
} 