import { apiClient } from './apiClient';
import offlineCacheService from '../utils/offlineCache';

export const searchApi = {
  // 全文搜索
  fulltextSearch: async (params: {
    q: string;
    category?: string;
    priceMin?: string;
    priceMax?: string;
    sortBy?: string;
    order?: string;
    page?: number;
    limit?: number;
  }) => {
    // 检查是否有缓存
    const cachedResults = await offlineCacheService.getCachedSearchResults(params.q);
    
    if (cachedResults && !navigator.onLine) {
      // 离线时返回缓存结果
      return {
        success: true,
        data: {
          results: cachedResults,
          total: cachedResults.length,
          page: 1,
          limit: cachedResults.length,
          totalPages: 1,
          query: params.q,
          fromCache: true
        }
      };
    }

    try {
      const response = await apiClient.get('/search/fulltext', { params });
      
      // 在线时缓存搜索结果
      if (response.success && response.data.results) {
        await offlineCacheService.cacheSearchResults(params.q, response.data.results);
      }
      
      return response;
    } catch (error) {
      // 如果在线搜索失败，尝试使用缓存
      const cachedResults = await offlineCacheService.getCachedSearchResults(params.q);
      if (cachedResults) {
        return {
          success: true,
          data: {
            results: cachedResults,
            total: cachedResults.length,
            page: 1,
            limit: cachedResults.length,
            totalPages: 1,
            query: params.q,
            fromCache: true
          }
        };
      }
      throw error;
    }
  },

  // 获取搜索建议
  getSuggestions: async (params: { q: string; limit?: number }) => {
    // 检查缓存
    const cacheKey = `suggestions_${params.q}_${params.limit || 10}`;
    const cached = await offlineCacheService.getCachedData(cacheKey);
    
    if (cached && !navigator.onLine) {
      return {
        success: true,
        data: cached,
        fromCache: true
      };
    }

    try {
      const response = await apiClient.get('/search/suggestions', { params });
      
      // 缓存建议
      if (response.success) {
        await offlineCacheService.cacheData(cacheKey, response.data, 30 * 60 * 1000); // 30分钟
      }
      
      return response;
    } catch (error) {
      // 如果在线获取失败，尝试使用缓存
      const cached = await offlineCacheService.getCachedData(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          fromCache: true
        };
      }
      throw error;
    }
  },

  // 获取搜索历史
  getHistory: async (params?: { limit?: number }) => {
    // 搜索历史需要用户登录，离线时可能无法获取
    if (!navigator.onLine) {
      return {
        success: true,
        data: [],
        fromCache: true
      };
    }

    try {
      const response = await apiClient.get('/search/history', { params });
      return response;
    } catch (error) {
      console.error('获取搜索历史失败:', error);
      return {
        success: true,
        data: [],
        fromCache: true
      };
    }
  },

  // 删除搜索历史
  deleteHistory: async (historyId: number) => {
    if (!navigator.onLine) {
      // 离线时记录操作，等在线时同步
      await offlineCacheService.addOfflineAction({
        type: 'view',
        data: { action: 'deleteHistory', historyId }
      });
      return { success: true, message: '操作已记录，将在联网后同步' };
    }

    try {
      const response = await apiClient.delete(`/search/history/${historyId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 清空搜索历史
  clearHistory: async () => {
    if (!navigator.onLine) {
      // 离线时记录操作，等在线时同步
      await offlineCacheService.addOfflineAction({
        type: 'view',
        data: { action: 'clearHistory' }
      });
      return { success: true, message: '操作已记录，将在联网后同步' };
    }

    try {
      const response = await apiClient.delete('/search/history');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 获取热门搜索词
  getPopular: async (params?: { limit?: number; days?: number }) => {
    // 检查缓存
    const cacheKey = `popular_${params?.limit || 10}_${params?.days || 7}`;
    const cached = await offlineCacheService.getCachedData(cacheKey);
    
    if (cached && !navigator.onLine) {
      return {
        success: true,
        data: cached,
        fromCache: true
      };
    }

    try {
      const response = await apiClient.get('/search/popular', { params });
      
      // 缓存热门搜索词
      if (response.success) {
        await offlineCacheService.cacheData(cacheKey, response.data, 60 * 60 * 1000); // 1小时
      }
      
      return response;
    } catch (error) {
      // 如果在线获取失败，尝试使用缓存
      const cached = await offlineCacheService.getCachedData(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          fromCache: true
        };
      }
      throw error;
    }
  },

  // 搜索纠错
  spellCheck: async (params: { q: string }) => {
    // 检查缓存
    const cacheKey = `spellcheck_${params.q}`;
    const cached = await offlineCacheService.getCachedData(cacheKey);
    
    if (cached && !navigator.onLine) {
      return {
        success: true,
        data: cached,
        fromCache: true
      };
    }

    try {
      const response = await apiClient.get('/search/spell-check', { params });
      
      // 缓存纠错结果
      if (response.success) {
        await offlineCacheService.cacheData(cacheKey, response.data, 24 * 60 * 60 * 1000); // 24小时
      }
      
      return response;
    } catch (error) {
      // 如果在线获取失败，尝试使用缓存
      const cached = await offlineCacheService.getCachedData(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          fromCache: true
        };
      }
      throw error;
    }
  },

  // 获取搜索统计
  getStats: async (params?: { days?: number }) => {
    if (!navigator.onLine) {
      return {
        success: true,
        data: [],
        fromCache: true
      };
    }

    try {
      const response = await apiClient.get('/search/stats', { params });
      return response;
    } catch (error) {
      console.error('获取搜索统计失败:', error);
      return {
        success: true,
        data: [],
        fromCache: true
      };
    }
  },

  // 同步离线操作
  syncOfflineActions: async () => {
    return await offlineCacheService.syncOfflineActions();
  },

  // 获取缓存统计
  getCacheStats: async () => {
    return await offlineCacheService.getCacheStats();
  },

  // 清除所有缓存
  clearAllCache: async () => {
    return await offlineCacheService.clearAllCache();
  }
}; 