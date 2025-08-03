import apiClient from './apiClient';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'product' | 'attraction' | 'article' | 'merchant';
  image?: string;
  price?: number;
  rating?: number;
  location?: string;
  tags?: string[];
  url: string;
  relevance: number;
}

export interface SearchFilters {
  type?: string;
  category?: string;
  priceRange?: [number, number];
  location?: string;
  rating?: number;
  tags?: string[];
}

export interface SearchParams {
  query: string;
  filters?: SearchFilters;
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'price' | 'rating' | 'date';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  totalPages: number;
  suggestions: string[];
  facets: {
    categories: Array<{ name: string; count: number }>;
    priceRanges: Array<{ range: string; count: number }>;
    locations: Array<{ name: string; count: number }>;
    tags: Array<{ name: string; count: number }>;
  };
}

export const searchApi = {
  search: async (params: SearchParams): Promise<SearchResponse> => {
    try {
      const response = await apiClient.get('/search', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '搜索失败');
    }
  },

  getSuggestions: async (query: string, limit?: number): Promise<string[]> => {
    try {
      const response = await apiClient.get('/search/suggestions', { 
        params: { query, limit: limit || 10 }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取搜索建议失败');
    }
  },

  getPopularSearches: async (limit?: number): Promise<string[]> => {
    try {
      const response = await apiClient.get('/search/popular', { 
        params: { limit: limit || 10 }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取热门搜索失败');
    }
  },

  getSearchHistory: async (): Promise<string[]> => {
    try {
      const response = await apiClient.get('/search/history');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取搜索历史失败');
    }
  },

  clearSearchHistory: async (): Promise<void> => {
    try {
      await apiClient.delete('/search/history');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '清除搜索历史失败');
    }
  },

  recordSearch: async (query: string, resultId?: string): Promise<void> => {
    try {
      await apiClient.post('/search/record', { query, resultId });
    } catch (error: any) {
      console.error('记录搜索失败:', error);
    }
  }
}; 