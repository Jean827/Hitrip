interface CacheItem {
  key: string;
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface SearchCache {
  query: string;
  results: any[];
  timestamp: number;
}

interface OfflineAction {
  id: string;
  type: 'favorite' | 'share' | 'view';
  data: any;
  timestamp: number;
}

class OfflineCacheService {
  private readonly CACHE_PREFIX = 'hainan_tourism_cache_';
  private readonly SEARCH_CACHE_PREFIX = 'search_cache_';
  private readonly OFFLINE_ACTIONS_KEY = 'offline_actions';
  private readonly MAX_CACHE_SIZE = 50; // Maximum number of cached items
  private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours

  // 检查是否支持IndexedDB
  private isIndexedDBSupported(): boolean {
    return 'indexedDB' in window;
  }

  // 检查是否支持localStorage
  private isLocalStorageSupported(): boolean {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  // 生成缓存键
  private generateCacheKey(key: string): string {
    return `${this.CACHE_PREFIX}${key}`;
  }

  // 生成搜索缓存键
  private generateSearchCacheKey(query: string): string {
    return `${this.SEARCH_CACHE_PREFIX}${query.toLowerCase().trim()}`;
  }

  // 清理过期缓存
  private async cleanExpiredCache(): Promise<void> {
    if (!this.isLocalStorageSupported()) return;

    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));

    for (const key of cacheKeys) {
      try {
        const item = JSON.parse(localStorage.getItem(key) || '{}');
        if (item.timestamp && Date.now() - item.timestamp > item.ttl) {
          localStorage.removeItem(key);
        }
      } catch (error) {
        console.error('清理缓存失败:', error);
        localStorage.removeItem(key);
      }
    }
  }

  // 限制缓存大小
  private async limitCacheSize(): Promise<void> {
    if (!this.isLocalStorageSupported()) return;

    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));

    if (cacheKeys.length > this.MAX_CACHE_SIZE) {
      // 按时间戳排序，删除最旧的缓存
      const cacheItems = cacheKeys.map(key => ({
        key,
        timestamp: JSON.parse(localStorage.getItem(key) || '{}').timestamp || 0
      }));

      cacheItems.sort((a, b) => a.timestamp - b.timestamp);

      const itemsToRemove = cacheItems.slice(0, cacheKeys.length - this.MAX_CACHE_SIZE);
      itemsToRemove.forEach(item => {
        localStorage.removeItem(item.key);
      });
    }
  }

  // 缓存搜索数据
  async cacheSearchResults(query: string, results: any[]): Promise<void> {
    if (!this.isLocalStorageSupported()) return;

    try {
      const cacheKey = this.generateSearchCacheKey(query);
      const cacheData: SearchCache = {
        query,
        results,
        timestamp: Date.now()
      };

      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      await this.cleanExpiredCache();
      await this.limitCacheSize();
    } catch (error) {
      console.error('缓存搜索数据失败:', error);
    }
  }

  // 获取缓存的搜索数据
  async getCachedSearchResults(query: string): Promise<any[] | null> {
    if (!this.isLocalStorageSupported()) return null;

    try {
      const cacheKey = this.generateSearchCacheKey(query);
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        const cacheData: SearchCache = JSON.parse(cached);
        const isExpired = Date.now() - cacheData.timestamp > this.DEFAULT_TTL;

        if (!isExpired) {
          return cacheData.results;
        } else {
          localStorage.removeItem(cacheKey);
        }
      }
    } catch (error) {
      console.error('获取缓存搜索数据失败:', error);
    }

    return null;
  }

  // 缓存通用数据
  async cacheData(key: string, data: any, ttl: number = this.DEFAULT_TTL): Promise<void> {
    if (!this.isLocalStorageSupported()) return;

    try {
      const cacheKey = this.generateCacheKey(key);
      const cacheItem: CacheItem = {
        key,
        data,
        timestamp: Date.now(),
        ttl
      };

      localStorage.setItem(cacheKey, JSON.stringify(cacheItem));
      await this.cleanExpiredCache();
      await this.limitCacheSize();
    } catch (error) {
      console.error('缓存数据失败:', error);
    }
  }

  // 获取缓存数据
  async getCachedData(key: string): Promise<any | null> {
    if (!this.isLocalStorageSupported()) return null;

    try {
      const cacheKey = this.generateCacheKey(key);
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        const cacheItem: CacheItem = JSON.parse(cached);
        const isExpired = Date.now() - cacheItem.timestamp > cacheItem.ttl;

        if (!isExpired) {
          return cacheItem.data;
        } else {
          localStorage.removeItem(cacheKey);
        }
      }
    } catch (error) {
      console.error('获取缓存数据失败:', error);
    }

    return null;
  }

  // 添加离线操作
  async addOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp'>): Promise<void> {
    if (!this.isLocalStorageSupported()) return;

    try {
      const actions = await this.getOfflineActions();
      const newAction: OfflineAction = {
        ...action,
        id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now()
      };

      actions.push(newAction);
      localStorage.setItem(this.OFFLINE_ACTIONS_KEY, JSON.stringify(actions));
    } catch (error) {
      console.error('添加离线操作失败:', error);
    }
  }

  // 获取离线操作
  async getOfflineActions(): Promise<OfflineAction[]> {
    if (!this.isLocalStorageSupported()) return [];

    try {
      const actions = localStorage.getItem(this.OFFLINE_ACTIONS_KEY);
      return actions ? JSON.parse(actions) : [];
    } catch (error) {
      console.error('获取离线操作失败:', error);
      return [];
    }
  }

  // 清除离线操作
  async clearOfflineActions(): Promise<void> {
    if (!this.isLocalStorageSupported()) return;

    try {
      localStorage.removeItem(this.OFFLINE_ACTIONS_KEY);
    } catch (error) {
      console.error('清除离线操作失败:', error);
    }
  }

  // 同步离线操作到服务器
  async syncOfflineActions(): Promise<void> {
    if (!navigator.onLine) return;

    try {
      const actions = await this.getOfflineActions();
      
      for (const action of actions) {
        try {
          // 根据操作类型执行相应的API调用
          switch (action.type) {
            case 'favorite':
              // await favoriteApi.addFavorite(action.data);
              break;
            case 'share':
              // await shareApi.recordShare(action.data);
              break;
            case 'view':
              // await analyticsApi.recordView(action.data);
              break;
          }
        } catch (error) {
          console.error(`同步操作失败: ${action.type}`, error);
        }
      }

      // 清除已同步的操作
      await this.clearOfflineActions();
    } catch (error) {
      console.error('同步离线操作失败:', error);
    }
  }

  // 检查网络状态
  isOnline(): boolean {
    return navigator.onLine;
  }

  // 监听网络状态变化
  onNetworkChange(callback: (isOnline: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }

  // 获取缓存统计信息
  async getCacheStats(): Promise<{
    totalItems: number;
    totalSize: number;
    searchCacheCount: number;
    offlineActionsCount: number;
  }> {
    if (!this.isLocalStorageSupported()) {
      return {
        totalItems: 0,
        totalSize: 0,
        searchCacheCount: 0,
        offlineActionsCount: 0
      };
    }

    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      const searchCacheKeys = keys.filter(key => key.startsWith(this.SEARCH_CACHE_PREFIX));
      
      let totalSize = 0;
      for (const key of keys) {
        totalSize += localStorage.getItem(key)?.length || 0;
      }

      const actions = await this.getOfflineActions();

      return {
        totalItems: cacheKeys.length,
        totalSize,
        searchCacheCount: searchCacheKeys.length,
        offlineActionsCount: actions.length
      };
    } catch (error) {
      console.error('获取缓存统计失败:', error);
      return {
        totalItems: 0,
        totalSize: 0,
        searchCacheCount: 0,
        offlineActionsCount: 0
      };
    }
  }

  // 清除所有缓存
  async clearAllCache(): Promise<void> {
    if (!this.isLocalStorageSupported()) return;

    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => 
        key.startsWith(this.CACHE_PREFIX) || 
        key.startsWith(this.SEARCH_CACHE_PREFIX) ||
        key === this.OFFLINE_ACTIONS_KEY
      );

      cacheKeys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('清除所有缓存失败:', error);
    }
  }
}

// 创建单例实例
const offlineCacheService = new OfflineCacheService();

export default offlineCacheService; 