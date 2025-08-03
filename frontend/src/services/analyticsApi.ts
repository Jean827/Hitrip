import apiClient from './apiClient';

export interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: Array<{
    path: string;
    views: number;
  }>;
  userBehavior: Array<{
    action: string;
    count: number;
    percentage: number;
  }>;
  conversionRate: number;
  revenue: number;
}

export interface AnalyticsFilters {
  startDate: string;
  endDate: string;
  groupBy?: 'day' | 'week' | 'month';
  segment?: string;
}

export const analyticsApi = {
  getDashboardData: async (filters: AnalyticsFilters): Promise<AnalyticsData> => {
    try {
      const response = await apiClient.get('/analytics/dashboard', { params: filters });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取分析数据失败');
    }
  },

  getPageAnalytics: async (pageId: string, filters: AnalyticsFilters): Promise<any> => {
    try {
      const response = await apiClient.get(`/analytics/pages/${pageId}`, { params: filters });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取页面分析失败');
    }
  },

  getUserBehavior: async (filters: AnalyticsFilters): Promise<any> => {
    try {
      const response = await apiClient.get('/analytics/user-behavior', { params: filters });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取用户行为失败');
    }
  },

  getConversionData: async (filters: AnalyticsFilters): Promise<any> => {
    try {
      const response = await apiClient.get('/analytics/conversions', { params: filters });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取转化数据失败');
    }
  },

  exportReport: async (filters: AnalyticsFilters, format: 'csv' | 'excel'): Promise<Blob> => {
    try {
      const response = await apiClient.get('/analytics/export', { 
        params: { ...filters, format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '导出报告失败');
    }
  }
}; 