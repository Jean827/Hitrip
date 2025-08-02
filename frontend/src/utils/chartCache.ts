// 图表缓存服务
export interface ChartCacheItem {
  data: any;
  timestamp: number;
  ttl: number; // 缓存生存时间（毫秒）
}

export class ChartCacheService {
  private cache = new Map<string, ChartCacheItem>();
  private maxCacheSize = 100; // 最大缓存条目数
  private defaultTTL = 5 * 60 * 1000; // 默认5分钟缓存

  /**
   * 获取缓存数据
   * @param key 缓存键
   * @returns 缓存数据或null
   */
  async getCachedData(key: string): Promise<any | null> {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // 检查缓存是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * 设置缓存数据
   * @param key 缓存键
   * @param data 缓存数据
   * @param ttl 缓存生存时间（毫秒）
   */
  async setCachedData(key: string, data: any, ttl: number = this.defaultTTL): Promise<void> {
    // 检查缓存大小，如果超过限制则清理最旧的缓存
    if (this.cache.size >= this.maxCacheSize) {
      this.cleanupOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * 删除缓存
   * @param key 缓存键
   */
  async deleteCachedData(key: string): Promise<void> {
    this.cache.delete(key);
  }

  /**
   * 清空所有缓存
   */
  async clearCache(): Promise<void> {
    this.cache.clear();
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): { size: number; hitRate: number; keys: string[] } {
    return {
      size: this.cache.size,
      hitRate: 0, // TODO: 实现命中率统计
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * 清理过期的缓存
   */
  private cleanupExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 清理最旧的缓存条目
   */
  private cleanupOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * 生成缓存键
   * @param chartType 图表类型
   * @param params 参数对象
   * @returns 缓存键
   */
  static generateCacheKey(chartType: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    
    return `${chartType}:${sortedParams}`;
  }
}

// 创建全局缓存实例
export const chartCache = new ChartCacheService(); 